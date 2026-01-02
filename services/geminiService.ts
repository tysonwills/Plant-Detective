
import { GoogleGenAI, Type } from "@google/genai";
import { IdentificationResponse, DiagnosticResult, GardenCenter } from "../types";

const cleanJsonResponse = (text: string) => {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

export const identifyPlant = async (base64Image: string): Promise<IdentificationResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: base64Image } },
        { text: "Identify this plant. Provide a care guide (including temperature, soil, and the absolute best place to position it in a home for optimal growth), and a list of 3-4 common problems with their solutions. Also, suggest similar plants. Return strictly valid JSON." }
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
              temperature: { type: Type.STRING },
              pruning: { type: Type.STRING },
              seasonalCare: { type: Type.STRING }, 
              homeRemedies: { type: Type.STRING },
              hints: { type: Type.ARRAY, items: { type: Type.STRING } },
              bestPlacement: { type: Type.STRING, description: "Specific advice on where to place the plant in a home." }
            },
            required: ["watering", "sunlight", "soil", "temperature", "hints", "bestPlacement"]
          },
          commonProblems: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                problem: { type: Type.STRING },
                solution: { type: Type.STRING }
              },
              required: ["problem", "solution"]
            }
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
    contents: `Provide botanical information, care guide (including temperature, soil, and the absolute best place to position it in a home for optimal growth), 3-4 common problems with solutions, and 3-4 similar plants for: ${plantName}. Return as strictly valid JSON.`,
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
              temperature: { type: Type.STRING },
              pruning: { type: Type.STRING },
              seasonalCare: { type: Type.STRING }, 
              homeRemedies: { type: Type.STRING },
              hints: { type: Type.ARRAY, items: { type: Type.STRING } },
              bestPlacement: { type: Type.STRING, description: "Specific advice on where to place the plant in a home." }
            },
            required: ["watering", "sunlight", "soil", "temperature", "hints", "bestPlacement"]
          },
          commonProblems: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                problem: { type: Type.STRING },
                solution: { type: Type.STRING }
              },
              required: ["problem", "solution"]
            }
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
    contents: "Find 5 highly-rated garden centers, nurseries, or plant stores near my current location. Return their names and addresses.",
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
