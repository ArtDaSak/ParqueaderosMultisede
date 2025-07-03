// test_dataset.js - Población de datos de prueba para Campus Parking (mongosh)

// 1. Insertar sedes
const sedesData = [
  { nombre: 'Central Park', ciudad: 'Bogotá', direccion: 'Av. Siempre Viva 123' },
  { nombre: 'Occidente', ciudad: 'Medellín', direccion: 'Calle 45 #67-89' },
  { nombre: 'Costa Azul', ciudad: 'Cartagena', direccion: 'Carrera 3 #21-10' }
];
const sedesResult = db.sedes.insertMany(sedesData);
const sedeIds = Object.values(sedesResult.insertedIds);

// 2. Insertar zonas (5 por sede)
const tipos = ['carro','moto','bicicleta','camion'];
const zonasData = [];
for (const sid of sedeIds) {
  for (let i = 1; i <= 5; i++) {
    const cap = Math.floor(Math.random() * 41) + 10; // 10-50
    zonasData.push({
      nombre: `Zona ${i}`,
      sedeId: sid,
      capacidadMaxima: cap,
      cuposDisponibles: cap,
      tiposVehiculosPermitidos: tipos.filter(() => Math.random() < 0.75),
      tarifaPorHora: NumberDecimal((Math.random() * 4 + 1).toFixed(2))
    });
  }
}
const zonasResult = db.zonas.insertMany(zonasData);
// Obtener zonas con datos completos
const zonas = db.zonas.find().toArray();

// 3. Insertar usuarios (10 empleados, 15 clientes)
const nombres = ['Ana','Luis','Carla','David','Sofía','Juan','María','Andrés','Laura','Carlos','Patricia','José','Valentina','Diego','Camila','Miguel','Lucía','Daniel','Natalia','Andres'];
const apellidos = ['Gómez','Pérez','Rodríguez','González','López','Martínez','Díaz','Hernández','Morales','Torres'];

const usuariosData = [];
// Empleados
for (let i = 0; i < 10; i++) {
  usuariosData.push({
    nombre: nombres[Math.floor(Math.random() * nombres.length)],
    apellido: apellidos[Math.floor(Math.random() * apellidos.length)],
    cedula: `EMP${1000 + i}`,
    email: `empleado${i + 1}@campusparking.com`,
    telefono: `300${Math.floor(1000000 + Math.random() * 9000000)}`,
    rol: 'empleado',
    sedeId: sedeIds[i % sedeIds.length]
  });
}
// Clientes
for (let i = 0; i < 15; i++) {
  usuariosData.push({
    nombre: nombres[Math.floor(Math.random() * nombres.length)],
    apellido: apellidos[Math.floor(Math.random() * apellidos.length)],
    cedula: `CLI${2000 + i}`,
    email: `cliente${i + 1}@mail.com`,
    telefono: `310${Math.floor(1000000 + Math.random() * 9000000)}`,
    rol: 'cliente',
    sedeId: null
  });
}
const usuariosResult = db.usuarios.insertMany(usuariosData);
const usuarioIds = Object.values(usuariosResult.insertedIds);
// Filtrar solo clientes para vehículos
const clienteIds = usuariosData
  .map((u, idx) => u.rol === 'cliente' ? usuarioIds[idx] : null)
  .filter(id => id);

// 4. Insertar vehículos (30, asignados a clientes)
const marcas = ['Toyota','Honda','Yamaha','Kawasaki','Giant','Ford','Chevrolet'];
const modelos = ['A1','B2','C3','D4','E5','F6'];
const colores = ['rojo','azul','negro','blanco','gris'];
const vehiculosData = [];
for (let i = 0; i < 30; i++) {
  vehiculosData.push({
    placa: `P${Math.random().toString(36).substring(2,7).toUpperCase()}`,
    tipo: tipos[Math.floor(Math.random() * tipos.length)],
    marca: marcas[Math.floor(Math.random() * marcas.length)],
    modelo: modelos[Math.floor(Math.random() * modelos.length)],
    color: colores[Math.floor(Math.random() * colores.length)],
    propietarioId: clienteIds[Math.floor(Math.random() * clienteIds.length)]
  });
}
const vehiculosResult = db.vehiculos.insertMany(vehiculosData);
const vehiculoIds = Object.values(vehiculosResult.insertedIds);

// 5. Insertar parqueos (50 registros, ~20% activos)
const parqueosData = [];
for (let i = 0; i < 50; i++) {
  const zona = zonas[Math.floor(Math.random() * zonas.length)];
  const vehId = vehiculoIds[Math.floor(Math.random() * vehiculoIds.length)];
  const horaEntrada = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60000);
  if (Math.random() < 0.2) {
    // Activo
    parqueosData.push({
      vehiculoId: vehId,
      clienteId: db.vehiculos.findOne({ _id: vehId }).propietarioId,
      sedeId: zona.sedeId,
      zonaId: zona._id,
      horaEntrada,
      horaSalida: null,
      tiempoTotal: null,
      costoTotal: null
    });
  } else {
    // Cerrado
    const durMin = Math.floor(Math.random() * 300) + 30; // 30-330 min
    const horaSalida = new Date(horaEntrada.getTime() + durMin * 60000);
    const costoTotal = NumberDecimal((durMin * parseFloat(zona.tarifaPorHora.toString())).toFixed(2));
    parqueosData.push({
      vehiculoId: vehId,
      clienteId: db.vehiculos.findOne({ _id: vehId }).propietarioId,
      sedeId: zona.sedeId,
      zonaId: zona._id,
      horaEntrada,
      horaSalida,
      tiempoTotal: durMin,
      costoTotal
    });
  }
}
db.parqueos.insertMany(parqueosData);

print("Datos de prueba insertados: ", {
  sedes: sedeIds.length,
  zonas: zonas.length,
  usuarios: usuarioIds.length,
  vehiculos: vehiculoIds.length,
  parqueos: parqueosData.length
});
