export interface CustomInputPanelProps {
  value: string;
  onChange: (value: string) => void;
}

/** Custom stdin for Run Code, shown in the results slot while "Provide Custom Input" is on — styled as the frame's Input box. */
export function CustomInputPanel({ value, onChange }: CustomInputPanelProps) {
  return (
    <div className="flex h-full flex-col rounded-[10px] bg-code-panel pt-[9px] pr-[20px] pb-[9px] pl-[21px]">
      <label
        htmlFor="custom-input"
        className="pl-[5px] font-inria text-[13px] leading-[25.075px] font-bold text-white"
      >
        Custom Input
      </label>
      <textarea
        id="custom-input"
        value={value}
        onChange={event => onChange(event.target.value)}
        className="mt-[4.35px] min-h-0 flex-1 resize-none rounded-[10px] bg-code-inset pt-[11.04px] pr-[12px] pl-[21px] font-sans text-[14px] leading-[25.075px] font-bold text-white outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      />
    </div>
  );
}
