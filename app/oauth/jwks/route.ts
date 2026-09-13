import { NextResponse } from "next/server";
import { exportJWK } from "jose";
import { getPublicKey, getKeyId } from "@/lib/oauth/keys";

/**
 * The public half of the RSA keypair this hub's id_tokens/access_tokens are signed with — same
 * shape as Formation's identical app/oauth/jwks/route.ts.
 */
export async function GET() {
  const publicKey = await getPublicKey();
  const jwk = await exportJWK(publicKey);
  return NextResponse.json(
    { keys: [{ ...jwk, kid: getKeyId(), use: "sig", alg: "RS256" }] },
    { headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
