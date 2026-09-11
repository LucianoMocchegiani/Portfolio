# QuarkID

Ecosistema de identidad digital del GCBA, en Phinx Lab (oct. 2024 — actualidad). https://buenosaires.gob.ar/gcaba_historico/jefaturadegabinete/innovacionytransformaciondigital/quarkid

Rol: Software Engineer.

Protocolo de identidad auto-soberana: credenciales verificables, DIDs, WACI y DIDComm. En código: emisor genérico, verificador genérico, accesos a eventos, MiBA Connect, KMS/DIDComm, Sidetree, IPFS, blockchain (RSK/LACChain).

Qué hice: reestructuración de servicios y estabilización; integración con blockchain, wallets, IPFS y Lacchain; WebSockets; bugs en validaciones criptográficas y comunicación entre wallets; desarrollo full stack.

Logro destacado: estabilización del proyecto al reorganizar código y eliminar fallas acumuladas.

Tres sistemas que comparten QuarkID Agent y WACI:
1. Accesos (eventos y edificios, WebSocket al agent)
2. Emisión (plantillas + QR WACI)
3. Verificación (QR, Redis TTL, Socket.io)

Stack: NestJS, Next.js, Redis, PostgreSQL, MongoDB, QuarkID Agent.
