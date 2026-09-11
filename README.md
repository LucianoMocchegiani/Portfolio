# Luciano Mocchegiani — portfolio

Chat a pantalla completa (estilo [aaabadcode.com/chat](https://www.aaabadcode.com/chat)). Motor: **copia** de `chat-api` + MCP de este repo.

No comparte env ni Postgres con Faciliter ni Kuatia. Puertos pensados para los tres stacks a la vez.

| Stack | Host (ahora en esta máquina) |
|-------|------------------------------|
| Kuatia | web **3000**, Postgres **5432**, billing **9000**, issuer **9001**, verifier **9002** |
| Faciliter | web **3002**, API **3001**, chat-api **3010**, MCP **3011**, Postgres **5433**, Redis **6379** |
| Este portfolio | web **3003**, chat-api **3020**, MCP **3021**, Postgres **5434** |

## Arranque

```powershell
Copy-Item chat-api\.env.example chat-api\.env
Copy-Item mcp\.env.example mcp\.env
Copy-Item web\.env.example web\.env
```

Poné `OPENROUTER_API_KEY` real en `chat-api/.env`. Después:

```powershell
docker compose up --build
```

El contenido del CV está en `mcp/help/*.md`. El chat público solo usa la tool `get_help`.

Portadas de cards: `web/public/work/<slug>.jpg` (ver `web/public/work/README.md`). Si no hay archivo, se muestran las iniciales.

## Dominio (Cloudflare Tunnel)

Igual que Kuatia/Faciliter: un túnel propio, no el de Faciliter.

| Host | Origen local |
|------|----------------|
| `lucianomocchegiani.xyz` / `www` | web **3003** |
| `chat.lucianomocchegiani.xyz` | chat-api **3020** |

```powershell
cloudflared tunnel --origincert C:\Users\User\.cloudflared\cert.pem --config C:\Users\User\.cloudflared\config-luciano.yml run luciano
```

Detalle en `local/cloudeflared.md`.


