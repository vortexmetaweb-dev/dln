import { createClient } from "@/lib/supabase/server";

type ServiceRecord = Record<string, unknown>;

export type PlatformServiceOption = {
  id: string;
  name: string;
};

function pickFirstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

function mapService(record: ServiceRecord): PlatformServiceOption | null {
  const id = pickFirstString(record.id);
  const name = pickFirstString(record.name);

  if (!id || !name) {
    return null;
  }

  return { id, name };
}

export async function getPlatformServices() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("services").select("id, name").order("name");

  if (error) {
    return [];
  }

  return (data ?? [])
    .map((entry) => mapService(entry as ServiceRecord))
    .filter((entry): entry is PlatformServiceOption => entry !== null);
}
