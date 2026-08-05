"use client";

import { useCallback, useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import {
  Building2Icon,
  CalendarClockIcon,
  FileEditIcon,
  Loader2Icon,
  PlusIcon,
  ReceiptTextIcon,
  ShipIcon,
  UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import type { EditableQuoteDraft } from "@/app/actions/quotes";
import { ChargeConceptsEditor } from "@/app/platform/new/ChargeConceptsEditor";
import { QuoteNumberBuilder } from "@/app/platform/new/QuoteNumberBuilder";
import { Button } from "@/components/ui/button";

export type QuoteFormFeedback = {
  success?: boolean;
  message?: string;
};

export type QuoteFormMode = "create" | "edit";

export type QuoteFormCatalogs = {
  serviceOptions: Array<{ id: string; name: string }>;
  equipmentTypeOptions: Array<{ id: string; name: string }>;
};

export type QuoteFormProps = {
  mode: QuoteFormMode;
  quoteId?: string;
  userName: string;
  userEmail: string;
  initialDraft: EditableQuoteDraft | null;
  defaultNextEightDigit: string;
  catalogs: QuoteFormCatalogs;
  action: (
    state: QuoteFormFeedback,
    formData: FormData,
  ) => QuoteFormFeedback | Promise<QuoteFormFeedback>;
  header?: {
    eyebrow: string;
    title: string;
    description: string;
  };
  submitLabel?: string;
  submitSubLabel?: string;
  submitIcon?: ReactNode;
  formClassName?: ComponentProps<"form">["className"];
};

const inputClassName =
  "h-10 w-full rounded-full border border-black/10 bg-white/80 px-3.5 text-[0.82rem] text-foreground outline-none placeholder:text-muted-foreground transition-colors focus:border-black/25 focus:bg-white";

const textareaClassName =
  "min-h-20 w-full resize-none rounded-[1.25rem] border border-black/10 bg-white/80 px-3.5 py-2.5 text-[0.82rem] leading-5 text-foreground outline-none placeholder:text-muted-foreground transition-colors focus:border-black/25 focus:bg-white";

function FormSection({
  icon,
  eyebrow,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border border-black/6 bg-white/88 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)] backdrop-blur sm:p-6">
      <div className="flex flex-col gap-4 border-b border-black/6 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[0.68rem] font-medium uppercase tracking-[0.24em] text-muted-foreground">
            <span className="flex size-7 items-center justify-center rounded-full bg-black/[0.04] text-foreground">
              {icon}
            </span>
            {eyebrow}
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-medium tracking-[-0.03em] text-foreground">{title}</h2>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={["grid gap-1.5", className].filter(Boolean).join(" ")}>
      <label className="text-[0.72rem] font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

export function QuoteForm({
  mode,
  quoteId,
  userName,
  userEmail,
  initialDraft,
  defaultNextEightDigit,
  catalogs,
  action,
  header,
  submitLabel,
  submitSubLabel,
  submitIcon,
  formClassName,
}: QuoteFormProps) {
  void userName;
  const defaultYearTwo = String(new Date().getFullYear()).slice(-2);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [formState, setFormState] = useState<QuoteFormFeedback | null>(null);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = event.currentTarget;
      if (form == null) return;

      const currentFormData = new FormData(form);
      const lastState: QuoteFormFeedback = formState ?? {};
      setFormState(null);

      startTransition(async () => {
        try {
          const next = await action(lastState, currentFormData);
          setFormState(next);
        } catch (error) {
          const message =
            error instanceof Error && error.message.length > 0
              ? error.message
              : "Ocurrió un error inesperado al guardar.";
          setFormState({ success: false, message });
        }
      });
    },
    [action, formState],
  );

  useEffect(() => {
    if (formState?.success === true) {
      const timer = window.setTimeout(() => {
        router.push("/platform");
      }, 700);
      return () => window.clearTimeout(timer);
    }
  }, [formState?.success, router]);

  const issuer = initialDraft?.issuer ?? {
    tradeName: "DLN FORWARDING",
    legalName: "NELLY TRESS TAKAHASHI",
    rfc: "TETN680531TJ6",
    taxAddress:
      "Carr. Libramiento Santa Fe San Julian Km. 3.7, Col. Nueva Dr. Delfino A. Victoria, C.P. 91690, Veracruz, Veracruz",
    phone: "2221526990",
    website: "www.dinforwarding.com",
    sellerName: "",
    contactEmail: userEmail,
  };

  const client = initialDraft?.client ?? {
    companyName: "",
    contactName: "",
  };

  const control = initialDraft?.control ?? {
    issueDate: "",
    validUntil: "",
    stateCode: "PUE",
    yearTwo: defaultYearTwo,
    eightDigit: defaultNextEightDigit,
    currencies: "USD / MXN",
  };

  const route = initialDraft?.route ?? {
    originPort: "",
    destinationPort: "",
    incoterm: "",
    shippingLine: "",
    freeDays: "",
    transitTime: "",
  };

  void header;

  const finalSubmitLabel =
    submitLabel ?? (mode === "edit" ? "Guardar cambios" : "Guardar cotización");
  const finalSubmitSubLabel =
    submitSubLabel ??
    (mode === "edit"
      ? "Se sobreescriben datos y conceptos guardados. El PDF se regenera automáticamente."
      : "Se guarda en tu historial y solo tú la verás (Admin puede ver todas).");

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={["grid gap-5", formClassName ?? ""].filter(Boolean).join(" ")}
      noValidate
    >
      {mode === "edit" && quoteId ? (
        <input type="hidden" name="quote_id" value={quoteId} />
      ) : null}

      {mode === "edit" ? (
        <input
          type="hidden"
          name="quote_number_eight_digit"
          value={control.eightDigit ?? defaultNextEightDigit}
        />
      ) : null}

      <FormSection
        icon={<Building2Icon className="size-3.5" />}
        eyebrow="Datos del emisor"
        title="Proveedor / Forwarder"
        description="Información corporativa y de contacto que se imprimirá en la cabecera de la cotización."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nombre Comercial">
            <input
              className={inputClassName}
              defaultValue={issuer.tradeName}
              name="issuer_trade_name"
            />
          </Field>

          <Field label="Razón Social">
            <input
              className={inputClassName}
              defaultValue={issuer.legalName}
              name="issuer_legal_name"
            />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="RFC">
            <input
              className={inputClassName}
              defaultValue={issuer.rfc}
              name="issuer_rfc"
            />
          </Field>

          <Field label="Teléfono / Celular">
            <input
              className={inputClassName}
              defaultValue={issuer.phone}
              name="issuer_phone"
            />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Sitio Web">
            <input
              className={inputClassName}
              defaultValue={issuer.website}
              name="issuer_website"
            />
          </Field>

          <Field label="Vendedor">
            <input
              className={inputClassName}
              defaultValue={issuer.sellerName}
              placeholder="Nombre del vendedor"
              name="issuer_seller_name"
            />
          </Field>
        </div>

        <div className="grid gap-3">
          <Field label="Dirección Fiscal">
            <textarea
              className={textareaClassName}
              defaultValue={issuer.taxAddress}
              name="issuer_tax_address"
            />
          </Field>

          <Field label="Correo de Contacto">
            <input
              className={inputClassName}
              defaultValue={issuer.contactEmail || userEmail}
              placeholder="correo@dlnforwarding.com"
              name="issuer_contact_email"
              type="email"
            />
          </Field>
        </div>
      </FormSection>

      <FormSection
        icon={<UserIcon className="size-3.5" />}
        eyebrow="Datos del cliente"
        title="Cliente"
        description="Identifica la empresa y el contacto principal que recibirá la propuesta comercial."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nombre de la Empresa">
            <input
              className={inputClassName}
              defaultValue={client.companyName}
              placeholder="Empresa"
              name="client_company_name"
            />
          </Field>

          <Field label="Contacto Primario">
            <input
              className={inputClassName}
              defaultValue={client.contactName}
              placeholder="Nombre y apellido"
              name="client_contact_name"
            />
          </Field>
        </div>
      </FormSection>

      <FormSection
        icon={<CalendarClockIcon className="size-3.5" />}
        eyebrow="Control documental"
        title="Control de la cotización"
        description="Datos administrativos que permiten identificar y emitir el documento final."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Fecha de Emisión">
            <input
              className={inputClassName}
              name="quote_issue_date"
              type="date"
              defaultValue={control.issueDate}
            />
          </Field>

          <Field label="Vigencia">
            <input
              className={inputClassName}
              name="quote_valid_until"
              type="date"
              defaultValue={control.validUntil}
            />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <QuoteNumberBuilder
            inputClassName={inputClassName}
            defaultStateCode={(control.stateCode || "PUE") as "PUE" | "VER" | "ZLO" | "ATM"}
            defaultYearTwoDigits={control.yearTwo || defaultYearTwo}
            defaultNextEightDigit={control.eightDigit || defaultNextEightDigit}
          />

          <Field label="Monedas del Documento">
            <input
              className={inputClassName}
              defaultValue={control.currencies}
              placeholder="USD / MXN"
              name="quote_currencies"
            />
          </Field>
        </div>
      </FormSection>

      <FormSection
        icon={<ShipIcon className="size-3.5" />}
        eyebrow="Tránsito marítimo"
        title="Ruta y operación"
        description="Define origen, destino y condiciones del tránsito para contextualizar la futura tarifa."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Puerto de Origen">
            <input
              className={inputClassName}
              defaultValue={route.originPort}
              placeholder="Ej. Qingdao"
              name="route_origin_port"
            />
          </Field>

          <Field label="Puerto de Destino">
            <input
              className={inputClassName}
              defaultValue={route.destinationPort}
              placeholder="Ej. Manzanillo, Colima"
              name="route_destination_port"
            />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Incoterm">
            <input
              className={inputClassName}
              defaultValue={route.incoterm}
              placeholder="FOB"
              name="route_incoterm"
            />
          </Field>

          <Field label="Naviera">
            <input
              className={inputClassName}
              defaultValue={route.shippingLine}
              placeholder="MSC"
              name="route_shipping_line"
            />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Días Libres de Demoras">
            <input
              className={inputClassName}
              defaultValue={route.freeDays}
              placeholder="21"
              name="route_free_days"
              inputMode="numeric"
            />
          </Field>

          <Field label="Tiempo de Tránsito (Estimado)">
            <input
              className={inputClassName}
              defaultValue={route.transitTime}
              placeholder="20-29 días"
              name="route_transit_time"
            />
          </Field>
        </div>
      </FormSection>

      <FormSection
        icon={<ReceiptTextIcon className="size-3.5" />}
        eyebrow="Conceptos a cobrar"
        title="Cargos, equipo e impuestos"
        description="Agrega los conceptos a cobrar, tipo de equipo, precio, moneda, IVA y notas comerciales."
      >
        <ChargeConceptsEditor
          serviceOptions={catalogs.serviceOptions}
          equipmentTypeOptions={catalogs.equipmentTypeOptions}
          inputClassName={inputClassName}
          textareaClassName={textareaClassName}
          initialChargeItems={initialDraft?.chargeItems ?? undefined}
          initialOtherItems={initialDraft?.otherItems ?? undefined}
        />
      </FormSection>

      {typeof formState?.success === "boolean" && formState?.message ? (
        <div
          className={[
            "rounded-[1.5rem] border px-4 py-3 text-[0.82rem] leading-5",
            formState.success
              ? "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-800"
              : "border-destructive/20 bg-destructive/[0.06] text-destructive",
          ].join(" ")}
          role="status"
        >
          {formState.message}
        </div>
      ) : null}

      <div className="sticky bottom-0 z-10 -mx-2 rounded-[1.75rem] border border-black/6 bg-white/80 p-4 shadow-[0_18px_48px_rgba(15,23,42,0.06)] backdrop-blur sm:mx-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{finalSubmitLabel}</p>
            <p className="text-[0.78rem] leading-5 text-muted-foreground">
              {finalSubmitSubLabel}
            </p>
          </div>
          <SubmitCta
            mode={mode}
            submitLabel={finalSubmitLabel}
            submitIcon={submitIcon ?? undefined}
            isPending={isPending}
          />
        </div>
      </div>
    </form>
  );
}

function SubmitCta({
  mode,
  submitLabel,
  submitIcon,
  isPending,
}: {
  mode: QuoteFormMode;
  submitLabel: string;
  submitIcon?: ReactNode;
  isPending: boolean;
}) {
  const icon = submitIcon ?? (
    mode === "edit" ? (
      <FileEditIcon className="size-4 mr-2" />
    ) : (
      <PlusIcon className="size-4 mr-2" />
    )
  );
  return (
    <Button type="submit" size="lg" className="rounded-full px-6" disabled={isPending}>
      {isPending ? (
        <Loader2Icon className="size-4 mr-2 animate-spin" />
      ) : (
          icon
        )}
      {isPending ? "Guardando…" : submitLabel}
    </Button>
  );
}

export default QuoteForm;
