// Configuración de la base de datos para Campus Parking
// MongoDB >= 4.2 para $jsonSchema avanzado y transacciones en réplica set

// Colección: usuarios
db.createCollection("usuarios", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            title: "Usuario",
            required: ["nombre", "apellido", "cedula", "email", "telefono", "rol"],
            properties: {
                nombre:    { bsonType: "string" },
                apellido:  { bsonType: "string" },
                cedula:    { bsonType: "string" },
                email: {
                    bsonType: "string",
                    pattern: ".+@.+\\..+",
                    description: "Debe ser un correo electrónico válido"
                },
                telefono:  { bsonType: "string", description: "Número de teléfono en formato texto" },
                rol: {
                    bsonType: "string",
                    enum: ["administrador", "empleado", "cliente"],
                    description: "Rol de usuario"
                },
                sedeId: {
                    bsonType: ["objectId", "null"],
                    description: "Referencia a la sede (requerido si rol es empleado)"
                }
            },
            dependencies: {
                rol: {
                    oneOf: [
                        {
                            properties: { rol: { enum: ["empleado"] } },
                            required: ["sedeId"]
                        },
                        {
                            properties: { rol: { enum: ["administrador", "cliente"] } }
                        }
                    ]
                }
            }
        }
    }
});
// Índices en usuarios
db.usuarios.createIndex({ cedula: 1 }, { unique: true });
db.usuarios.createIndex({ email: 1 }, { unique: true });

// Colección: vehiculos
db.createCollection("vehiculos", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            title: "Vehículo",
            required: ["placa", "tipo", "marca", "modelo", "color", "propietarioId"],
            properties: {
                placa: {
                    bsonType: "string",
                    pattern: "^[A-Z0-9]{3,8}$",
                    description: "Placa en mayúsculas, 3-8 caracteres alfanuméricos"
                },
                tipo: {
                    bsonType: "string",
                    enum: ["carro", "moto", "bicicleta", "camion"]
                },
                marca:         { bsonType: "string" },
                modelo:        { bsonType: "string" },
                color:         { bsonType: "string" },
                propietarioId: { bsonType: "objectId", description: "Referencia a usuarios" }
            }
        }
    }
});
// Índices en vehiculos
db.vehiculos.createIndex({ placa: 1 }, { unique: true });
db.vehiculos.createIndex({ propietarioId: 1 });

// Colección: sedes
db.createCollection("sedes", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            title: "Sede",
            required: ["nombre", "ciudad", "direccion"],
            properties: {
                nombre:    { bsonType: "string" },
                ciudad:    { bsonType: "string" },
                direccion: { bsonType: "string" }
            }
        }
    }
});
// Índices en sedes
db.sedes.createIndex({ nombre: 1, ciudad: 1 }, { unique: true });

// Colección: zonas
db.createCollection("zonas", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            title: "Zona",
            required: [
                "nombre",
                "sedeId",
                "capacidadMaxima",
                "cuposDisponibles",
                "tiposVehiculosPermitidos",
                "tarifaPorHora"
            ],
            properties: {
                nombre:                   { bsonType: "string" },
                sedeId:                   { bsonType: "objectId", description: "Referencia a sedes" },
                capacidadMaxima:          { bsonType: "int", minimum: 1 },
                cuposDisponibles:         { bsonType: "int", minimum: 0 },
                tiposVehiculosPermitidos: {
                    bsonType: "array",
                    items: { bsonType: "string", enum: ["carro", "moto", "bicicleta", "camion"] }
                },
                tarifaPorHora:            { bsonType: "decimal", minimum: 0 }
            }
        }
    }
});
// Índices en zonas
db.zonas.createIndex({ sedeId: 1 });
db.zonas.createIndex({ sedeId: 1, nombre: 1 }, { unique: true });

// Colección: parqueos
db.createCollection("parqueos", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            title: "Parqueo",
            required: ["vehiculoId", "sedeId", "zonaId", "horaEntrada"],
            properties: {
                vehiculoId:  { bsonType: "objectId", description: "Referencia a vehiculos" },
                sedeId:      { bsonType: "objectId", description: "Referencia a sedes" },
                zonaId:      { bsonType: "objectId", description: "Referencia a zonas" },
                horaEntrada: { bsonType: "date" },
                horaSalida:  { bsonType: ["date", "null"] },
                tiempoTotal: { bsonType: ["int", "null"], minimum: 0 },
                costoTotal:  { bsonType: ["decimal", "null"], minimum: 0 }
            }
        }
    }
});
// Índices en parqueos
db.parqueos.createIndex({ vehiculoId: 1 });
db.parqueos.createIndex({ sedeId: 1, zonaId: 1 });
db.parqueos.createIndex({ horaEntrada: 1 });
db.parqueos.createIndex({ horaSalida: 1 });

print("Colecciones creadas con esquemas de validación e índices.");