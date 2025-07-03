// roles.js - Definición de roles y asignación en MongoDB para Campus Parking

// 1. Crear roles en la base de datos campusParking

// Administrador: acceso total
db.createRole({
    role: "administrador",
    privileges: [
      { resource: { db: "campusParking", collection: "usuarios" }, actions: ["find", "insert", "update", "remove"] },
      { resource: { db: "campusParking", collection: "vehiculos" }, actions: ["find", "insert", "update", "remove"] },
      { resource: { db: "campusParking", collection: "sedes" }, actions: ["find", "insert", "update", "remove"] },
      { resource: { db: "campusParking", collection: "zonas" }, actions: ["find", "insert", "update", "remove"] },
      { resource: { db: "campusParking", collection: "parqueos" }, actions: ["find", "insert", "update", "remove"] }
    ],
    roles: []
  });
  
  // Empleado de sede: lectura de clientes/vehiculos, gestión de parqueos en su sede
  // Requiere filtro por sedeId, asumimos que el usuario tiene campo "sedeId" asignado
  
  db.createRole({
    role: "empleado",
    privileges: [
      {
        resource: { db: "campusParking", collection: "usuarios" },
        actions: ["find"],
        // Solo puede ver usuarios con same sedeId => no hay filter support en createRole, controlar desde la aplicación
      },
      { resource: { db: "campusParking", collection: "vehiculos" }, actions: ["find"] },
      { resource: { db: "campusParking", collection: "parqueos" }, actions: ["find", "insert", "update"] }
    ],
    roles: []
  });
  
  // Cliente: solo lectura de su perfil, historial y disponibilidad general
  db.createRole({
    role: "cliente",
    privileges: [
      { resource: { db: "campusParking", collection: "usuarios" }, actions: ["find"] },
      { resource: { db: "campusParking", collection: "parqueos" }, actions: ["find"] },
      { resource: { db: "campusParking", collection: "zonas" }, actions: ["find"] }
    ],
    roles: []
  });
  
  // 2. Crear usuarios de ejemplo y asignarles roles
  
  // Administrador
  db.createUser({
    user: "admin1",
    pwd: "passwordAdmin",
    roles: [ { role: "administrador", db: "campusParking" } ]
  });
  
  // Empleado
  db.createUser({
    user: "empleado1",
    pwd: "passwordEmp",
    roles: [ { role: "empleado", db: "campusParking" } ]
  });
  
  // Cliente
  db.createUser({
    user: "cliente1",
    pwd: "passwordCli",
    roles: [ { role: "cliente", db: "campusParking" } ]
  });
  
  print("Roles y usuarios creados con permisos adecuados.");