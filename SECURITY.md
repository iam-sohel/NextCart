# Security Policy

## Reporting a vulnerability

Email security@nextcart.example (placeholder — replace with your real
contact before publishing). Do not file a public GitHub issue for
security-sensitive reports.

## Environment variables

The backend reads every secret from an environment variable. There are
**no hardcoded credentials in source control**. The list below is
authoritative; if a variable is missing the application fails to start
(`JwtUtil` and `application.properties` both validate this).

| Variable                       | Where it is used                              |
| ------------------------------ | --------------------------------------------- |
| `DB_URL`                       | `spring.datasource.url`                       |
| `DB_USERNAME`                  | `spring.datasource.username`                  |
| `DB_PASSWORD`                  | `spring.datasource.password`                  |
| `DB_POOL_MAX_SIZE`             | Hikari `maximum-pool-size`                    |
| `DB_POOL_MIN_IDLE`             | Hikari `minimum-idle`                         |
| `DB_POOL_CONNECTION_TIMEOUT_MS`| Hikari `connection-timeout`                   |
| `DB_POOL_IDLE_TIMEOUT_MS`      | Hikari `idle-timeout`                         |
| `DB_POOL_MAX_LIFETIME_MS`      | Hikari `max-lifetime`                         |
| `JPA_DDL_AUTO`                 | `spring.jpa.hibernate.ddl-auto`              |
| `JPA_SHOW_SQL`                 | `spring.jpa.show-sql`                         |
| `JWT_SECRET`                   | `app.security.jwt.secret` (HS256 signing key) |
| `RAZORPAY_KEY_ID`              | Razorpay public key id                        |
| `RAZORPAY_KEY_SECRET`          | Razorpay key secret                           |
| `RAZORPAY_WEBHOOK_SECRET`      | Razorpay webhook HMAC secret                  |
| `SPRING_PROFILES_ACTIVE`       | Active Spring profile                         |

`JWT_SECRET` must be at least 32 bytes (256 bits). Generate one with:

```
openssl rand -base64 48
```

## Rotation

Every credential in this project must be treated as if it is already
compromised if it has ever appeared in a Git commit, because Git history
is durable. The audit of 18 August 2026 identified four credentials
that were present in the public `master` branch at that point. The
recommended path is **rotate, do not purge**:

1. Treat every credential listed above as compromised.
2. Generate a new value at the provider (Supabase, Razorpay, etc.).
3. Update the secret store / environment used by every environment
   (local, CI, staging, production).
4. Restart the affected services.
5. Confirm the old value is rejected.
6. Add a dated entry to `CHANGELOG.md` describing the rotation.

Rewriting Git history (`git filter-repo`, BFG, etc.) is possible but
**destructive**: it changes every commit hash, breaks every clone, and
forces every collaborator to re-clone. It also does not remove the
secret from any system that already pulled it (CI caches, forks, the
GitHub API, archive mirrors). Rotation is almost always the right
answer.

## Pre-commit hook (recommended)

Add a hook that blocks commits containing patterns matching the
variables above. Example (`.git/hooks/pre-commit`):

```sh
#!/bin/sh
PATTERNS='DB_PASSWORD|JWT_SECRET|RAZORPAY_KEY_SECRET|RAZORPAY_WEBHOOK_SECRET'
if git diff --cached | grep -E "^\+.*$PATTERNS" >/dev/null; then
  echo "Refusing commit: potential secret detected."
  exit 1
fi
```

For stronger guarantees, use `gitleaks` or `trufflehog` in CI.
