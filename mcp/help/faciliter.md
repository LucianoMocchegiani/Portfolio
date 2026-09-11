# Faciliter

Producto propio. https://faciliter.xyz/ — Software Engineer (punta a punta).

SaaS **multi-tenant de afiliaciones** en Argentina: gyms, clubes, estudios. El local arma **packs** (lo que vende), cobra (Mercado Pago de **su** cuenta + efectivo en caja), controla la **puerta** (QR / credencial SSI) y el socio usa la **app**.

No es un “software de gym genérico”: Brain es el sistema de afiliados. Kuatia entra como **issuer/verifier compartidos** (un producto Kuatia; gyms por claims `tenantId` / `packId`). El dinero del socio **no se queda** en Faciliter.

Si preguntan de qué va: afiliados, packs, caja y puerta para un local. Si preguntan relación con Kuatia: la credencial de acceso es Kuatia. Si preguntan el asistente: consulta (MCP de lectura); no cobra ni escribe.

Stack: NestJS, Next.js, Flutter, PostgreSQL, Redis, chat-api + MCP.

---

## Piezas que mantengo

### Socio (app Flutter)

Estado de cuenta, packs, pagos, calendario, credencial de puerta. Perfil **MEMBER** (nunca el mismo JWT que staff).

### Staff (panel Next / Admin)

Dueño, recepción, profesores. Roles y permisos. Caja, afiliados, packs, sesiones, puerta. Habla con la Nest API. El **asistente** (drawer) habla con **chat-api**, no con Nest directo.

### Super Admin

Misma web, fuera de un gym: CRUD de tenants, impersonate. Login aparte (`SUPER`).

### Nest API

Monolito modular (auth, tenants, members, packs, caja, Mercado Pago, access/Kuatia, etc.). Multi-tenant por `tenant_id` en JWT. **Postgres** `gymbro` + **Redis** (compose; jobs BullMQ cuando haga falta).

### chat-api + MCP

Asistente portable. El panel manda al chat-api → MCP (tools de lectura: socios, caja, reportes, help) → Nest con el Bearer del staff. Postgres database `chat` en la misma instancia. Sin writes.

### Kuatia

Issuer/verifier compartidos. Create/update pack → metadata en el issuer. Pack cobrado → offer OID4VCI. Puerta → OID4VP.

### Mercado Pago

Cuenta **del gym** (`mp.connect`). Checkout + webhook. Derechos (contrato/reserva) solo si el pago está **aprobado**. Efectivo = caja / arqueo.

---

## Flujos (para explicar en prosa)

**Alta de gym.** Super crea tenant → sucursal default, roles, owner Admin. Kuatia: bind de wallets de env (no provision por gym).

**Cobrar un pack.** Staff en caja o socio en la app → carrito → MP o efectivo → contrato vigente → offer Kuatia (el socio acepta en la app).

**Puerta.** Staff genera QR OID4VP → socio escanea → session-ms de Kuatia/verifier → Faciliter decide Allow/Deny (deuda, pack, reserva) y registra intento.

**Asistente.** Staff pregunta en el panel → chat-api → MCP GET a Nest → respuesta + chips de navegación. No da de alta ni cobra.

Arquitectura (describila en prosa; no pegues el dibujo ni Mermaid; la UI ya lo muestra):

```
  Socio (app)     Staff (panel)     Super Admin
       │                │ │               │
       │                │ └──► chat-api ──► Postgres
       │                │           │
       │                │          MCP
       │                │           │
       └────────────────┴───────────┴─────┘
                          ▼
                       Nest API
                          │
            ┌─────────────┼──────────┬──────────┐
            ▼             ▼          ▼          ▼
        Postgres       Redis      Kuatia   Mercado Pago
```
