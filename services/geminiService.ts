
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { IdentificationResponse, DiagnosticResult, GardenCenter } from "../types";

const cleanJsonResponse = (text: string) => {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

const identificationSchema = {
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
        toxicityWarning: { type: Type.STRING },
        toxicityAdvice: { type: Type.STRING }
      },
      required: ["scientificName", "commonName", "genus", "isToxic"]
    },
    care: {
      type: Type.OBJECT,
      properties: {
        watering: { type: Type.STRING },
        wateringDaysInterval: { type: Type.INTEGER },
        sunlight: { type: Type.STRING },
        soil: { type: Type.STRING },
        temperature: { type: Type.STRING },
        minTemp: { type: Type.INTEGER },
        maxTemp: { type: Type.INTEGER },
        estimatedHeight: { type: Type.STRING },
        humidity: { type: Type.STRING },
        fertilizer: { type: Type.STRING },
        fertilizerMonthsActive: { type: Type.ARRAY, items: { type: Type.INTEGER } },
        fertilizerDaysInterval: { type: Type.INTEGER },
        pruning: { type: Type.STRING },
        cleaningDaysInterval: { type: Type.INTEGER },
        seasonalCare: { type: Type.STRING },
        homeRemedies: { type: Type.STRING },
        hints: { type: Type.ARRAY, items: { type: Type.STRING } },
        bestPlacement: { type: Type.STRING }
      },
      required: ["watering", "wateringDaysInterval", "sunlight", "soil", "temperature", "humidity", "fertilizer", "fertilizerMonthsActive", "fertilizerDaysInterval", "cleaningDaysInterval", "hints", "bestPlacement", "minTemp", "maxTemp", "estimatedHeight"]
    },
    commonProblems: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          problem: { type: Type.STRING },
          description: { type: Type.STRING },
          solution: { type: Type.STRING }
        },
        required: ["problem", "description", "solution"]
      }
    }
  }
};

export const identifyPlant = async (base64Image: string): Promise<IdentificationResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: base64Image } },
        { text: "Identify this plant. For the main result and for each 'similarPlant' entry, provide full botanical data including identification details, complete care parameters (intervals, temps, height), and common problems. For 'commonProblems', provide a detailed 'description' of the symptoms and a 'solution' formatted as a numbered list of specific steps. Return strictly valid JSON." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          ...identificationSchema.properties,
          similarPlants: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                scientificName: { type: Type.STRING },
                description: { type: Type.STRING },
                ...identificationSchema.properties
              },
              required: ["name", "scientificName"]
            }
          }
        },
        required: ["identification", "care", "commonProblems", "similarPlants"]
      }
    }
  });
  const text = response.text;
  if (!text) throw new Error("Image analysis failed.");
  return JSON.parse(cleanJsonResponse(text));
};

export const getPlantInfoByName = async (plantName: string): Promise<IdentificationResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Provide botanical information and care guide for: ${plantName}. Also include 3 similar plants with their own basic care and identification data. For 'commonProblems', provide a detailed 'description' of the symptoms and a 'solution' formatted as a numbered list of specific steps. Return strictly valid JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          ...identificationSchema.properties,
          similarPlants: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                scientificName: { type: Type.STRING },
                description: { type: Type.STRING },
                ...identificationSchema.properties
              },
              required: ["name", "scientificName"]
            }
          }
        },
        required: ["identification", "care", "commonProblems", "similarPlants"]
      }
    }
  });
  return JSON.parse(cleanJsonResponse(response.text!));
};

export const diagnoseHealth = async (base64Image: string): Promise<Omit<DiagnosticResult, 'id' | 'timestamp' | 'imageUrl'>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: base64Image } },
        { text: "Analyze plant health. Return strictly JSON." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          plantName: { type: Type.STRING }, issue: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ["Healthy", "Warning", "Critical"] },
          advice: { type: Type.STRING }
        },
        required: ["plantName", "issue", "severity", "advice"]
      }
    }
  });
  return JSON.parse(cleanJsonResponse(response.text!));
};

export const findNearbyGardenCenters = async (lat: number, lng: number): Promise<GardenCenter[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Find 5 highly-rated garden centers near my location.",
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: { latitude: lat, longitude: lng }
        }
      }
    }
  });

  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const centers: GardenCenter[] = chunks
    .filter((chunk: any) => chunk.maps)
    .map((chunk: any, index: number) => ({
      id: `real-${index}`,
      name: chunk.maps.title,
      latitude: lat + (Math.random() - 0.5) * 0.01,
      longitude: lng + (Math.random() - 0.5) * 0.01,
      address: chunk.maps.uri || "Address available via link",
      website: chunk.maps.uri
    }));

  return centers;
};

export const startBotanistChat = (): Chat => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: 'You are a world-class botanist and plant care expert named Flora. You help users with plant identification, watering schedules, pest control, and general gardening advice. Be friendly, knowledgeable, and practical. If a user asks about toxicity, provide safety advice.',
    },
  });
};
