import type { FormEvent } from "react";
import { SaqsoButton } from "./SaqsoButton";

type SaqsoSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function SaqsoSearchBar({ value, onChange, onSubmit, placeholder = "Search products", className = "" }: SaqsoSearchBarProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit?.(value);
  }

  return (
    <form className={["saqso-search", className].filter(Boolean).join(" ")} onSubmit={handleSubmit}>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-label={placeholder} />
      <SaqsoButton type="submit" size="sm">Search</SaqsoButton>
    </form>
  );
}