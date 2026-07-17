"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { PlusIcon, UserPlusIcon } from "lucide-react";

import { Configuracion } from "./configuracion";
import { CreateUserDrawer } from "./CreateUserDrawer";
import { Button } from "@/components/ui/button";

const menuItems = [
  { label: "Usuarios", href: "/platform/users" },
  { label: "Historial", href: "/platform" },
  { label: "Clientes", href: "/platform/clients" },
];

type NavbarProps = {
  userName: string;
  userAvatarUrl?: string;
};

export function Navbar({ userName, userAvatarUrl }: NavbarProps) {
  const pathname = usePathname();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(userAvatarUrl ?? "");

  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <>
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex min-h-12 w-full max-w-[1600px] items-center justify-between gap-3 px-3 lg:px-5">
          <div className="flex items-center gap-1.5">
            <Button asChild size="sm" className="rounded-xl">
              <Link href="/platform/new">
                <PlusIcon data-icon="inline-start" />
                New
              </Link>
            </Button>

            <div className="hidden h-4 w-px bg-border md:block" />

            <nav className="hidden items-center gap-0.5 md:flex">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={[
                    "rounded-full px-2.5 py-1 text-xs transition-colors",
                    pathname === item.href
                      ? "bg-foreground text-background"
                      : "text-foreground hover:bg-muted",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="inline-flex size-7 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
              aria-label="Agregar usuario"
              onClick={() => setIsCreateUserOpen(true)}
            >
              <UserPlusIcon className="size-3.5" />
            </button>
            <div className="relative flex size-7 items-center justify-center overflow-hidden rounded-full bg-foreground text-[10px] font-medium text-background ring-1 ring-black/5">
              {avatarUrl ? (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url("${avatarUrl}")` }}
                  aria-hidden="true"
                />
              ) : null}
              <span className={avatarUrl ? "sr-only" : ""}>{initials || "U"}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsConfigOpen(true)}
              className="hidden min-w-0 flex-col rounded-lg px-2 py-1 text-left transition-colors hover:bg-muted sm:flex"
              aria-label="Abrir configuracion del usuario"
            >
              <span className="truncate text-[11px] text-foreground">{userName}</span>
            </button>
          </div>
        </div>
      </header>

      <Configuracion
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onAvatarChange={setAvatarUrl}
      />

      <CreateUserDrawer
        isOpen={isCreateUserOpen}
        onClose={() => setIsCreateUserOpen(false)}
      />
    </>
  );
}
