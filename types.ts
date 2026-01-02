
export interface PlantIdentification {
  scientificName: string;
  commonName: string;
  genus: string;
  family: string;
  confidence: number;
  description: string;
  isToxic: boolean;
  toxicityWarning?: string;
}

export interface CareGuide {
  watering: string;
  sunlight: string;
  soil: string;
  pruning: string;
  seasonalCare: string;
  homeRemedies: string;
  hints: string[]; // Added quick care hints
}

export interface IdentificationResponse {
  identification: PlantIdentification;
  care: CareGuide;
  similarPlants: Array<{
    name: string;
    scientificName: string;
    description: string;
  }>;
}

export interface Reminder {
  id: string;
  plantId: string;
  type: 'Water' | 'Fertilize' | 'Prune' | 'Mist' | 'Repot';
  frequency: 'Daily' | 'Weekly' | 'Bi-weekly' | 'Monthly';
  time: string; // HH:mm format
  lastCompleted?: string;
}

export interface DiagnosticResult {
  id: string;
  timestamp: string;
  plantName: string;
  issue: string;
  severity: 'Healthy' | 'Warning' | 'Critical';
  advice: string;
  imageUrl?: string;
}

export interface WikiImage {
  imageUrl: string;
  sourcePageUrl: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  isSubscribed: boolean;
}

export interface GardenCenter {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
}
