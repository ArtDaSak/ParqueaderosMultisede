# 🅿️ Campus Parking: Sistema de Gestión de Parqueaderos Multisede

Campus Parking es una solución backend diseñada para administrar múltiples parqueaderos en distintas sedes mediante **MongoDB**, eliminando la duplicación de datos y garantizando integridad y escalabilidad.

> **MongoDB ≥ 4.2** por transacciones ACID en réplica set y validaciones avanzadas con `$jsonSchema`.

## 🚀 Funcionalidades Principales

| Función                           | Script Implementación                                              |
|-----------------------------------|--------------------------------------------------------------------|
| Registro de vehículos             | `db_config.js`, `test_dataset.js`                                  |
| Gestión de usuarios y roles       | `db_config.js`, `roles.js`                                         |
| Control de sedes y zonas          | `db_config.js`, `transactions.js`                                  |
| Registro de ingresos y salidas    | `transactions.js`, `test_dataset.js`                               |
| Consultas analíticas y reportes   | `aggregations.js`                                                  |
| Visualización de historial        | `aggregations.js`, `roles.js`                                      |

## 🛠️ Requisitos Técnicos

- **MongoDB**: v4.2+ con réplica set habilitado
- **Node.js**: v16+ (para scripts Node)
- **npm** o **yarn**

## ⚙️ Instalación y Ejecución Básica

1. Clonar el repositorio y entrar al directorio:
   ```bash
   git clone <URL_PRIVADA> campus-parking
   cd campus-parking
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Crear colecciones, índices y validaciones:
   ```bash
   mongo localhost:27017/campusParking --eval "load('db_config.js')"
   ```
4. Poblar datos de prueba:
   ```bash
   mongo localhost:27017/campusParking --eval "load('test_dataset.js')"
   ```
5. Ejecutar consultas analíticas:
   ```bash
   mongo localhost:27017/campusParking aggregations.js
   ```
6. Configurar roles y usuarios:
   ```bash
   mongo localhost:27017/campusParking roles.js
   ```
7. Registrar ingreso/salida de vehículo (Node.js):
   ```bash
   node transactions.js <vehiculoId> <sedeId> <zonaId> [--salida]
   ```

> **Orden de carga**: `db_config.js` → `test_dataset.js` → resto de scripts.

## 📂 Estructura del Proyecto

```
campus-parking/
├── db_config.js        # Definir colecciones con $jsonSchema e índices
├── test_dataset.js     # Generar datos de prueba coherentes y variados
├── aggregations.js     # Pipelines de agregaciones y reportes
├── roles.js            # Crear roles y usuarios en MongoDB
├── transactions.js     # Registro de ingresos/salidas con transacciones
└── README.md           # Documentación del sistema
```

## 📐 Diseño del Modelo de Datos

- **usuarios** (`camelCase`) con _dependencies_ para que `sedeId` sea requerido si `rol` es **empleado**.
- **vehiculos** con validación de `placa` (regex) y referencia a `propietarioId`.
- **sedes** con índice único en `(nombre, ciudad)`.
- **zonas** para gestionar `capacidadMaxima` y `cuposDisponibles` dinámicos.
- **parqueos** con referencias cruzadas y campos calculados (`tiempoTotal`, `costoTotal`).

### Índices Clave

- `usuarios.cedula`, `usuarios.email` (únicos)
- `vehiculos.placa` (único), `vehiculos.propietarioId`
- `sedes.nombre, ciudad` (único)
- `zonas.sedeId, nombre` (único)
- `parqueos.sedeId, zonaId`, `parqueos.horaEntrada`, `parqueos.horaSalida`

## 📊 Consultas Analíticas

En `aggregations.js` encontrarás pipelines detallados y comentados para:
1. **Parqueos últimos 30 días por sede**
2. **Zonas más ocupadas (porcentaje de uso)**
3. **Ingreso total generado por sede**
4. **Cliente con más uso de parqueadero**
5. **Tipo de vehículo más frecuente por sede**
6. **Historial de parqueos de un cliente específico**
7. **Vehículos actualmente activos por sede**
8. **Zonas que han excedido su capacidad**

> Reemplaza `REEMPLAZAR_CON_ID_DEL_CLIENTE` con un `ObjectId` real para el punto 6.

## 🔐 Seguridad y Control de Acceso

- **roles.js** crea roles con permisos CRUD específicos usando `db.createRole`.
- Usuarios de ejemplo con `db.createUser` para cada rol: Administrador, Empleado, Cliente.
- Restricciones de **sede** deben reforzarse en la capa de aplicación o mediante reglas avanzadas de Mongo.

## 🛣️ Roadmap y Mejoras Futuras

- **Sharding** de la colección `parqueos` para alta concurrencia.
- **Dashboard** con Node.js + Express + React para UI gráfica.
- **Caching** con Redis para consultas frecuentes.
- **Pruebas automatizadas** con Jest o Mocha.

---

### 📜 Licencia

Este proyecto está bajo [Licencia MIT](./LICENSE.md).

## ✨ Créditos:

🅿️ **Campus Parking** es un proyecto desarrollado con el propósito de aprender y aplicar conceptos avanzados de bases de datos NoSQL, específicamente MongoDB, en un contexto realista de gestión de parqueaderos. Agradecemos a todas las personas y comunidades que han contribuido con recursos y conocimiento para hacer posible este proyecto.

El proyecto fue diseñado con 💖 por _ArtDaSak_ y _Charlie_ (ChatGPT de OpenAI, IA colaborativa).

---

## 👀 Disclaimer:

Este proyecto fue desarrollado con apoyo de herramientas de inteligencia artificial (IA), mayormente Charlie (ChatGPT de OpenAI) y Grok (xAI), utilizadas con fines exclusivamente educativos y de aprendizaje personal.