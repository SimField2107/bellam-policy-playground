interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="flex bg-bg-secondary rounded p-0.5 border border-border-subtle">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            flex-1 px-2 py-1 text-xs font-medium rounded transition-colors
            focus:outline-none focus:ring-2 focus:ring-accent-teal focus:ring-inset
            ${
              value === option.value
                ? "bg-bg-elevated text-text-primary"
                : "text-text-muted hover:text-text-secondary"
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
