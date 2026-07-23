# AWS Infrastructure Configuration

This document outlines the AWS cloud infrastructure setup supporting CineVerse in production.

---

## ☁️ Provisioned Services

- **AWS EC2 (Elastic Compute Cloud)**: Instance running Ubuntu 22.04 LTS hosting the Docker runtime and Caddy reverse proxy.
- **AWS RDS / Neon PostgreSQL**: Managed PostgreSQL database with automated backups and connection pooling.
- **AWS Security Groups**:
  - Inbound: Port 80 (HTTP), Port 443 (HTTPS), Port 22 (SSH restricted to deploy IP).
  - Outbound: All traffic allowed.

---

## 🔒 Caddy Reverse Proxy Configuration (`Caddyfile`)

```caddyfile
cineverse.app {
    reverse_proxy localhost:3000
    encode zstd gzip
    
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
    }
}
```
