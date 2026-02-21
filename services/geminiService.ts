// (Partially Depricated)
import { GoogleGenAI } from "@google/genai";
import { Form_Data } from "../types";

export const generateOperationalNarrative = async (
  formData: FormData,
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Based on the following agricultural intake data, write a comprehensive and professional "Operational Story." 
    This narrative should synthesize the producer's management philosophy, operational history, conservation commitment, and future vision into a cohesive 3-4 paragraph review.
    
    The tone should be professional, respectful, and analytical, suitable for a Program Planner to use as a primary brief.
    Focus on:
    1. Operational Foundation: Scale, crops, and land history.
    2. Stewardship & Land Assets: Tillage, cover crops, and the utility/health of grassland and timber areas.
    3. Technical Proficiency: Nutrient application timing, water management infrastructure, and marketing sophistication.
    4. Future Alignment: 5-year vision, succession readiness, and secondary land values like recreation.

    Data for synthesis: ${JSON.stringify(formData)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction:
          "You are an expert Senior Agricultural Program Planner. Your task is to transform raw intake data into a sophisticated 'Operational Story' that captures the nuance of a farming operation's management logic, legacy, and natural resource stewardship.",
      },
    });
    return response.text || "Synthesis unavailable.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The system was unable to synthesize the narrative at this time. Please proceed with manual review.";
  }
};
