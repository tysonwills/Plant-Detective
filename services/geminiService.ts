
import { GoogleGenAI, Type } from "@google/genai";
import { IdentificationResponse, DiagnosticResult } from "../types";

export const identifyPlant = async (base64Image: string): Promise<IdentificationResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: base64Image } },
        { text: "Identify this plant and provide a comprehensive care guide. Also, suggest 3-4 similar plants. Return strictly valid JSON." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          identification: {
            type: Type.OBJECT,
            properties: {
              scientificName: { type: Type.STRING },
              commonName: { type: Type.STRING },
              genus: { type: Type.STRING },
              family: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              description: { type: Type.STRING },
              isToxic: { type: Type.BOOLEAN },
              toxicityWarning: { type: Type.STRING }
            },
            required: ["scientificName", "commonName", "genus", "isToxic"]
          },
          care: {
            type: Type.OBJECT,
            properties: {
              watering: { type: Type.STRING },
              sunlight: { type: Type.STRING },
              soil: { type: Type.STRING },
              pruning: { type: Type.STRING },
              seasonalCare: { type: Type.STRING },
              homeRemedies: { type: Type.STRING },
              hints: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["watering", "sunlight", "soil", "hints"]
          },
          similarPlants: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                scientificName: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["name", "scientificName"]
            }
          }
        },
        required: ["identification", "care", "similarPlants"]
      }
    }
  });

  try {
    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse identification JSON", e);
    throw new Error("Invalid response format");
  }
};

export const getPlantInfoByName = async (plantName: string): Promise<IdentificationResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Provide botanical information, care guide, and 3-4 similar plants for: ${plantName}. Return as JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          identification: {
            type: Type.OBJECT,
            properties: {
              scientificName: { type: Type.STRING },
              commonName: { type: Type.STRING },
              genus: { type: Type.STRING },
              family: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              description: { type: Type.STRING },
              isToxic: { type: Type.BOOLEAN },
              toxicityWarning: { type: Type.STRING }
            },
            required: ["scientificName", "commonName", "genus", "isToxic"]
          },
          care: {
            type: Type.OBJECT,
            properties: {
              watering: { type: Type.STRING },
              sunlight: { type: Type.STRING },
              soil: { type: Type.STRING },
              pruning: { type: Type.STRING },
              seasonalCare: { type: Type.STRING },
              homeRemedies: { type: Type.STRING },
              hints: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["watering", "sunlight", "soil", "hints"]
          },
          similarPlants: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                scientificName: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["name", "scientificName"]
            }
          }
        },
        required: ["identification", "care", "similarPlants"]
      }
    }
  });

  try {
    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse info JSON", e);
    throw new Error("Invalid response format");
  }
};

export const diagnoseHealth = async (base64Image: string): Promise<Omit<DiagnosticResult, 'id' | 'timestamp' | 'imageUrl'>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: base64Image } },
        { text: "Analyze this plant's health. Identify any diseases, pests, or nutrient deficiencies. Provide advice for restoration. Return as JSON." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          plantName: { type: Type.STRING },
          issue: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ["Healthy", "Warning", "Critical"] },
          advice: { type: Type.STRING }
        },
        required: ["plantName", "issue", "severity", "advice"]
      }
    }
  });

  try {
    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse diagnostic JSON", e);
    throw new Error("Invalid response format");
  }
};
