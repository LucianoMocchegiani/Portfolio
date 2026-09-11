<!-- Túnel portfolio lucianomocchegiani.xyz

Túnel: luciano (4e8cfe26-19b3-4caa-92fc-3f543cd44da6)
Config: C:\Users\User\.cloudflared\config-luciano.yml
Cert: cert.pem (misma cuenta que Kuatia)

No mezclar con config.yml (Faciliter) ni config-kuatia.yml.

Chat-api PRIMERO en ingress (chat.… → :3020). Web apex/www → :3003. MCP no se publica.

Arranque (terminal aparte; Faciliter y Kuatia siguen corriendo):

  cloudflared tunnel --origincert C:\Users\User\.cloudflared\cert.pem --config C:\Users\User\.cloudflared\config-luciano.yml run luciano

Si el dominio es zona nueva en Cloudflare, primero agregalo al dashboard (mismo account que kuatia.xyz), nameservers, después:

  cloudflared tunnel --origincert C:\Users\User\.cloudflared\cert.pem route dns luciano lucianomocchegiani.xyz
  cloudflared tunnel --origincert C:\Users\User\.cloudflared\cert.pem route dns luciano www.lucianomocchegiani.xyz
  cloudflared tunnel --origincert C:\Users\User\.cloudflared\cert.pem route dns luciano chat.lucianomocchegiani.xyz
-->
