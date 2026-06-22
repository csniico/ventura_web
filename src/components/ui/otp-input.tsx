"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  /** Fired when the last digit is filled (e.g. auto-submit). */
  onComplete?: (value: string) => void;
  invalid?: boolean;
  disabled?: boolean;
}

/** Segmented numeric code input with paste + keyboard navigation. */
export function OtpInput({
  value,
  onChange,
  length = 6,
  onComplete,
  invalid,
  disabled,
}: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const setDigit = (index: number, digit: string) => {
    const next = value.split("");
    next[index] = digit;
    const joined = next.join("").slice(0, length);
    onChange(joined);
    if (joined.length === length && !joined.includes("")) onComplete?.(joined);
  };

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    if (!digit) return;
    setDigit(index, digit);
    if (index < length - 1) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (value[index]) {
        setDigit(index, "");
      } else if (index > 0) {
        refs.current[index - 1]?.focus();
        setDigit(index - 1, "");
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!digits) return;
    onChange(digits);
    const focusIndex = Math.min(digits.length, length - 1);
    refs.current[focusIndex]?.focus();
    if (digits.length === length) onComplete?.(digits);
  };

  return (
    <div className="flex gap-2 sm:gap-3" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={value[i] ?? ""}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          className={cn(
            "h-13 w-full min-w-0 rounded-xl border bg-white text-center text-lg font-semibold text-zinc-900 shadow-sm transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500",
            "disabled:bg-zinc-50",
            invalid ? "border-red-400" : "border-zinc-200",
          )}
          style={{ height: "3.25rem" }}
        />
      ))}
    </div>
  );
}
