# Credential rotation — actions for the project owner

These are the steps **you** must take outside this repository. I (the
assistant) can rewrite config and code, but I cannot reach Supabase or
Razorpay to actually rotate anything.

Treat every step as urgent. The credentials were present in commits on
the public `master` branch, so they should be considered compromised.

---

## 1. Supabase database password

The host (`aws-0-ap-northeast-1.pooler.supabase.com`) and project
identifier are also exposed, but those are not secrets by themselves —
only the password matters.

1. Open the Supabase dashboard for this project.
2. Go to **Settings → Database**.
3. Scroll to **Database password** and click **Reset database password**.
   Choose a new strong password. Save it somewhere you trust (password
   manager / secret store).
4. Wait for Supabase to confirm the rotation.
5. Update the `DB_PASSWORD` value in every environment that runs the
   backend (local shell, CI secrets, staging, production).
6. Restart the backend in each environment.
7. Confirm a known API call (e.g. `GET /actuator/health`) succeeds
   after restart.

---

## 2. Razorpay keys

Three Razorpay values were exposed: `rzp_test_*` key id, the matching
key secret, and the webhook secret. They are test-mode keys, which
limits the damage, but **rotate them anyway** because the same habit
protects live keys later.

1. Log in to the Razorpay Dashboard.
2. **Settings → API Keys → Generate Test Key** (or regenerate).
   Capture the new key id and secret.
3. **Settings → Webhooks → select your webhook → rotate secret** if the
   UI supports it; otherwise delete and recreate the webhook endpoint
   and capture the new secret.
4. Update `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and
   `RAZORPAY_WEBHOOK_SECRET` in every environment.
5. Restart the backend. Confirm a test checkout still succeeds.

If you intend to go live soon, do **not** stop at test keys — generate
live keys, store them in a secret manager, and inject via env var.

---

## 3. JWT signing key

The previous key was hardcoded in `JwtUtil.java`. It was used to sign
every user session token, so any token issued before rotation must be
considered forgeable.

1. Generate a fresh key:
   ```
   openssl rand -base64 48
   ```
2. Set the value as `JWT_SECRET` in every environment.
3. Restart the backend.
4. **All existing user sessions are now invalid** — that is the
   desired effect. Users will be asked to log in again.
5. If you want sessions to survive rotation, add a key-id (`kid`)
   header and accept multiple valid keys during a grace window. Skip
   this for the first rotation — invalidating sessions is safer.

---

## 4. After rotation

1. Verify nothing in the current `master` branch still contains a
   literal credential value:
   ```
   git grep -nE '(DB_PASSWORD|JWT_SECRET|RAZORPAY_KEY_SECRET|RAZORPAY_WEBHOOK_SECRET)\s*=\s*[^$\s]' master
   ```
   (Should return nothing now that the changes from this turn are
   committed.)
2. Decide whether to rewrite Git history. **Recommendation: do not.**
   Even after rewriting, anyone who cloned before the rewrite still has
   the secret, and the rotation you just performed already neutralises
   the old values.
3. Add a CI secret-scanning job (`gitleaks`, `trufflehog`, or GitHub
   secret scanning) so the next leak is caught at PR time, not in
   production.
4. Record the rotation date in `CHANGELOG.md`.

---

## What this turn did **not** do

- Did not rotate any real credential — those live at the providers.
- Did not push to GitHub. The local commits are on `master` in your
  working tree only.
- Did not rewrite Git history. `git filter-repo` would purge the
  secrets from history but is destructive; it needs your explicit
  decision.
- Did not add CI secret scanning. Recommended as a follow-up.
