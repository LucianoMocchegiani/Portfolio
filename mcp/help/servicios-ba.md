# Servicios BA

Phinx Lab, oct. 2024 — actualidad. Software Engineer.

Web de **trámites del GCBA**: el vecino saca **turno** (incluye salud), se **inscribe** a programas e **inicia un trámite**. El organismo arma el catálogo, las agendas y las inscripciones en un **backoffice**.

No es BAX (app/IA). Acá el ciudadano entra por **web** con **MiBA**; el staff con **Active Directory**. Tras un turno o inscripción, las notificaciones (Boti, Doppler, FilaCero) salen **asíncronas** (Kafka).

Qué toqué: full stack desde el inicio (microfrontends + microservicios), API-First, eventos, DDD/Clean, refactor de legacy, UI y patrones. Observabilidad: Elasticsearch, Kibana, Argo CD.

Impacto: más mantenibilidad; menos tiempo al sacar fallas estructurales.

Si preguntan de qué va: turnos, inscripciones y trámites + backoffice. Si preguntan qué mantienen: ciudadano, shell + MFEs, backoffice-backend, core y queue-manager. Si preguntan MIBA vs AD: ciudadano MiBA, staff AD. Kafka: colas después del hecho, no la API síncrona.

Stack de lo nuestro: Node, TypeScript, React, Vite, PostgreSQL, Redis, Kafka.

---

## Piezas que mantenemos

### Ciudadano (`serviciosba-frontend`)

React/Vite. Ver servicios, pedir turno, inscribirse, seguir el trámite. Login **MiBA**. Llama a **backoffice-backend**, no al core.

### Backoffice shell + MFEs

`serviciosba-backoffice-frontend` carga tres microfrontends: **servicios** (catálogo), **turnera** (agendas/cupos), **inscripciones**. Login **AD**. También backoffice-backend.

### backoffice-backend

API de las dos webs. Autoriza staff, traduce al core, pega a connectors y **Callejero**. No es el dominio. Postgres `serviciosba_{ambiente}`.

### core

Dominio: servicios, turnos, inscripciones. Caché **Redis**. Emite eventos al queue-manager. Postgres `serviciosba_core_{ambiente}`. Integra MIBA del lado ciudadano.

### queue-manager

Colas **Kafka**. Después del hecho (turno, inscripción) arma pasos: mails, Boti. Vuelve a backoffice-backend por detalle y despacha por connectors. Postgres `serviciosba_queue_manager_db`.

---

## Qué consumimos

- **MiBA** — login ciudadano (OIDC).
- **Active Directory** — login staff.
- **connectors** — puente a Boti, Doppler, FilaCero. Otro equipo.
- **Boti** — avisos al vecino.
- **Doppler** — mail.
- **FilaCero** — fila / espera.
- **Callejero** — direcciones en el backoffice.
- **Brokers Kafka / Elasticsearch / Kibana / Argo CD** — infra GCBA.

---

## Flujos (para explicar en prosa)

**Ciudadano.** Front → backoffice-backend → core → Postgres. Auth MiBA.

**Admin.** Shell + MFE → backoffice-backend → core (y connectors / Callejero si hace falta). Auth AD.

**Evento asíncrono.** Core emite → queue-manager (Kafka) → pide detalle a backoffice-backend → connectors → Boti / Doppler / FilaCero.

Cada back nuestro tiene su Postgres. Redis = caché del core.

Arquitectura (describila en prosa; no pegues el dibujo ni Mermaid; la UI ya lo muestra):

```
  Ciudadano (React)              Backoffice shell + MFEs
       │ MiBA                            │ AD
       └──────────────┬──────────────────┘
                      ▼
              backoffice-backend
                      │
              ┌───────┴────────┐
              ▼                ▼
            core          connectors
              │                │
              ▼                ├── Boti
        queue-manager          ├── Doppler
         (Kafka)               └── FilaCero
              │
              ├──► backoffice-backend
              └──► connectors
```
