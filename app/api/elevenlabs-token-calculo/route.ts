import { NextResponse } from "next/server";

const CALCULO_AGENT_ID = "agent_3901kt72qamsf14rvfr7nhw6egr3";

export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json(
      { error: "ELEVENLABS_API_KEY no configurada en .env.local" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${CALCULO_AGENT_ID}`,
      {
        headers: {
          "xi-api-key": apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Error de ElevenLabs API: ${response.status}`, detail: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ signedUrl: data.signed_url });
  } catch (error) {
    console.error("[elevenlabs-token-calculo] Error:", error);
    return NextResponse.json(
      { error: "Error al obtener token de ElevenLabs" },
      { status: 500 }
    );
  }
}
