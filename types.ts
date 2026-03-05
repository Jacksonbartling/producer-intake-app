export interface Nutrient_Detail {
  Split_Fall: string;
  Split_Spring: string;
  Split_Season: string;
  Methods: string[];
}

export interface Form_Data {
  // Phase 1 (Foundation)
  Primary_Crops: string[];
  Rotation_Story: string[];
  History_Changed: string;

  // Phase 2 (Soil/Water/Land Assets)
  Tillage_Strategy: string[];
  Tillage_Depth: string[];
  Tillage_History: string;
  Tillage_Reasoning: string;
  Cover_Crops_Relationship: string[];
  Cover_Crop_Mix: string[];
  Cover_Crop_Challenges: string;
  Irrigation_Setup: string[];
  IWM_Strategy: string[];
  Water_Management_Experience: string;
  // NEW Land Assets
  Grassland_Utility: string[];
  Grassland_Health: string[];
  Timber_Strategy: string[];
  Management_Challenges: string[];
  Water_Infrastructure: string[];

  // Phase 3 (Nutrient)
  Fertility_Nitrogen_Source: string[];
  Nutrient_Details: Record<string, Nutrient_Detail>; // Keyed by source name
  Input_Technology: string[];
  Input_Tech_Explanations: Record<string, string>; // Keyed by tech name
  Manure_Source: string[];
  Protection_Passes: string[];
  General_Input_Pass_Notes: string;

  // Phase 4 (Specialized)
  Livestock_Integration: string[];
  Operation_Type: string[];
  Herd_Size: string;
  Mature_Weight: string;
  Breeds: string;
  Genetics_Source: string;
  Grazing_Method: string[];
  Livestock_Vision: string;
  Market_Sell_Locations: string[];
  Sales_Methods: string[];
  Uses_Grain_Marketer: string;
  On_Farm_Storage: string;
  Marketing_Strategy_Narrative: string;

  // Phase 5 (Strategy)
  Existing_Programs: string[];
  Top_Priorities: string[];
  Fears: string[];
  Succession_Plan: string[];
  Five_Year_Vision: string;
  Hurdles: string;
  Recreational_Activities: string[];
}

// Backwards-compatible aliases (old names) to ease migration.
export type NutrientDetail = Nutrient_Detail;
export type FormData = Form_Data;

export enum Phase {
  Landing = 0,
  Land = 1,
  Foundation = 2,
  SoilWater = 3,
  NutrientCycle = 4,
  Specialized = 5,
  Strategy = 6,
  AIReview = 7,
  Success = 8,
}
