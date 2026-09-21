# QuarkID

Ecosistema de identidad digital del GCBA, Phinx Lab (oct. 2024 — actualidad). https://buenosaires.gob.ar/gcaba_historico/jefaturadegabinete/innovacionytransformaciondigital/quarkid

Protocolo SSI: credenciales verificables, DIDs (`did:quarkid`), **WACI**, DIDComm. Tres **apps de operadores** (emisor, verificador, accesos), **holder MiBA Connect** y el **nodo DID**.

Qué hice: Lider tecnico, reestructurar y estabilizar; blockchain, wallets, IPFS, Lacchain; WebSockets; bugs criptográficos y de comunicación entre wallets; full stack.

Logro: estabilización al reorganizar servicios y sacar fallas acumuladas.

BAX no corre el protocolo: usa Connect como holder y el verificador embebido. Topic `bax`.

Si preguntan qué mantienen: emisor, verificador, accesos, MiBA Connect (websocket + KMS) y el nodo (Modena, Sidetree, VCSL, IPFS API).

Si preguntan qué es **WACI**: protocolo de **invitación por QR** para emitir o presentar una credencial (el holder escanea; hay una sesión). No es QuarkID entero ni “el estándar de blockchain”. No armes una definición SSI genérica: es ese flujo de emisión/presentación.

WACI: protocolo de presentación/emisión por QR (invitación). Redis en el verificador: TTL de la sesión de verificación.

---

## Piezas que mantenemos

Apps de operadores: cada una **front Next + back Nest + QuarkID Agent / WACI**. Staff con **Active Directory** (eso no es nuestro).

### Emisor genérico

Plantillas + QR WACI. La VC llega al holder (wallet MiBA / Connect). **PostgreSQL**. Revocación vía **VCSL**.

### Verificador genérico

Pide presentación WACI, SSE/WebSocket, webhooks HMAC. Front también embebido en BAX. **PostgreSQL + Redis** (TTL sesión / visualización).

### Accesos GCBA

Eventos y edificios, reglas, QR/PDF, registro en vivo. **PostgreSQL**.

### MiBA Connect

Holder de MiBA/BAX: DIDs, VCs, WACI. `miba-connect-websocket` (tiempo real). **MongoDB + Redis**.

### api-kms

Puente a **Vault** (Vault no es nuestro).

### Nodo DID

- **Modena Resolver** — índice create/resolve `did:quarkid`. Nest; sin DB de dominio.
- **rsk-sidetree** — nodo Sidetree. **MongoDB + IPFS**; ancla en **blockchain**.
- **API VCSL** — revocación (bit arrays). FastAPI. **PostgreSQL + Redis + IPFS**.
- **IPFS API** — REST sobre IPFS (claves, bit arrays, IPNS). FastAPI.

Stack: NestJS, Next.js, FastAPI, QuarkID Agent, WACI, PostgreSQL, Redis, MongoDB, IPFS.

---

## Qué consumimos

- **Active Directory GCBA** — login de operadores.
- **Vault (MiBA)** — claves; nosotros hacemos el KMS.
- **Ledger de prod** — zkSync / StarkNet / Ethereum del proveedor. `nodo-blockchain` LACChain/Besu es **solo dev**.
- **Wallet MiBA / BAX** — el ciudadano (app: topic `bax`).

---

## Flujos (para explicar en prosa)

**Emisión.** Admin → emisor front → back → Agent WACI (QR) → holder escanea (BAX/Connect) → nodo (Modena → Sidetree) resuelve DIDs → VC en la wallet. Emisor puede marcar revocada en VCSL → IPFS.

**Verificación.** Operador (o BAX embebido) → verificador → QR WACI → wallet presenta → stream SSE/WS → nodo chequea DID emisor y holder → resultado + webhook HMAC.

**Acceso.** Admin crea evento → QR → operador valida con back-accesos (WS + Agent) → asistente presenta VC → Allow/Deny + registro en vivo.

Todos los backs (emisor, verificador, accesos, Connect) pegan a **Modena** para DIDs.

DBs en prosa: emisor/accesos = Postgres; verificador = Postgres + Redis; Connect = Mongo + Redis; Sidetree = Mongo + IPFS; VCSL = Postgres + Redis + IPFS.

Arquitectura (describila en prosa; no pegues el dibujo ni Mermaid; la UI ya lo muestra):

```
  Operadores                    Wallet / BAX
      │                              │
      ├── Emisor                     ├── MiBA Connect
      ├── Verificador ◄··············┘
      └── Accesos
              │
              ▼
        Modena Resolver
              │
         rsk-sidetree
              │
         ┌────┴────┐
         ▼         ▼
       IPFS    Blockchain

  Emisor ···► VCSL ···► IPFS
```
