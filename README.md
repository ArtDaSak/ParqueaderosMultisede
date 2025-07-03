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
   git clone https://github.com/ArtDaSak/ParqueaderosMultisede.git campus-parking
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

## 🔐 Seguridad y Control de Acceso

- **roles.js** crea roles con permisos CRUD específicos usando `db.createRole`.
- Usuarios de ejemplo con `db.createUser` para cada rol: Administrador, Empleado, Cliente.
- Restricciones de **sede** deben reforzarse en la capa de aplicación o mediante reglas avanzadas de Mongo.

---

## 🚀 Tecnologías Utilizadas:

<ul>
    <li>
        <a href="https://www.mongodb.com/" target="_blank" rel="noreferrer">
            <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/mongodb/mongodb-original.svg" alt="MongoDB" width="15"/>
        </a>
        MongoDB – Base de datos NoSQL usada para modelado flexible, validaciones y transacciones.
    </li>
    <li>
        <a href="https://developer.mozilla.org/es/docs/Web/JavaScript" target="_blank" rel="noreferrer">
            <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" alt="JavaScript" width="15"/>
        </a>
        JavaScript (ES6+) – Lenguaje principal para scripts, agregaciones y lógica de backend.
    </li>
    <li>
        <a href="https://nodejs.org/" target="_blank" rel="noreferrer">
            <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg" alt="Node.js" width="15"/>
        </a>
        Node.js – Ejecuta scripts modernos (como transacciones y pruebas).
    </li>
    <li>
        <a href="https://www.json.org/json-es.html" target="_blank" rel="noreferrer">
            <img src="https://www.json.org/img/json160.gif" alt="JSON" width="15"/>
        </a>
        JSON – Formato usado para estructuras de datos y comunicación entre scripts.
    </li>
    <li>
        <a href="https://daringfireball.net/projects/markdown/" target="_blank" rel="noreferrer">
            <img src="https://cdn.commonmark.org/uploads/default/original/2X/3/366f3614de6996d79a131fdf9b41ed7d65cfe181.png" alt="Markdown" width="15"/>
        </a>
        Markdown – Para la documentación clara y organizada del proyecto.
    </li>
    <li>
        <a href="https://code.visualstudio.com/" target="_blank" rel="noreferrer">
            <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/vscode/vscode-original.svg" alt="VS Code" width="15"/>
        </a>
        Visual Studio Code – Editor principal de desarrollo, con extensiones para Mongo, Git y JS.
    </li>
    <li> 
        <a href="https://git-scm.com/" target="_blank" rel="noreferrer">
            <img src="https://www.vectorlogo.zone/logos/git-scm/git-scm-icon.svg" alt="Git" width="15"/>
        </a>
        Git – Control de versiones para rastreo de cambios y ramas del proyecto.
    </li>
    <li> 
        <a href="https://github.com/" target="_blank" rel="noreferrer">
            <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/github/github-original.svg" alt="GitHub" width="15"/>
        </a>
        GitHub – Almacenamiento remoto del repositorio y colaboración entre desarrolladores.
    </li>
</ul>

---

### 📜 Licencia

Este proyecto está bajo [Licencia MIT](./LICENSE.md).

## ✨ Créditos:

🅿️ **Campus Parking** es un proyecto desarrollado con el propósito de aprender y aplicar conceptos avanzados de bases de datos NoSQL, específicamente MongoDB, en un contexto realista de gestión de parqueaderos. Agradecemos a todas las personas y comunidades que han contribuido con recursos y conocimiento para hacer posible este proyecto.

El proyecto fue diseñado con 💖 por _ArtDaSak_ y _Charlie_ (ChatGPT de OpenAI, IA colaborativa).

---

## 👀 Disclaimer:

Este proyecto fue desarrollado con apoyo de herramientas de inteligencia artificial (IA), mayormente Charlie (ChatGPT de OpenAI) y Grok (xAI), utilizadas con fines exclusivamente educativos y de aprendizaje personal.
