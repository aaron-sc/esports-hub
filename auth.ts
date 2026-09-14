import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyLoginProofToken } from "@/lib/auth/login-proof";

/**
 * The hub has no user database of its own — Formation is the identity provider for the whole
 * esports-tools.com family, but "signing in" here is a native email+password (+ 2FA) form on this
 * hub's own domain, not a redirect to Formation's. lib/actions/auth.ts's loginAction/
 * verifyTwoFactorAction check credentials against Formation server-to-server (see
 * lib/auth/formation-credentials.ts) and, on success, hand this Credentials provider a short-lived
 * signed proof (lib/auth/login-proof.ts) rather than the password itself. Session here is a pure
 * JWT built from that proof; nothing is persisted server-side.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 2 * 60 * 60 }, // 2h — short on purpose, see README
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;
      const isPublic =
        pathname === "/" ||
        pathname.startsWith("/login") ||
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
    // `user` is only populated on the initial sign-in call, from the Credentials provider's
    // authorize() return value below — same one-time-stamp shape the old OIDC provider's
    // `profile` branch used to have.
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = (user.image as string | null) ?? null;
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
    Credentials({
      credentials: {
        proofToken: { label: "Proof", type: "text" },
      },
      async authorize(credentials) {
        const proofToken = credentials?.proofToken;
        if (typeof proofToken !== "string") return null;

        const proof = verifyLoginProofToken(proofToken);
        if (!proof) return null;

        return { id: proof.sub, email: proof.email, name: proof.name, image: proof.picture };
      },
    }),
  ],
});
