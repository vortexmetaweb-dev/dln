"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  CalendarDaysIcon,
  CameraIcon,
  Clock3Icon,
  MapPinIcon,
  MailIcon,
  PhoneIcon,
  ShieldCheckIcon,
  XIcon,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type ConfiguracionProps = {
  isOpen: boolean;
  onClose: () => void;
  onAvatarChange?: (avatarUrl: string) => void;
};

type AuthProfile = {
  fullName: string;
  statusLabel: string;
  avatarUrl: string;
  stage: string;
  state: string;
  email: string;
  phone: string;
  birthday: string;
  location: string;
  experience: string;
  addedDate: string;
  role: string;
  createdAt: string;
  lastSignIn: string;
};

const emptyProfile: AuthProfile = {
  fullName: "",
  statusLabel: "",
  avatarUrl: "",
  stage: "",
  state: "",
  email: "",
  phone: "",
  birthday: "",
  location: "",
  experience: "",
  addedDate: "",
  role: "",
  createdAt: "",
  lastSignIn: "",
};

function formatShortDate(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getMetadataValue(
  metadata: Record<string, unknown> | undefined,
  keys: string[],
) {
  for (const key of keys) {
    const value = metadata?.[key];

    if (typeof value === "string") {
      return value;
    }
  }

  return "";
}

export function Configuracion({
  isOpen,
  onClose,
  onAvatarChange,
}: ConfiguracionProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [profile, setProfile] = useState<AuthProfile>(emptyProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isCancelled = false;

    const loadUser = async () => {
      setIsLoading(true);

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (isCancelled) {
        return;
      }

      if (!user) {
        setProfile(emptyProfile);
        setIsLoading(false);
        return;
      }

      const metadata = user.user_metadata as Record<string, unknown> | undefined;
      const appMetadata = user.app_metadata as Record<string, unknown> | undefined;

      setProfile({
        fullName:
          getMetadataValue(metadata, ["full_name", "name", "display_name"]) ||
          user.email ||
          "",
        statusLabel:
          getMetadataValue(metadata, ["status_label", "status"]) ||
          (user.email_confirmed_at ? "Usuario Activo" : ""),
        avatarUrl: getMetadataValue(metadata, ["avatar_url", "picture", "photo_url"]),
        stage: getMetadataValue(metadata, ["stage"]),
        state:
          getMetadataValue(metadata, ["state"]) ||
          (user.email_confirmed_at ? "Completed" : ""),
        email: user.email ?? "",
        phone: user.phone ?? getMetadataValue(metadata, ["phone", "mobile_phone"]),
        birthday: getMetadataValue(metadata, ["birthday", "birthdate", "dob"]),
        location: getMetadataValue(metadata, ["location", "city", "country"]),
        experience: getMetadataValue(metadata, ["experience"]),
        addedDate: formatShortDate(user.created_at),
        role:
          getMetadataValue(metadata, ["role"]) ||
          getMetadataValue(appMetadata, ["role"]),
        createdAt: formatDateTime(user.created_at),
        lastSignIn: formatDateTime(user.last_sign_in_at),
      });
      setIsLoading(false);
    };

    void loadUser();

    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

  const profileDetails = useMemo(
    () => [
      {
        label: "Email",
        value: profile.email,
        icon: MailIcon,
      },
      {
        label: "Número de teléfono",
        value: profile.phone,
        icon: PhoneIcon,
      },
      {
        label: "Fecha de nacimiento",
        value: profile.birthday,
        icon: CalendarDaysIcon,
      },
      {
        label: "Ubicación",
        value: profile.location,
        icon: MapPinIcon,
      },
      {
        label: "Experiencia",
        value: profile.experience,
        icon: Clock3Icon,
      },
      {
        label: "Rol",
        value: profile.role,
        icon: ShieldCheckIcon,
      },
    ],
    [profile],
  );

  const profileImageSrc = previewUrl || profile.avatarUrl || "";

  const handleSelectPhoto = () => {
    if (isUploading) {
      return;
    }

    inputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxFileSize = 5 * 1024 * 1024;

    setUploadMessage(null);
    setUploadError(null);

    if (!allowedTypes.includes(file.type)) {
      setUploadError("Usa una imagen JPG, PNG o WEBP.");
      event.target.value = "";
      return;
    }

    if (file.size > maxFileSize) {
      setUploadError("La imagen no debe superar 5MB.");
      event.target.value = "";
      return;
    }

    const localPreview = URL.createObjectURL(file);

    setPreviewUrl((currentPreview) => {
      if (currentPreview) {
        URL.revokeObjectURL(currentPreview);
      }

      return localPreview;
    });

    setIsUploading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: getUserError,
      } = await supabase.auth.getUser();

      if (getUserError || !user) {
        throw new Error("No se pudo validar tu sesion.");
      }

      const currentAvatarPath =
        getMetadataValue(
          user.user_metadata as Record<string, unknown> | undefined,
          ["avatar_path"],
        ) || "";

      const fileExtension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filePath = `${user.id}/avatar.${fileExtension}`;

      if (currentAvatarPath && currentAvatarPath !== filePath) {
        await supabase.storage.from("avatar").remove([currentAvatarPath]);
      }

      const { error: uploadStorageError } = await supabase.storage
        .from("avatar")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadStorageError) {
        throw uploadStorageError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatar").getPublicUrl(filePath);

      const versionedPublicUrl = `${publicUrl}?v=${Date.now()}`;

      const { error: updateUserError } = await supabase.auth.updateUser({
        data: {
          avatar_url: versionedPublicUrl,
          avatar_path: filePath,
        },
      });

      if (updateUserError) {
        throw updateUserError;
      }

      setProfile((current) => ({
        ...current,
        avatarUrl: versionedPublicUrl,
      }));
      onAvatarChange?.(versionedPublicUrl);

      setPreviewUrl((currentPreview) => {
        if (currentPreview) {
          URL.revokeObjectURL(currentPreview);
        }

        return null;
      });

      setUploadMessage("Foto de perfil actualizada.");
    } catch (error) {
      console.error(error);

      setPreviewUrl((currentPreview) => {
        if (currentPreview) {
          URL.revokeObjectURL(currentPreview);
        }

        return null;
      });

      setUploadError(
        error instanceof Error
          ? error.message
          : "No se pudo subir la foto de perfil.",
      );
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar panel de configuracion"
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-white/45 backdrop-blur-[2px] transition-opacity duration-[350ms] ease-in-out",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        aria-hidden={!isOpen}
        className={cn(
          "fixed right-4 top-4 z-50 w-[min(26rem,calc(100vw-2rem))] translate-x-[110%] overflow-hidden rounded-[1.75rem] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.24)] transition-transform duration-[350ms] ease-in-out",
          isOpen && "translate-x-0",
        )}
      >
        <div className="flex items-center justify-end px-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 items-center justify-center rounded-full bg-black/[0.03] text-slate-500 transition-colors hover:bg-black/[0.06] hover:text-slate-900"
            aria-label="Cerrar"
          >
            <XIcon className="size-4.5" />
          </button>
        </div>

        <div className="px-4 pb-4 pt-1">
          <div className="rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(248,250,252,0.94)_0%,rgba(255,255,255,1)_52%)] px-4 py-4 ring-1 ring-black/5 sm:px-5">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="relative flex size-16 items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-1 ring-black/5 sm:size-18">
                  {profileImageSrc ? (
                    <img
                      src={profileImageSrc}
                      alt="Foto de perfil"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-medium text-slate-500">
                      {profile.fullName
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((chunk) => chunk[0]?.toUpperCase() ?? "")
                        .join("") || "U"}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSelectPhoto}
                  disabled={isUploading}
                  className="absolute -bottom-1 -right-1 inline-flex size-8 items-center justify-center rounded-full bg-slate-950 text-white shadow-[0_12px_30px_rgba(15,23,42,0.22)] transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <CameraIcon className="size-3" />
                </button>
              </div>

              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />

              <div className="min-w-0 flex-1">
                <h2 className="truncate text-[1.15rem] font-medium tracking-[-0.05em] text-slate-950 sm:text-[1.25rem]">
                  {isLoading ? "Cargando..." : profile.fullName || " "}
                </h2>
                <p className="mt-0.5 min-h-4 text-xs text-slate-500">
                  {profile.statusLabel || " "}
                </p>
                {isUploading ? (
                  <p className="mt-1 text-xs text-slate-500">Subiendo foto...</p>
                ) : null}
                {!isUploading && uploadMessage ? (
                  <p className="mt-1 text-xs text-emerald-600">{uploadMessage}</p>
                ) : null}
                {!isUploading && uploadError ? (
                  <p className="mt-1 text-xs text-red-500">{uploadError}</p>
                ) : null}
              </div>
            </div>

            <div className="mt-4 border-b border-slate-200/80 pb-4">
              <div className="mb-3">
                <p className="text-[0.72rem] uppercase tracking-[0.26em] text-slate-400">
                 Datos Personales
                </p>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {profileDetails.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="flex min-w-0 items-start gap-2"
                    >
                      <div className="pt-0.5 text-slate-400">
                        <Icon className="size-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[0.68rem] uppercase tracking-[0.14em] text-slate-400">
                          {item.label}
                        </p>
                        <p className="mt-0.5 line-clamp-2 break-words text-sm leading-4.5 font-medium text-slate-900">
                          {item.value || " "}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-[0.72rem] uppercase tracking-[0.26em] text-slate-400">
                Actividad
              </p>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 px-3 py-3 ring-1 ring-black/5">
                  <div className="text-[0.68rem] uppercase tracking-[0.14em] text-slate-400">
                    Cuenta creada
                  </div>
                  <div className="mt-1.5 text-sm font-medium leading-5 text-slate-900">
                    {profile.createdAt || " "}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 px-3 py-3 ring-1 ring-black/5">
                  <div className="text-[0.68rem] uppercase tracking-[0.14em] text-slate-400">
                    Ultimo acceso
                  </div>
                  <div className="mt-1.5 text-sm font-medium leading-5 text-slate-900">
                    {profile.lastSignIn || " "}
                  </div>
                </div>

                <div className="col-span-2 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-black/5">
                  <div className="grid gap-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-slate-500">Fecha de creacion</p>
                      <p className="min-h-5 text-right text-sm font-medium text-slate-900">
                        {profile.addedDate || " "}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-slate-500">Rol</p>
                      <p className="min-h-5 text-right text-sm font-medium text-slate-900">
                        {profile.role || " "}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
