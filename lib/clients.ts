import { createClient } from "@/lib/supabase/server";

type ClientRecord = Record<string, unknown>;

export type PlatformClient = {
  id: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  logoUrl: string | null;
  createdAtLabel: string;
};

export type PlatformClientsResult = {
  authorized: boolean;
  clients: PlatformClient[];
  isAdmin: boolean;
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

function formatCreatedAt(record: ClientRecord) {
  const createdAt = pickFirstString(record.created_at, record.createdAt);

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

function mapClient(record: ClientRecord): PlatformClient {
  const id = pickFirstString(record.id) ?? "sin-id";
  const company = pickFirstString(record.company, record.name) ?? "Sin empresa";
  const email = pickFirstString(record.email) ?? "Sin correo";
  const phone = pickFirstString(record.phone) ?? "Sin telefono";
  const country = pickFirstString(record.country) ?? "Sin pais";
  const logoUrl = pickFirstString(record.logo_url, record.logoUrl);

  return {
    id,
    company,
    email,
    phone,
    country,
    logoUrl: logoUrl ?? null,
    createdAtLabel: formatCreatedAt(record),
  };
}

export async function getPlatformClients(): Promise<PlatformClientsResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      authorized: false,
      clients: [],
      isAdmin: false,
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
      clients: [],
      isAdmin: false,
      errorMessage: "No se pudo validar el rol del usuario actual.",
    };
  }

  const isAdmin = profile?.role === "Admin";

  const { data, error } = await supabase.from("clients").select("*");

  if (error) {
    return {
      authorized: false,
      clients: [],
      isAdmin,
      errorMessage: "No se pudo cargar la tabla public.clients.",
    };
  }

  const clients = [...(data ?? [])]
    .sort((left, right) => {
      const leftAt = Date.parse(pickFirstString((left as ClientRecord).created_at) ?? "");
      const rightAt = Date.parse(pickFirstString((right as ClientRecord).created_at) ?? "");

      return Number.isFinite(rightAt) ? rightAt - (Number.isFinite(leftAt) ? leftAt : 0) : 0;
    })
    .map((entry) => mapClient(entry as ClientRecord));

  return {
    authorized: true,
    clients,
    isAdmin,
  };
}

