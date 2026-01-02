
import { GoogleGenAI, Type } from "@google/genai";
import { PlantIdentification, CareGuide, DiagnosticResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const identifyPlant = async (base64Image: string): Promise<{ identification: PlantIdentification; care: CareGuide }> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: base64Image } },
        { text: "Identify this plant and provide a comprehensive care guide. Return the result in a valid JSON format." }
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
              homeRemedies: { type: Type.STRING }
            },
            required: ["watering", "sunlight", "soil"]
          }
        },
        required: ["identification", "care"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export const getPlantInfoByName = async (plantName: string): Promise<{ identification: PlantIdentification; care: CareGuide }> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Provide botanical information and a care guide for the plant: ${plantName}. Return as JSON.`,
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
              homeRemedies: { type: Type.STRING }
            },
            required: ["watering", "sunlight", "soil"]
          }
        },
        required: ["identification", "care"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export const diagnoseHealth = async (base64Image: string): Promise<Omit<DiagnosticResult, 'id' | 'timestamp' | 'imageUrl'>> => {
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

  return JSON.parse(response.text || "{}");
};
