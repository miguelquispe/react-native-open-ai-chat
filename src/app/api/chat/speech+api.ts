import OpenAI, { toFile } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_SECRET_KEY,
});

export async function POST(request: Request) {
  const { audioBase64, previousResponseId } = await request.json();

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: await toFile(Buffer.from(audioBase64, "base64"), "audio.m4a"),
      model: "whisper-1",
    });

    const response = await openai.responses.create({
      model: "gpt-4.1",
      input: transcription.text,
      ...(previousResponseId && { previous_response_id: previousResponseId }),
    });

    return Response.json({
      responseId: response.id,
      responseMessage: response.output_text,
      transcribedMessage: transcription.text,
    });
  } catch (error) {
    console.error("Error processing audio transcription or response:", error);
    return Response.json(
      { error: "Failed to process audio transcription or response." },
      { status: 500 }
    );
  }
}
