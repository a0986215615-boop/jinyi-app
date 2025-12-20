import { GoogleGenAI, Type } from "@google/genai";
import { DEPARTMENTS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSymptoms = async (symptoms: string): Promise<{ departmentId: string; reason: string } | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `
        User symptoms: "${symptoms}".
        Available departments: ${JSON.stringify(DEPARTMENTS.map(d => ({ id: d.id, name: d.name, description: d.description })))}.
        
        Task: Analyze the symptoms and recommend the most suitable department from the list.
        Return a JSON object with 'departmentId' (must match one of the provided IDs) and 'reason' (brief explanation in Traditional Chinese).
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            departmentId: { type: Type.STRING },
            reason: { type: Type.STRING },
          },
          required: ["departmentId", "reason"],
        },
      },
    });

    const text = response.text;
    if (!text) return null;

    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
};
