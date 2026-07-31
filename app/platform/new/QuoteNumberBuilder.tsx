"use client";

import { useMemo, useState } from "react";

const QUOTE_STATES = [
  { value: "PUE", label: "Puebla (PUE)" },
  { value: "VER", label: "Veracruz (VER)" },
  { value: "ZLO", label: "Manzanillo (ZLO)" },
  { value: "ATM", label: "Altamira (ATM)" },
] as const;

type QuoteStateCode = (typeof QUOTE_STATES)[number]["value"];

const TWO_DIGIT_RE = /^\d{0,2}$/;
const DEFAULT_STATE: QuoteStateCode = "PUE";

function currentYearTwoDigits() {
  return String(new Date().getFullYear()).slice(-2);
}

export function QuoteNumberBuilder({
  inputClassName,
  defaultStateCode = DEFAULT_STATE,
  defaultYearTwoDigits,
  defaultNextEightDigit,
}: {
  inputClassName: string;
  defaultStateCode?: QuoteStateCode;
  defaultYearTwoDigits?: string;
  defaultNextEightDigit?: string;
}) {
  const yearFromServer = defaultYearTwoDigits ?? currentYearTwoDigits();

  const [stateCode, setStateCode] = useState<QuoteStateCode>(defaultStateCode || DEFAULT_STATE);
  const [yearSuffix, setYearSuffix] = useState<string>(yearFromServer);

  const yearNormalized = useMemo(() => {
    const digits = yearSuffix.replace(/\D/g, "");
    if (!digits) return yearFromServer;
    if (TWO_DIGIT_RE.test(digits)) return digits.padEnd(2, "0");
    return digits.slice(0, 2);
  }, [yearSuffix, yearFromServer]);

  const fullYearFour = useMemo(() => {
    const two = Number(yearNormalized);
    if (!Number.isFinite(two)) return new Date().getFullYear();
    const currentCentury = Math.floor(new Date().getFullYear() / 100) * 100;
    return currentCentury + two;
  }, [yearNormalized]);

  const nextEightDigit = useMemo(() => {
    const clean = String(defaultNextEightDigit || "").replace(/\D/g, "");
    if (clean.length === 8) return clean;
    const serial = "0001";
    const yearStr = String(fullYearFour).slice(-4).padStart(4, "0");
    return `${serial}${yearStr}`;
  }, [defaultNextEightDigit, fullYearFour]);

  const compositeValue = useMemo(() => {
    const prefix = `${stateCode}${yearNormalized}`;
    return `${prefix}-${nextEightDigit}`;
  }, [stateCode, yearNormalized, nextEightDigit]);

  return (
    <div className="grid gap-1.5">
      <label className="text-[0.72rem] font-medium text-muted-foreground">
        N.º de Cotización
      </label>

      <input type="hidden" name="quote_number_state" value={stateCode} />
      <input type="hidden" name="quote_number_year" value={yearNormalized} />
      <input type="hidden" name="quote_number" value={compositeValue} />

      <div className="grid gap-3 lg:grid-cols-[11rem_8.5rem_1fr]">
        <div className="grid gap-1.5">
          <label className="text-[0.7rem] font-medium text-muted-foreground">Estado</label>
          <select
            className={inputClassName}
            value={stateCode}
            onChange={(event) => setStateCode(event.target.value as QuoteStateCode)}
          >
            {QUOTE_STATES.map((option) => (
              <option key={option.value} value={option.value}>
              {option.label}
            </option>
            ))}
          </select>
        </div>

        <div className="grid gap-1.5">
          <label className="text-[0.7rem] font-medium text-muted-foreground">
            Año · 2 dígitos
          </label>
          <input
            className={inputClassName}
            value={yearSuffix}
            onChange={(event) => setYearSuffix(event.target.value)}
            inputMode="numeric"
            maxLength={2}
            placeholder={yearFromServer}
          />
        </div>

        <div className="grid gap-1.5">
          <label className="text-[0.7rem] font-medium text-muted-foreground">
            Consecutivo · 8 dígitos
          </label>
          <div
            className={[
              inputClassName,
              "flex items-center bg-black/[0.03] text-muted-foreground",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-readonly="true"
          >
            <span className="font-mono text-[0.82rem] font-medium tracking-[-0.01em] text-foreground/85">
              {nextEightDigit}
            </span>
          </div>
        </div>
      </div>

      <p className="text-[0.72rem] leading-5 text-muted-foreground">
        Formato:{" "}
        <span className="font-medium text-foreground">{DEFAULT_STATE}26-00012026</span> · 4
        letras Estado+Año, guion, 8 dígitos (4 consecutivo + 4 año). El consecutivo final se confirma al guardar para evitar duplicados.
      </p>
    </div>
  );
}

export default QuoteNumberBuilder;
