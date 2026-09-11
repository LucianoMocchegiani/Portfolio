# Kuatia

Producto propio. https://kuatia.xyz/

Plataforma para emitir y verificar credenciales digitales: privacidad del titular, OpenID4VCI/VP, SD-JWT. Roles: emisor, verificador, holder (wallet).

Rol: Software Engineer. Stack: Next.js, NestJS, Flutter/React Native, PostgreSQL, Redis, OpenID4VC, DIDComm.

Qué construí: consola y landing, billing y API keys, issuer, verifier, wallet, flujos de oferta y presentación.

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

