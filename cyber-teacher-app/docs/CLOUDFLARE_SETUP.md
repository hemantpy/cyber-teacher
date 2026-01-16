# Cloudflare Setup Guide

This guide covers configuring Cloudflare for optimal security with the Cyber Teacher platform.

---

## Prerequisites

1. Domain registered and pointed to Cloudflare nameservers
2. Cloudflare account (Free plan works, Pro recommended)
3. Application deployed (e.g., on Vercel)

---

## Step 1: DNS Configuration

1. Log in to Cloudflare Dashboard
2. Select your domain
3. Go to **DNS** → **Records**
4. Add CNAME record:
   - **Name**: `@` or subdomain (e.g., `cyber`)
   - **Target**: Your Vercel deployment URL (e.g., `cyber-teacher-app.vercel.app`)
   - **Proxy status**: Proxied (orange cloud)

---

## Step 2: SSL/TLS Settings

Navigate to **SSL/TLS** → **Overview**:

1. Set SSL mode to **Full (strict)**
2. Enable **Always Use HTTPS**
3. Enable **Automatic HTTPS Rewrites**

Navigate to **SSL/TLS** → **Edge Certificates**:

1. Enable **HTTP Strict Transport Security (HSTS)**
   - Max Age: 12 months (31536000 seconds)
   - Include subdomains: Yes
   - Preload: Yes

---

## Step 3: Security Settings

### Firewall Rules

Navigate to **Security** → **WAF** → **Custom rules**:

#### Rule 1: Block Suspicious User Agents
```
(http.user_agent contains "curl" and not http.request.uri.path contains "/api/token")
or (http.user_agent contains "wget")
or (http.user_agent contains "python-requests")
or (http.user_agent eq "")
```
Action: **Block**

#### Rule 2: Rate Limit API
```
(http.request.uri.path contains "/api/")
```
Action: **Rate Limit** (10 requests per 10 seconds per IP)

### Bot Fight Mode

Navigate to **Security** → **Bots**:

1. Enable **Bot Fight Mode**
2. If on Pro plan, enable **Super Bot Fight Mode**

### DDoS Protection

Navigate to **Security** → **DDoS**:

1. Verify **HTTP DDoS attack protection** is enabled
2. Set sensitivity to **Medium** or **High**

---

## Step 4: Page Rules (Optional)

Navigate to **Rules** → **Page Rules**:

### Cache Static Assets
```
URL: *cyber-teacher.example.com/_next/static/*
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
```

### Bypass Cache for API
```
URL: *cyber-teacher.example.com/api/*
Settings:
  - Cache Level: Bypass
  - Disable Apps
```

---

## Step 5: WAF Managed Rules

Navigate to **Security** → **WAF** → **Managed rules**:

1. Enable **Cloudflare Managed Ruleset**
2. Enable **OWASP Core Ruleset**
3. Set paranoia level to **PL2** (balanced)

### Recommended Rule Adjustments

| Rule ID | Action | Reason |
|---------|--------|--------|
| 100000+ | Log | OWASP generic rules (monitor first) |
| XSS rules | Block | Cross-site scripting protection |
| SQLi rules | Block | SQL injection protection |

---

## Step 6: Rate Limiting Configuration

Navigate to **Security** → **WAF** → **Rate limiting rules**:

### API Rate Limit
```
Expression: (http.request.uri.path contains "/api/")
Characteristics:
  - IP: Source IP
Threshold: 30 requests per 10 seconds
Action: Block for 60 seconds
```

### Aggressive Scanning Protection
```
Expression: (http.request.uri.path contains "/api/") and (http.request.method eq "POST")
Characteristics:
  - IP: Source IP
Threshold: 10 requests per 10 seconds
Action: Block for 120 seconds
```

---

## Step 7: Verify Configuration

### Test Security Headers

Use [securityheaders.com](https://securityheaders.com) to scan your domain.

Expected grade: **A** or **A+**

### Test Rate Limiting

```bash
# Should get rate limited after ~30 requests
for i in {1..50}; do
  curl -s -o /dev/null -w "%{http_code}\n" https://your-domain.com/api/token
done
```

### Test Bot Protection

```bash
# Should be blocked
curl -A "" https://your-domain.com
curl -A "curl/7.68.0" https://your-domain.com
```

---

## Monitoring

### Security Events

Navigate to **Security** → **Events**:

- Monitor blocked requests
- Review challenge passes
- Check rate limit triggers

### Analytics

Navigate to **Analytics** → **Security**:

- Track DDoS attack patterns
- Monitor bot traffic
- Review WAF rule triggers

---

## Troubleshooting

### Issue: Legitimate Users Blocked

1. Check **Security** → **Events** for the block reason
2. Add IP to **IP Access Rules** allowlist
3. Adjust WAF rule sensitivity

### Issue: Rate Limits Too Aggressive

1. Increase threshold in rate limiting rules
2. Add exceptions for specific paths
3. Whitelist known IPs

### Issue: CORS Errors

1. Verify origin in your app's CORS configuration
2. Check Cloudflare isn't modifying headers
3. Disable **Rocket Loader** if enabled

---

## Quick Reference

| Setting | Location | Value |
|---------|----------|-------|
| SSL Mode | SSL/TLS → Overview | Full (strict) |
| HSTS | SSL/TLS → Edge Certificates | Enabled |
| Bot Fight Mode | Security → Bots | Enabled |
| WAF Managed Rules | Security → WAF | Enabled |
| DDoS Protection | Security → DDoS | Default (enabled) |
| API Rate Limit | Security → WAF → Rate limiting | 30 req/10s |

---

## Support

- [Cloudflare Documentation](https://developers.cloudflare.com)
- [Cloudflare Community](https://community.cloudflare.com)
