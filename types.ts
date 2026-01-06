
export interface PlantIdentification {
  scientificName: string;
  commonName: string;
  genus: string;
  family: string;
  confidence: number;
  description: string;
  isToxic: boolean;
  toxicityWarning?: string;
  toxicityAdvice?: string;
}

export interface CareGuide {
  watering: string;
  wateringDaysInterval: number;
  sunlight: string;
  soil: string;
  temperature: string;
  minTemp?: number;
  maxTemp?: number;
  estimatedHeight?: string;
  humidity: string;
  fertilizer: string;
  fertilizerMonthsActive: number[];
  fertilizerDaysInterval: number;
  pruning: string;
  cleaningDaysInterval: number;
  seasonalCare: string;
  homeRemedies: string;
  hints: string[];
  bestPlacement: string;
}

export interface CommonProblem {
  problem: string;
  description: string;
  solution: string;
}

export interface IdentificationResponse {
  identification: PlantIdentification;
  care: CareGuide;
  commonProblems: CommonProblem[];
  similarPlants: Array<Partial<IdentificationResponse> & {
    name: string;
    scientificName: string;
    description: string;
    imageUrl?: string;
  }>;
}

export interface Reminder {
  id: string;
  plantId: string;
  type: 'Water' | 'Fertilize' | 'Prune' | 'Mist' | 'Repot' | 'Clean';
  frequency: 'Daily' | 'Weekly' | 'Bi-weekly' | 'Monthly';
  time: string;
  lastCompleted?: string;
  lastNotificationDate?: string;
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
  notificationsEnabled?: boolean;
}

export interface GardenCenter {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  website?: string;
  rating?: number;
  distance?: string;
  isOpen?: boolean;
  tags?: string[];
  phone?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}
