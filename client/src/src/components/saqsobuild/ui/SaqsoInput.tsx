import type { InputHTMLAttributes } from "react";

type SaqsoInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function SaqsoInput({ label, hint, error, className = "", id, ...props }: SaqsoInputProps) {
  const inputId = id || props.name || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <label className="saqso-field" htmlFor={inputId}>
      {label ? <span className="saqso-field__label">{label}</span> : null}
      <input id={inputId} className={["saqso-input", error ? "saqso-input--error" : "", className].filter(Boolean).join(" ")} {...props} />
      {error ? <span className="saqso-field__error">{error}</span> : hint ? <span className="saqso-field__hint">{hint}</span> : null}
    </label>
  );
}