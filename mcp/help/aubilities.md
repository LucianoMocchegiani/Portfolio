# Aubilities

https://aubilities.com/ — oct. 2023 — oct. 2024, Full Stack Developer (remoto).

Find My Couch, construido desde cero: arquitectura por contextos, Cognito (JWT, RBAC), datos sensibles, paquetes por perfil cognitivo, calendario, panel de administración.

Hice: núcleo funcional (registro, login, perfiles, archivos, paquetes, asistencia), auth Cognito, admin de usuarios/paquetes/especialistas, testing y refactor.

Impacto: modernización completa, arquitectura clara y mantenible. Logro: núcleo funcional completo del producto.

Stack: React, MUI, Node.js, Express, AWS Cognito, Vite.

Arquitectura (describila en prosa; no pegues el dibujo ni Mermaid; la UI ya lo muestra):

```
  Microfrontends (Vite)
           │
           ▼
        APIs Node
           │
          AWS
```

