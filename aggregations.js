// aggregations.js - Consultas analíticas para Campus Parking
// MongoDB >= 4.2

// Calcular fecha de hace 30 días para filtrar el último mes
const fechaInicioUltimoMes = new Date();
fechaInicioUltimoMes.setMonth(fechaInicioUltimoMes.getMonth() - 1);

// 1. ¿Cuántos parqueos se registraron por sede en el último mes?
print("1. Parqueos por sede en el último mes:");
db.parqueos.aggregate([
  // Filtrar parqueos con fecha de entrada en los últimos 30 días
  { $match: { horaEntrada: { $gte: fechaInicioUltimoMes } } },
  // Agrupar por sedeId y contar registros
  { $group: { _id: "$sedeId", totalParqueos: { $sum: 1 } } },
  // Unir con sedes para obtener nombre
  { $lookup: { from: "sedes", localField: "_id", foreignField: "_id", as: "sedeInfo" } },
  { $unwind: "$sedeInfo" },
  // Proyectar salida clara
  { $project: { nombreSede: "$sedeInfo.nombre", totalParqueos: 1, _id: 0 } }
]).forEach(doc => printjson(doc));

// 2. ¿Cuáles son las zonas más ocupadas en cada sede? (porcentaje de uso)
print("\n2. Zonas más ocupadas por sede:");
db.parqueos.aggregate([
  // Agrupar usos por zonaId
  { $group: { _id: "$zonaId", usos: { $sum: 1 } } },
  // Unir con zonas para obtener capacidadMaxima y sedeId
  { $lookup: { from: "zonas", localField: "_id", foreignField: "_id", as: "zonaInfo" } },
  { $unwind: "$zonaInfo" },
  // Calcular porcentaje de ocupación
  { $addFields: {
      porcentajeOcupacion: {
        $multiply: [
          { $divide: ["$usos", "$zonaInfo.capacidadMaxima"] },
          100
        ]
      }
    }
  },
  // Unir con sedes para nombre de sede
  { $lookup: { from: "sedes", localField: "zonaInfo.sedeId", foreignField: "_id", as: "sedeInfo" } },
  { $unwind: "$sedeInfo" },
  // Proyectar campos necesarios
  { $project: {
      nombreSede: "$sedeInfo.nombre",
      nombreZona: "$zonaInfo.nombre",
      porcentajeOcupacion: 1,
      _id: 0
    }
  },
  // Ordenar de mayor a menor ocupación
  { $sort: { porcentajeOcupacion: -1 } }
]).forEach(doc => printjson(doc));

// 3. ¿Cuál es el ingreso total generado por parqueo en cada sede?
print("\n3. Ingreso total por sede:");
db.parqueos.aggregate([
  // Filtrar solo parqueos completados con costoTotal
  { $match: { costoTotal: { $ne: null } } },
  // Agrupar por sedeId sumando costoTotal
  { $group: { _id: "$sedeId", ingresoTotal: { $sum: "$costoTotal" } } },
  // Unir con sedes
  { $lookup: { from: "sedes", localField: "_id", foreignField: "_id", as: "sedeInfo" } },
  { $unwind: "$sedeInfo" },
  // Proyectar nombre y total
  { $project: { nombreSede: "$sedeInfo.nombre", ingresoTotal: 1, _id: 0 } }
]).forEach(doc => printjson(doc));

// 4. ¿Qué cliente ha usado más veces el parqueadero?
print("\n4. Cliente con más parqueos:");
db.parqueos.aggregate([
  // Agrupar por clienteId y contar registros
  { $group: { _id: "$clienteId", usosTotales: { $sum: 1 } } },
  // Unir con usuarios para obtener nombre
  { $lookup: { from: "usuarios", localField: "_id", foreignField: "_id", as: "clienteInfo" } },
  { $unwind: "$clienteInfo" },
  // Proyectar nombre completo y usos
  { $project: { nombreCliente: { $concat: ["$clienteInfo.nombre", " ", "$clienteInfo.apellido"] }, usosTotales: 1, _id: 0 } },
  // Ordenar y limitar al top 1
  { $sort: { usosTotales: -1 } },
  { $limit: 1 }
]).forEach(doc => printjson(doc));

// 5. ¿Qué tipo de vehículo es más frecuente por sede?
print("\n5. Tipo de vehículo más frecuente por sede:");
db.parqueos.aggregate([
  // Unir con vehiculos para obtener tipo
  { $lookup: { from: "vehiculos", localField: "vehiculoId", foreignField: "_id", as: "vehInfo" } },
  { $unwind: "$vehInfo" },
  // Agrupar por sedeId y tipo, contar
  { $group: { _id: { sede: "$sedeId", tipoVehiculo: "$vehInfo.tipo" }, count: { $sum: 1 } } },
  // Ordenar para poder agrupar top por sede
  { $sort: { "_id.sede": 1, count: -1 } },
  // Agrupar por sede seleccionando primer tipo
  { $group: { _id: "$_id.sede", tipoFrecuente: { $first: "$_id.tipoVehiculo" }, total: { $first: "$count" } } },
  // Unir con sedes
  { $lookup: { from: "sedes", localField: "_id", foreignField: "_id", as: "sedeInfo" } },
  { $unwind: "$sedeInfo" },
  // Proyectar datos finales
  { $project: { nombreSede: "$sedeInfo.nombre", tipoFrecuente: 1, total: 1, _id: 0 } }
]).forEach(doc => printjson(doc));

// 6. Historial de parqueos de un cliente dado (reemplazar CLIENTE_ID)
print("\n6. Historial de parqueos de un cliente específico:");
const clienteIdBusqueda = ObjectId("507f1f77bcf86cd799439011"); //ID del cliente
db.parqueos.aggregate([
  // Filtrar por clienteId
  { $match: { clienteId: clienteIdBusqueda } },
  // Unir con sedes, zonas y vehiculos para detalles
  { $lookup: { from: "sedes", localField: "sedeId", foreignField: "_id", as: "sedeInfo" } },
  { $unwind: "$sedeInfo" },
  { $lookup: { from: "zonas", localField: "zonaId", foreignField: "_id", as: "zonaInfo" } },
  { $unwind: "$zonaInfo" },
  { $lookup: { from: "vehiculos", localField: "vehiculoId", foreignField: "_id", as: "vehInfo" } },
  { $unwind: "$vehInfo" },
  // Proyectar campos deseados
  { $project: {
      fecha:        "$horaEntrada",
      sede:         "$sedeInfo.nombre",
      zona:         "$zonaInfo.nombre",
      tipoVehiculo: "$vehInfo.tipo",
      tiempoMin:    "$tiempoTotal",
      costoTotal:   "$costoTotal",
      _id: 0
    }
  }
]).forEach(doc => printjson(doc));

// 7. Vehículos parqueados actualmente en cada sede
print("\n7. Vehículos activos por sede:");
db.parqueos.aggregate([
  // Filtrar activos (sin horaSalida)
  { $match: { horaSalida: null } },
  // Agrupar por sedeId y contar
  { $group: { _id: "$sedeId", activos: { $sum: 1 } } },
  // Unir con sedes
  { $lookup: { from: "sedes", localField: "_id", foreignField: "_id", as: "sedeInfo" } },
  { $unwind: "$sedeInfo" },
  // Proyectar resultados
  { $project: { nombreSede: "$sedeInfo.nombre", activos: 1, _id: 0 } }
]).forEach(doc => printjson(doc));

// 8. Zonas que han excedido su capacidad de parqueo en algún momento
print("\n8. Zonas con uso excedido:");
db.parqueos.aggregate([
  // Agrupar para contar usos por zona
  { $group: { _id: "$zonaId", usos: { $sum: 1 } } },
  // Unir con zonas para obtener capacidadMaxima
  { $lookup: { from: "zonas", localField: "_id", foreignField: "_id", as: "zonaInfo" } },
  { $unwind: "$zonaInfo" },
  // Filtrar donde usos > capacidadMaxima
  { $match: { $expr: { $gt: ["$usos", "$zonaInfo.capacidadMaxima"] } } },
  // Unir con sedes para nombre de sede
  { $lookup: { from: "sedes", localField: "zonaInfo.sedeId", foreignField: "_id", as: "sedeInfo" } },
  { $unwind: "$sedeInfo" },
  // Proyectar resultados de zonas excedidas
  { $project: {
      nombreSede:      "$sedeInfo.nombre",
      nombreZona:      "$zonaInfo.nombre",
      usos:            1,
      capacidadMaxima: "$zonaInfo.capacidadMaxima",
      _id: 0
    }
  }
]).forEach(doc => printjson(doc));

print("Consultas analíticas completadas.");