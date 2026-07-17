"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Building2Icon, CameraIcon, ChevronDownIcon, XIcon } from "lucide-react";

import { createClientRecord, type CreateClientActionState } from "@/app/actions/clients";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type CreateClientDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

type CountryOption = {
  code: string;
  label: string;
  dialCode: string;
  flag: string;
};

type DraftClient = {
  company: string;
  email: string;
  phone: string;
  country: string;
};

const fallbackCountries: CountryOption[] = [
  { code: "MX", label: "Mexico", dialCode: "+52", flag: "🇲🇽" },
  { code: "CN", label: "China", dialCode: "+86", flag: "🇨🇳" },
  { code: "DE", label: "Alemania", dialCode: "+49", flag: "🇩🇪" },
];

const defaultCountry = fallbackCountries[0];
const countriesCatalogUrl =
  "https://cdn.jsdelivr.net/gh/jkaninda/world-countries@master/countries.json";

let cachedCountryOptions: CountryOption[] | null = null;
let countryOptionsPromise: Promise<CountryOption[]> | null = null;

async function loadCountryOptions() {
  if (cachedCountryOptions) {
    return cachedCountryOptions;
  }

  if (!countryOptionsPromise) {
    countryOptionsPromise = fetch(countriesCatalogUrl)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("No se pudo cargar el catalogo de paises.");
        }

        const rawCountries = (await response.json()) as Array<{
          name?: string;
          code?: string;
          dialCode?: string;
          flag?: string;
        }>;

        const regionNames = new Intl.DisplayNames(["es-MX"], { type: "region" });

        const nextCountries = rawCountries
          .filter((country) => country.code && country.dialCode && country.flag)
          .map((country) => ({
            code: country.code as string,
            label:
              regionNames.of(country.code as string) ||
              (country.name as string) ||
              (country.code as string),
            dialCode: country.dialCode as string,
            flag: country.flag as string,
          }))
          .sort((left, right) => left.label.localeCompare(right.label, "es-MX"));

        cachedCountryOptions = nextCountries;
        return nextCountries;
      })
      .catch(() => fallbackCountries);
  }

  return countryOptionsPromise;
}

const emptyDraft: DraftClient = {
  company: "",
  email: "",
  phone: defaultCountry.dialCode,
  country: defaultCountry.label,
};

function getFileExtension(file: File) {
  const nameExt = file.name.split(".").pop()?.toLowerCase();

  if (nameExt && nameExt.length <= 6) {
    return nameExt;
  }

  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

export function CreateClientDrawer({ isOpen, onClose }: CreateClientDrawerProps) {
  const [draft, setDraft] = useState<DraftClient>(emptyDraft);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<CreateClientActionState | null>(null);
  const [isPending, startTransition] = useTransition();
  const [countryOptions, setCountryOptions] = useState<CountryOption[]>(fallbackCountries);
  const [countryCode, setCountryCode] = useState(defaultCountry.code);

  const canSubmit = useMemo(() => {
    return draft.company.trim().length > 1 && !isPending;
  }, [draft.company, isPending]);

  const selectedCountry =
    countryOptions.find((country) => country.code === countryCode) ?? defaultCountry;

  const closeDrawer = useCallback(() => {
    setDraft(emptyDraft);
    setSelectedFile(null);
    setFeedback(null);
    setCountryCode(defaultCountry.code);
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    onClose();
  }, [onClose]);

  useEffect(() => {
    let isCancelled = false;

    void loadCountryOptions().then((countries) => {
      if (!isCancelled) {
        setCountryOptions(countries);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDrawer();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [closeDrawer, isOpen]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChange = (key: keyof DraftClient) => {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setDraft((current) => ({ ...current, [key]: value }));
    };
  };

  const handleCountryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextCode = event.target.value;
    const nextCountry =
      countryOptions.find((country) => country.code === nextCode) ?? defaultCountry;

    setCountryCode(nextCountry.code);
    setDraft((current) => ({
      ...current,
      country: nextCountry.label,
      phone:
        current.phone.trim().length === 0 ||
        countryOptions.some((country) => current.phone.startsWith(country.dialCode))
          ? nextCountry.dialCode
          : current.phone,
    }));
  };

  const handleSelectImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setFeedback(null);

    if (!file) {
      setSelectedFile(null);
      setPreviewUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return null;
      });
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxFileSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setFeedback({ success: false, message: "Usa una imagen JPG, PNG o WEBP." });
      event.target.value = "";
      return;
    }

    if (file.size > maxFileSize) {
      setFeedback({ success: false, message: "La imagen no debe superar 5MB." });
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const clientId = crypto.randomUUID();

      let logoUrl: string | undefined;
      let logoPath: string | undefined;

      if (selectedFile) {
        const supabase = createClient();
        const extension = getFileExtension(selectedFile);
        const path = `${clientId}/logo.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("clients")
          .upload(path, selectedFile, { upsert: true, cacheControl: "3600" });

        if (uploadError) {
          setFeedback({ success: false, message: uploadError.message });
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("clients").getPublicUrl(path);

        logoUrl = `${publicUrl}?v=${Date.now()}`;
        logoPath = path;
      }

      const result = await createClientRecord({
        id: clientId,
        company: draft.company,
        email: draft.email,
        phone: draft.phone,
        country: draft.country,
        logoUrl,
        logoPath,
      });

      setFeedback(result);

      if (!result.success) {
        if (logoPath) {
          const supabase = createClient();
          await supabase.storage.from("clients").remove([logoPath]);
        }

        return;
      }

      setDraft(emptyDraft);
      setSelectedFile(null);
      setPreviewUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return null;
      });
      closeDrawer();
    });
  };

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar panel de clientes"
        onClick={closeDrawer}
        className={cn(
          "fixed inset-0 z-40 bg-black/20 transition-opacity duration-[350ms] ease-in-out",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        aria-hidden={!isOpen}
        className={cn(
          "fixed right-4 top-4 z-50 w-[25.5rem] max-w-[calc(100vw-2rem)] translate-x-[110%] overflow-hidden rounded-[1.75rem] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.16)] transition-transform duration-[350ms] ease-in-out",
          isOpen && "translate-x-0",
        )}
      >
        <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-4">
          <div className="min-w-0">
            <h2 className="text-[1.4rem] font-medium tracking-[-0.05em] text-[#111111]">
              Nuevo cliente
            </h2>
            <p className="mt-1 text-[0.88rem] leading-5 text-[#6f6f68]">
              Guarda empresa y datos de contacto.
            </p>
          </div>

          <button
            type="button"
            onClick={closeDrawer}
            className="inline-flex size-8 items-center justify-center rounded-full text-[#6f6f68] transition-colors hover:bg-black/[0.04] hover:text-[#111111]"
            aria-label="Cerrar"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        <div className="px-3.5 pb-3.5 pt-2">
          <form
            onSubmit={handleSubmit}
            className="mx-auto w-full rounded-[1.5rem] border border-[#e5e7eb] bg-white px-4 py-4.5"
          >
            <div className="flex items-center gap-3">
              <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#e5e7eb] bg-[#f8fafc] text-[#111111]">
                {previewUrl ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url("${previewUrl}")` }}
                    aria-hidden="true"
                  />
                ) : (
                  <Building2Icon className="size-5 text-[#6f6f68]" />
                )}
              </div>

              <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-[#e5e7eb] bg-white px-4 text-[0.84rem] font-medium text-[#111111] transition-colors hover:bg-[#f8fafc]">
                <CameraIcon className="size-3.5" />
                Subir logo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleSelectImage}
                  disabled={isPending}
                />
              </label>
            </div>

            <div className="mt-4 grid gap-2.5">
              <input
                value={draft.company}
                onChange={handleChange("company")}
                type="text"
                placeholder="Empresa"
                className="h-10 w-full rounded-full border border-[#e5e7eb] bg-white px-3.5 text-[0.82rem] text-[#111111] outline-none placeholder:text-[#6f6f68]"
              />

              <div className="grid grid-cols-2 gap-2.5">
                <div className="relative min-w-0">
                  <select
                    value={countryCode}
                    onChange={handleCountryChange}
                    className="h-10 w-full appearance-none rounded-full border border-[#e5e7eb] bg-white pl-11 pr-8 text-[0.82rem] text-[#111111] outline-none"
                  >
                    {countryOptions.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.label} ({country.dialCode})
                      </option>
                    ))}
                  </select>

                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                    <span
                      className="text-base leading-none"
                      aria-label={`Bandera de ${selectedCountry.label}`}
                    >
                      {selectedCountry.flag}
                    </span>
                  </div>

                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#6f6f68]">
                    <ChevronDownIcon className="size-3.5" />
                  </div>
                </div>

                <input
                  value={draft.phone}
                  onChange={handleChange("phone")}
                  type="tel"
                  placeholder={`${selectedCountry.dialCode} Telefono`}
                  className="h-10 min-w-0 rounded-full border border-[#e5e7eb] bg-white px-3.5 text-[0.82rem] text-[#111111] outline-none placeholder:text-[#6f6f68]"
                />
              </div>

              <input
                value={draft.email}
                onChange={handleChange("email")}
                type="email"
                placeholder="Correo"
                className="h-10 w-full rounded-full border border-[#e5e7eb] bg-white px-3.5 text-[0.82rem] text-[#111111] outline-none placeholder:text-[#6f6f68]"
              />
            </div>

            {feedback?.message ? (
              <p
                className={cn(
                  "mt-3 text-[0.78rem]",
                  feedback.success ? "text-emerald-600" : "text-destructive",
                )}
                role="alert"
              >
                {feedback.message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-full bg-[#111111] px-4 text-[0.84rem] font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Guardando..." : "Guardar cliente"}
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
