# 📋 Inventario Tecnológico — IPE Services

> **Proyecto:** `ipe-services` — Backend API para el Instituto de Psicología y Educación  
> **Versión:** `0.1.0`  
> **Última actualización:** 6 de marzo de 2026

---

## 🏗️ Framework Principal

| Tecnología     | Versión                                | Rol                                                                           |
| -------------- | -------------------------------------- | ----------------------------------------------------------------------------- |
| **NestJS**     | `^11.0.1`                              | Framework backend principal (módulos, inyección de dependencias, decoradores) |
| **Fastify**    | via `@nestjs/platform-fastify ^11.0.1` | Servidor HTTP de alto rendimiento (reemplaza Express)                         |
| **TypeScript** | `^5.7.3`                               | Lenguaje de programación (strict mode habilitado)                             |
| **Node.js**    | `22` (Alpine)                          | Runtime de ejecución                                                          |
| **RxJS**       | `^7.8.1`                               | Programación reactiva (streams, observables)                                  |

### Configuración TypeScript

- **Target:** ES2022
- **Module:** CommonJS
- **Strict mode:** Habilitado (`strict`, `noImplicitAny`, `strictNullChecks`, `strictBindCallApply`)
- **Path aliases:** `@common/*`, `@config/*`, `@modules/*`, `@auth/*`, `@database/*`

---

## 🗄️ Base de Datos

| Tecnología     | Versión       | Rol                                    |
| -------------- | ------------- | -------------------------------------- |
| **PostgreSQL** | `16` (Alpine) | Base de datos relacional principal     |
| **Prisma ORM** | `^6.0.0`      | ORM, migraciones y generación de tipos |
| **Redis**      | `7` (Alpine)  | Caché, almacenamiento en memoria       |
| **ioredis**    | `^5.9.3`      | Cliente Redis para Node.js             |

### Scripts de Base de Datos

```bash
npm run db:generate       # Genera el cliente Prisma
npm run db:migrate:dev    # Ejecuta migraciones en desarrollo
npm run db:migrate:deploy # Despliega migraciones en producción
npm run db:push           # Sincroniza schema sin migraciones
npm run db:seed           # Ejecuta el seeder (ts-node prisma/seed.ts)
npm run db:studio         # Abre Prisma Studio (GUI)
```

### Conexiones

- **DATABASE_URL:** Conexión principal (pooler si disponible)
- **DIRECT_URL:** Conexión directa para migraciones

---

## 🔐 Autenticación y Seguridad

| Tecnología            | Versión   | Rol                                            |
| --------------------- | --------- | ---------------------------------------------- |
| **Passport**          | `^0.7.0`  | Framework de autenticación                     |
| **passport-jwt**      | `^4.0.1`  | Estrategia JWT para Passport                   |
| **@nestjs/jwt**       | `^11.0.2` | Módulo JWT integrado con NestJS                |
| **@nestjs/passport**  | `^11.0.0` | Integración Passport ↔ NestJS                  |
| **Argon2**            | `^0.44.0` | Hashing de contraseñas (más seguro que bcrypt) |
| **Helmet**            | `^8.0.0`  | Protección de headers HTTP                     |
| **@nestjs/throttler** | `^6.0.0`  | Rate limiting / protección contra abuso        |

### Configuración JWT

- **Access Token:** Expira en `15m`
- **Refresh Token:** Expira en `7d`
- **Autenticación Swagger:** Bearer token

---

## 📦 Módulos NestJS del Framework

| Módulo                    | Versión   | Rol                                                       |
| ------------------------- | --------- | --------------------------------------------------------- |
| **@nestjs/config**        | `^4.0.0`  | Configuración centralizada / variables de entorno         |
| **@nestjs/swagger**       | `^11.0.0` | Documentación automática de la API (OpenAPI / Swagger UI) |
| **@nestjs/terminus**      | `^11.0.0` | Health checks y readiness probes                          |
| **@nestjs/event-emitter** | `^3.0.0`  | Sistema de eventos internos (pub/sub)                     |
| **@nestjs/mapped-types**  | `^2.0.0`  | Utilidades para DTOs (PartialType, PickType, etc.)        |
| **@fastify/static**       | `^9.0.0`  | Servir archivos estáticos                                 |

---

## ✅ Validación y Transformación

| Tecnología            | Versión   | Rol                                                              |
| --------------------- | --------- | ---------------------------------------------------------------- |
| **class-validator**   | `^0.14.1` | Validación con decoradores (`@IsEmail()`, `@IsNotEmpty()`, etc.) |
| **class-transformer** | `^0.5.1`  | Transformación automática de objetos / DTOs                      |
| **Zod**               | `^3.23.0` | Validación de schemas (complementario)                           |

### Configuración del ValidationPipe

```typescript
new ValidationPipe({
  whitelist: true, // Elimina propiedades no declaradas
  forbidNonWhitelisted: true, // Error si se envían propiedades extra
  transform: true, // Transforma automáticamente los tipos
  transformOptions: {
    enableImplicitConversion: true, // Convierte strings a números, booleans, etc.
  },
});
```

---

## 🐳 Infraestructura y Contenedores

### Docker

| Componente          | Detalle                                        |
| ------------------- | ---------------------------------------------- |
| **Imagen base**     | `node:22-alpine`                               |
| **Build**           | Multi-stage (base → deps → build → production) |
| **Process manager** | `dumb-init` (manejo correcto de señales)       |
| **Usuario**         | `nestjs` (UID 1001, no-root)                   |
| **Puerto expuesto** | `3000`                                         |
| **Healthcheck**     | `wget` a `/api/v1/health/live` cada 30s        |

### Docker Compose

| Archivo                   | Entorno        | Servicios                       |
| ------------------------- | -------------- | ------------------------------- |
| `docker-compose.yml`      | **Desarrollo** | `api`, `postgres`, `redis`      |
| `docker-compose.prod.yml` | **Producción** | `api` (imagen de GHCR), `redis` |

### Servicios en Desarrollo

| Servicio   | Imagen               | Puerto |
| ---------- | -------------------- | ------ |
| `api`      | Build local          | `3000` |
| `postgres` | `postgres:16-alpine` | `5432` |
| `redis`    | `redis:7-alpine`     | `6379` |

---

## 🚀 CI/CD y Deploy

### GitHub Actions (`deploy.yml`)

```
Push a main → Build Docker image → Push a GHCR → Deploy a VPS via SSH
```

| Paso               | Herramienta                                          |
| ------------------ | ---------------------------------------------------- |
| **Checkout**       | `actions/checkout@v4`                                |
| **Registry login** | `docker/login-action@v3` → GitHub Container Registry |
| **Build & Push**   | `docker/build-push-action@v6`                        |
| **Deploy**         | `appleboy/ssh-action@v1` → SSH al VPS                |

### Registry de Imágenes

- **Registry:** `ghcr.io`
- **Imagen:** `ghcr.io/vicalcantfrontend/ipe-services`
- **Tags:** `latest` + SHA del commit

### Estrategia de Deploy

1. SSH al VPS (`/opt/ipe-services`)
2. Crea red `ipe_network` si no existe
3. Pull de la última imagen
4. Recreación forzada del servicio `api`
5. Limpieza de imágenes antiguas

---

## 🧪 Testing

| Tecnología          | Versión   | Rol                                     |
| ------------------- | --------- | --------------------------------------- |
| **Jest**            | `^30.0.0` | Framework de pruebas                    |
| **ts-jest**         | `^29.2.5` | Transformador TypeScript para Jest      |
| **Supertest**       | `^7.0.0`  | Testing de endpoints HTTP / pruebas e2e |
| **@nestjs/testing** | `^11.0.1` | Módulo de testing de NestJS             |

### Scripts de Testing

```bash
npm test              # Ejecuta pruebas unitarias
npm run test:watch    # Modo watch
npm run test:cov      # Con reporte de cobertura
npm run test:debug    # Con inspector de Node.js
npm run test:e2e      # Pruebas end-to-end
```

---

## 🔧 Herramientas de Desarrollo

| Tecnología             | Versión   | Rol                                           |
| ---------------------- | --------- | --------------------------------------------- |
| **ESLint**             | `^9.18.0` | Linter (flat config)                          |
| **typescript-eslint**  | `^8.20.0` | Reglas TypeScript para ESLint                 |
| **Prettier**           | `^3.4.2`  | Formateador de código                         |
| **ts-node**            | `^10.9.2` | Ejecución directa de TypeScript               |
| **ts-loader**          | `^9.5.2`  | Loader TypeScript para webpack                |
| **source-map-support** | `^0.5.21` | Soporte de source maps en runtime             |
| **@nestjs/cli**        | `^11.0.0` | CLI de NestJS (generación de archivos, build) |
| **@nestjs/schematics** | `^11.0.0` | Plantillas para generación de código          |

### Configuración ESLint

- **Formato:** Flat config (`eslint.config.mjs`)
- **Extends:** `eslint:recommended` + `typescript-eslint:recommendedTypeChecked` + Prettier
- **Reglas personalizadas:**
  - `no-explicit-any` → off
  - `no-floating-promises` → warn
  - `no-unsafe-argument` → warn

---

## 🌐 Configuración de la API

| Parámetro             | Valor                              |
| --------------------- | ---------------------------------- |
| **Prefijo global**    | `/api`                             |
| **Versionado**        | URI-based (`/api/v1/...`)          |
| **Puerto**            | `3000`                             |
| **CORS origins**      | `localhost:3000`, `localhost:5173` |
| **Swagger UI**        | `/docs`                            |
| **Trust proxy**       | Habilitado                         |
| **Graceful shutdown** | Habilitado                         |

---

## 📁 Arquitectura de Módulos

### Módulos de Dominio (`src/modules/`)

| Módulo             | Archivos | Descripción                       |
| ------------------ | -------- | --------------------------------- |
| `appointments`     | 5        | Gestión de citas                  |
| `billing`          | 4        | Facturación y pagos               |
| `clinical-records` | 3        | Registros clínicos                |
| `diplomados`       | 8        | Diplomados y programas educativos |
| `enrollments`      | 3        | Inscripciones                     |
| `notifications`    | 3        | Sistema de notificaciones         |
| `patients`         | 3        | Gestión de pacientes              |
| `students`         | 8        | Gestión de estudiantes            |
| `users`            | 9        | Gestión de usuarios               |

### Módulos Transversales (`src/`)

| Módulo                   | Descripción                                         |
| ------------------------ | --------------------------------------------------- |
| `auth/` (17 archivos)    | Autenticación, guards, estrategias JWT              |
| `common/` (16 archivos)  | Utilidades compartidas, decoradores, filtros, pipes |
| `config/` (6 archivos)   | Configuración de la aplicación                      |
| `database/` (5 archivos) | Prisma service, conexión a base de datos            |
| `health/` (3 archivos)   | Health checks (liveness, readiness)                 |
| `events/`                | Sistema de eventos                                  |
| `jobs/`                  | Tareas programadas / background jobs                |

---

## 📊 Resumen del Stack

```
┌─────────────────────────────────────────────────────┐
│                    CLIENTE                           │
│              (Frontend en :5173)                     │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP / REST
┌──────────────────────▼──────────────────────────────┐
│              NESTJS + FASTIFY (:3000)                │
│  ┌─────────┐ ┌──────────┐ ┌───────────┐            │
│  │ Swagger  │ │ Passport │ │ Throttler │            │
│  │  /docs   │ │   JWT    │ │  + Helmet │            │
│  └─────────┘ └──────────┘ └───────────┘            │
│  ┌──────────────────────────────────────┐           │
│  │         Módulos de Negocio           │           │
│  │  users · patients · appointments     │           │
│  │  billing · enrollments · diplomados  │           │
│  │  clinical-records · notifications    │           │
│  │  students                            │           │
│  └──────────────────────────────────────┘           │
│  ┌──────────────────────────────────────┐           │
│  │    Prisma ORM · class-validator      │           │
│  └──────────────────────────────────────┘           │
└──────────┬─────────────────────┬────────────────────┘
           │                     │
┌──────────▼──────────┐ ┌───────▼─────────┐
│   PostgreSQL 16     │ │    Redis 7      │
│   (Base de datos)   │ │    (Caché)      │
└─────────────────────┘ └─────────────────┘

CI/CD: GitHub Actions → GHCR → VPS (SSH)
```

---

> 📌 **Nota:** Este documento refleja el estado actual del proyecto al momento de su generación. Actualizar conforme evolucione el stack.
