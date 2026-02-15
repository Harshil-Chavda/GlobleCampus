import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    const { message, history, language } = await req.json();
    // Use the hardcoded API Key as requested
    const apiKey = "AIzaSyBZXJK9bKmiNTd22pgNekhOVx0_J3xP8wA";

    if (!apiKey) {
      return Response.json(
        { error: "Gemini API key is not configured" },
        { status: 500 },
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Switch to gemini-3-flash-preview as requested by user
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    // Prepend language instruction if provided
    const languageInstruction = language
      ? `(Please answer in ${language}) `
      : "";
    const fullMessage = languageInstruction + message;

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Who created you?" }],
        },
        {
          role: "model",
          parts: [
            {
              text: "I am an AI assistant created by GlobalCampus, designed to help students with their studies and navigation.",
            },
          ],
        },
        ...(history || []),
      ],
    });

    const result = await chat.sendMessage(fullMessage);
    const response = await result.response;
    const text = response.text();

    return Response.json({ text });
  } catch (error) {
    console.error("Chat error:", error);
    return Response.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}
