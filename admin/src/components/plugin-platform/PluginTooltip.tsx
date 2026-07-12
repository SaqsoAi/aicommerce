"use client";

import {
  AlertTriangle,
  CheckCircle2,
  CircleHelp,
  ExternalLink,
  Loader2,
  Settings2,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import {
  cloneElement,
  isValidElement,
  useId,
  useState,
  type FocusEventHandler,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
} from "react";

import { usePluginTooltip } from "./PluginTooltipContext";

export interface PluginTooltipProps {
  pluginKey: string;
  children: ReactElement;
  placement?: "top" | "bottom" | "left" | "right";
  disabled?: boolean;
  className?: string;
  fallback?: ReactNode;
}

const placementClasses = {
  top: "bottom-full left-1/2 mb-3 -translate-x-1/2",
  bottom: "left-1/2 top-full mt-3 -translate-x-1/2",
  left: "right-full top-1/2 mr-3 -translate-y-1/2",
  right: "left-full top-1/2 ml-3 -translate-y-1/2",
};

function iconFor(state?: string) {
  if (state === "ACTIVE") {
    return <CheckCircle2 className="text-emerald-300" size={18} />;
  }
  if (state === "BLOCKED") {
    return <ShieldAlert className="text-red-300" size={18} />;
  }
  if (state === "DEGRADED") {
    return <AlertTriangle className="text-amber-300" size={18} />;
  }
  return <Settings2 className="text-cyan-300" size={18} />;
}

export default function PluginTooltip({
  pluginKey,
  children,
  placement = "top",
  disabled = false,
  className = "",
  fallback,
}: PluginTooltipProps) {
  const tooltipId = useId();
  const [open, setOpen] = useState(false);
  const { guidance, loading } = usePluginTooltip(pluginKey);

  if (!isValidElement(children)) {
    return null;
  }

  type TriggerProps = {
    "aria-describedby"?: string;
    onMouseEnter?: MouseEventHandler<HTMLElement>;
    onMouseLeave?: MouseEventHandler<HTMLElement>;
    onFocus?: FocusEventHandler<HTMLElement>;
    onBlur?: FocusEventHandler<HTMLElement>;
  };

  const typedChildren = children as ReactElement<TriggerProps>;
  const originalProps = typedChildren.props;

  const trigger = cloneElement<TriggerProps>(typedChildren, {
    "aria-describedby": open ? tooltipId : undefined,
    onMouseEnter: (event) => {
      originalProps.onMouseEnter?.(event);
      if (!disabled) setOpen(true);
    },
    onMouseLeave: (event) => {
      originalProps.onMouseLeave?.(event);
      setOpen(false);
    },
    onFocus: (event) => {
      originalProps.onFocus?.(event);
      if (!disabled) setOpen(true);
    },
    onBlur: (event) => {
      originalProps.onBlur?.(event);
      setOpen(false);
    },
  });

  return (
    <span className={`relative inline-flex ${className}`}>
      {trigger}

      {open && !disabled ? (
        <span
          id={tooltipId}
          role="tooltip"
          className={`absolute z-[90] w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-slate-950/95 p-4 text-left shadow-2xl shadow-black/50 backdrop-blur-xl ${placementClasses[placement]}`}
        >
          {loading ? (
            <span className="flex items-center gap-2 text-sm text-white/60">
              <Loader2 className="animate-spin" size={16} />
              Loading plugin guidance…
            </span>
          ) : guidance ? (
            <span className="block space-y-3">
              <span className="flex items-start gap-3">
                {iconFor(guidance.guidanceState)}
                <span>
                  <span className="block font-black text-white">
                    {guidance.title}
                  </span>
                  <span className="mt-1 block text-xs font-bold uppercase tracking-[0.16em] text-white/35">
                    {guidance.guidanceState.replaceAll("_", " ")}
                  </span>
                </span>
              </span>

              <span className="block text-sm leading-6 text-white/65">
                {guidance.summary}
              </span>

              <span className="block rounded-xl border border-white/10 bg-white/[0.04] p-3">
                <span className="block text-xs font-black uppercase tracking-[0.15em] text-cyan-200/70">
                  {guidance.guidanceState === "ACTIVE" ||
                  guidance.guidanceState === "DEGRADED"
                    ? "To operate"
                    : "To activate"}
                </span>
                <span className="mt-2 block text-sm leading-6 text-white/75">
                  {guidance.instruction}
                </span>
              </span>

              {guidance.action?.href ? (
                <Link
                  href={guidance.action.href}
                  className="inline-flex items-center gap-2 text-sm font-bold text-cyan-200 hover:text-cyan-100"
                >
                  {guidance.action.label}
                  <ExternalLink size={14} />
                </Link>
              ) : null}
            </span>
          ) : (
            fallback || (
              <span className="flex items-center gap-2 text-sm text-white/60">
                <CircleHelp size={16} />
                Plugin guidance is unavailable.
              </span>
            )
          )}
        </span>
      ) : null}
    </span>
  );
}
