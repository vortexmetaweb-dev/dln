import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
  Building2Icon,
  CalendarClockIcon,
  ReceiptTextIcon,
  ShipIcon,
  UserIcon,
} from "lucide-react";

import { createMaritimeQuote } from "@/app/actions/quotes";
import { ChargeConceptsEditor } from "@/app/platform/new/ChargeConceptsEditor";
import { Navbar } from "@/app/platform/components/navbar";
import { Button } from "@/components/ui/button";
import { getPlatformEquipmentTypes } from "@/lib/equipment-types";
import { getPlatformServices } from "@/lib/services";
import { createClient } from "@/lib/supabase/server";

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

export default async function PlatformNewQuotePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const userName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email ||
    "Usuario";
  const userAvatarUrl =
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    user.user_metadata?.photo_url ||
    "";
  const serviceOptions = await getPlatformServices();
  const equipmentTypeOptions = await getPlatformEquipmentTypes();

  return (
    <main className="h-screen overflow-hidden bg-background text-foreground">
      <Navbar userName={userName} userAvatarUrl={userAvatarUrl} />

      <section className="relative h-[calc(100vh-3.5rem)] overflow-hidden px-6 py-8 lg:px-8 lg:py-10">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(250,250,252,0.96)_0%,rgba(245,248,252,0.92)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(173,206,243,0.28),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.9),transparent_58%)]" />

        <div className="relative mx-auto flex h-full w-full max-w-[1600px] flex-col">
          <div className="flex flex-col gap-5 border-b border-black/5 pb-6">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-normal tracking-[-0.05em] text-foreground sm:text-4xl">
                  Nueva cotización
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                  Una vista más ordenada para capturar emisor, cliente, tránsito y control del documento
                  antes de pasar al cálculo.
                </p>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 pt-6">
            <div className="h-full overflow-auto pr-1">
              <div className="w-full">
                <form className="grid gap-5" action={createMaritimeQuote}>
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
                          defaultValue="DLN FORWARDING"
                          name="issuer_trade_name"
                        />
                      </Field>

                      <Field label="Razón Social">
                        <input
                          className={inputClassName}
                          defaultValue="NELLY TRESS TAKAHASHI"
                          name="issuer_legal_name"
                        />
                      </Field>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="RFC">
                        <input
                          className={inputClassName}
                          defaultValue="TETN680531TJ6"
                          name="issuer_rfc"
                        />
                      </Field>

                      <Field label="Teléfono / Celular">
                        <input
                          className={inputClassName}
                          defaultValue="2221526990"
                          name="issuer_phone"
                        />
                      </Field>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Sitio Web">
                        <input
                          className={inputClassName}
                          defaultValue="www.dinforwarding.com"
                          name="issuer_website"
                        />
                      </Field>

                      <Field label="Vendedor">
                        <input
                          className={inputClassName}
                          placeholder="Nombre del vendedor"
                          name="issuer_seller_name"
                        />
                      </Field>
                    </div>

                    <div className="grid gap-3">
                      <Field label="Dirección Fiscal">
                        <textarea
                          className={textareaClassName}
                          defaultValue="Carr. Libramiento Santa Fe San Julian Km. 3.7, Col. Nueva Dr. Delfino A. Victoria, C.P. 91690, Veracruz, Veracruz"
                          name="issuer_tax_address"
                        />
                      </Field>

                      <Field label="Correo de Contacto">
                        <input
                          className={inputClassName}
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
                          placeholder="Empresa"
                          name="client_company_name"
                        />
                      </Field>

                      <Field label="Contacto Primario">
                        <input
                          className={inputClassName}
                          placeholder="Nombre y apellido"
                          name="client_contact_name"
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
                          placeholder="Ej. Qingdao"
                          name="route_origin_port"
                        />
                      </Field>

                      <Field label="Puerto de Destino">
                        <input
                          className={inputClassName}
                          placeholder="Ej. Manzanillo, Colima"
                          name="route_destination_port"
                        />
                      </Field>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Incoterm">
                        <input className={inputClassName} placeholder="FOB" name="route_incoterm" />
                      </Field>

                      <Field label="Naviera">
                        <input className={inputClassName} placeholder="MSC" name="route_shipping_line" />
                      </Field>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <Field label="Días Libres de Demoras">
                        <input
                          className={inputClassName}
                          placeholder="21"
                          name="route_free_days"
                          inputMode="numeric"
                        />
                      </Field>

                      <Field label="Tiempo de Tránsito (Estimado)">
                        <input
                          className={inputClassName}
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
                      serviceOptions={serviceOptions}
                      equipmentTypeOptions={equipmentTypeOptions}
                      inputClassName={inputClassName}
                      textareaClassName={textareaClassName}
                    />
                  </FormSection>

                  <FormSection
                    icon={<CalendarClockIcon className="size-3.5" />}
                    eyebrow="Control documental"
                    title="Control de la cotización"
                    description="Datos administrativos que permiten identificar y emitir el documento final."
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Fecha de Emisión">
                        <input className={inputClassName} name="quote_issue_date" type="date" />
                      </Field>

                      <Field label="Vigencia">
                        <input className={inputClassName} name="quote_valid_until" type="date" />
                      </Field>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="N.º de Cotización">
                        <input
                          className={inputClassName}
                          placeholder="Ej. PUE26-15042026"
                          name="quote_number"
                        />
                      </Field>

                      <Field label="Monedas del Documento">
                        <input
                          className={inputClassName}
                          placeholder="USD / MXN"
                          name="quote_currencies"
                        />
                      </Field>
                    </div>
                  </FormSection>

                  <div className="sticky bottom-0 z-10 -mx-2 rounded-[1.75rem] border border-black/6 bg-white/80 p-4 shadow-[0_18px_48px_rgba(15,23,42,0.06)] backdrop-blur sm:mx-0">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">Guardar cotización</p>
                        <p className="text-[0.78rem] leading-5 text-muted-foreground">
                          Se guarda en tu historial y solo tú la verás (Admin puede ver todas).
                        </p>
                      </div>
                      <Button type="submit" size="lg" className="rounded-full px-6">
                        Guardar cotización
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
