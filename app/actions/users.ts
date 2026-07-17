"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const inviteRoleSchema = z.enum(["Admin", "Usuario"]);

const inviteRowSchema = z.object({
  email: z.email("Ingresa un correo valido.").trim(),
  password: z
    .string()
    .trim()
    .min(6, "La contrasena debe tener al menos 6 caracteres."),
  role: inviteRoleSchema,
});

const createUsersSchema = z
  .array(
    z.object({
      email: z.string().trim(),
      password: z.string().trim(),
      role: inviteRoleSchema,
    }),
  )
  .transform((rows) =>
    rows.filter((row) => row.email.length > 0 || row.password.length > 0),
  )
  .superRefine((rows, ctx) => {
    if (rows.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Agrega al menos un usuario para continuar.",
      });
      return;
    }

    rows.forEach((row, index) => {
      const parsedRow = inviteRowSchema.safeParse(row);

      if (!parsedRow.success) {
        parsedRow.error.issues.forEach((issue) => {
          ctx.addIssue({
            ...issue,
            path: [index, ...issue.path],
          });
        });
      }
    });
  });

export type CreateUsersActionState = {
  success: boolean;
  message: string;
  createdCount?: number;
};

export async function createUsers(
  rows: Array<{
    email: string;
    password: string;
    role: "Admin" | "Usuario";
  }>,
): Promise<CreateUsersActionState> {
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

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return {
      success: false,
      message: "No se pudo validar el permiso del usuario actual.",
    };
  }

  if (profile?.role !== "Admin") {
    return {
      success: false,
      message: "Solo un administrador puede crear usuarios.",
    };
  }

  const validatedRows = createUsersSchema.safeParse(rows);

  if (!validatedRows.success) {
    return {
      success: false,
      message: validatedRows.error.issues[0]?.message ?? "Revisa los datos del formulario.",
    };
  }

  let adminClient;

  try {
    adminClient = createAdminClient();
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message:
        "Falta configurar SUPABASE_SERVICE_ROLE_KEY en .env.local para crear usuarios.",
    };
  }

  const failures: string[] = [];
  let createdCount = 0;

  for (const row of validatedRows.data) {
    const { error } = await adminClient.auth.admin.createUser({
      email: row.email,
      password: row.password,
      email_confirm: true,
      user_metadata: {
        role: row.role,
      },
    });

    if (error) {
      failures.push(`${row.email}: ${error.message}`);
      continue;
    }

    createdCount += 1;
  }

  if (failures.length > 0) {
    return {
      success: false,
      message: failures[0] ?? "No se pudieron crear los usuarios.",
      createdCount,
    };
  }

  revalidatePath("/platform");
  revalidatePath("/platform/users");

  return {
    success: true,
    message:
      createdCount === 1
        ? "Usuario creado correctamente."
        : `${createdCount} usuarios creados correctamente.`,
    createdCount,
  };
}

export type UpdateUserRoleActionState = {
  success: boolean;
  message: string;
};

const updateUserRoleSchema = z.object({
  userId: z.string().trim().min(1),
  role: inviteRoleSchema,
});

export async function updateUserRole(input: {
  userId: string;
  role: "Admin" | "Usuario";
}): Promise<UpdateUserRoleActionState> {
  const validatedInput = updateUserRoleSchema.safeParse(input);

  if (!validatedInput.success) {
    return {
      success: false,
      message: "Revisa el usuario seleccionado.",
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

  if (validatedInput.data.userId === user.id && validatedInput.data.role !== "Admin") {
    return {
      success: false,
      message: "No puedes quitarte los permisos de administrador desde aqui.",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return {
      success: false,
      message: "No se pudo validar el permiso del usuario actual.",
    };
  }

  if (profile?.role !== "Admin") {
    return {
      success: false,
      message: "Solo un administrador puede modificar roles.",
    };
  }

  let adminClient;

  try {
    adminClient = createAdminClient();
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Falta configurar SUPABASE_SERVICE_ROLE_KEY para administrar usuarios.",
    };
  }

  const { error: updateProfileError } = await adminClient
    .from("profiles")
    .update({ role: validatedInput.data.role })
    .eq("id", validatedInput.data.userId);

  if (updateProfileError) {
    return {
      success: false,
      message: "No se pudo actualizar el rol en public.profiles.",
    };
  }

  const { data: targetUserResult, error: getUserError } =
    await adminClient.auth.admin.getUserById(validatedInput.data.userId);

  if (!getUserError && targetUserResult.user) {
    const existingMetadata =
      (targetUserResult.user.user_metadata as Record<string, unknown> | null) ?? {};

    const { error: updateUserError } = await adminClient.auth.admin.updateUserById(
      validatedInput.data.userId,
      {
        user_metadata: {
          ...existingMetadata,
          role: validatedInput.data.role,
        },
      },
    );

    if (updateUserError) {
      revalidatePath("/platform/users");

      return {
        success: true,
        message:
          "Rol actualizado, pero no se pudo sincronizar el metadata del usuario.",
      };
    }
  }

  revalidatePath("/platform/users");

  return {
    success: true,
    message: "Rol actualizado correctamente.",
  };
}

export type DeleteUserActionState = {
  success: boolean;
  message: string;
};

const deleteUserSchema = z.object({
  userId: z.string().trim().min(1),
});

export async function deleteUser(input: { userId: string }): Promise<DeleteUserActionState> {
  const validatedInput = deleteUserSchema.safeParse(input);

  if (!validatedInput.success) {
    return {
      success: false,
      message: "Revisa el usuario seleccionado.",
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

  if (validatedInput.data.userId === user.id) {
    return {
      success: false,
      message: "No puedes eliminar tu propia cuenta desde aqui.",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return {
      success: false,
      message: "No se pudo validar el permiso del usuario actual.",
    };
  }

  if (profile?.role !== "Admin") {
    return {
      success: false,
      message: "Solo un administrador puede eliminar usuarios.",
    };
  }

  let adminClient;

  try {
    adminClient = createAdminClient();
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Falta configurar SUPABASE_SERVICE_ROLE_KEY para administrar usuarios.",
    };
  }

  const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(
    validatedInput.data.userId,
  );

  const authErrorMessage = deleteAuthError?.message?.toLowerCase() ?? "";
  const authErrorIgnorable =
    authErrorMessage.includes("not found") || authErrorMessage.includes("user not found");

  if (deleteAuthError && !authErrorIgnorable) {
    return {
      success: false,
      message: `No se pudo eliminar el usuario: ${deleteAuthError.message}`,
    };
  }

  const { error: deleteProfileError } = await adminClient
    .from("profiles")
    .delete()
    .eq("id", validatedInput.data.userId);

  if (deleteProfileError) {
    return {
      success: false,
      message:
        "El usuario se elimino de autenticacion, pero fallo al eliminar su perfil en public.profiles.",
    };
  }

  revalidatePath("/platform/users");

  return {
    success: true,
    message: "Usuario eliminado correctamente.",
  };
}
