# Security Documentation

This document outlines the security measures implemented in the Cyber Teacher platform.

## Overview

Cyber Teacher is designed as a **fully anonymous** cybersecurity education platform with **no user accounts**.
Despite the lack of authentication, the platform implements defense-in-depth security measures.

---

## Security Architecture

```
Browser → Cloudflare (WAF/DDoS) → Next.js Middleware → API Routes → Simulation Engine
                                      ↓                    ↓
                                Security Headers      Token + Rate Limit
                                                          ↓
                                                    Input Validation
```

---

## Security Measures Implemented

### 1. Security Headers (middleware.ts)

All responses include strict security headers:

| Header | Value | Purpose |
|--------|-------|---------|
| `Content-Security-Policy` | Strict CSP | Prevents XSS, injection attacks |
| `X-Frame-Options` | `DENY` | Prevents clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME sniffing |
| `Referrer-Policy` | `same-origin` | Controls referrer information |
| `Permissions-Policy` | Restrictive | Disables camera, mic, USB, etc. |
| `X-XSS-Protection` | `1; mode=block` | Legacy XSS protection |
| `Strict-Transport-Security` | HSTS enabled | Forces HTTPS |

### 2. Rate Limiting

- **Global rate limit**: 30 requests/second per IP
- **Simulation actions**: 10 requests/second per IP
- **Token endpoint**: 5 requests/second per IP
- Algorithm: Token bucket with sliding window

### 3. App Token System

Anti-abuse token system (not authentication):

1. Client requests token from `/api/token` on page load
2. Server generates UUID token with 1-hour expiry
3. Client includes token in `X-App-Token` header for API calls
4. Server validates token on each request

**Purpose**: Prevents direct curl/bot abuse without requiring user accounts.

### 4. Input Validation

All simulation actions are validated against strict schemas:

- **Enum-only actions**: Only predefined action types accepted
- **Strict mode**: Unknown fields are rejected
- **Size limits**: Max 10KB request body
- **Pattern validation**: No dangerous content patterns
- **Sanitization**: All inputs sanitized before processing

Allowed action types:
```typescript
const SIMULATION_ACTIONS = [
  'ATTACK_DDOS', 'ATTACK_SQL_INJECTION', 'ATTACK_MALWARE', ...
  'DEFENSE_FIREWALL', 'DEFENSE_WAF', 'DEFENSE_RATE_LIMIT', ...
  'NODE_ADD', 'NODE_REMOVE', 'LINK_ADD', 'LINK_REMOVE', ...
  'SIM_START', 'SIM_PAUSE', 'SIM_RESET', 'SIM_STEP'
];
```

### 5. CORS Protection

- Only allowed origins can make cross-origin requests
- Production: `https://cyber-teacher-app.vercel.app`
- Development: `http://localhost:3000`

### 6. Simulation Sandbox

The simulation engine:

- [NO] Never executes user code
- [NO] Never uses `eval()` or `Function()`
- [NO] Never parses raw HTML
- [NO] Never accepts scripts
- [YES] Only accepts predefined enum actions
- [YES] All actions are deterministic

---

## What's NOT Implemented

The following are **intentionally not implemented** for security:

- [NO] User accounts / authentication
- [NO] Password storage
- [NO] File uploads
- [NO] User-generated HTML content
- [NO] Admin panel
- [NO] Database with user data
- [NO] Payment processing
- [NO] OAuth providers

---

## Cloudflare Integration

For full protection, deploy behind Cloudflare with:

1. **DDoS Protection** (Auto-enabled)
2. **WAF Managed Rules**
3. **Bot Fight Mode**
4. **Rate Limiting Rules** for `/api/*`
5. **HTTPS Enforcement**

See [CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md) for detailed configuration.

---

## Security Checklist

### Before Deployment

- [ ] Verify `NODE_ENV=production`
- [ ] No exposed `.env` files
- [ ] No debug endpoints
- [ ] CSP headers configured
- [ ] HTTPS enforced
- [ ] Cloudflare configured

### Periodic Review

- [ ] Check rate limit logs
- [ ] Monitor for abuse patterns
- [ ] Update dependencies
- [ ] Review security headers

---

## Reporting Security Issues

If you discover a security vulnerability, please:

1. **Do not** create a public GitHub issue
2. Contact the maintainer directly
3. Provide details for reproduction
4. Allow reasonable time for a fix

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-16 | Initial security implementation |
