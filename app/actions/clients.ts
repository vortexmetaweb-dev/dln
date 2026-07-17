"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const createClientSchema = z.object({
  id: z.string().uuid(),
  company: z.string().trim().min(2, "Ingresa el nombre de la empresa."),
  email: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null))
    .refine((value) => !value || z.email().safeParse(value).success, {
      message: "Ingresa un correo valido.",
    }),
  phone: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
  country: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
  logoUrl: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
  logoPath: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
});

export type CreateClientActionState = {
  success: boolean;
  message: string;
};

export async function createClientRecord(input: {
  id: string;
  company: string;
  email?: string;
  phone?: string;
  country?: string;
  logoUrl?: string;
  logoPath?: string;
}): Promise<CreateClientActionState> {
  const validatedInput = createClientSchema.safeParse(input);

  if (!validatedInput.success) {
    return {
      success: false,
      message:
        validatedInput.error.issues[0]?.message ?? "Revisa los datos del formulario.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      message: "Tu sesion no es valida. Vuelve a iniciar sesion.",
    };
  }

  const payload = validatedInput.data;

  const { error: insertError } = await supabase.from("clients").insert({
    id: payload.id,
    company: payload.company,
    email: payload.email,
    phone: payload.phone,
    country: payload.country,
    logo_url: payload.logoUrl,
    logo_path: payload.logoPath,
    created_by: user.id,
  });

  if (insertError) {
    return {
      success: false,
      message: "No se pudo guardar el cliente.",
    };
  }

  revalidatePath("/platform/clients");

  return {
    success: true,
    message: "Cliente creado correctamente.",
  };
}
