import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Tractor,
  ClipboardList,
  Send,
  MapPin,
  Layers,
  Store,
  BookOpen,
  Info,
  Zap,
  Loader2,
  FileText,
  Sparkles,
  AlertCircle,
  Waves,
  Trees,
  Tent,
} from "lucide-react";
import { Phase, Form_Data, Nutrient_Detail } from "./types";
import {
  CheckboxCard,
  SectionTitle,
  TextInput,
  TextArea,
  PillSelect,
} from "./components/FormElements";
import { generateOperationalNarrative } from "./services/terraService";

// GUIDELINE PHILOSOPHY: We are solving problems. Understand every issue that could turn into a mutually-beneficial enrollment (sale).

// Reference option sets used by the form
const Nitrogen_Sources = [
  "Anhydrous",
  "Urea",
  "UAN",
  "MAP/DAP",
  "AMS/ATS",
  "Other",
];

const Application_Methods = [
  "Injected/Knife",
  "Broadcast",
  "Foliar",
  "Planter Applied",
  "Other",
];

const Tech_Explanation_Options: Record<string, string[]> = {
  "Nitrification Inhibitor": [
    "Protect Fall Applied N",
    "Protect Spring Pre-Plant N",
    "Manure Management",
    "Maximize Availability",
    "Other",
  ],
  "Urease Inhibitor": [
    "Protect Surface Applied Urea",
    "Protect Surface UAN",
    "Protect Volatilization",
    "Other",
  ],
  "Variable Rate (VRT)": [
    "Grid Sample Based",
    "Zone/Soil Type Based",
    "Yield Map History",
    "Sensor/Drone Based",
    "Other",
  ],
  Biologicals: [
    "Soil Stimulant/Carbon Source",
    "N-Fixing Microbes",
    "P-Solubilizing Agents",
    "Other",
  ],
};

const Marketing_Channels = [
  "Ethanol Plant",
  "Feedlot",
  "Local Elevator",
  "Terminal/River",
  "Specialty/Direct",
  "Other",
];

const Sales_Methods = [
  "Spot Market",
  "Forward Contract",
  "HTA (Hedge-to-Arrive)",
  "Basis Contract",
  "Minimum Price",
  "Hedging/Futures",
  "Other",
];

// Introduction of Title_Snake_Case from types.ts
const INITIAL_DATA: Form_Data = {
  Primary_Crops: [],
  Rotation_Story: [],
  History_Changed: "",

  Tillage_Strategy: [],
  Tillage_Depth: [],
  Tillage_History: "",
  Tillage_Reasoning: "",
  Cover_Crops_Relationship: [],
  Cover_Crop_Mix: [],
  Cover_Crop_Challenges: "",
  Irrigation_Setup: [],
  IWM_Strategy: [],
  Water_Management_Experience: "",

  Grassland_Utility: [],
  Grassland_Health: [],
  Timber_Strategy: [],
  Management_Challenges: [],
  Water_Infrastructure: [],

  Fertility_Nitrogen_Source: [],
  Nutrient_Details: {},
  Input_Technology: [],
  Input_Tech_Explanations: {},
  Manure_Source: [],
  Protection_Passes: [],
  General_Input_Pass_Notes: "",

  Livestock_Integration: [],
  Operation_Type: [],
  Herd_Size: "",
  Mature_Weight: "",
  Breeds: "",
  Genetics_Source: "",
  Grazing_Method: [],
  Livestock_Vision: "",
  Market_Sell_Locations: [],
  Sales_Methods: [],
  Uses_Grain_Marketer: "No",
  On_Farm_Storage: "",
  Marketing_Strategy_Narrative: "",

  Existing_Programs: [],
  Top_Priorities: [],
  Fears: [],
  Succession_Plan: [],
  Five_Year_Vision: "",
  Hurdles: "",
  Recreational_Activities: [],
};

const App: React.FC = () => {
  const [phase, setPhase] = useState<Phase>(Phase.Landing);
  const [data, setData] = useState<Form_Data>(INITIAL_DATA);
  const [otherValues, setOtherValues] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiNarrative, setAiNarrative] = useState<string>("");

  const updateData = (updates: Partial<Form_Data>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const NA_LABELS: Record<string, string> = {
    Grassland_Utility: "N/A: No Grassland",
    Timber_Strategy: "N/A: No Timber",
  };

  // Reusable NA/None detector used by array handlers and pill selects
  const isNAOption = (opt: string | undefined) => {
    if (!opt) return false;
    const low = opt.toLowerCase();
    return (
      low.startsWith("n/a") ||
      low.includes("n/a:") ||
      low === "none" ||
      low.startsWith("none ") ||
      low.includes("never used") ||
      low.includes("n/a: no")
    );
  };

  const toggleArrayItem = (field: keyof Form_Data, value: string) => {
    const current = (data[field] as unknown as string[]) || [];

    const naLabel = NA_LABELS[field as string];
    // If the selected value is explicitly an NA label for this field,
    // set it as the single selected value.
    if (naLabel && value === naLabel) {
      updateData({ [field]: [value] } as any);
      return;
    }

    // If the tapped option is an NA-like option, make it exclusive.
    if (isNAOption(value)) {
      updateData({ [field]: [value] } as any);
      return;
    }

    // Otherwise, add/remove the item but ensure any NA-like options are removed.
    const withoutNA = current.filter((item) => !isNAOption(item));
    const updated = withoutNA.includes(value)
      ? withoutNA.filter((item) => item !== value)
      : [...withoutNA, value];
    updateData({ [field]: updated } as any);
  };

  // Handle pill-select style inputs with NA exclusivity
  const handlePillChange = (field: keyof Form_Data, selected: string[]) => {
    const na = selected.find((s) => isNAOption(s));
    if (na) {
      updateData({ [field]: [na] } as any);
      return;
    }
    const cleaned = selected.filter((s) => !isNAOption(s));
    updateData({ [field]: cleaned } as any);
  };

  const setSingleChoice = (field: keyof Form_Data, value: string) => {
    updateData({ [field]: [value] });
  };

  const updateOtherText = (field: string, text: string) => {
    setOtherValues((prev) => ({ ...prev, [field]: text }));

    // Immediately migrate common write-ins into the canonical `data` shape
    // so the resulting JSON contains the typed value instead of the
    // ephemeral "Other" token.
    if (!text || text.trim() === "") return;

    // Helper: replace "Other" in an array field with the typed text
    const replaceOtherInArray = (key: keyof Form_Data) => {
      const arr = (data[key] as unknown as string[]) || [];
      const replaced = arr.includes("Other")
        ? arr.map((v) => (v === "Other" ? text : v))
        : [...arr, text];
      updateData({ [key]: replaced } as any);
    };

    // Field-specific migrations
    switch (field) {
      case "Primary_Crops":
        replaceOtherInArray("Primary_Crops");
        break;

      case "Fertility_Nitrogen_Source":
        // Replace "Other" token in sources and move any Nutrient_Details
        // keyed under "Other" to the new text key.
        {
          const sources = (data.Fertility_Nitrogen_Source || []) as string[];
          const newSources = sources.includes("Other")
            ? sources.map((s) => (s === "Other" ? text : s))
            : [...sources, text];

          const details = { ...(data.Nutrient_Details || {}) } as Record<
            string,
            Nutrient_Detail
          >;
          if (details["Other"] && !details[text]) {
            details[text] = details["Other"];
            delete details["Other"];
          }

          updateData({
            Fertility_Nitrogen_Source: newSources,
            Nutrient_Details: details,
          } as any);
        }
        break;

      default:
        // Generic behavior: if the field maps to an array on Form_Data,
        // replace "Other" with the typed value.
        if ((data as any)[field] instanceof Array) {
          const arr = (data as any)[field] as string[];
          if (arr.includes("Other")) {
            const replaced = arr.map((v) => (v === "Other" ? text : v));
            updateData({ [field]: replaced } as any);
          }
        }
        break;
    }
  };

  const updateNutrientDetail = (
    source: string,
    updates: Partial<Nutrient_Detail>,
  ) => {
    const current = data.Nutrient_Details[source] || {
      Split_Fall: "0",
      Split_Spring: "0",
      Split_Season: "0",
      Methods: [],
    };
    updateData({
      Nutrient_Details: {
        ...(data.Nutrient_Details || {}),
        [source]: { ...current, ...updates },
      },
    } as any);
  };

  const toggleNutrientMethod = (source: string, method: string) => {
    const detail = data.Nutrient_Details[source] || {
      Split_Fall: "0",
      Split_Spring: "0",
      Split_Season: "0",
      Methods: [],
    };
    const methods = detail.Methods.includes(method)
      ? detail.Methods.filter((m) => m !== method)
      : [...detail.Methods, method];
    updateNutrientDetail(source, { Methods: methods } as any);
  };

  const updateTechExplanation = (tech: string, val: string) => {
    updateData({
      Input_Tech_Explanations: {
        ...(data.Input_Tech_Explanations || {}),
        [tech]: val,
      },
    } as any);
  };

  const nextPhase = () => {
    if (phase < Phase.Success) setPhase(phase + 1);
  };

  const prevPhase = () => {
    if (phase > Phase.Landing) setPhase(phase - 1);
  };

  const handleAIReview = async () => {
    setIsGenerating(true);
    setPhase(Phase.AIReview);
    // For prototype: bypass API call and show fixed success message
    setAiNarrative(
      "This is a synthesized narrative of the farm's operational history, ready for program eligibility review.",
    );
    setIsGenerating(false);
  };

  const handleFinish = () => {
    setPhase(Phase.Success);
    console.log("Intake Form Data & AI Narrative Captured:", {
      ...data,
      aiNarrative,
    });
  };

  const renderOtherInput = (field: string) => {
    const isSelected = (data[field as keyof Form_Data] as string[]).includes(
      "Other",
    );
    if (!isSelected) return null;

    return (
      <div className="mt-2 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
        <input
          type="text"
          value={otherValues[field] || ""}
          onChange={(e) => updateOtherText(field, e.target.value)}
          placeholder="Please specify..."
          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2E20]/20 focus:border-[#1B2E20] transition-all"
        />
      </div>
    );
  };

  const renderProgress = () => {
    if (phase === Phase.Landing || phase === Phase.Success) return null;

    const icons = [
      <MapPin className="w-5 h-5" />,
      <ClipboardList className="w-5 h-5" />,
      <Tractor className="w-5 h-5" />,
      <Layers className="w-5 h-5" />,
      <Store className="w-5 h-5" />,
      <Send className="w-5 h-5" />,
      <Sparkles className="w-5 h-5" />,
    ];

    return (
      <div className="flex items-center justify-center gap-3 mb-12 animate-in fade-in duration-700">
        {icons.map((icon, i) => {
          const iconIdx = i + 1;
          return (
            <React.Fragment key={i}>
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  phase >= iconIdx
                    ? "bg-[#1B2E20] text-white shadow-lg"
                    : "bg-white text-gray-400 border border-gray-200"
                }`}
              >
                {icon}
              </div>
              {i < icons.length - 1 && (
                <div
                  className={`h-[2px] w-8 transition-colors ${phase > iconIdx ? "bg-[#1B2E20]" : "bg-gray-200"}`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const renderLandingPage = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-[#1B2E20] text-white p-12 rounded-[2.5rem] mb-12 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold tracking-widest uppercase mb-6 text-green-100 backdrop-blur-sm">
            <Zap className="w-3 h-3" /> Team Overview
          </div>
          <h1 className="text-5xl serif mb-6 leading-tight">
            Operational Intake Framework
          </h1>
          <p className="text-lg text-green-100/80 mb-8 leading-relaxed">
            This intake captures the "Story" of a farm through a fluid
            conversation, enabling planners to unlock high-value conservation
            and carbon intensity opportunities.
          </p>
          <button
            onClick={() => setPhase(Phase.Land)}
            className="bg-white text-[#1B2E20] px-10 py-5 rounded-2xl font-black flex items-center gap-3 hover:bg-green-50 transition-all shadow-xl hover:-translate-y-1 active:scale-95"
          >
            Start Prototype Experience
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
        <div className="absolute -right-20 -bottom-20 opacity-10">
          <Tractor className="w-96 h-96" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm">
          <SectionTitle>Field Architecture</SectionTitle>
          <ul className="space-y-6 mt-6">
            <li className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800">
                  Operational Foundation
                </h4>
                <p className="text-sm text-gray-500">
                  Primary Crops (Multi), Rotation Story (Multi), Land History
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Layers className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800">
                  Natural Asset Stewardship
                </h4>
                <p className="text-sm text-gray-500">
                  Tillage, Cover Crops, Water Infrastructure, Grassland Utility
                  & Health, Timber Strategy
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800">
                  Nutrient Intelligence
                </h4>
                <p className="text-sm text-gray-500">
                  Per-source timing (Fall/Spring/In-season %), Application
                  Methods (Multi), Input Technology (selectable pills), General
                  Input & Pass Notes
                </p>
              </div>
            </li>
          </ul>
        </div>

        <div className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm">
          <SectionTitle>Specialized Logic</SectionTitle>
          <ul className="space-y-6 mt-6">
            <li className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <Store className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800">Marketing & Sales</h4>
                <p className="text-sm text-gray-500">
                  Market Channels (Multi), Grain Marketers (Dependent Text),
                  Sales Strategy (Narrative)
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <Tent className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800">Human Alignment</h4>
                <p className="text-sm text-gray-500">
                  Priorities, Succession (Status), Recreational Use (Multi), and
                  5-Year Vision.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-[#1B2E20]" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800">
                  AI Operational Review
                </h4>
                <p className="text-sm text-gray-500">
                  Final step synthesizes all raw data into a cohesive
                  professional narrative for producer acceptance.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Simplified renderPhase stub: restores compile-time correctness while
  // preserving the original phase titles and minimal behavior. Replace
  // with full UI per-phase later once compilation is stable.
  const renderPhase = () => {
    if (phase === Phase.Landing) return renderLandingPage();
    if (phase === Phase.Success)
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
          <div className="bg-[#E6F4EA] p-6 rounded-full shadow-lg mb-8">
            <CheckCircle2 className="w-16 h-16 text-[#1B2E20]" />
          </div>
          <h2 className="text-3xl serif text-[#1B2E20] mb-4">
            Intake Complete
          </h2>
          <p className="text-gray-500 max-w-sm mb-8">
            Your operational story has been successfully captured and
            synthesized.
          </p>
        </div>
      );

    // Restore Foundation phase UI first (safe increment).
    if (phase === Phase.Foundation)
      return (
        <div className="space-y-6">
          <PillSelect
            label="Primary Crops"
            options={[
              "Corn",
              "Soybeans",
              "Wheat",
              "Cotton",
              "Alfalfa",
              "Sorghum/Milo",
              "Rice",
              "Corn Silage",
              "Other",
            ]}
            selected={data.Primary_Crops}
            onChange={(crops) => handlePillChange("Primary_Crops", crops)}
            otherValue={otherValues.Primary_Crops}
            onOtherChange={(v) => updateOtherText("Primary_Crops", v)}
          />

          <SectionTitle>Rotation Story (Select Multiple)</SectionTitle>
          {[
            "Continuous (Same crop every year)",
            "Standard (e.g., Corn/Soy)",
            "Complex (3+ crops in rotation)",
            "Other",
          ].map((opt) => (
            <CheckboxCard
              key={opt}
              label={opt}
              checked={data.Rotation_Story.includes(opt)}
              onChange={() => toggleArrayItem("Rotation_Story", opt)}
            />
          ))}
          {renderOtherInput("Rotation_Story")}

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              If you want, continue to the next steps to fill water, nutrient,
              and strategy modules.
            </p>
          </div>
        </div>
      );

    // Soil/Water phase
    if (phase === Phase.SoilWater)
      return (
        <div className="space-y-12">
          <div>
            <SectionTitle>
              Tillage Strategy (Select all that apply)
            </SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              {[
                "No-Till",
                "Strip-Till",
                "Vertical Till",
                "Field Cultivator",
                "Disc/Ripper",
                "Hipper/Bedder",
                "Moldboard Plow",
                "Other",
              ].map((opt) => (
                <CheckboxCard
                  key={opt}
                  label={opt}
                  checked={data.Tillage_Strategy.includes(opt)}
                  onChange={() => toggleArrayItem("Tillage_Strategy", opt)}
                />
              ))}
            </div>
            {renderOtherInput("Tillage_Strategy")}

            <SectionTitle>Tillage Depth</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {['0–2"', '3–4"', '5–6"', '7–10"', '11"+'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => toggleArrayItem("Tillage_Depth", opt)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    data.Tillage_Depth.includes(opt)
                      ? "bg-[#1B2E20] text-white border-[#1B2E20]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-10 border-t border-gray-100">
            <SectionTitle>Cover Crops Relationship</SectionTitle>
            {[
              "Never Used",
              "New Adopter (1-3 yrs)",
              "Some Acres",
              "Long-Term (Pre-2020)",
              "Past User",
              "Other",
            ].map((opt) => (
              <CheckboxCard
                key={opt}
                label={opt}
                checked={data.Cover_Crops_Relationship.includes(opt)}
                onChange={() =>
                  toggleArrayItem("Cover_Crops_Relationship", opt)
                }
              />
            ))}
            {renderOtherInput("Cover_Crops_Relationship")}

            <TextArea
              label="Cover Crop Experience"
              placeholder="What challenges have you faced using cover crops?"
              value={data.Cover_Crop_Challenges}
              onChange={(val) =>
                updateData({ Cover_Crop_Challenges: val } as any)
              }
            />
          </div>

          <div className="pt-10 border-t border-gray-100 bg-gray-50 -mx-8 md:-mx-12 p-8 md:p-12">
            <div className="flex items-center gap-3 mb-8">
              <Waves className="w-6 h-6 text-[#1B2E20]" />
              <h2 className="text-2xl font-bold text-gray-800">
                Water Infrastructure
              </h2>
            </div>

            <SectionTitle>
              Water Usage & Management (Select all that apply)
            </SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {[
                "Sub-surface Drainage (Pattern/Targeted Tile)",
                "Irrigation (Surface or Well)",
                "Livestock Delivery (Ponds/Streams/Hydrants)",
                "Erosion/Bank Stability Issues",
                "Storage/Flood Control (Wetlands/Structures)",
              ].map((opt) => (
                <CheckboxCard
                  key={opt}
                  label={opt}
                  checked={data.Water_Infrastructure.includes(opt)}
                  onChange={() => toggleArrayItem("Water_Infrastructure", opt)}
                />
              ))}
            </div>

            <TextArea
              label="Water Management Experience"
              placeholder="Any issues with availability, drainage efficiency, or compliance?"
              value={data.Water_Management_Experience}
              onChange={(v) =>
                updateData({ Water_Management_Experience: v } as any)
              }
            />
          </div>

          <div className="pt-10 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <Trees className="w-6 h-6 text-[#1B2E20]" />
              <h2 className="text-2xl font-bold text-gray-800">
                Natural Land Assets
              </h2>
            </div>

            <div className="space-y-10">
              <div className="p-6 bg-white border border-gray-200 rounded-3xl shadow-sm">
                <SectionTitle>Grassland Utility</SectionTitle>
                <p className="text-xs text-gray-400 mb-4 -mt-3">
                  How do you currently utilize your grassland?
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    "Production (Active Grazing/Haying)",
                    "Conservation (Idle/CRP/Habitat)",
                    "Utility (Filter Strips/Field Borders)",
                    "N/A: No Grassland",
                    "Other",
                  ].map((opt) => (
                    <CheckboxCard
                      key={opt}
                      label={opt}
                      checked={data.Grassland_Utility.includes(opt)}
                      onChange={() => toggleArrayItem("Grassland_Utility", opt)}
                    />
                  ))}
                </div>
                {renderOtherInput("Grassland_Utility")}

                {data.Grassland_Utility.length > 0 &&
                  !data.Grassland_Utility.includes("N/A: No Grassland") && (
                    <div className="mt-6 animate-in slide-in-from-top-4">
                      <SectionTitle>Grassland Health</SectionTitle>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                          "High Quality (Diverse/Maintained)",
                          "Needs Attention (Brush/Weeds)",
                          "Restoration Goal (Improving Forage)",
                        ].map((opt) => (
                          <button
                            key={opt}
                            onClick={() =>
                              toggleArrayItem("Grassland_Health", opt)
                            }
                            className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                              data.Grassland_Health.includes(opt)
                                ? "bg-[#1B2E20] text-white border-[#1B2E20]"
                                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              <div className="p-6 bg-white border border-gray-200 rounded-3xl shadow-sm">
                <SectionTitle>Timber Strategy</SectionTitle>
                <p className="text-xs text-gray-400 mb-4 -mt-3">
                  Current management status of your trees?
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    "Active Management (FMP/Harvests)",
                    "Passive Use (Windbreak/Buffer)",
                    "Silvopasture (Grazing Wooded Areas)",
                    "Clearing/Conversion Goal",
                    "N/A: No Timber",
                  ].map((opt) => (
                    <CheckboxCard
                      key={opt}
                      label={opt}
                      checked={data.Timber_Strategy.includes(opt)}
                      onChange={() => toggleArrayItem("Timber_Strategy", opt)}
                    />
                  ))}
                </div>

                {data.Timber_Strategy.length > 0 &&
                  !data.Timber_Strategy.includes("N/A: No Timber") && (
                    <div className="mt-6 animate-in slide-in-from-top-4">
                      <SectionTitle>
                        Management Challenges (Select All)
                      </SectionTitle>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          "Invasive Pressure",
                          "Significant Deadfall/Disease",
                          "Lack of Access",
                          "None / Managed as-is",
                        ].map((opt) => (
                          <CheckboxCard
                            key={opt}
                            label={opt}
                            checked={data.Management_Challenges.includes(opt)}
                            onChange={() =>
                              toggleArrayItem("Management_Challenges", opt)
                            }
                          />
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      );

    // Nutrient cycle phase
    if (phase === Phase.NutrientCycle)
      return (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div>
            <SectionTitle>Fertility & Nitrogen Source</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Nitrogen_Sources.map((opt) => (
                <CheckboxCard
                  key={opt}
                  label={opt}
                  checked={data.Fertility_Nitrogen_Source.includes(opt)}
                  onChange={() =>
                    toggleArrayItem("Fertility_Nitrogen_Source", opt)
                  }
                />
              ))}
            </div>
            {renderOtherInput("Fertility_Nitrogen_Source")}
          </div>

          {data.Fertility_Nitrogen_Source.length > 0 && (
            <div className="space-y-10 mt-12 border-t border-gray-100 pt-10">
              {data.Fertility_Nitrogen_Source.map((source) => {
                const detail = data.Nutrient_Details[source] || {
                  Split_Fall: "0",
                  Split_Spring: "0",
                  Split_Season: "0",
                  Methods: [],
                };
                const displayName =
                  source === "Other"
                    ? otherValues["Fertility_Nitrogen_Source"] || "Other Source"
                    : source;

                return (
                  <div
                    key={source}
                    className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm transition-all hover:shadow-md animate-in slide-in-from-right-4 duration-500"
                  >
                    <div className="flex items-center gap-3 mb-8 border-b border-gray-50 pb-4">
                      <div className="w-8 h-8 rounded-full bg-[#1B2E20] text-white flex items-center justify-center text-xs font-bold">
                        {source.charAt(0)}
                      </div>
                      <h4 className="text-xl font-bold text-gray-800">
                        {displayName} Details
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                          Fall %
                        </label>
                        <input
                          type="number"
                          value={detail.Split_Fall}
                          onChange={(e) =>
                            updateNutrientDetail(source, {
                              Split_Fall: e.target.value,
                            } as any)
                          }
                          className="w-full p-4 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-[#1B2E20] outline-none transition-all font-mono shadow-inner border-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                          Spring %
                        </label>
                        <input
                          type="number"
                          value={detail.Split_Spring}
                          onChange={(e) =>
                            updateNutrientDetail(source, {
                              Split_Spring: e.target.value,
                            } as any)
                          }
                          className="w-full p-4 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-[#1B2E20] outline-none transition-all font-mono shadow-inner border-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                          In-Season %
                        </label>
                        <input
                          type="number"
                          value={detail.Split_Season}
                          onChange={(e) =>
                            updateNutrientDetail(source, {
                              Split_Season: e.target.value,
                            } as any)
                          }
                          className="w-full p-4 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-[#1B2E20] outline-none transition-all font-mono shadow-inner border-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Application Method
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Application_Methods.map((method) => (
                          <CheckboxCard
                            key={method}
                            label={method}
                            checked={detail.Methods.includes(method)}
                            onChange={() =>
                              toggleNutrientMethod(source, method)
                            }
                          />
                        ))}
                      </div>
                      {detail.Methods.includes("Other") && (
                        <div className="mt-4">
                          <input
                            type="text"
                            value={
                              otherValues[`nitrogenMethod_${source}`] || ""
                            }
                            onChange={(e) =>
                              updateOtherText(
                                `nitrogenMethod_${source}`,
                                e.target.value,
                              )
                            }
                            placeholder="Please specify..."
                            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2E20]/20 focus:border-[#1B2E20] transition-all"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-12 pt-10 border-t border-gray-100 space-y-8">
            <div>
              <PillSelect
                label="Input Technology"
                options={[
                  "Nitrification Inhibitor",
                  "Urease Inhibitor",
                  "Variable Rate (VRT)",
                  "Biologicals",
                  "Other",
                ]}
                selected={data.Input_Technology}
                onChange={(tech) => handlePillChange("Input_Technology", tech)}
                otherValue={otherValues.Input_Technology}
                onOtherChange={(v) => updateOtherText("Input_Technology", v)}
              />

              {data.Input_Technology.filter((t) => Tech_Explanation_Options[t])
                .length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-4 duration-500">
                  {data.Input_Technology.map((tech) => {
                    const options = Tech_Explanation_Options[tech];
                    if (!options) return null;

                    return (
                      <div
                        key={tech}
                        className="p-4 bg-gray-50 border border-gray-200 rounded-2xl"
                      >
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <AlertCircle className="w-3 h-3" /> Explain {tech}
                        </label>
                        <select
                          value={data.Input_Tech_Explanations[tech] || ""}
                          onChange={(e) =>
                            updateTechExplanation(tech, e.target.value)
                          }
                          className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1B2E20] outline-none transition-all shadow-sm"
                        >
                          <option value="" disabled>
                            Select usage strategy...
                          </option>
                          {options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        {data.Input_Tech_Explanations[tech] === "Other" && (
                          <input
                            type="text"
                            placeholder="Describe usage..."
                            className="mt-2 w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2E20]/20 focus:border-[#1B2E20] transition-all"
                            onChange={(e) =>
                              updateTechExplanation(
                                tech,
                                `Other: ${e.target.value}`,
                              )
                            }
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <TextArea
              label="General Input & Pass Notes"
              placeholder="Detail your typical field pass and overall fertility strategy..."
              value={data.General_Input_Pass_Notes}
              onChange={(v) =>
                updateData({ General_Input_Pass_Notes: v } as any)
              }
            />
          </div>
        </div>
      );

    // Specialized phase
    if (phase === Phase.Specialized)
      return (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div>
            <SectionTitle>Livestock Integration</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "None",
                "Integrated (Grazing Crops)",
                "Separate (Pasture/Feedlot)",
                "Other",
              ].map((opt) => (
                <CheckboxCard
                  key={opt}
                  label={opt}
                  checked={data.Livestock_Integration.includes(opt)}
                  onChange={() => toggleArrayItem("Livestock_Integration", opt)}
                />
              ))}
            </div>
            {renderOtherInput("Livestock_Integration")}

            {data.Livestock_Integration.length > 0 &&
              !data.Livestock_Integration.includes("None") && (
                <div className="mt-4 p-6 bg-gray-50 rounded-3xl border border-gray-200 shadow-sm space-y-6 animate-in slide-in-from-top-4 duration-500">
                  <SectionTitle>Operation Type</SectionTitle>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      "Cow-Calf",
                      "Stocker",
                      "Finisher",
                      "Dairy",
                      "Swine",
                      "Poultry",
                      "Other",
                    ].map((opt) => (
                      <CheckboxCard
                        key={opt}
                        label={opt}
                        checked={data.Operation_Type.includes(opt)}
                        onChange={() => toggleArrayItem("Operation_Type", opt)}
                      />
                    ))}
                  </div>
                  {renderOtherInput("Operation_Type")}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                        Herd Size
                      </label>
                      <input
                        type="number"
                        value={data.Herd_Size}
                        onChange={(e) =>
                          updateData({ Herd_Size: e.target.value } as any)
                        }
                        className="w-full p-4 bg-gray-800 text-white rounded-xl outline-none shadow-inner border-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                        Mature Weight (avg)
                      </label>
                      <input
                        type="number"
                        value={data.Mature_Weight}
                        onChange={(e) =>
                          updateData({ Mature_Weight: e.target.value } as any)
                        }
                        className="w-full p-4 bg-gray-800 text-white rounded-xl outline-none shadow-inner border-none"
                      />
                    </div>
                  </div>
                  <TextArea
                    label="Breeds & Genetics History"
                    value={data.Breeds}
                    onChange={(v) => updateData({ Breeds: v } as any)}
                  />
                </div>
              )}
          </div>

          <div className="pt-10 border-t border-gray-100">
            <SectionTitle>Marketing & Grain Sales Strategy</SectionTitle>
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  Where do you market/sell your crops?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Marketing_Channels.map((opt) => (
                    <CheckboxCard
                      key={opt}
                      label={opt}
                      checked={data.Market_Sell_Locations.includes(opt)}
                      onChange={() =>
                        toggleArrayItem("Market_Sell_Locations", opt)
                      }
                    />
                  ))}
                </div>
                {renderOtherInput("Market_Sell_Locations")}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  How do you sell? (Sales Methods)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Sales_Methods.map((opt) => (
                    <CheckboxCard
                      key={opt}
                      label={opt}
                      checked={data.Sales_Methods.includes(opt)}
                      onChange={() => toggleArrayItem("Sales_Methods", opt)}
                    />
                  ))}
                </div>
                {renderOtherInput("Sales_Methods")}
              </div>

              <div className="p-6 bg-[#E6F4EA]/50 rounded-3xl border border-[#1B2E20]/10">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-semibold text-[#1B2E20]">
                    Do you use an external Grain Marketer/Advisor?
                  </label>
                  <div className="flex gap-2">
                    {["Yes", "No"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() =>
                          updateData({ Uses_Grain_Marketer: opt } as any)
                        }
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${data.Uses_Grain_Marketer === opt ? "bg-[#1B2E20] text-white" : "bg-white text-gray-400 border border-gray-200"}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                {data.Uses_Grain_Marketer === "Yes" && (
                  <input
                    type="text"
                    placeholder="Name of marketing group or advisor..."
                    className="w-full p-4 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1B2E20] transition-all text-sm"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    On-Farm Storage (Total Bushels)
                  </label>
                  <input
                    type="number"
                    value={data.On_Farm_Storage}
                    onChange={(e) =>
                      updateData({ On_Farm_Storage: e.target.value } as any)
                    }
                    className="w-full p-4 bg-gray-800 text-white rounded-xl outline-none shadow-inner border-none"
                  />
                </div>

                <TextArea
                  label="Marketing Strategy Narrative"
                  placeholder="Describe how and where you move your grain, including any logistical challenges or storage advantages..."
                  value={data.Marketing_Strategy_Narrative}
                  onChange={(v) =>
                    updateData({ Marketing_Strategy_Narrative: v } as any)
                  }
                />
              </div>
            </div>
          </div>
        </div>
      );

    // Strategy phase
    if (phase === Phase.Strategy)
      return (
        <div className="space-y-6">
          <SectionTitle>Program Commitments</SectionTitle>
          <PillSelect
            label="Existing Programs"
            options={[
              "EQIP",
              "CSP",
              "CRP",
              "State-Level",
              "Carbon",
              "None",
              "Other",
            ]}
            selected={data.Existing_Programs}
            onChange={(p) => handlePillChange("Existing_Programs", p)}
            otherValue={otherValues.Existing_Programs}
            onOtherChange={(v) => updateOtherText("Existing_Programs", v)}
          />

          <div className="pt-10 border-t border-gray-100">
            <SectionTitle>Recreational Interaction</SectionTitle>
            <p className="text-xs text-gray-400 mb-4 -mt-3">
              What activities occur on your property today? (Select all that
              apply)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "Personal Use (Hunting/Fishing/ATV family only)",
                "Neighbor Access (Free with permission)",
                "Commercial Lease (Annual Income)",
                "Public Access (State-managed program)",
                "N/A: No recreational use",
              ].map((opt) => (
                <CheckboxCard
                  key={opt}
                  label={opt}
                  checked={data.Recreational_Activities.includes(opt)}
                  onChange={() =>
                    toggleArrayItem("Recreational_Activities", opt)
                  }
                />
              ))}
            </div>
          </div>

          <SectionTitle>Human Alignment</SectionTitle>
          <PillSelect
            label="Top Priorities"
            options={[
              "ROI",
              "Soil Health",
              "Legacy",
              "Reduced Labor",
              "Stability",
              "Other",
            ]}
            selected={data.Top_Priorities}
            onChange={(p) => handlePillChange("Top_Priorities", p)}
            otherValue={otherValues.Top_Priorities}
            onOtherChange={(v) => updateOtherText("Top_Priorities", v)}
          />
          <SectionTitle>Succession Plan Status</SectionTitle>
          {["Plan in place", "Discussing", "Not yet"].map((opt) => (
            <CheckboxCard
              key={opt}
              label={opt}
              checked={data.Succession_Plan.includes(opt)}
              onChange={() => toggleArrayItem("Succession_Plan", opt)}
            />
          ))}
          <TextArea
            label="The Five-Year Vision"
            placeholder="Paint the picture of the farm in 5 years..."
            value={data.Five_Year_Vision}
            onChange={(v) => updateData({ Five_Year_Vision: v } as any)}
          />
        </div>
      );

    // AI Review phase
    if (phase === Phase.AIReview)
      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Loader2 className="w-12 h-12 text-[#1B2E20] animate-spin mb-4" />
              <h3 className="text-xl font-bold text-gray-800">
                Synthesizing Operational Story...
              </h3>
              <p className="text-gray-500 max-w-xs mt-2">
                Terra is processing your intake data into a comprehensive
                operational narrative.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-[#E6F4EA] rounded-2xl border border-[#1B2E20]/10">
                <Sparkles className="w-6 h-6 text-[#1B2E20]" />
                <p className="text-sm font-semibold text-[#1B2E20]">
                  This narrative was synthesized from your responses for final
                  verification.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-[2rem] p-8 md:p-12 shadow-sm relative">
                <FileText className="absolute top-8 right-8 w-12 h-12 text-gray-50 opacity-10" />
                <div className="prose prose-stone max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-lg font-medium">
                    {aiNarrative}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 italic text-gray-500 text-sm text-center">
                "By accepting this review, you confirm that the synthesis
                accurately reflects your operational history and management
                philosophy."
              </div>
            </div>
          )}
        </div>
      );

    // Fallback placeholder
    return (
      <div className="py-12 text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {getPhaseTitle()}
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">{getPhaseSubtitle()}</p>
      </div>
    );
  };

  const getPhaseTitle = () => {
    switch (phase) {
      case Phase.Landing:
        return "Operational Framework";
      case Phase.Land:
        return "Review/Add Land";
      case Phase.Foundation:
        return "Operational Foundation";
      case Phase.SoilWater:
        return "Soil, Water & Land Assets";
      case Phase.NutrientCycle:
        return "Nutrient & Input Cycle";
      case Phase.Specialized:
        return "Specialized Modules";
      case Phase.Strategy:
        return "Strategy & Human Alignment";
      case Phase.AIReview:
        return "Review Synthesis";
      case Phase.Success:
        return "Submission Successful";
      default:
        return "";
    }
  };

  const getPhaseSubtitle = () => {
    switch (phase) {
      case Phase.Landing:
        return "Documentation & Prototype Entry Point";
      case Phase.Land:
        return "Manage detailed land boundaries and ownership records.";
      case Phase.Foundation:
        return "The core crops and rotational strategy of the farm.";
      case Phase.SoilWater:
        return "Conservation core and natural resource stewardship tracking.";
      case Phase.NutrientCycle:
        return "Detailed tracking of nitrogen source, timing, and application.";
      case Phase.Specialized:
        return "Livestock and detailed marketing/sales strategy.";
      case Phase.Strategy:
        return "Commitments, risks, recreation, and the long-term vision.";
      case Phase.AIReview:
        return "Final verification of your synthesized operational narrative.";
      case Phase.Success:
        return "Thank you for completing the operational intake.";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        {renderProgress()}

        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-white">
          <div className="p-8 md:p-12">
            <header
              className={`mb-10 ${phase === Phase.Landing ? "hidden" : "block"}`}
            >
              <h1 className="text-4xl serif text-[#1B2E20] mb-3">
                {getPhaseTitle()}
              </h1>
              <p className="text-gray-500 text-lg leading-relaxed">
                {getPhaseSubtitle()}
              </p>
            </header>

            <main
              className={`${phase === Phase.Landing ? "" : "min-h-[400px]"}`}
            >
              {renderPhase()}
            </main>

            <footer
              className={`mt-12 flex items-center justify-between border-t border-gray-100 pt-8 ${phase === Phase.Landing || phase === Phase.Success ? "hidden" : "block"}`}
            >
              {phase === Phase.Land ? (
                <div />
              ) : (
                <button
                  disabled={isGenerating}
                  onClick={prevPhase}
                  className="flex items-center gap-2 text-gray-500 font-semibold hover:text-[#1B2E20] transition-colors disabled:opacity-30"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back
                </button>
              )}

              {phase === Phase.Strategy ? (
                <button
                  onClick={handleAIReview}
                  className="bg-[#1B2E20] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 hover:bg-[#152419] shadow-xl hover:shadow-[#1B2E20]/20 transition-all active:scale-95"
                >
                  Generate Operational Review
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : phase === Phase.AIReview ? (
                <button
                  disabled={isGenerating}
                  onClick={handleFinish}
                  className="bg-[#1B2E20] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 hover:bg-[#152419] shadow-xl hover:shadow-[#1B2E20]/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isGenerating ? "Processing..." : "Accept and Submit Brief"}
                  {!isGenerating && <CheckCircle2 className="w-5 h-5" />}
                </button>
              ) : (
                <button
                  onClick={nextPhase}
                  className="bg-[#1B2E20] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 hover:bg-[#152419] shadow-xl hover:shadow-[#1B2E20]/20 transition-all active:scale-95 ml-auto"
                >
                  Save and Continue
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </footer>
          </div>
        </div>

        <p className="text-center text-gray-400 text-xs mt-8 uppercase tracking-[0.2em] font-medium">
          {phase === Phase.Landing
            ? "Technical Documentation Mode"
            : "Expert Operational Intake Portal"}
        </p>
      </div>
    </div>
  );
};

export default App;
