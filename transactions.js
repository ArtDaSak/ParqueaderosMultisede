// transactions.js - Registrar ingreso y salida de vehículo con transacciones en MongoDB (Replica Set)
// Uso: node transactions.js <vehiculoId> <sedeId> <zonaId> [--salida]

const { MongoClient, ObjectId } = require('mongodb');

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('campusParking');
    const session = client.startSession();

    // Leer parámetros de línea de comandos
    const [vehiculoIdArg, sedeIdArg, zonaIdArg] = process.argv.slice(2);
    if (!vehiculoIdArg || !sedeIdArg || !zonaIdArg) {
      console.error('Uso: node transactions.js <vehiculoId> <sedeId> <zonaId>');
      process.exit(1);
    }
    const vehiculoId = new ObjectId(vehiculoIdArg);
    const sedeId     = new ObjectId(sedeIdArg);
    const zonaId     = new ObjectId(zonaIdArg);

    // Determina si es registro de salida
    const esSalida = process.argv.includes('--salida');

    await session.withTransaction(async () => {
      if (!esSalida) {
        // Ingreso: verificar cupos y registrar parqueo
        const zona = await db.collection('zonas').findOne({ _id: zonaId }, { session });
        if (!zona || zona.cuposDisponibles < 1) {
          throw new Error('Sin cupos disponibles en la zona.');
        }
        // Insertar parqueo con horaEntrada
        const ingreso = {
          vehiculoId,
          sedeId,
          zonaId,
          horaEntrada: new Date(),
          horaSalida:  null,
          tiempoTotal: null,
          costoTotal:  null
        };
        await db.collection('parqueos').insertOne(ingreso, { session });
        // Decrementar cupos
        await db.collection('zonas').updateOne(
          { _id: zonaId },
          { $inc: { cuposDisponibles: -1 } },
          { session }
        );
        console.log('Ingreso registrado con éxito.');
      } else {
        // Salida: actualizar parqueo, calcular tiempo y costo
        // Buscar parqueo activo
        const parqueo = await db.collection('parqueos').findOne(
          { vehiculoId, zonaId, horaSalida: null },
          { session }
        );
        if (!parqueo) {
          throw new Error('No se encontró parqueo activo para ese vehículo y zona.');
        }
        const horaSalida  = new Date();
        const tiempoMin   = Math.ceil((horaSalida - parqueo.horaEntrada) / 60000);
        const tarifaHora = zona.tarifaPorHora; // usar zona obtenida previamente o volver a consultar
        const costoTotal  = Number((tiempoMin * tarifaHora).toFixed(2));

        // Actualizar registro de parqueo
        await db.collection('parqueos').updateOne(
          { _id: parqueo._id },
          { $set: { horaSalida, tiempoTotal: tiempoMin, costoTotal } },
          { session }
        );
        // Incrementar cupos disponibles
        await db.collection('zonas').updateOne(
          { _id: zonaId },
          { $inc: { cuposDisponibles: 1 } },
          { session }
        );
        console.log(`Salida registrada: tiempo ${tiempoMin} min, costo $${costoTotal}`);
      }
    }, {
      readConcern: { level: 'local' },
      writeConcern: { w: 'majority' },
      readPreference: 'primary'
    });

  } catch (error) {
    console.error('Error en transacción:', error.message);
  } finally {
    await client.close();
    process.exit(0);
  }
}

run();