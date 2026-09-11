# BAX

Asignación actual en Phinx Lab (oct. 2024 — actualidad) para el GCBA. https://bax.buenosaires.gob.ar/

**BAX** es la IA / app de la Ciudad: trámites, identidad y credenciales en el celular (texto, voz, imagen). El ciudadano se loguea con **MiBA**, ve documentos digitales, chatea con **Boti** (texto) o **ElevenLabs** (voz), saca turnos/trámites (actividad) y verifica credenciales con un verificador embebido.

No es Servicios BA (eso es la web de turnos). No es QuarkID entero: BAX **usa** MiBA Connect como holder y el verificador genérico embebido. Detalle Quark: topic `quarkid`.

Rol: Software Engineer. Qué toqué: app Flutter, session-ms, miba2-api, MiBA Connect, verificador embebido, flujos QR.

Si preguntan qué mantienen: app, session-ms, miba2-api, MiBA Connect y el verificador. El resto se consume.

---

## Piezas que mantenemos

### BAX app (Flutter)

Home, documentos, chat Boti/voz, actividad (turnos/trámites), QR. Flavors dev/qa/hml/prod. **Sin DB propia.** Auth OIDC contra MiBA Login (`miba-mobile`). Casi todo lo de negocio pasa por **session-ms**. Biometría y push van a **miba2-api**. Verificación: WebView del verificador genérico.

### session-ms (BFF, Python/Flask)

Documentos, DID, WACI, historial Boti/ElevenLabs, `activity-summary` (turnos/trámites), eventos. Orquesta al resto. **MariaDB/MySQL** (SQLAlchemy: sesiones, chats, eventos, DIDs) + **Redis** (caché WACI + lock del scheduler).

### miba2-api (Python/Flask)

Biometría BIOMIX y notificaciones (push / NEF). **MySQL/MariaDB**. Push **Firebase**. Hay `REDIS_HOST` en el entorno; **el código no usa Redis**.

### MiBA Connect

Holder SSI: DIDs, VCs, WACI. Session-ms lo llama como Extrimian/IDConnect. Incluye websocket. **MongoDB + Redis**. Más detalle en topic `quarkid`.

### Verificador genérico (embebido)

Front WebView + back Nest. QR, sesión, WebSocket. **PostgreSQL + Redis** (TTL). Mismo verificador del ecosistema Quark.

---

## Qué consumimos

- **MiBA Login** — OIDC / Keycloak (`miba-mobile`).
- **Boti (Botmaker)** — chat texto. Session-ms proxea historial/webchat; el token no va al cliente.
- **ElevenLabs** — voz. Session-ms emite el token de conversación.
- **Proxy Core** — documentos de carpeta ciudadana → agente Quark.
- **TAD / VisionBA** — trámites y turnos/actividad vía `activity-summary`. La app **no** llama a Servicios BA.
- **GEDO** — documentos de expediente.
- **Eventos** — agenda (gestor de contenidos / Linda).

---

## Flujos (para explicar en prosa)

**Login.** App → MiBA Login (OIDC) → session-ms emite session token.

**Documentos.** App → session-ms → Proxy Core / Connect → listado de VCs. WACI: session-ms + Redis + MiBA Connect.

**Chat texto.** App → session-ms `/chat/boti` → Botmaker. Historial en MariaDB.

**Chat voz.** App → session-ms pide token ElevenLabs → conversación; historial en session-ms.

**Actividad.** App → `/activity-summary` → TAD + VisionBA (turnos, trámites, reclamos).

**Verificar.** App abre WebView del verificador → WACI con la wallet/Connect.

DBs en prosa (no en el dibujo): session-ms = MariaDB + Redis; miba2-api = MySQL; Connect = Mongo + Redis; verificador = Postgres + Redis.

Arquitectura (describila en prosa; no pegues el dibujo ni Mermaid; la UI ya lo muestra):

```
                    Ciudadano
                        │
                    ┌───▼───┐
                    │  BAX  │  app Flutter
                    └───┬───┘
                        │
         ┌──────────┬───┴────┬──────────────┐
         ▼          ▼        ▼              ▼
      MiBA     session-ms  miba2-api   Verificador
      Login         │      (bio/push)   (WebView)
                    │
     ┌──────┬───────┼───────┬────────┬───────┬────────┐
     ▼      ▼       ▼       ▼        ▼       ▼        ▼
   Boti  Eleven  MiBA    Proxy    TAD /    GEDO    Eventos
         Labs   Connect  Core    VisionBA
```
