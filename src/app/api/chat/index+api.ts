import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_SECRET_KEY,
});

export async function POST(request: Request) {
  const { message, imageBase64, previousResponseId } = await request.json();

  let messageContent;

  if (imageBase64) {
    messageContent = [
      {
        role: "user",
        content: message,
      },
      {
        role: "user",
        content: {
          type: "image_url",
          image_url: imageBase64,
        },
      },
    ];
  } else {
    messageContent = message;
  }

  try {
    const response = await openai.responses.create({
      model: "gpt-4.1",
      input: messageContent,
      ...(previousResponseId && { previous_response_id: previousResponseId }),
    });
    return Response.json({
      responseId: response.id,
      responseMessage: response.output_text,
    });
  } catch (error) {
    console.error("Error OpenAI:", error);
    return Response.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
