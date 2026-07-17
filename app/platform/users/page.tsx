import { redirect } from "next/navigation";
import { ShieldCheckIcon } from "lucide-react";

import { Hore } from "@/app/platform/components/hore";
import { Navbar } from "@/app/platform/components/navbar";
import { UsersHeaderActions } from "@/app/platform/users/UsersHeaderActions";
import { UsersTable } from "@/app/platform/users/UsersTable";
import { getPlatformUsers } from "@/lib/profiles";
import { createClient } from "@/lib/supabase/server";

export default async function PlatformUsersPage() {
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

  const usersResult = await getPlatformUsers();

  return (
    <main className="h-screen overflow-hidden bg-background text-foreground">
      <Navbar userName={userName} userAvatarUrl={userAvatarUrl} />

      <section className="relative h-[calc(100vh-3.5rem)] overflow-hidden px-6 py-8 lg:px-8 lg:py-10">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(250,250,252,0.96)_0%,rgba(245,248,252,0.92)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(173,206,243,0.28),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.9),transparent_58%)]" />

        <div className="relative mx-auto flex h-full w-full max-w-6xl flex-col">
          <div className="flex flex-col gap-3 border-b border-black/5 pb-5">

            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-normal tracking-[-0.05em] text-foreground sm:text-4xl">
                  Usuarios
                </h1>
              </div>

              {usersResult.authorized ? (
                <UsersHeaderActions
                  count={usersResult.users.length}
                  className="items-start lg:items-center lg:text-right"
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Acceso restringido al listado completo
                </p>
              )}
            </div>
          </div>

          <div className="min-h-0 flex-1 pt-6">
            {usersResult.authorized ? (
              <UsersTable users={usersResult.users} currentUserId={user.id} />
            ) : (
              <div className="flex h-full items-center justify-center rounded-[1.75rem] border border-black/6 bg-white/75 px-6 text-center shadow-[0_20px_80px_rgba(15,23,42,0.05)] backdrop-blur">
                <div className="max-w-lg space-y-3">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-black/8 bg-black/[0.03]">
                    <ShieldCheckIcon className="size-5 text-foreground" />
                  </div>
                  <p className="text-lg font-medium text-foreground">
                    No se pudo mostrar el listado completo
                  </p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {usersResult.errorMessage ??
                      "Verifica que tu cuenta tenga rol Admin y que la tabla profiles este disponible."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-6 right-6 z-10 w-[min(100%,22rem)] max-sm:left-6 max-sm:right-6 lg:bottom-8 lg:right-8">
          <Hore />
        </div>
      </section>
    </main>
  );
}
