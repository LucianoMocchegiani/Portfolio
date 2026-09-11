# ISP Skynet

https://ipskynet.com.ar/ — jun. 2021 — jul. 2023, Full Stack Developer (presencial), **único desarrollador**.

ISP de fibra en General Rodríguez, ~**3000 clientes**. Yo armé la **primera plataforma de autogestión**: el cliente entra, ve el dashboard, paga, cambia de plan y mira si la conexión está caída. Antes eso era mostrador / tickets.

La landing pública de hoy es la empresa (contacto, fibra). El producto que hice es el **portal**. Yo mantuve **todo** el stack de autogestión (front, API, tres adaptadores).

Stack: React 18, TypeScript, Vite, Node/Express, PostgreSQL. Nginx reverse proxy, PM2, HTTPS.

Si preguntan de qué va Skynet: ISP + portal de autogestión. Si preguntan qué hice: front, API y los tres adaptadores, yo solo. Impacto: menos carga operativa (menos tickets de “quiero pagar / ver la factura / está caída la línea”). Logro: primera autogestión, punta a punta.

---

## Piezas que mantuve

### skynet-frontend

Portal del cliente. React + Vite + TypeScript. Estado con Context + hooks. Habla **solo** con `skynet-api` (REST + JWT, refresh automático).

Pantallas: login/registro, dashboard (métricas de conexión), facturas (consulta y descarga), pagos online, planes y cambio de plan, consumo, historial, notificaciones. Responsive móvil/desktop. Caché local de datos frecuentes, loading/errores centralizados, updates optimistas.

### skynet-api

API principal (Express + TypeScript). Orquesta a los tres adaptadores. **PostgreSQL** compartida con sistemas legado del ISP (también vistas read-only al legado).

Módulos: `auth` (JWT + refresh, rate limit de login), `users`, `billing`, `payments`, `plans`, `connections`, `dashboard`, `audit` (acciones críticas: pagos, cambio de plan).

Webhooks de pago llegan acá vía el payment-adapter. Health: `GET /health`.

### skynet-payment-adapter

Abstrae procesadores (Strategy): **Mercado Pago** (tarjeta/transferencia), **procesador bancario local** (API legado), transferencias con validación manual.

Estados: iniciado → procesando → completado / fallido. Webhooks por proveedor (firma HMAC). Retry con backoff, circuit breaker, **idempotencia**. Reembolsos.

Lo usa `skynet-api` (módulo payments). Las **tarjetas no se guardan** (solo tokens del proveedor).

### skynet-connection-adapter

Estado de línea, velocidad down/up, consumo, historial de cortes. Pega al **sistema interno de conexiones** (REST/SOAP legado) y a **vistas PostgreSQL de solo lectura**. Normaliza formatos distintos del legado.

Lo usan conexión y dashboard de la API.

### skynet-billing-adapter

Sync con **facturación legado**: nuevas facturas, estados (pendiente / pagada / vencida), intereses y descuentos, conciliación de pagos, discrepancias. Polling para detectar cambios. Lectura de tablas legado por vistas.

Lo usa el módulo billing de la API.

---

## Qué no construí yo (se consume)

- **Mercado Pago** y **APIs bancarias** — cobro.
- **Sistema interno de conexiones (legado)** — la red del ISP.
- **Facturación legado** — el ISP ya facturaba; el portal se engancha.

Infra: PostgreSQL (sí la usé; compartida con el ISP). **Sin Redis.**

---

## Flujos (para explicar en prosa)

**Login.** Front → `POST /auth/login` → Postgres valida (bcrypt) → JWT corto (~15 min) + refresh. Rate limit en login (pocos intentos por IP).

**Ver factura.** Front → `/billing/invoices` → API lee Postgres; si hace falta, billing-adapter sincroniza con el legado y devuelve.

**Pagar.** Front → `/payments/process` → payment-adapter (MP o banco) → webhook de confirmación → API actualiza pago → billing-adapter concilia la factura en Postgres → el front muestra OK.

**Dashboard / conexión.** Front → `/connections/status` → connection-adapter → sistema interno de red → métricas al dashboard.

**Cambio de plan.** Front → `/plans/change` → API valida el plan en Postgres → connection-adapter aplica en la red → se actualiza el plan → billing-adapter genera la factura nueva.

Comunicación entre servicios: API keys internas, HTTPS, HMAC en webhooks. Inputs sanitizados; SQL con prepared statements.

---

## Datos (Postgres)

Tablas de dominio del portal: usuarios, facturas, pagos, planes, promociones, auditoría, sesiones. Acceso al legado por **vistas read-only**. Connection pooling.

Orden de arranque: Postgres → billing-adapter → connection-adapter → payment-adapter → skynet-api → frontend.

Ambientes: DEV, STAGING, PROD.

Escala de esa época: ~3000 clientes, ~3000 facturas/mes, ~2500 pagos/mes. La API estaba pensada para más de una instancia detrás de Nginx.

Arquitectura (describila en prosa; no pegues el dibujo ni Mermaid; la UI ya lo muestra):

```
  Cliente (~3000)
        │
  skynet-frontend (React)
        │
    skynet-api
        │
   ┌────┼────────────┐
   ▼    ▼            ▼
 payment  connection  billing
 adapter   adapter    adapter
   │         │           │
   ▼         ▼           ▼
 MP /      Red ISP    Facturación
 bancos    (legado)    (legado)
                 │
            PostgreSQL
```
