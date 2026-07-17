import { createClient } from "@/lib/supabase/server";

type EquipmentTypeRecord = Record<string, unknown>;

export type PlatformEquipmentTypeOption = {
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

function mapEquipmentType(record: EquipmentTypeRecord): PlatformEquipmentTypeOption | null {
  const id = pickFirstString(record.id);
  const name = pickFirstString(record.name);

  if (!id || !name) {
    return null;
  }

  return { id, name };
}

export async function getPlatformEquipmentTypes() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("equipment_types").select("id, name").order("name");

  if (error) {
    return [];
  }

  return (data ?? [])
    .map((entry) => mapEquipmentType(entry as EquipmentTypeRecord))
    .filter((entry): entry is PlatformEquipmentTypeOption => entry !== null);
}
