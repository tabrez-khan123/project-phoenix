export type DeviceType = 'laptop' | 'smartphone';

export type DevicePathway = 'repair' | 'donate' | 'refurbish' | 'resell' | 'harvest' | 'recycle';

export interface DeviceAssessmentInput {
  type: DeviceType;
  brand: string;
  model: string;
  condition: 'like-new' | 'good' | 'fair' | 'poor' | 'broken';
  symptoms: string;
  images: File[];
  video?: File;
}

export interface AnalysisPipelineStep {
  id: string;
  name: string;
  status: 'idle' | 'processing' | 'completed' | 'failed';
  details: string[];
  duration: number; // in ms
}

export interface EnvironmentalImpact {
  co2AvoidedKg: number;
  eWastePreventedGrams: number;
  valuableMaterialsRecovered: {
    goldGrams: number;
    copperGrams: number;
    cobaltGrams: number;
    aluminumGrams: number;
  };
  treesEquivalent: number;
  carMilesAvoided: number;
}

export interface AssessmentResult {
  deviceId: string;
  deviceType: DeviceType;
  brand: string;
  model: string;
  recommendation: DevicePathway;
  confidenceScore: number; // percentage (e.g. 94)
  deviceHealthScore: number; // percentage (e.g. 78)
  evidence: string[];
  reasoning: string;
  lifecycleExtensionYears: number;
  valuePreservedUsd: number;
  environmentalImpact: EnvironmentalImpact;
}

export interface CommunityAction {
  id: string;
  userName: string;
  userLocation: string;
  deviceType: DeviceType;
  brand: string;
  model: string;
  pathway: DevicePathway;
  timestamp: string;
  co2SavedKg: number;
}

export interface LedgerStats {
  devicesSaved: number;
  co2AvoidedTons: number;
  educationalDonations: number;
  economicValuePreservedUsd: number;
}
