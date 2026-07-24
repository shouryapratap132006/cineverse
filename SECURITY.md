# Security Policy

## Supported Versions

CineVerse actively supports security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Reporting a Vulnerability

The CineVerse core maintainers take security and data privacy very seriously. We appreciate your efforts to responsibly disclose any security vulnerabilities you find.

### Responsible Disclosure Guidelines

If you discover a security vulnerability within CineVerse, please follow these steps:

1. **Do NOT open a public GitHub issue** for security vulnerabilities.
2. Email your findings directly to **security@cineverse.app** or contact the lead maintainers confidentially via GitHub Security Advisories.
3. Include the following details in your report:
   - Type of vulnerability (e.g., SQL Injection, XSS, SSRF, Auth Bypass, Data Leak)
   - Step-by-step instructions or Proof-of-Concept (PoC) script to reproduce the issue
   - Affected components (e.g., custom Socket.IO server, Prisma queries, AI Gateway, Clerk Webhooks)
   - Potential impact of exploitation
4. Allow our team up to **48 hours** to acknowledge your report and evaluate the risk.
5. Work with us to test and verify the fix before any public disclosure.

## Security Response Process

When a valid vulnerability report is received:

1. **Acknowledgement**: We will acknowledge receipt of your report within 48 hours.
2. **Assessment**: Our security team will investigate and confirm the report.
3. **Patching**: We will develop, test, and release a security patch in a new patch version.
4. **Advisory**: A public GitHub Security Advisory will be published detailing the fix and acknowledging your contribution (if desired).

## Security Best Practices for Self-Hosting

When deploying CineVerse to production:
- Ensure all environment secrets (`CLERK_SECRET_KEY`, `GROQ_API_KEY`, `STRIPE_SECRET_KEY`) are kept confidential and loaded strictly via environment variables.
- Use TLS/SSL certificates (e.g. via Let's Encrypt / Caddy) for encrypted HTTPS and WSS connections.
- Ensure PostgreSQL connections enforce SSL in production (`sslmode=require`).
- Restrict public access to database ports (port 5432) using firewall rules / AWS Security Groups.
