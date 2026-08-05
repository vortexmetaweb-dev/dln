import { redirect } from "next/navigation";
import {
  Building2Icon,
  CalendarClockIcon,
  ReceiptTextIcon,
  ShipIcon,
  UserIcon,
} from "lucide-react";

import {
  createMaritimeQuote,
  getEditableQuote,
  updateMaritimeQuote,
  type EditableQuoteDraft,
} from "@/app/actions/quotes";
import { QuoteForm, type QuoteFormFeedback } from "@/app/platform/new/QuoteForm";
import { Navbar } from "@/app/platform/components/navbar";
import { getPlatformEquipmentTypes } from "@/lib/equipment-types";
import { getNextMaritimeQuoteSerial } from "@/lib/quotes";
import { getPlatformServices } from "@/lib/services";
import { createClient } from "@/lib/supabase/server";

async function handleCreateActionWrapper(
  state: QuoteFormFeedback,
  formData: FormData,
): Promise<QuoteFormFeedback> {
  "use server";
  try {
    const result = await createMaritimeQuote(formData);
    return {
      success: true,
      message: `Cotización ${result.quoteNumber} creada correctamente.`,
    };
  } catch (error) {
    const message =
      error instanceof Error && error.message.length > 0
        ? error.message
        : "No se pudo crear la cotización.";
    return { success: false, message };
  }
}

async function handleUpdateActionWrapper(
  state: QuoteFormFeedback,
  formData: FormData,
): Promise<QuoteFormFeedback> {
  "use server";

  const quoteId = formData.get("quote_id");
  if (typeof quoteId !== "string" || quoteId.trim().length === 0) {
    return {
      success: false,
      message: "No se identificó la cotización a actualizar.",
    };
  }

  try {
    const result = await updateMaritimeQuote(quoteId, formData);
    return {
      success: true,
      message: `Cotización ${result.quoteNumber} actualizada correctamente.`,
    };
  } catch (error) {
    const message =
      error instanceof Error && error.message.length > 0
        ? error.message
        : "No se pudo actualizar la cotización.";
    return { success: false, message };
  }
}

const ICONS = {
  Building2Icon,
  CalendarClockIcon,
  ReceiptTextIcon,
  ShipIcon,
  UserIcon,
};

type NewQuotePageProps = {
  params: Promise<Record<string, never>>;
  searchParams: Promise<{ id?: string | string[] }>;
};

export default async function PlatformNewQuotePage(props: NewQuotePageProps) {
  void ICONS;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const userFullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email ||
    "Usuario";
  const userName = userFullName;
  const userEmail = user.email ?? "";
  const userAvatarUrl =
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    user.user_metadata?.photo_url ||
    "";
  const serviceOptions = await getPlatformServices();
  const equipmentTypeOptions = await getPlatformEquipmentTypes();
  const defaultYearTwo = String(new Date().getFullYear()).slice(-2);

  const resolvedSearch = await props.searchParams;
  const rawId = resolvedSearch?.id;
  const editingId: string | null = Array.isArray(rawId)
    ? rawId[0]?.toString().trim() ?? null
    : typeof rawId === "string" && rawId.trim().length > 0
      ? rawId.trim()
      : null;

  const emptyDraft: EditableQuoteDraft = {
    id: null,
    issuer: {
      tradeName: "DLN FORWARDING",
      legalName: "NELLY TRESS TAKAHASHI",
      rfc: "TETN680531TJ6",
      taxAddress:
        "Carr. Libramiento Santa Fe San Julian Km. 3.7, Col. Nueva Dr. Delfino A. Victoria, C.P. 91690, Veracruz, Veracruz",
      phone: "2221526990",
      website: "www.dinforwarding.com",
      sellerName: "",
      contactEmail: userEmail,
    },
    client: {
      companyName: "",
      contactName: "",
    },
    control: {
      issueDate: "",
      validUntil: "",
      stateCode: "PUE",
      yearTwo: defaultYearTwo,
      eightDigit: "",
      currencies: "USD / MXN",
    },
    route: {
      originPort: "",
      destinationPort: "",
      incoterm: "",
      shippingLine: "",
      freeDays: "",
      transitTime: "",
    },
    chargeItems: [],
    otherItems: [],
  };

  let hydratedDraft: EditableQuoteDraft = emptyDraft;
  let fallbackEightDigit: string;
  let pageMode: "create" | "edit" = "create";
  let actionForForm:
    | typeof handleCreateActionWrapper
    | typeof handleUpdateActionWrapper = handleCreateActionWrapper;

  if (editingId) {
    const existing = await getEditableQuote(editingId);
    if (!existing) {
      redirect("/platform");
    }

    const serialForEdit = await getNextMaritimeQuoteSerial({
      stateCode: existing.control.stateCode || "PUE",
      yearTwoDigits: existing.control.yearTwo || defaultYearTwo,
      supabaseClient: supabase,
    });
    const safeEight =
      existing.control.eightDigit && existing.control.eightDigit.length === 8
        ? existing.control.eightDigit
        : serialForEdit.nextEightDigit;

    hydratedDraft = {
      ...existing,
      control: {
        ...existing.control,
        eightDigit: safeEight,
      },
    };
    pageMode = "edit";
    fallbackEightDigit = safeEight;
    actionForForm = handleUpdateActionWrapper;
  } else {
    const defaultSerial = await getNextMaritimeQuoteSerial({
      stateCode: "PUE",
      yearTwoDigits: defaultYearTwo,
      supabaseClient: supabase,
    });
    hydratedDraft = {
      ...emptyDraft,
      control: {
        ...emptyDraft.control,
        eightDigit: defaultSerial.nextEightDigit,
      },
    };
    fallbackEightDigit = defaultSerial.nextEightDigit;
  }

  const titleStateCode = hydratedDraft.control.stateCode || "PUE";
  const titleYearTwo = hydratedDraft.control.yearTwo || defaultYearTwo;
  const titleEightDigit = fallbackEightDigit;

  return (
    <main className="h-screen overflow-hidden bg-background text-foreground">
      <Navbar userName={userName} userAvatarUrl={userAvatarUrl} />

      <section className="relative h-[calc(100vh-3.5rem)] overflow-hidden px-6 py-8 lg:px-8 lg:py-10">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(250,250,252,0.96)_0%,rgba(245,248,252,0.92)_100%)]" />
        {pageMode === "edit" ? (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,208,160,0.26),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.9),transparent_58%)]" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(173,206,243,0.28),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.9),transparent_58%)]" />
        )}

        <div className="relative mx-auto flex h-full w-full max-w-[1600px] flex-col">
          <div className="flex flex-col gap-5 border-b border-black/5 pb-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                {pageMode === "edit" ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/[0.06] px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-orange-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                    Editar cotización
                  </div>
                ) : null}
                <h1 className="text-3xl font-normal tracking-[-0.05em] text-foreground sm:text-4xl">
                  {pageMode === "edit" ? (
                    <>
                      {titleStateCode}
                      {titleYearTwo}
                      <span className="text-muted-foreground/70"> — </span>
                      <span className="font-mono text-[1.95rem] tracking-[-0.04em] text-foreground/90">
                        {titleEightDigit}
                      </span>
                    </>
                  ) : (
                    "Nueva cotización"
                  )}
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                  {pageMode === "edit"
                    ? "Modifica cualquier campo y guarda. Se actualizarán los conceptos, totales y el PDF se regenera automáticamente. Los cambios incrementan la versión y actualizan la fecha de edición."
                    : "Una vista más ordenada para capturar emisor, cliente, tránsito y control del documento antes de pasar al cálculo."}
                </p>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 pt-6">
            <div className="h-full overflow-auto pr-1">
              <div className="w-full">
                <QuoteForm
                  mode={pageMode}
                  quoteId={editingId ?? undefined}
                  userName={userName}
                  userEmail={userEmail}
                  initialDraft={hydratedDraft}
                  defaultNextEightDigit={fallbackEightDigit}
                  catalogs={{
                    serviceOptions,
                    equipmentTypeOptions,
                  }}
                  action={actionForForm}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
