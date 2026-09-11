# Kuatia

Producto propio. https://kuatia.xyz/ — Software Engineer (punta a punta).

Infraestructura para **emitir y verificar credenciales digitales** con estándares abiertos: **OpenID4VCI / OpenID4VP**, **SD-JWT**, DIDComm. El titular guarda la credencial en la wallet; el verificador pide una prueba, no una copia de la base.

No es Faciliter: Kuatia es el issuer/verifier. Faciliter lo usa para la puerta. Docs públicas: kuatia.xyz/docs.

Si preguntan de qué va: emitir y verificar credenciales (emisor, verificador, holder). Si preguntan por qué OpenID4VC y no un QR propietario: interoperable, el holder controla qué comparte, SD-JWT revela claims en selectivo. Si preguntan el rol: dueño técnico, todo el stack.

Stack: Next.js, NestJS, Flutter/React Native, PostgreSQL, OpenID4VC, DIDComm. **Sin Redis** (el compose no lo levanta; rate limits en memoria).

---

## Piezas que mantengo

### Web (`identity-kuatia`)

Landing + consola (Next). Proxy a billing / issuer / verifier. Onboarding de cuentas, API keys, planes (Free/Pro/Business).

### Billing (`identity-billing-service`, :9000)

Cuentas, productos, API keys, planes, provision de tenant. Postgres `identity_billing`. Auth admin / API key.

### Issuer (`identity-issuer-service`, :9001)

Emisión **OID4VCI** + DIDComm. Credo-TS / identity-core. Postgres `identity_issuer`. Offer que la wallet acepta.

### Verifier (`identity-verifier-service`, :9002)

Verificación **OID4VP** + DIDComm. Postgres `identity_verifier`. Presentation request (QR / requestUri) y resultado.

### Wallet (holder)

App Flutter (identity-core-dart). Guarda la credencial; habla OpenID4VC con issuer/verifier. El holder-service de custodia es lab, fuera del compose.

Tres bases en **un Postgres**: `identity_billing`, `identity_issuer`, `identity_verifier`. RabbitMQ opcional, apagado.

---

## Qué se consume

Nada de un tercero de producto: no hay Mercado Pago en Kuatia (eso es Faciliter). Credo / OpenWallet Foundation para el protocolo.

---

## Flujos (para explicar en prosa)

**Alta de tenant.** Consola → billing crea cuenta + keys → bind de issuer/verifier compartidos (un producto Kuatia, N tenants por claims).

**Emitir.** Emisor arma oferta OID4VCI → wallet escanea / abre el offer → holder guarda SD-JWT. Faciliter: pack aprobado → offer del pack (`urn:gymbro:pack:{id}`).

**Verificar.** Verifier crea authorization request (DCQL) → QR = requestUri → wallet presenta → verifier valida firma / status → Allow/Deny. En puerta Faciliter el claim `memberId` identifica al socio.

Auth de APIs: header `x-api-key` (`iss_live_…` / `ver_live_…`).

Arquitectura (describila en prosa; no pegues el dibujo ni Mermaid; la UI ya lo muestra):

```
             ┌──────────┐
             │  Wallet  │
             └────┬─────┘
                  │ OpenID4VC
             ┌────▼─────┐
             │   Web    │
             └────┬─────┘
                  │
       ┌──────────┼──────────┐
       ▼          ▼          ▼
    Billing    Issuer    Verifier
       │          │          │
       └──────────┴────┬─────┘
                       ▼
                   PostgreSQL
```
