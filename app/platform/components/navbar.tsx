import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

const menuItems = [
  { label: "Usuarios", href: "/platform" },
  { label: "Historial", href: "/platform" },
  { label: "Clientes", href: "/platform" },
  { label: "Configuracion", href: "/platform" },
];

type NavbarProps = {
  userName: string;
};

export function Navbar({ userName }: NavbarProps) {
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex min-h-14 w-full max-w-[1600px] items-center justify-between gap-4 px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="rounded-xl">
            <Link href="/platform">
              <PlusIcon data-icon="inline-start" />
              New
            </Link>
          </Button>

          <div className="hidden h-5 w-px bg-border md:block" />

          <nav className="hidden items-center gap-1 md:flex">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-full px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-foreground text-xs font-medium text-background">
            {initials || "U"}
          </div>
          <div className="hidden min-w-0 flex-col sm:flex">
            <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Usuario
            </span>
            <span className="truncate text-xs text-foreground">{userName}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
