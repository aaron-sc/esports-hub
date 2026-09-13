import NextAuth from "next-auth";

/**
 * The hub has no user database and no login form of its own — Formation is the identity provider
 * for the whole esports-tools.com family (see lib/oauth/ in that repo), and "signing in" here is
 * just signIn("formation") sending the browser through the standard OIDC authorization-code +
 * PKCE flow. Session here is a pure JWT built from the id_token Formation returns; nothing is
 * persisted server-side.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 2 * 60 * 60 }, // 2h — short on purpose, see README
  pages: { signIn: "/" },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;
      const isPublic =
        pathname === "/" ||
        pathname.startsWith("/privacy") ||
        pathname.startsWith("/terms") ||
        pathname.startsWith("/api/auth") ||
        // This hub is also its own OIDC provider now (see lib/oauth/, app/oauth/) — these do their
        // own session/credential checks internally rather than relying on this gate, the same
        // reasoning Formation's identical auth.config.ts already documents for its own /oauth.
        pathname.startsWith("/oauth") ||
        pathname.startsWith("/.well-known") ||
        pathname === "/robots.txt" ||
        pathname === "/sitemap.xml";
      return isPublic || isLoggedIn;
    },
    // Auth.js's OIDC provider already verifies the id_token's signature (against Formation's
    // published JWKS) and standard claims (iss/aud/exp) before this ever runs — this callback
    // just decides what to keep from the resulting profile.
    async jwt({ token, profile }) {
      if (profile) {
        token.sub = profile.sub as string;
        token.email = profile.email as string;
        token.name = profile.name as string;
        token.picture = (profile.picture as string | null) ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.email = (token.email as string) ?? session.user.email;
        session.user.name = (token.name as string) ?? session.user.name;
        session.user.image = (token.picture as string | null) ?? null;
      }
      return session;
    },
  },
  providers: [
    {
      id: "formation",
      name: "Formation",
      type: "oidc",
      issuer: process.env.FORMATION_ISSUER,
      clientId: process.env.OIDC_CLIENT_ID,
      clientSecret: process.env.OIDC_CLIENT_SECRET,
      // Formation's /oauth/token only implements client_secret_post (see that repo's
      // app/oauth/token/route.ts) — Auth.js defaults new OIDC providers to client_secret_basic.
      client: { token_endpoint_auth_method: "client_secret_post" },
      checks: ["pkce", "state", "nonce"],
      authorization: { params: { scope: "openid profile email" } },
    },
  ],
});
