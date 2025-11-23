import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || ''; // Injected via environment

let genAI: GoogleGenAI | null = null;

export const getAIClient = () => {
  if (!genAI) {
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
};

// --- Fast Responses (Flash Lite) ---
export const checkAnswerQuickly = async (question: string, userAnswer: string): Promise<boolean> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite-latest',
      contents: `Question: ${question}. User Answer: ${userAnswer}. Is the user answer correct? Respond with JSON { "correct": boolean, "feedback": string }`,
      config: { responseMimeType: 'application/json' }
    });
    const result = JSON.parse(response.text || '{}');
    return result.correct === true;
  } catch (e) {
    console.error("Fast check failed", e);
    return false;
  }
};

// --- Complex Chat (Gemini Pro) ---
export const getOwlChatResponse = async (history: {role: string, parts: string}[], message: string): Promise<string> => {
  const ai = getAIClient();
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "You are a wise, friendly, and encouraging Owl Assistant for a child. Keep answers short, fun, and educational.",
    },
    history: history.map(h => ({ role: h.role, parts: [{ text: h.parts }] }))
  });
  
  const result: GenerateContentResponse = await chat.sendMessage({ message });
  return result.text || "Hoot hoot! I'm thinking...";
};

// --- Image Generation (Nano Banana Pro) ---
export const generateRewardImage = async (prompt: string, size: '1K' | '2K' | '4K' = '1K'): Promise<string | null> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: size
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e) {
    console.error("Image gen failed", e);
    return null;
  }
};

export const getLiveClient = () => {
  return getAIClient();
}
