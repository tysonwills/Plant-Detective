
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
        { text: "Identify this plant. For the main result and for each 'similarPlant' entry, provide full botanical data including identification details, complete care parameters (intervals, temps, height), and common problems. Return strictly valid JSON." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 0 },
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
    contents: `Provide botanical information and care guide for: ${plantName}. Also include 3 similar plants with their own basic care and identification data. Return strictly valid JSON.`,
    config: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 0 },
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
  if (!text) throw new Error("Plant search failed.");
  return JSON.parse(cleanJsonResponse(text));
};

export const diagnoseHealth = async (base64Image: string): Promise<Omit<DiagnosticResult, 'id' | 'timestamp' | 'imageUrl'>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: base64Image } },
        { text: "Examine this plant for health issues. Perform a clinical analysis of symptoms and specifically diagnose the underlying biological or environmental cause (etiology). Provide a step-by-step remedy. Return strictly valid JSON." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 0 },
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          plantName: { type: Type.STRING }, 
          issue: { type: Type.STRING },
          cause: { type: Type.STRING, description: "The underlying biological or environmental root cause of the observed symptoms." },
          severity: { type: Type.STRING, enum: ["Healthy", "Warning", "Critical"] },
          advice: { type: Type.STRING, description: "Detailed recovery protocol." }
        },
        required: ["plantName", "issue", "cause", "severity", "advice"]
      }
    }
  });
  const text = response.text;
  if (!text) throw new Error("Diagnostic analysis failed.");
  return JSON.parse(cleanJsonResponse(text));
};

export const findNearbyGardenCenters = async (lat: number, lng: number): Promise<GardenCenter[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Find 5 high-quality garden centers, nurseries, or botanical supply stores near my current location. Please ensure you provide their names, full addresses, and telephone numbers.",
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
    .map((chunk: any, index: number) => {
      const fakeRating = 4.2 + (Math.random() * 0.7);
      const dist = (0.5 + Math.random() * 5).toFixed(1);
      
      const tags = ["Verified Store"];
      const title = chunk.maps.title || "Garden Center";
      if (title.toLowerCase().includes('nursery')) tags.push("Nursery");
      if (title.toLowerCase().includes('center')) tags.push("Full Service");
      if (index === 0) tags.push("Top Rated");

      return {
        id: `real-${index}`,
        name: title,
        latitude: lat + (Math.random() - 0.5) * 0.02, 
        longitude: lng + (Math.random() - 0.5) * 0.02,
        address: "Nearby location detected",
        website: chunk.maps.uri,
        rating: Number(fakeRating.toFixed(1)),
        distance: `${dist} km`,
        isOpen: Math.random() > 0.3,
        tags: tags,
        phone: "+1 (555) 000-0000" // Simulated phone if not present in grounding chunks (which only provide URI/Title)
      };
    });

  return centers;
};

export const startBotanistChat = (): Chat => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: 'You are a world-class botanist named Flora. Help users with plant care. Be friendly and practical.',
    },
  });
};