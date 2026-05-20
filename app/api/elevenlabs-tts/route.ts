import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  const voiceId = process.env.ELEVENLABS_VOICE_ID?.trim();

  if (!apiKey) {
    return NextResponse.json(
      { error: "ELEVENLABS_API_KEY no configurada" },
      { status: 500 }
    );
  }

  if (!voiceId) {
    return NextResponse.json(
      { error: "ELEVENLABS_VOICE_ID no configurada" },
      { status: 500 }
    );
  }

  const { text } = await req.json();

  if (!text || typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "texto requerido" }, { status: 400 });
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: text.trim(),
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.60,
          speed: 0.70,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[elevenlabs-tts] Error:", response.status, errorText);
    return NextResponse.json(
      { error: `Error de ElevenLabs: ${response.status}` },
      { status: response.status }
    );
  }

  const audioBuffer = await response.arrayBuffer();

  return new Response(audioBuffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": String(audioBuffer.byteLength),
    },
  });
}
