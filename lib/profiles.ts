import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

type ProfileRecord = Record<string, unknown>;

export type PlatformUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAtLabel: string;
  lastActiveLabel: string;
  avatarUrl: string;
};

export type PlatformUsersResult = {
  authorized: boolean;
  users: PlatformUser[];
  errorMessage?: string;
};

function pickFirstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

function getCreatedAtTimestamp(profile: ProfileRecord) {
  const createdAt = pickFirstString(
    profile.created_at,
    profile.createdAt,
    profile.inserted_at,
  );

  if (!createdAt) {
    return 0;
  }

  const timestamp = Date.parse(createdAt);

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function formatCreatedAt(profile: ProfileRecord) {
  const createdAt = pickFirstString(
    profile.created_at,
    profile.createdAt,
    profile.inserted_at,
  );

  if (!createdAt) {
    return "Sin fecha";
  }

  const parsedDate = new Date(createdAt);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

function formatLastActive(value?: string | null) {
  if (!value) {
    return "Sin actividad";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Sin actividad";
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
}

function normalizeStatusLabel(value: string | null) {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if (
    normalized === "activo" ||
    normalized === "active" ||
    normalized === "habilitado" ||
    normalized === "enabled"
  ) {
    return "Activo";
  }

  if (
    normalized === "inactivo" ||
    normalized === "inactive" ||
    normalized === "deshabilitado" ||
    normalized === "disabled" ||
    normalized === "baneado" ||
    normalized === "blocked"
  ) {
    return "Inactivo";
  }

  return null;
}

function isAuthUserInactive(authUser: User | null) {
  if (!authUser) {
    return false;
  }

  if (authUser.deleted_at) {
    return true;
  }

  if (!authUser.banned_until) {
    return false;
  }

  const bannedUntil = Date.parse(authUser.banned_until);

  return Number.isFinite(bannedUntil) && bannedUntil > Date.now();
}

function getProfileStatus(profile: ProfileRecord, authUser: User | null) {
  const explicitStatus = normalizeStatusLabel(
    pickFirstString(profile.status, profile.state, profile.stage),
  );

  if (explicitStatus) {
    return explicitStatus;
  }

  return isAuthUserInactive(authUser) ? "Inactivo" : "Activo";
}

function getAvatarUrl(profile: ProfileRecord, authUser: User | null) {
  const authMetadata = (authUser?.user_metadata ?? {}) as Record<string, unknown>;

  return (
    pickFirstString(
      profile.avatar_url,
      profile.avatarUrl,
      authMetadata.avatar_url,
      authMetadata.picture,
      authMetadata.photo_url,
    ) ?? ""
  );
}

function mapProfile(profile: ProfileRecord, authUser: User | null): PlatformUser {
  const email = pickFirstString(profile.email) ?? "Sin correo";
  const id = pickFirstString(profile.id, profile.email) ?? "sin-id";
  const role = pickFirstString(profile.role, profile.user_role) ?? "Usuario";
  const status = getProfileStatus(profile, authUser);
  const name =
    pickFirstString(
      profile.full_name,
      profile.name,
      profile.display_name,
      profile.username,
    ) ?? email;

  return {
    id,
    name,
    email,
    role,
    status,
    createdAtLabel: formatCreatedAt(profile),
    lastActiveLabel: formatLastActive(authUser?.last_sign_in_at),
    avatarUrl: getAvatarUrl(profile, authUser),
  };
}

export async function getPlatformUsers(): Promise<PlatformUsersResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      authorized: false,
      users: [],
      errorMessage: "Tu sesion no es valida. Vuelve a iniciar sesion.",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return {
      authorized: false,
      users: [],
      errorMessage: "No se pudo validar el rol del usuario actual.",
    };
  }

  if (profile?.role !== "Admin") {
    return {
      authorized: false,
      users: [],
      errorMessage: "Solo un administrador puede ver el listado completo.",
    };
  }

  let adminClient;

  try {
    adminClient = createAdminClient();
  } catch (error) {
    console.error(error);

    return {
      authorized: false,
      users: [],
      errorMessage:
        "Falta configurar SUPABASE_SERVICE_ROLE_KEY para consultar perfiles.",
    };
  }

  const { data, error } = await adminClient.from("profiles").select("*");

  if (error) {
    return {
      authorized: false,
      users: [],
      errorMessage: "No se pudo cargar la tabla public.profiles.",
    };
  }

  const { data: authUsersData, error: authUsersError } =
    await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

  if (authUsersError) {
    console.error("No se pudo consultar auth.admin.listUsers:", authUsersError.message);
  }

  const authUsersById = new Map(
    (authUsersData?.users ?? []).map((authUser) => [authUser.id, authUser]),
  );

  const users = [...(data ?? [])]
    .sort(
      (left, right) =>
        getCreatedAtTimestamp(right as ProfileRecord) -
        getCreatedAtTimestamp(left as ProfileRecord),
    )
    .map((entry) => {
      const profile = entry as ProfileRecord;
      const profileId = pickFirstString(profile.id, profile.email) ?? "";

      return mapProfile(profile, authUsersById.get(profileId) ?? null);
    });

  return {
    authorized: true,
    users,
  };
}
