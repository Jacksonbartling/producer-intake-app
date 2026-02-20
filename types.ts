export interface NutrientDetail {
  splitFall: string;
  splitSpring: string;
  splitSeason: string;
  methods: string[];
}

export interface FormData {
  // Phase 1 (Foundation)
  primaryCrops: string[];
  rotationStory: string[];
  historyChanged: string;

  // Phase 2 (Soil/Water/Land Assets)
  tillageApproach: string[];
  tillageDepth: string[];
  tillageHistory: string;
  tillageReasoning: string;
  coverCropRelationship: string[];
  coverCropMix: string[];
  coverCropExperience: string;
  irrigationSetup: string[];
  iwmStrategy: string[];
  waterPainPoints: string;
  // NEW Land Assets
  grasslandUse: string[];
  grasslandHealth: string[];
  timberStatus: string[];
  timberHeadaches: string[];
  waterManagementStrategy: string[];

  // Phase 3 (Nutrient)
  nitrogenSource: string[];
  nutrientDetails: Record<string, NutrientDetail>; // Keyed by source name
  inputTech: string[];
  inputTechExplanations: Record<string, string>; // Keyed by tech name
  manureSource: string[];
  protectionPasses: string[];
  inputNotes: string;

  // Phase 4 (Specialized)
  livestockIntegration: string[];
  livestockOperation: string[];
  herdSize: string;
  matureWeight: string;
  breeds: string;
  geneticsSource: string;
  grazingMethod: string[];
  livestockVision: string;
  primaryMarket: string[];
  marketingMethods: string[];
  usesGrainMarketer: string;
  onFarmStorage: string;
  marketingStrategy: string;

  // Phase 5 (Strategy)
  existingPrograms: string[];
  priorities: string[];
  fears: string[];
  successionPlan: string[];
  fiveYearVision: string;
  hurdles: string;
  recreationalActivities: string[];
}

export enum Phase {
  Landing = 0,
  Land = 1,
  Foundation = 2,
  SoilWater = 3,
  NutrientCycle = 4,
  Specialized = 5,
  Strategy = 6,
  AIReview = 7,
  Success = 8
}