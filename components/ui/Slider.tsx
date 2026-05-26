import { InputHTMLAttributes } from "react";

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  value: number;
  displayValue?: string;
}

export function Slider({
  label,
  value,
  displayValue,
  className = "",
  ...props
}: SliderProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs text-text-secondary">{label}</label>
        <span className="text-xs font-mono text-text-muted">
          {displayValue ?? value}
        </span>
      </div>
      <input type="range" value={value} className="w-full" {...props} />
    </div>
  );
}
