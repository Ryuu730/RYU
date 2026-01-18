
import { GoogleGenAI, Type } from "@google/genai";

export const fetchLiveRates = async () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Get the current middle-market exchange rates for the following currencies to Indonesian Rupiah (IDR): USD, EUR, SGD, AUD, JPY, GBP, CNY, MYR.",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              currency: { type: Type.STRING },
              rate: { type: Type.NUMBER, description: "Exchange rate value in IDR" }
            },
            required: ["currency", "rate"]
          }
        }
      },
    });

    const rates = JSON.parse(response.text || "[]");
    return {
      rates,
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error("Error fetching rates:", error);
    return null;
  }
};
