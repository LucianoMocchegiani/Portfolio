# ISP Skynet

https://ipskynet.com.ar/ — jun. 2021 — jul. 2023, Full Stack Developer (presencial), único desarrollador.

Plataforma web de autogestión para clientes del ISP: registro, login, pagos, planes, promociones, facturación y dashboard. Integración con APIs de pagos y de conexiones.

Impacto: menos carga operativa al habilitar autogestión. Logro: primera plataforma de autogestión del ISP, de punta a punta.

Stack: React, Node.js, Express, PostgreSQL.

Arquitectura (describila en prosa; no pegues el dibujo ni Mermaid; la UI ya lo muestra):

```
  React
    │
    ▼
  Express + Sequelize
    │
  PostgreSQL
```

