"use client";

import { useMemo, useState } from "react";
import { PlusIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PlatformEquipmentTypeOption } from "@/lib/equipment-types";
import type { PlatformServiceOption } from "@/lib/services";

type ChargeConcept = {
  id: string;
  conceptName: string;
  equipmentType: string;
  quantity: string;
  price: string;
  vatMode: "sin_iva" | "mas_iva";
  currency: "USD" | "MXN" | "EUR";
  notes: string;
};

type OtherConcept = {
  id: string;
  name: string;
  valueType: "monto" | "porcentaje";
  value: string;
  vatMode: "sin_iva" | "mas_iva";
  currency: "MXN";
  notes: string;
};

type ChargeConceptsEditorProps = {
  serviceOptions: PlatformServiceOption[];
  equipmentTypeOptions: PlatformEquipmentTypeOption[];
  inputClassName: string;
  textareaClassName: string;
};

const IVA_RATE = 0.16;

function createEmptyConcept(): ChargeConcept {
  return {
    id: crypto.randomUUID(),
    conceptName: "",
    equipmentType: "",
    quantity: "1",
    price: "",
    vatMode: "sin_iva",
    currency: "USD",
    notes: "",
  };
}

function createEmptyOtherConcept(): OtherConcept {
  return {
    id: crypto.randomUUID(),
    name: "",
    valueType: "monto",
    value: "",
    vatMode: "sin_iva",
    currency: "MXN",
    notes: "",
  };
}

function formatMoney(value: number, currency: ChargeConcept["currency"]) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function ChargeConceptsEditor({
  serviceOptions,
  equipmentTypeOptions,
  inputClassName,
  textareaClassName,
}: ChargeConceptsEditorProps) {
  const [concepts, setConcepts] = useState<ChargeConcept[]>([createEmptyConcept()]);
  const [otherConcepts, setOtherConcepts] = useState<OtherConcept[]>([createEmptyOtherConcept()]);

  const totals = useMemo(() => {
    return concepts.reduce(
      (acc, concept) => {
        const quantity = Number(concept.quantity || 0);
        const unitPrice = Number(concept.price || 0);
        const baseAmount = unitPrice * (Number.isFinite(quantity) && quantity > 0 ? quantity : 0);
        const vatAmount = concept.vatMode === "mas_iva" ? baseAmount * IVA_RATE : 0;
        acc.subtotal += baseAmount;
        acc.vat += vatAmount;
        acc.total += baseAmount + vatAmount;
        return acc;
      },
      { subtotal: 0, vat: 0, total: 0 },
    );
  }, [concepts]);

  const otherTotals = useMemo(() => {
    return otherConcepts.reduce(
      (acc, concept) => {
        const rawValue = Number(concept.value || 0);
        const baseAmount =
          concept.valueType === "porcentaje" ? (totals.subtotal * rawValue) / 100 : rawValue;
        const vatAmount = concept.vatMode === "mas_iva" ? baseAmount * IVA_RATE : 0;
        acc.subtotal += baseAmount;
        acc.vat += vatAmount;
        acc.total += baseAmount + vatAmount;
        return acc;
      },
      { subtotal: 0, vat: 0, total: 0 },
    );
  }, [otherConcepts, totals.subtotal]);

  const updateConcept = <K extends keyof ChargeConcept>(
    id: string,
    key: K,
    value: ChargeConcept[K],
  ) => {
    setConcepts((current) =>
      current.map((concept) => (concept.id === id ? { ...concept, [key]: value } : concept)),
    );
  };

  const addConcept = () => {
    setConcepts((current) => [...current, createEmptyConcept()]);
  };

  const removeConcept = (id: string) => {
    setConcepts((current) =>
      current.length === 1 ? [createEmptyConcept()] : current.filter((concept) => concept.id !== id),
    );
  };

  const updateOtherConcept = <K extends keyof OtherConcept>(
    id: string,
    key: K,
    value: OtherConcept[K],
  ) => {
    setOtherConcepts((current) =>
      current.map((concept) => (concept.id === id ? { ...concept, [key]: value } : concept)),
    );
  };

  const addOtherConcept = () => {
    setOtherConcepts((current) => [...current, createEmptyOtherConcept()]);
  };

  const removeOtherConcept = (id: string) => {
    setOtherConcepts((current) =>
      current.length === 1
        ? [createEmptyOtherConcept()]
        : current.filter((concept) => concept.id !== id),
    );
  };

  return (
    <div className="grid gap-4">
      {concepts.map((concept, index) => {
        const quantity = Number(concept.quantity || 0);
        const unitPrice = Number(concept.price || 0);
        const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
        const baseAmount = unitPrice * safeQuantity;
        const vatAmount = concept.vatMode === "mas_iva" ? baseAmount * IVA_RATE : 0;
        const total = baseAmount + vatAmount;

        return (
          <div
            key={concept.id}
            className="rounded-[1.35rem] border border-black/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.9)_100%)] p-4 shadow-[0_12px_32px_rgba(15,23,42,0.04)]"
          >
            <div className="flex items-center justify-between gap-3 border-b border-black/6 pb-3">
              <div>
                <p className="text-sm font-medium text-foreground">Concepto {index + 1}</p>
                <p className="text-[0.76rem] text-muted-foreground">
                  Define servicio, equipo, moneda, IVA y notas.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeConcept(concept.id)}
              >
                <Trash2Icon />
                Quitar
              </Button>
            </div>

            <div className="mt-4 grid gap-3 xl:grid-cols-4">
              <div className="grid gap-1.5 xl:col-span-2">
                <label className="text-[0.72rem] font-medium text-muted-foreground">
                  Concepto a cobrar
                </label>
                <select
                  className={inputClassName}
                  name={`charge_concepts.${index}.concept_name`}
                  value={concept.conceptName}
                  onChange={(event) => updateConcept(concept.id, "conceptName", event.target.value)}
                >
                  <option value="">Selecciona un servicio</option>
                  {serviceOptions.map((service) => (
                    <option key={service.id} value={service.name}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-1.5 xl:col-span-2">
                <label className="text-[0.72rem] font-medium text-muted-foreground">
                  Tipo de equipo
                </label>
                <select
                  className={inputClassName}
                  name={`charge_concepts.${index}.equipment_type`}
                  value={concept.equipmentType}
                  onChange={(event) => updateConcept(concept.id, "equipmentType", event.target.value)}
                >
                  <option value="">Selecciona un tipo de equipo</option>
                  {equipmentTypeOptions.map((equipmentType) => (
                    <option key={equipmentType.id} value={equipmentType.name}>
                      {equipmentType.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3 grid gap-3 xl:grid-cols-5">
              <div className="grid gap-1.5">
                <label className="text-[0.72rem] font-medium text-muted-foreground">Cantidad</label>
                <input
                  className={inputClassName}
                  name={`charge_concepts.${index}.quantity`}
                  placeholder="1"
                  inputMode="numeric"
                  value={concept.quantity}
                  onChange={(event) => updateConcept(concept.id, "quantity", event.target.value)}
                />
              </div>

              <div className="grid gap-1.5">
                <label className="text-[0.72rem] font-medium text-muted-foreground">Precio</label>
                <input
                  className={inputClassName}
                  name={`charge_concepts.${index}.price`}
                  placeholder="0.00"
                  inputMode="decimal"
                  value={concept.price}
                  onChange={(event) => updateConcept(concept.id, "price", event.target.value)}
                />
              </div>

              <div className="grid gap-1.5">
                <label className="text-[0.72rem] font-medium text-muted-foreground">IVA</label>
                <select
                  className={inputClassName}
                  name={`charge_concepts.${index}.vat_mode`}
                  value={concept.vatMode}
                  onChange={(event) =>
                    updateConcept(
                      concept.id,
                      "vatMode",
                      event.target.value as ChargeConcept["vatMode"],
                    )
                  }
                >
                  <option value="sin_iva">Sin IVA</option>
                  <option value="mas_iva">Mas IVA</option>
                </select>
              </div>

              <div className="grid gap-1.5">
                <label className="text-[0.72rem] font-medium text-muted-foreground">Moneda</label>
                <select
                  className={inputClassName}
                  name={`charge_concepts.${index}.currency`}
                  value={concept.currency}
                  onChange={(event) =>
                    updateConcept(
                      concept.id,
                      "currency",
                      event.target.value as ChargeConcept["currency"],
                    )
                  }
                >
                  <option value="USD">USD</option>
                  <option value="MXN">MXN</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>

              {concept.vatMode === "mas_iva" ? (
                <div className="grid gap-1.5">
                  <label className="text-[0.72rem] font-medium text-muted-foreground">
                    IVA calculado
                  </label>
                  <div className="flex h-10 items-center rounded-full border border-emerald-500/15 bg-emerald-500/[0.06] px-3.5 text-[0.82rem] font-medium text-emerald-700">
                    {formatMoney(vatAmount, concept.currency)}
                  </div>
                </div>
              ) : (
                <div className="grid gap-1.5">
                  <label className="text-[0.72rem] font-medium text-muted-foreground">IVA calculado</label>
                  <div className="flex h-10 items-center rounded-full border border-black/8 bg-black/[0.03] px-3.5 text-[0.82rem] text-muted-foreground">
                    No aplica
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_18rem]">
              <div className="grid gap-1.5">
                <label className="text-[0.72rem] font-medium text-muted-foreground">Notas</label>
                <textarea
                  className={textareaClassName}
                  name={`charge_concepts.${index}.notes`}
                  placeholder="Escribe una observacion, alcance o condicion del concepto."
                  value={concept.notes}
                  onChange={(event) => updateConcept(concept.id, "notes", event.target.value)}
                />
              </div>

              <div className="rounded-[1.1rem] border border-black/6 bg-white/85 p-4">
                <p className="text-[0.68rem] uppercase tracking-[0.2em] text-muted-foreground">
                  Resumen
                </p>
                <div className="mt-3 grid gap-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Base</span>
                    <span className="font-medium text-foreground">
                      {formatMoney(baseAmount, concept.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">IVA</span>
                    <span className="font-medium text-foreground">
                      {formatMoney(vatAmount, concept.currency)}
                    </span>
                  </div>
                  <div className="h-px bg-black/6" />
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-medium text-foreground">
                      {formatMoney(total, concept.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.35rem] border border-dashed border-black/10 bg-white/60 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">Agregar más conceptos</p>
          <p className="text-[0.76rem] text-muted-foreground">
            Usa una fila por cada cargo que quieras incluir en la cotización.
          </p>
        </div>

        <Button type="button" variant="outline" onClick={addConcept}>
          <PlusIcon />
          Agregar concepto
        </Button>
      </div>

      <div className="rounded-[1.75rem] border border-black/6 bg-white/88 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)] backdrop-blur sm:p-6">
        <div className="flex flex-col gap-4 border-b border-black/6 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Otros conceptos
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-medium tracking-[-0.03em] text-foreground">
                Ajustes y adicionales
              </h3>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                Captura cargos extra como monto o porcentaje, con IVA, moneda MXN y nota.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4">
          {otherConcepts.map((concept, index) => {
            const rawValue = Number(concept.value || 0);
            const baseAmount =
              concept.valueType === "porcentaje" ? (totals.subtotal * rawValue) / 100 : rawValue;
            const vatAmount = concept.vatMode === "mas_iva" ? baseAmount * IVA_RATE : 0;
            const total = baseAmount + vatAmount;

            return (
              <div
                key={concept.id}
                className="rounded-[1.35rem] border border-black/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.9)_100%)] p-4 shadow-[0_12px_32px_rgba(15,23,42,0.04)]"
              >
                <div className="flex items-center justify-between gap-3 border-b border-black/6 pb-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Otro concepto {index + 1}</p>
                    <p className="text-[0.76rem] text-muted-foreground">
                      Monto fijo o porcentaje, con IVA en MXN.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeOtherConcept(concept.id)}
                  >
                    <Trash2Icon />
                    Quitar
                  </Button>
                </div>

                <div className="mt-4 grid gap-3 xl:grid-cols-4">
                  <div className="grid gap-1.5 xl:col-span-2">
                    <label className="text-[0.72rem] font-medium text-muted-foreground">Nombre</label>
                    <input
                      className={inputClassName}
                      name={`other_concepts.${index}.name`}
                      placeholder="Ej. Manejo adicional / Recargo / Descuento"
                      value={concept.name}
                      onChange={(event) => updateOtherConcept(concept.id, "name", event.target.value)}
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <label className="text-[0.72rem] font-medium text-muted-foreground">Tipo</label>
                    <select
                      className={inputClassName}
                      name={`other_concepts.${index}.value_type`}
                      value={concept.valueType}
                      onChange={(event) =>
                        updateOtherConcept(
                          concept.id,
                          "valueType",
                          event.target.value as OtherConcept["valueType"],
                        )
                      }
                    >
                      <option value="monto">Monto</option>
                      <option value="porcentaje">%</option>
                    </select>
                  </div>

                  <div className="grid gap-1.5">
                    <label className="text-[0.72rem] font-medium text-muted-foreground">Valor</label>
                    <input
                      className={inputClassName}
                      name={`other_concepts.${index}.value`}
                      placeholder={concept.valueType === "porcentaje" ? "0.00" : "0.00"}
                      inputMode="decimal"
                      value={concept.value}
                      onChange={(event) => updateOtherConcept(concept.id, "value", event.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-3 grid gap-3 xl:grid-cols-4">
                  <div className="grid gap-1.5">
                    <label className="text-[0.72rem] font-medium text-muted-foreground">IVA</label>
                    <select
                      className={inputClassName}
                      name={`other_concepts.${index}.vat_mode`}
                      value={concept.vatMode}
                      onChange={(event) =>
                        updateOtherConcept(
                          concept.id,
                          "vatMode",
                          event.target.value as OtherConcept["vatMode"],
                        )
                      }
                    >
                      <option value="sin_iva">Sin IVA</option>
                      <option value="mas_iva">Mas IVA</option>
                    </select>
                  </div>

                  <div className="grid gap-1.5">
                    <label className="text-[0.72rem] font-medium text-muted-foreground">Moneda</label>
                    <div className="flex h-10 items-center justify-between rounded-full border border-black/10 bg-white/80 px-3.5 text-[0.82rem] text-foreground">
                      MXN
                      <input
                        type="hidden"
                        name={`other_concepts.${index}.currency`}
                        value={concept.currency}
                      />
                    </div>
                  </div>

                  {concept.vatMode === "mas_iva" ? (
                    <div className="grid gap-1.5 xl:col-span-2">
                      <label className="text-[0.72rem] font-medium text-muted-foreground">
                        IVA calculado
                      </label>
                      <div className="flex h-10 items-center rounded-full border border-emerald-500/15 bg-emerald-500/[0.06] px-3.5 text-[0.82rem] font-medium text-emerald-700">
                        {formatMoney(vatAmount, "MXN")}
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-1.5 xl:col-span-2">
                      <label className="text-[0.72rem] font-medium text-muted-foreground">
                        IVA calculado
                      </label>
                      <div className="flex h-10 items-center rounded-full border border-black/8 bg-black/[0.03] px-3.5 text-[0.82rem] text-muted-foreground">
                        No aplica
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_18rem]">
                  <div className="grid gap-1.5">
                    <label className="text-[0.72rem] font-medium text-muted-foreground">Nota</label>
                    <textarea
                      className={textareaClassName}
                      name={`other_concepts.${index}.notes`}
                      placeholder="Escribe una nota, condicion o aclaracion."
                      value={concept.notes}
                      onChange={(event) => updateOtherConcept(concept.id, "notes", event.target.value)}
                    />
                  </div>

                  <div className="rounded-[1.1rem] border border-black/6 bg-white/85 p-4">
                    <p className="text-[0.68rem] uppercase tracking-[0.2em] text-muted-foreground">
                      Resumen (MXN)
                    </p>
                    <div className="mt-3 grid gap-2 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-muted-foreground">Base</span>
                        <span className="font-medium text-foreground">{formatMoney(baseAmount, "MXN")}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-muted-foreground">IVA</span>
                        <span className="font-medium text-foreground">{formatMoney(vatAmount, "MXN")}</span>
                      </div>
                      <div className="h-px bg-black/6" />
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-medium text-foreground">{formatMoney(total, "MXN")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.35rem] border border-dashed border-black/10 bg-white/60 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Agregar otro concepto</p>
              <p className="text-[0.76rem] text-muted-foreground">
                Para recargos, descuentos o ajustes por porcentaje.
              </p>
            </div>

            <Button type="button" variant="outline" onClick={addOtherConcept}>
              <PlusIcon />
              Agregar
            </Button>
          </div>

          <div className="rounded-[1.35rem] border border-black/6 bg-white/80 p-4">
            <p className="text-[0.68rem] uppercase tracking-[0.2em] text-muted-foreground">
              Total otros conceptos (MXN)
            </p>
            <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
              <div className="rounded-[1rem] border border-black/6 bg-white/90 px-4 py-3">
                <p className="text-[0.72rem] text-muted-foreground">Subtotal</p>
                <p className="mt-1 text-base font-medium text-foreground">
                  {formatMoney(otherTotals.subtotal, "MXN")}
                </p>
              </div>
              <div className="rounded-[1rem] border border-black/6 bg-white/90 px-4 py-3">
                <p className="text-[0.72rem] text-muted-foreground">IVA</p>
                <p className="mt-1 text-base font-medium text-foreground">
                  {formatMoney(otherTotals.vat, "MXN")}
                </p>
              </div>
              <div className="rounded-[1rem] border border-black/6 bg-white/90 px-4 py-3">
                <p className="text-[0.72rem] text-muted-foreground">Total</p>
                <p className="mt-1 text-base font-medium text-foreground">
                  {formatMoney(otherTotals.total, "MXN")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[1.35rem] border border-black/6 bg-white/80 p-4">
        <p className="text-[0.68rem] uppercase tracking-[0.2em] text-muted-foreground">
          Total preliminar
        </p>
        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
          <div className="rounded-[1rem] border border-black/6 bg-white/90 px-4 py-3">
            <p className="text-[0.72rem] text-muted-foreground">Subtotal base</p>
            <p className="mt-1 text-base font-medium text-foreground">
              {formatMoney(totals.subtotal, "USD")}
            </p>
          </div>
          <div className="rounded-[1rem] border border-black/6 bg-white/90 px-4 py-3">
            <p className="text-[0.72rem] text-muted-foreground">IVA acumulado</p>
            <p className="mt-1 text-base font-medium text-foreground">
              {formatMoney(totals.vat, "USD")}
            </p>
          </div>
          <div className="rounded-[1rem] border border-black/6 bg-white/90 px-4 py-3">
            <p className="text-[0.72rem] text-muted-foreground">Total estimado</p>
            <p className="mt-1 text-base font-medium text-foreground">
              {formatMoney(totals.total, "USD")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
