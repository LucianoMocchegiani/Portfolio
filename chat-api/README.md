# chat-api (instancia Luciano)

Copia del motor portable. **Esta** instancia apunta al MCP del portfolio (`CHAT_MCP_URL`) y a su Postgres. No reutilices el `.env` de Faciliter: cada MCP lleva su chat-api.

Público: `POST /v1/public/session` + stream de mensajes. El modo público solo puede llamar `get_help`.
