# Aubilities

https://aubilities.com/ — oct. 2023 — oct. 2024, Full Stack Developer (remoto).

Plataforma de **inclusión cognitiva / neurodivergencia**. El sitio de hoy habla de **Aubi-One**; en esa etapa era esta plataforma web.

El **usuario** se loguea, completa **cuestionarios** de neurodivergencia, ve **noticias y eventos**, usa el **chat** y **Find My Couch**. El **admin** opera y **audita todo lo que entra**.

**PHP era legado** (ahí estaba montado usuario + admin). Se buscaba **migrar a React**. Yo trabajaba en los **productos React**, no en el PHP como destino.

Si preguntan de qué va: plataforma de neurodivergencia. Si preguntan Find My Couch: módulo React para **encontrar un couch** (así se llama en el producto), con **sesiones** y **fotos en S3** — no es el nombre del producto ni un “mentor”. Si preguntan qué hice: React + migración, no el monolito PHP.

Stack: React, Vite, AWS Cognito, S3. PHP solo como legado.

---

## Piezas

### Plataforma PHP (legado)

Host viejo: cuestionarios, noticias/eventos, admin/auditoría. Se iba a reemplazar. Yo no “dueño del PHP”.

### Chat (React + Vite)

Producto nuevo montado en el host (ej. público `aubilities-chat-frontend`). Pusher para tiempo real en esa pieza. No es la plataforma entera.

### Find My Couch (React)

Apartado para que la persona neurodivergente **encuentre un couch**. Sistema de **sesiones** (agenda / seguimiento). **Imágenes en S3**. Módulo, no el producto.

### Cognito

Auth (JWT / usuarios). Lo consumimos.

### S3

Fotos de Find My Couch. Lo consumimos.

---

## Qué hice

Chat y Find My Couch (matching, sesiones, S3), auth Cognito, testing/refactor, y el camino de **migración** PHP → React.

Impacto: modernización del stack. Logro: módulos React en producción sobre el host viejo.

---

## Flujos (para explicar en prosa)

**Login.** Usuario o admin → PHP legado → Cognito.

**Cuestionario / noticias.** Siguen en el host PHP (legado) hasta que se migren.

**Chat.** PHP sirve la página → carga el front React → mensajería (Pusher) contra el backend del chat.

**Find My Couch.** Usuario busca couch → sesiones → fotos suben a S3. El módulo React está montado en el mismo host.

Arquitectura (describila en prosa; no pegues el dibujo ni Mermaid; la UI ya lo muestra):

```
  Usuario                         Admin
     │                              │
     └──────────┬───────────────────┘
                ▼
      PHP (legado) ──► Cognito
      (cuestionarios, noticias,
       eventos, auditoría)
                │
         ┌──────┴──────┐
         ▼             ▼
 Chat (React)    Find My Couch (React) ──► S3
   stack nuevo         stack nuevo
```
