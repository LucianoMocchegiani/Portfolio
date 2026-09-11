# Seekitup

https://www.seekitup.com/ — jun. 2023 — oct. 2023, Full Stack Developer (remoto).

**App mobile de red social** (iOS/Android). Backend **API-First**: autenticación, usuarios, módulos sociales y **pizarras en tiempo real**. UI según **Figma**. Performance, testing y refactor de módulos.

El sitio público de hoy puede mostrar otro pitch (guardar links). En **esta ficha** el trabajo es la red social + pizarras de 2023. No inventes un producto de bookmarks como si lo hubieras construido vos.

Si preguntan de qué va: app social + pizarras realtime. Si preguntan React Native o web: **React Native / Expo**, no una web como producto principal. Si preguntan qué hice: app, APIs REST, módulo de pizarras, testing/refactor.

Stack: React Native, Expo, Node.js, Express, PostgreSQL.

---

## Piezas que toqué

### App (`iOS / Android`, Expo)

Cliente mobile. Auth, usuarios, feed/módulos sociales, pizarras colaborativas en tiempo real. Implementación desde Figma.

### API Node (Express)

API-First REST: login, usuarios, social, pizarras. La app habla acá; no hay un BFF aparte.

### PostgreSQL

Persistencia de usuarios, social y estado de las pizarras.

---

## Flujos (para explicar en prosa)

**Auth / perfil.** App → API Express → Postgres.

**Social.** App → APIs de usuarios/módulos → Postgres.

**Pizarra en tiempo real.** App → API (canal realtime del módulo de pizarras) → persistencia en Postgres. Si preguntan el transporte concreto (Socket.io vs otro) y no está acá: no lo inventes; hablá de “tiempo real en el módulo de pizarras”.

Arquitectura (describila en prosa; no pegues el dibujo ni Mermaid; la UI ya lo muestra):

```
  iOS / Android (Expo)
           │
           ▼
        API Node
           │
       PostgreSQL
```
