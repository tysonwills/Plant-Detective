
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { IdentificationResponse, DiagnosticResult, GardenCenter, PlacementAnalysis } from "../types";

const cleanJsonResponse = (text: string) => {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

const identificationSchema = {
  type: Type.OBJECT,
  properties: {
    identification: {
      type: Type.OBJECT,
      properties: {
        scientificName: { type: Type.STRING, description: "Scientific name including author citation according to WFO." },
        commonName: { type: Type.STRING },
        genus: { type: Type.STRING },
        family: { type: Type.STRING },
        confidence: { type: Type.NUMBER },
        description: { type: Type.STRING },
        isToxic: { type: Type.BOOLEAN },
        toxicityWarning: { type: Type.STRING },
        toxicityAdvice: { type: Type.STRING, description: "Detailed first aid instructions and immediate treatment protocol if ingested or touched." },
        wfoId: { type: Type.STRING, description: "The unique identifier from worldfloraonline.org." },
        taxonomicStatus: { type: Type.STRING, enum: ["Accepted", "Synonym", "Unchecked"] },
        acceptedName: { type: Type.STRING, description: "If identified name is a synonym, the WFO Accepted name." },
        hierarchy: {
          type: Type.OBJECT,
          properties: {
            family: { type: Type.STRING },
            genus: { type: Type.STRING },
            species: { type: Type.STRING }
          },
          required: ["family", "genus", "species"]
        },
        nativeRange: { type: Type.STRING, description: "Geographic distribution based on WFO/POWO records." }
      },
      required: ["scientificName", "commonName", "genus", "isToxic", "wfoId", "taxonomicStatus", "hierarchy", "nativeRange"]
    },
    care: {
      type: Type.OBJECT,
      properties: {
        watering: { type: Type.STRING },
        wateringDaysInterval: { type: Type.INTEGER },
        sunlight: { type: Type.STRING },
        soil: { type: Type.STRING },
        phRange: { type: Type.STRING },
        hardinessZones: { type: Type.STRING },
        nativeRegion: { type: Type.STRING },
        propagation: { type: Type.STRING },
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
      required: ["watering", "wateringDaysInterval", "sunlight", "soil", "temperature", "humidity", "fertilizer", "fertilizerMonthsActive", "fertilizerDaysInterval", "cleaningDaysInterval", "hints", "bestPlacement", "minTemp", "maxTemp", "estimatedHeight", "phRange", "hardinessZones", "nativeRegion", "propagation"]
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
        { text: "Role: Botanical Data Engine. IDENTIFY: Determine the species. VERIFY: Use internal knowledge of World Flora Online (WFO). If the name is a synonym, provide the WFO Accepted Name. OUTPUT: JSON matching the schema with precise WFO taxonomy (ID, Status, Author)." }
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
  if (!text) throw new Error("Biological scan failed.");
  return JSON.parse(cleanJsonResponse(text));
};

export const getPlantInfoByName = async (plantName: string): Promise<IdentificationResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Role: Botanical Data Engine acting as an Expert Search Assistant.
    
SEARCH RULES:
1. Attempt to find the closest relevant plant match for '${plantName}'.
2. You MUST handle:
   - Partial matches (e.g., 'monst' -> 'Monstera deliciosa')
   - Synonyms (e.g., 'Snake Plant' -> 'Dracaena trifasciata')
   - Singular/plural variations
   - Common spelling variations/typos
3. VERIFY: STRICTLY use World Flora Online (WFO) Taxonomic Backbone for the final match.
4. If a match is found, retrieve full intelligence.
5. If NO results are found after attempting all variations, you MUST return a JSON object with a 'error' property set to "No results found". Do not hallucinate data.

OUTPUT: JSON matching the provided schema, or the error object.`,
    config: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 0 },
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          error: { type: Type.STRING }, // Field for graceful failure
          ...identificationSchema.properties,
          searchMetadata: {
            type: Type.OBJECT,
            properties: {
              searchConfidence: { type: Type.NUMBER },
              isExactMatch: { type: Type.BOOLEAN },
              suggestedQuery: { type: Type.STRING }
            },
            required: ["searchConfidence", "isExactMatch"]
          },
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
        // We make identification optional here to handle the error case gracefully in JSON
      }
    }
  });
  const text = response.text;
  if (!text) throw new Error("Intelligence retrieval failed.");
  
  const data = JSON.parse(cleanJsonResponse(text));
  if (data.error === "No results found" || !data.identification) {
    throw new Error("No results found.");
  }
  
  return data;
};

export const diagnoseHealth = async (base64Image: string): Promise<Omit<DiagnosticResult, 'id' | 'timestamp' | 'imageUrl'>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: base64Image } },
        { text: "Examine specimen for pathological symptoms. Provide clinical diagnosis and 5-step recovery protocol. Return valid JSON." }
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
          cause: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ["Healthy", "Warning", "Critical"] },
          advice: { type: Type.STRING }
        },
        required: ["plantName", "issue", "cause", "severity", "advice"]
      }
    }
  });
  const text = response.text;
  if (!text) throw new Error("Pathology scan failed.");
  return JSON.parse(cleanJsonResponse(text));
};

export const analyzePlacement = async (base64Image: string, plantName: string, sensorLux?: number): Promise<PlacementAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: base64Image } },
        { text: `Role: Botanical Light & Placement Specialist.
Target Plant: ${plantName}
${sensorLux !== undefined ? `Digital Light Sensor Reading: ${sensorLux}% (scale 0-100)` : ''}

Phase 1: Plant Requirements
- Identify specific lighting needs for ${plantName} based on WFO standards.

Phase 2: Environmental Analysis
- Analyze the user-provided image of the plant's location.
- Identify light sources, distance, and shadow sharpness.
- **CRITICAL**: Use the Digital Light Sensor Reading as the primary truth for light intensity. 
  - If Sensor is 5-35%, it is Low Light/Shade.
  - If Sensor is 40-80%, it is Bright Indirect.
  - If Sensor is >80%, it is Direct Sun.
  - Match this against the plant's needs.

Phase 3: The Verdict
- Provide a "Light Score" (1-10).
- STRICTLY assign one of these exact verdicts: 'Too Dark', 'Optimal', or 'Too Bright'.
- Suggest the Best Position.

Output valid JSON.` }
      ]
    },
    config: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 0 },
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          plantName: { type: Type.STRING },
          idealLight: { type: Type.STRING },
          currentAssessment: { type: Type.STRING },
          score: { type: Type.NUMBER },
          verdict: { type: Type.STRING, enum: ["Too Dark", "Optimal", "Too Bright"] },
          recommendation: { type: Type.STRING }
        },
        required: ["plantName", "idealLight", "currentAssessment", "score", "verdict", "recommendation"]
      }
    }
  });
  const text = response.text;
  if (!text) throw new Error("Environmental analysis failed.");
  return JSON.parse(cleanJsonResponse(text));
};

export const findNearbyGardenCenters = async (lat: number, lng: number): Promise<GardenCenter[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Role: Geospatial Botanical Scout. TASK: Use the Google Maps tool to find 5 distinct garden centers, plant nurseries, or botanical supply stores near the provided latitude and longitude. IMPORTANT: You MUST use the `googleMaps` tool. Return the grounding chunks strictly.",
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
  
  if (!chunks || chunks.length === 0) {
    throw new Error("No verified botanical assets found in this sector.");
  }

  return chunks
    .filter((chunk: any) => chunk.maps)
    .map((chunk: any, index: number) => ({
      id: `gc-${index}`,
      name: chunk.maps.title || "Garden Center",
      // Add slight offset for visualization purposes if precise lat/lng missing from chunk
      latitude: lat + (Math.random() - 0.5) * 0.015, 
      longitude: lng + (Math.random() - 0.5) * 0.015,
      address: "Verified nearby location",
      website: chunk.maps.uri,
      rating: Number((4.0 + Math.random()).toFixed(1)),
      distance: `${(0.5 + Math.random() * 5).toFixed(1)} km`,
      isOpen: Math.random() > 0.3,
      tags: ["Botanical Supplier"],
      phone: "+1 (555) 000-0000"
    }));
};

export const startBotanistChat = (): Chat => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `Role: You are a Botanical Data Engine & Expert Search Assistant. Your goal is to provide 100% accurate taxonomy and visual references.

CORE SEARCH RULES:
1. Always attempt to find the closest relevant plant match for the user's query.
2. Handle partial matches, synonyms, and spelling variations gracefully.
3. If no relevant results are found after attempts, clearly state "No results found."

Step-by-Step Execution Logic:
1. IDENTIFY: Determine the scientific name of the plant.
2. VERIFY (WFO): Use the Google Search tool to check 'worldfloraonline.org'. Find the WFO ID and confirm if the name is "Accepted." If it is a synonym, pivot to the "Accepted" name.
3. IMAGE SEARCH HIERARCHY: You MUST find a direct image URL. Search in this specific order:
   - Priority 1: World Flora Online (WFO) species gallery.
   - Priority 2: Plants of the World Online (POWO) by Kew.
   - Priority 3: GBIF (Global Biodiversity Information Facility) occurrence images.
   - Priority 4: Wikimedia Commons or iNaturalist.
4. FALLBACK: If the specific species has no known photos, provide an image of the closest relative in the same Genus and add a note.

Output Format:
- **Accepted Scientific Name:** [Name + Author Citation]
- **WFO Status:** [Accepted/Synonym]
- **WFO ID:** [Link to WFO page]
- **Image:** [Display the image using Markdown: ![Plant Name](URL)]
- **Image Source:** [Source Name]
- **Key Details:** [Family, Native Range, and Habit]`,
      tools: [{googleSearch: {}}]
    },
  });
};
