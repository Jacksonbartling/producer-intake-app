import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Tractor, ClipboardList, Send, MapPin, Layers, Store, BookOpen, Info, Zap, Loader2, FileText, Sparkles, AlertCircle, Waves, Trees, Tent } from 'lucide-react';
import { Phase, FormData, NutrientDetail } from './types';
import { 
  CheckboxCard, 
  SectionTitle, 
  TextInput, 
  TextArea, 
  PillSelect 
} from './components/FormElements';
import { generateOperationalNarrative } from './services/geminiService';

const INITIAL_DATA: FormData = {
  primaryCrops: [],
  rotationStory: [],
  historyChanged: '',
  tillageApproach: [],
  tillageDepth: [],
  tillageHistory: '',
  tillageReasoning: '',
  coverCropRelationship: [],
  coverCropMix: [],
  coverCropExperience: '',
  irrigationSetup: [],
  iwmStrategy: [],
  waterPainPoints: '',
  grasslandUse: [],
  grasslandHealth: [],
  timberStatus: [],
  timberHeadaches: [],
  waterManagementStrategy: [],
  nitrogenSource: [],
  nutrientDetails: {},
  inputTech: [],
  inputTechExplanations: {},
  manureSource: [],
  protectionPasses: [],
  inputNotes: '',
  livestockIntegration: [],
  livestockOperation: [],
  herdSize: '',
  matureWeight: '',
  breeds: '',
  geneticsSource: '',
  grazingMethod: [],
  livestockVision: '',
  primaryMarket: [],
  marketingMethods: [],
  usesGrainMarketer: 'No',
  onFarmStorage: '',
  marketingStrategy: '',
  existingPrograms: [],
  priorities: [],
  fears: [],
  successionPlan: [],
  fiveYearVision: '',
  hurdles: '',
  recreationalActivities: []
};

const NITROGEN_SOURCES = ["Anhydrous", "Urea", "UAN", "MAP/DAP", "AMS/ATS", "Other"];
const APPLICATION_METHODS = ["Injected/Knife", "Broadcast", "Foliar", "Planter Applied", "Other"];
const MARKETING_CHANNELS = ["Ethanol Plant", "Feedlot", "Local Elevator", "Terminal/River", "Specialty/Direct", "Other"];
const SALES_METHODS = ["Spot Market", "Forward Contract", "HTA (Hedge-to-Arrive)", "Basis Contract", "Minimum Price", "Hedging/Futures", "Other"];

const TECH_EXPLANATION_OPTIONS: Record<string, string[]> = {
  "Nitrification Inhibitor": ["Protect Fall Applied N", "Protect Spring Pre-Plant N", "Manure Management", "Maximize Availability", "Other"],
  "Urease Inhibitor": ["Protect Surface Applied Urea", "Protect Surface UAN", "Protect Volatilization", "Other"],
  "Variable Rate (VRT)": ["Grid Sample Based", "Zone/Soil Type Based", "Yield Map History", "Sensor/Drone Based", "Other"],
  "Biologicals": ["Soil Stimulant/Carbon Source", "N-Fixing Microbes", "P-Solubilizing Agents", "Other"]
};

const App: React.FC = () => {
  const [phase, setPhase] = useState<Phase>(Phase.Landing);
  const [data, setData] = useState<FormData>(INITIAL_DATA);
  const [otherValues, setOtherValues] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiNarrative, setAiNarrative] = useState<string>('');

  const updateData = (updates: Partial<FormData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const toggleArrayItem = (field: keyof FormData, value: string) => {
    const current = data[field] as string[];
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    updateData({ [field]: updated });
  };

  const setSingleChoice = (field: keyof FormData, value: string) => {
    updateData({ [field]: [value] });
  };

  const updateOtherText = (field: string, text: string) => {
    setOtherValues(prev => ({ ...prev, [field]: text }));
  };

  const updateNutrientDetail = (source: string, updates: Partial<NutrientDetail>) => {
    const current = data.nutrientDetails[source] || { splitFall: '0', splitSpring: '0', splitSeason: '0', methods: [] };
    updateData({
      nutrientDetails: {
        ...data.nutrientDetails,
        [source]: { ...current, ...updates }
      }
    });
  };

  const toggleNutrientMethod = (source: string, method: string) => {
    const detail = data.nutrientDetails[source] || { splitFall: '0', splitSpring: '0', splitSeason: '0', methods: [] };
    const methods = detail.methods.includes(method)
      ? detail.methods.filter(m => m !== method)
      : [...detail.methods, method];
    updateNutrientDetail(source, { methods });
  };

  const updateTechExplanation = (tech: string, val: string) => {
    updateData({
      inputTechExplanations: {
        ...data.inputTechExplanations,
        [tech]: val
      }
    });
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
    const narrative = await generateOperationalNarrative({ ...data, _writeIns: otherValues } as any);
    setAiNarrative(narrative);
    setIsGenerating(false);
  };

  const handleFinish = () => {
    setPhase(Phase.Success);
    console.log("Intake Form Data & AI Narrative Captured:", { 
      ...data, 
      _writeIns: otherValues,
      aiNarrative 
    });
  };

  const renderOtherInput = (field: string) => {
    const isSelected = (data[field as keyof FormData] as string[]).includes('Other');
    if (!isSelected) return null;

    return (
      <div className="mt-2 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
        <input
          type="text"
          value={otherValues[field] || ''}
          onChange={(e) => updateOtherText(field, e.target.value)}
          placeholder="Please specify Other..."
          className="w-full p-3 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-[#1B2E20] outline-none text-sm transition-all placeholder-gray-400 border-none shadow-inner"
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
      <Sparkles className="w-5 h-5" />
    ];

    return (
      <div className="flex items-center justify-center gap-3 mb-12 animate-in fade-in duration-700">
        {icons.map((icon, i) => {
          const iconIdx = i + 1;
          return (
            <React.Fragment key={i}>
              <div 
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  phase >= iconIdx ? 'bg-[#1B2E20] text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-200'
                }`}
              >
                {icon}
              </div>
              {i < icons.length - 1 && (
                <div className={`h-[2px] w-8 transition-colors ${phase > iconIdx ? 'bg-[#1B2E20]' : 'bg-gray-200'}`} />
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
          <h1 className="text-5xl serif mb-6 leading-tight">Operational Intake Framework</h1>
          <p className="text-lg text-green-100/80 mb-8 leading-relaxed">
            This intake captures the "Story" of a farm through a fluid conversation, enabling planners to unlock high-value conservation and carbon intensity opportunities.
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
                <h4 className="font-bold text-gray-800">Operational Foundation</h4>
                <p className="text-sm text-gray-500">Primary Crops (Multi), Rotation Story (Multi), Land History (Bool + Narrative)</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Layers className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800">Natural Asset Stewardship</h4>
                <p className="text-sm text-gray-500">Tillage, Cover Crops, Grassland Health, Timber Strategy, and Water Utility.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800">Nutrient Intelligence</h4>
                <p className="text-sm text-gray-500">Per-Source Timing (Split Fall/Spring/Season %), Application Methods (Multi), Input Tech (Pills)</p>
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
                <p className="text-sm text-gray-500">Market Channels (Multi), Grain Marketers (Dependent Text), Sales Strategy (Narrative)</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <Tent className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800">Human Alignment</h4>
                <p className="text-sm text-gray-500">Priorities, Succession (Status), Recreational Use (Multi), and 5-Year Vision.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-[#1B2E20]" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800">AI Operational Review</h4>
                <p className="text-sm text-gray-500">Final step synthesizes all raw data into a cohesive professional narrative for producer acceptance.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderPhase = () => {
    switch (phase) {
      case Phase.Landing:
        return renderLandingPage();
        
      case Phase.Land:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <div className="bg-white p-4 rounded-full shadow-sm mb-6">
              <MapPin className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Review/Add Land</h3>
            <p className="text-gray-500 max-w-sm">
              Detailed geospatial land boundaries and ownership records will be managed in this upcoming module.
            </p>
          </div>
        );

      case Phase.Foundation:
        return (
          <div className="space-y-6">
            <PillSelect 
              label="Primary Crops"
              options={["Corn", "Soybeans", "Wheat", "Cotton", "Alfalfa", "Sorghum/Milo", "Rice", "Corn Silage", "Other"]}
              selected={data.primaryCrops}
              onChange={(crops) => updateData({ primaryCrops: crops })}
              otherValue={otherValues.primaryCrops}
              onOtherChange={(v) => updateOtherText('primaryCrops', v)}
            />
            <SectionTitle>Rotation Story (Select Multiple)</SectionTitle>
            {["Continuous (Same crop every year)", "Standard (e.g., Corn/Soy)", "Complex (3+ crops in rotation)", "Other"].map(opt => (
              <CheckboxCard 
                key={opt}
                label={opt}
                checked={data.rotationStory.includes(opt)}
                onChange={() => toggleArrayItem('rotationStory', opt)}
              />
            ))}
            {renderOtherInput('rotationStory')}
          </div>
        );

      case Phase.SoilWater:
        return (
          <div className="space-y-12">
            <div>
              <SectionTitle>Tillage Strategy (Select Multiple)</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                {["No-Till", "Strip-Till", "Vertical Till", "Field Cultivator", "Disc/Ripper", "Hipper/Bedder", "Moldboard Plow", "Other"].map(opt => (
                  <CheckboxCard 
                    key={opt}
                    label={opt}
                    checked={data.tillageApproach.includes(opt)}
                    onChange={() => toggleArrayItem('tillageApproach', opt)}
                  />
                ))}
              </div>
              {renderOtherInput('tillageApproach')}

              <SectionTitle>Tillage Depth</SectionTitle>
              <div className="flex flex-wrap gap-2">
                 {["0–2\"", "3–4\"", "5–6\"", "7–10\"", "11\"+"].map(opt => (
                   <button
                     key={opt}
                     onClick={() => toggleArrayItem('tillageDepth', opt)}
                     className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                       data.tillageDepth.includes(opt)
                         ? 'bg-[#1B2E20] text-white border-[#1B2E20]' 
                         : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                     }`}
                   >
                     {opt}
                   </button>
                 ))}
              </div>
            </div>

            <div className="pt-10 border-t border-gray-100">
              <SectionTitle>Cover Crops Relationship</SectionTitle>
              {["Never Used", "New Adopter (1-3 yrs)", "Some Acres", "Long-Term (Pre-2020)", "Past User", "Other"].map(opt => (
                <CheckboxCard 
                  key={opt}
                  label={opt}
                  checked={data.coverCropRelationship.includes(opt)}
                  onChange={() => toggleArrayItem('coverCropRelationship', opt)}
                />
              ))}
              {renderOtherInput('coverCropRelationship')}

              <TextArea 
                label="Cover Crop Experience" 
                placeholder="What's worked and what hasn't?"
                value={data.coverCropExperience}
                onChange={(val) => updateData({ coverCropExperience: val })}
              />
            </div>

            <div className="pt-10 border-t border-gray-100 bg-gray-50 -mx-8 md:-mx-12 p-8 md:p-12">
              <div className="flex items-center gap-3 mb-8">
                <Waves className="w-6 h-6 text-[#1B2E20]" />
                <h2 className="text-2xl font-bold text-gray-800">Water Infrastructure</h2>
              </div>
              
              <SectionTitle>Water Usage & Management (Select All)</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {[
                  "Sub-surface Drainage (Pattern/Targeted Tile)",
                  "Irrigation (Surface or Well)",
                  "Livestock Delivery (Ponds/Streams/Hydrants)",
                  "Erosion/Bank Stability Issues",
                  "Storage/Flood Control (Wetlands/Structures)"
                ].map(opt => (
                  <CheckboxCard 
                    key={opt}
                    label={opt}
                    checked={data.waterManagementStrategy.includes(opt)}
                    onChange={() => toggleArrayItem('waterManagementStrategy', opt)}
                  />
                ))}
              </div>

              <TextArea 
                label="Water Pain Points" 
                placeholder="Any issues with availability, drainage efficiency, or compliance?"
                value={data.waterPainPoints}
                onChange={v => updateData({ waterPainPoints: v })}
              />
            </div>

            <div className="pt-10 border-t border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <Trees className="w-6 h-6 text-[#1B2E20]" />
                <h2 className="text-2xl font-bold text-gray-800">Natural Land Assets</h2>
              </div>

              <div className="space-y-10">
                <div className="p-6 bg-white border border-gray-200 rounded-3xl shadow-sm">
                  <SectionTitle>Grassland Utility</SectionTitle>
                  <p className="text-xs text-gray-400 mb-4 -mt-3">How do you currently utilize your grassland?</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {["Production (Active Grazing/Haying)", "Conservation (Idle/CRP/Habitat)", "Utility (Filter Strips/Field Borders)", "N/A: No Grassland", "Other"].map(opt => (
                      <CheckboxCard 
                        key={opt}
                        label={opt}
                        checked={data.grasslandUse.includes(opt)}
                        onChange={() => setSingleChoice('grasslandUse', opt)}
                      />
                    ))}
                  </div>
                  {renderOtherInput('grasslandUse')}
                  
                  {data.grasslandUse.length > 0 && !data.grasslandUse.includes('N/A: No Grassland') && (
                    <div className="mt-6 animate-in slide-in-from-top-4">
                      <SectionTitle>Grassland Health</SectionTitle>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {["High Quality (Diverse/Maintained)", "Needs Attention (Brush/Weeds)", "Restoration Goal (Improving Forage)"].map(opt => (
                          <button
                            key={opt}
                            onClick={() => setSingleChoice('grasslandHealth', opt)}
                            className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                              data.grasslandHealth.includes(opt)
                                ? 'bg-[#1B2E20] text-white border-[#1B2E20]'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
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
                  <p className="text-xs text-gray-400 mb-4 -mt-3">Current management status of your trees?</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {["Active Management (FMP/Harvests)", "Passive Use (Windbreak/Buffer)", "Silvopasture (Grazing Wooded Areas)", "Clearing/Conversion Goal", "N/A: No Timber"].map(opt => (
                      <CheckboxCard 
                        key={opt}
                        label={opt}
                        checked={data.timberStatus.includes(opt)}
                        onChange={() => setSingleChoice('timberStatus', opt)}
                      />
                    ))}
                  </div>

                  {data.timberStatus.length > 0 && !data.timberStatus.includes('N/A: No Timber') && (
                    <div className="mt-6 animate-in slide-in-from-top-4">
                      <SectionTitle>Management Headaches (Select All)</SectionTitle>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {["Invasive Pressure", "Significant Deadfall/Disease", "Lack of Access", "None / Managed as-is"].map(opt => (
                          <CheckboxCard 
                            key={opt}
                            label={opt}
                            checked={data.timberHeadaches.includes(opt)}
                            onChange={() => toggleArrayItem('timberHeadaches', opt)}
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

      case Phase.NutrientCycle:
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div>
              <SectionTitle>Fertility & Nitrogen Source</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {NITROGEN_SOURCES.map(opt => (
                  <CheckboxCard 
                    key={opt}
                    label={opt}
                    checked={data.nitrogenSource.includes(opt)}
                    onChange={() => toggleArrayItem('nitrogenSource', opt)}
                  />
                ))}
              </div>
              {renderOtherInput('nitrogenSource')}
            </div>

            {data.nitrogenSource.length > 0 && (
              <div className="space-y-10 mt-12 border-t border-gray-100 pt-10">
                {data.nitrogenSource.map((source) => {
                  const detail = data.nutrientDetails[source] || { splitFall: '0', splitSpring: '0', splitSeason: '0', methods: [] };
                  const displayName = source === 'Other' ? (otherValues['nitrogenSource'] || 'Other Source') : source;

                  return (
                    <div key={source} className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm transition-all hover:shadow-md animate-in slide-in-from-right-4 duration-500">
                      <div className="flex items-center gap-3 mb-8 border-b border-gray-50 pb-4">
                        <div className="w-8 h-8 rounded-full bg-[#1B2E20] text-white flex items-center justify-center text-xs font-bold">
                          {source.charAt(0)}
                        </div>
                        <h4 className="text-xl font-bold text-gray-800">{displayName} Details</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Fall %</label>
                          <input 
                            type="number"
                            value={detail.splitFall}
                            onChange={(e) => updateNutrientDetail(source, { splitFall: e.target.value })}
                            className="w-full p-4 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-[#1B2E20] outline-none transition-all font-mono shadow-inner border-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Spring %</label>
                          <input 
                            type="number"
                            value={detail.splitSpring}
                            onChange={(e) => updateNutrientDetail(source, { splitSpring: e.target.value })}
                            className="w-full p-4 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-[#1B2E20] outline-none transition-all font-mono shadow-inner border-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">In-Season %</label>
                          <input 
                            type="number"
                            value={detail.splitSeason}
                            onChange={(e) => updateNutrientDetail(source, { splitSeason: e.target.value })}
                            className="w-full p-4 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-[#1B2E20] outline-none transition-all font-mono shadow-inner border-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Application Method</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {APPLICATION_METHODS.map(method => (
                            <CheckboxCard 
                              key={method}
                              label={method}
                              checked={detail.methods.includes(method)}
                              onChange={() => toggleNutrientMethod(source, method)}
                            />
                          ))}
                        </div>
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
                  options={["Nitrification Inhibitor", "Urease Inhibitor", "Variable Rate (VRT)", "Biologicals", "Other"]}
                  selected={data.inputTech}
                  onChange={tech => updateData({ inputTech: tech })}
                  otherValue={otherValues.inputTech}
                  onOtherChange={(v) => updateOtherText('inputTech', v)}
                />

                {data.inputTech.filter(t => TECH_EXPLANATION_OPTIONS[t]).length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    {data.inputTech.map(tech => {
                      const options = TECH_EXPLANATION_OPTIONS[tech];
                      if (!options) return null;
                      
                      return (
                        <div key={tech} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <AlertCircle className="w-3 h-3" /> Explain {tech}
                          </label>
                          <select
                            value={data.inputTechExplanations[tech] || ''}
                            onChange={(e) => updateTechExplanation(tech, e.target.value)}
                            className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1B2E20] outline-none transition-all shadow-sm"
                          >
                            <option value="" disabled>Select usage strategy...</option>
                            {options.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                          {data.inputTechExplanations[tech] === 'Other' && (
                            <input 
                              type="text"
                              placeholder="Describe usage..."
                              className="mt-2 w-full p-2 border-b border-gray-300 text-sm focus:border-[#1B2E20] outline-none bg-transparent"
                              onChange={(e) => updateTechExplanation(tech, `Other: ${e.target.value}`)}
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
                placeholder="Describe your typical pass across the field or overall fertility strategy..."
                value={data.inputNotes}
                onChange={v => updateData({ inputNotes: v })}
              />
            </div>
          </div>
        );

      case Phase.Specialized:
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div>
              <SectionTitle>Livestock Integration</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["None", "Integrated (Grazing Crops)", "Separate (Pasture/Feedlot)", "Other"].map(opt => (
                  <CheckboxCard 
                    key={opt}
                    label={opt}
                    checked={data.livestockIntegration.includes(opt)}
                    onChange={() => toggleArrayItem('livestockIntegration', opt)}
                  />
                ))}
              </div>
              {renderOtherInput('livestockIntegration')}

              {data.livestockIntegration.length > 0 && !data.livestockIntegration.includes("None") && (
                <div className="mt-4 p-6 bg-gray-50 rounded-3xl border border-gray-200 shadow-sm space-y-6 animate-in slide-in-from-top-4 duration-500">
                  <SectionTitle>Operation Type</SectionTitle>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {["Cow-Calf", "Stocker", "Finisher", "Dairy", "Swine", "Poultry", "Other"].map(opt => (
                      <CheckboxCard 
                        key={opt}
                        label={opt}
                        checked={data.livestockOperation.includes(opt)}
                        onChange={() => toggleArrayItem('livestockOperation', opt)}
                      />
                    ))}
                  </div>
                  {renderOtherInput('livestockOperation')}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Herd Size</label>
                      <input 
                        type="number"
                        value={data.herdSize}
                        onChange={(e) => updateData({ herdSize: e.target.value })}
                        className="w-full p-4 bg-gray-800 text-white rounded-xl outline-none shadow-inner border-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Mature Weight (avg)</label>
                      <input 
                        type="number"
                        value={data.matureWeight}
                        onChange={(e) => updateData({ matureWeight: e.target.value })}
                        className="w-full p-4 bg-gray-800 text-white rounded-xl outline-none shadow-inner border-none"
                      />
                    </div>
                  </div>
                  <TextArea label="Breeds & Genetics History" value={data.breeds} onChange={v => updateData({ breeds: v })} />
                </div>
              )}
            </div>

            <div className="pt-10 border-t border-gray-100">
              <SectionTitle>Marketing & Grain Sales Strategy</SectionTitle>
              
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">Where do you market/sell your crops?</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {MARKETING_CHANNELS.map(opt => (
                      <CheckboxCard 
                        key={opt}
                        label={opt}
                        checked={data.primaryMarket.includes(opt)}
                        onChange={() => toggleArrayItem('primaryMarket', opt)}
                      />
                    ))}
                  </div>
                  {renderOtherInput('primaryMarket')}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">How do you sell? (Sales Methods)</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {SALES_METHODS.map(opt => (
                      <CheckboxCard 
                        key={opt}
                        label={opt}
                        checked={data.marketingMethods.includes(opt)}
                        onChange={() => toggleArrayItem('marketingMethods', opt)}
                      />
                    ))}
                  </div>
                  {renderOtherInput('marketingMethods')}
                </div>

                <div className="p-6 bg-[#E6F4EA]/50 rounded-3xl border border-[#1B2E20]/10">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-semibold text-[#1B2E20]">Do you use an external Grain Marketer/Advisor?</label>
                    <div className="flex gap-2">
                      {["Yes", "No"].map(opt => (
                        <button
                          key={opt}
                          onClick={() => updateData({ usesGrainMarketer: opt })}
                          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                            data.usesGrainMarketer === opt 
                              ? 'bg-[#1B2E20] text-white' 
                              : 'bg-white text-gray-400 border border-gray-200'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  {data.usesGrainMarketer === 'Yes' && (
                    <input 
                      type="text"
                      placeholder="Name of marketing group or advisor..."
                      className="w-full p-4 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1B2E20] transition-all text-sm"
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">On-Farm Storage (Total Bushels)</label>
                    <input 
                      type="number"
                      value={data.onFarmStorage}
                      onChange={(e) => updateData({ onFarmStorage: e.target.value })}
                      className="w-full p-4 bg-gray-800 text-white rounded-xl outline-none shadow-inner border-none"
                    />
                  </div>
                </div>

                <TextArea 
                  label="Marketing Strategy Narrative" 
                  placeholder="Describe how and where you move your grain, including any logistical hurdles or storage advantages..."
                  value={data.marketingStrategy}
                  onChange={v => updateData({ marketingStrategy: v })}
                />
              </div>
            </div>
          </div>
        );

      case Phase.Strategy:
        return (
          <div className="space-y-6">
            <SectionTitle>Program Commitments</SectionTitle>
            <PillSelect 
              label="Existing Programs"
              options={["EQIP", "CSP", "CRP", "State-Level", "Carbon", "None", "Other"]}
              selected={data.existingPrograms}
              onChange={p => updateData({ existingPrograms: p })}
              otherValue={otherValues.existingPrograms}
              onOtherChange={(v) => updateOtherText('existingPrograms', v)}
            />
            
            <div className="pt-10 border-t border-gray-100">
              <SectionTitle>Recreational Interaction</SectionTitle>
              <p className="text-xs text-gray-400 mb-4 -mt-3">What activities occur on your property today? (Select All)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "Personal Use (Hunting/Fishing/ATV family only)",
                  "Neighbor Access (Free with permission)",
                  "Commercial Lease (Annual Income)",
                  "Public Access (State-managed program)",
                  "N/A: No recreational use"
                ].map(opt => (
                  <CheckboxCard 
                    key={opt}
                    label={opt}
                    checked={data.recreationalActivities.includes(opt)}
                    onChange={() => toggleArrayItem('recreationalActivities', opt)}
                  />
                ))}
              </div>
            </div>

            <SectionTitle>Human Alignment</SectionTitle>
            <PillSelect 
              label="Top Priorities"
              options={["ROI", "Soil Health", "Legacy", "Reduced Labor", "Stability", "Other"]}
              selected={data.priorities}
              onChange={p => updateData({ priorities: p })}
              otherValue={otherValues.priorities}
              onOtherChange={(v) => updateOtherText('priorities', v)}
            />
            <SectionTitle>Succession Plan Status</SectionTitle>
            {["Plan in place", "Discussing", "Not yet"].map(opt => (
              <CheckboxCard 
                key={opt}
                label={opt}
                checked={data.successionPlan.includes(opt)}
                onChange={() => toggleArrayItem('successionPlan', opt)}
              />
            ))}
            <TextArea 
              label="The Five-Year Vision" 
              placeholder="Paint the picture of the farm in 5 years..."
              value={data.fiveYearVision}
              onChange={v => updateData({ fiveYearVision: v })}
            />
          </div>
        );

      case Phase.AIReview:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Loader2 className="w-12 h-12 text-[#1B2E20] animate-spin mb-4" />
                <h3 className="text-xl font-bold text-gray-800">Synthesizing Operational Story...</h3>
                <p className="text-gray-500 max-w-xs mt-2">Gemini is processing your intake data into a comprehensive operational narrative.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 bg-[#E6F4EA] rounded-2xl border border-[#1B2E20]/10">
                  <Sparkles className="w-6 h-6 text-[#1B2E20]" />
                  <p className="text-sm font-semibold text-[#1B2E20]">This narrative was synthesized from your responses for final verification.</p>
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
                  "By accepting this review, you confirm that the synthesis accurately reflects your operational history and management philosophy."
                </div>
              </div>
            )}
          </div>
        );

      case Phase.Success:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
            <div className="bg-[#E6F4EA] p-6 rounded-full shadow-lg mb-8">
              <CheckCircle2 className="w-16 h-16 text-[#1B2E20]" />
            </div>
            <h2 className="text-3xl serif text-[#1B2E20] mb-4">Intake Complete</h2>
            <p className="text-gray-500 max-w-sm mb-8">
              Your operational story has been successfully captured and synthesized. Our program planners will review your verified brief.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#1B2E20] text-white px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-[#1B2E20]/20 transition-all active:scale-95"
            >
              Start New Entry
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  const getPhaseTitle = () => {
    switch (phase) {
      case Phase.Landing: return "Operational Framework";
      case Phase.Land: return "Review/Add Land";
      case Phase.Foundation: return "Operational Foundation";
      case Phase.SoilWater: return "Soil, Water & Land Assets";
      case Phase.NutrientCycle: return "Nutrient & Input Cycle";
      case Phase.Specialized: return "Specialized Modules";
      case Phase.Strategy: return "Strategy & Human Alignment";
      case Phase.AIReview: return "Review Synthesis";
      case Phase.Success: return "Submission Successful";
      default: return "";
    }
  };

  const getPhaseSubtitle = () => {
    switch (phase) {
      case Phase.Landing: return "Documentation & Prototype Entry Point";
      case Phase.Land: return "Manage detailed land boundaries and ownership records.";
      case Phase.Foundation: return "The high-level 'Who, What, and Where' of the farm.";
      case Phase.SoilWater: return "Conservation core and natural resource stewardship tracking.";
      case Phase.NutrientCycle: return "Detailed tracking of nitrogen source, timing, and application.";
      case Phase.Specialized: return "Livestock and detailed marketing/sales strategy.";
      case Phase.Strategy: return "Commitments, risks, recreation, and the long-term vision.";
      case Phase.AIReview: return "Final verification of your synthesized operational narrative.";
      case Phase.Success: return "Thank you for completing the operational intake.";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        {renderProgress()}

        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-white">
          <div className="p-8 md:p-12">
            <header className={`mb-10 ${phase === Phase.Landing ? 'hidden' : 'block'}`}>
              <h1 className="text-4xl serif text-[#1B2E20] mb-3">{getPhaseTitle()}</h1>
              <p className="text-gray-500 text-lg leading-relaxed">{getPhaseSubtitle()}</p>
            </header>

            <main className={`${phase === Phase.Landing ? '' : 'min-h-[400px]'}`}>
              {renderPhase()}
            </main>

            <footer className={`mt-12 flex items-center justify-between border-t border-gray-100 pt-8 ${phase === Phase.Landing || phase === Phase.Success ? 'hidden' : 'block'}`}>
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
                  {isGenerating ? 'Processing...' : 'Accept and Submit Brief'}
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
          {phase === Phase.Landing ? "Technical Documentation Mode" : "Expert Operational Intake Portal"}
        </p>
      </div>
    </div>
  );
};

export default App;