# Esports Tools — Hub

The front door for the esports-tools.com product family — a marketing landing page plus a single
sign-on launcher for [Formation](https://formation.esports-tools.com) (team management) and
[Vault](https://vault.esports-tools.com) (sponsorship & finance).

No database, no login form of its own: signing in redirects to Formation, which is the identity
provider for the whole family (OpenID Connect authorization-code + PKCE — see that repo's
`lib/oauth/`). Session here is a JWT built straight from the id_token Formation returns.

## Stack

Next.js 16 (App Router) + NextAuth v5 (a single custom OIDC provider, JWT sessions), Tailwind v4 +
shadcn/radix-ui. No Prisma — nothing here needs a database.

## Local development

```bash
npm install
cp .env.example .env   # fill in AUTH_SECRET, FORMATION_ISSUER, OIDC_CLIENT_ID/SECRET
npm run dev             # http://localhost:3500
```

You'll need Formation running too, with this app registered as an OAuth client there (see
`../team-tracker/lib/oauth/`).

## Deploy

Deploys to the same production VM as Formation and Vault, sharing Formation's Caddy instance and
the `esports-tools-shared` Docker network. See `Dockerfile` / `docker-compose.yml`.
