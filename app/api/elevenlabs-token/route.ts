import { NextResponse } from "next/server";

/**
 * GET /api/elevenlabs-token
 * Genera un signed URL para conectar con el agente de ElevenLabs
 * El frontend usa este endpoint para autenticar la conexión WebRTC
 */
export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID?.trim();

  if (!apiKey) {
    return NextResponse.json(
      { error: "ELEVENLABS_API_KEY no configurada en .env.local" },
      { status: 500 }
    );
  }

  if (!agentId) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_ELEVENLABS_AGENT_ID no configurada en .env.local" },
      { status: 500 }
    );
  }

  console.log("[elevenlabs-token] agentId:", agentId);
  console.log("[elevenlabs-token] apiKey (primeros 8 chars):", apiKey?.slice(0, 8));

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
      {
        headers: {
          "xi-api-key": apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[elevenlabs-token] Error de API:", response.status, errorText);
      console.error("[elevenlabs-token] URL usada:", `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`);
      return NextResponse.json(
        { error: `Error de ElevenLabs API: ${response.status}`, detail: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ signedUrl: data.signed_url });
  } catch (error) {
    console.error("[elevenlabs-token] Error:", error);
    return NextResponse.json(
      { error: "Error al obtener token de ElevenLabs" },
      { status: 500 }
    );
  }
}
