import React from "react";
import { Check, CheckCircle2 } from "lucide-react";

interface CheckboxItemProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

export const CheckboxCard: React.FC<CheckboxItemProps> = ({
  label,
  checked,
  onChange,
}) => (
  <button
    onClick={onChange}
    className={`flex items-center gap-4 w-full p-4 border rounded-lg transition-all text-left mb-2 ${
      checked
        ? "border-[#1B2E20] bg-[#E6F4EA] ring-1 ring-[#1B2E20]"
        : "border-gray-200 bg-white hover:border-gray-300"
    }`}
  >
    <div
      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
        checked ? "border-[#1B2E20] bg-[#1B2E20]" : "border-gray-300"
      }`}
    >
      {checked && <Check className="w-4 h-4 text-white" />}
    </div>
    <span className="text-gray-700 font-medium">{label}</span>
  </button>
);

export const SectionTitle: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 mt-8 first:mt-0">
    {children}
  </h3>
);

export const TextInput: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
}> = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div className="mb-4">
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2E20]/20 focus:border-[#1B2E20] transition-all"
    />
  </div>
);

export const TextArea: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}> = ({ label, value, onChange, placeholder }) => (
  <div className="mb-4">
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label}
    </label>
    <textarea
      rows={4}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2E20]/20 focus:border-[#1B2E20] transition-all"
    />
  </div>
);

export const PillSelect: React.FC<{
  label: string;
  options: string[];
  selected: string[];
  onChange: (options: string[]) => void;
  otherValue?: string;
  onOtherChange?: (val: string) => void;
}> = ({ label, options, selected, onChange, otherValue, onOtherChange }) => {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex flex-wrap gap-2 mb-3">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
              selected.includes(opt)
                ? "bg-[#1B2E20] text-white border-[#1B2E20]"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {selected.includes("Other") && onOtherChange && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <input
            type="text"
            value={otherValue}
            onChange={(e) => onOtherChange(e.target.value)}
            placeholder="Please specify..."
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2E20]/20 focus:border-[#1B2E20] transition-all"
          />
        </div>
      )}
    </div>
  );
};
