export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    ok: true,
    ts: Date.now(),
    resend_configured: Boolean(process.env.RESEND_API_KEY),
    resend_key_length: process.env.RESEND_API_KEY?.length ?? 0,
  });
}
