"use client";

import { useState } from "react";
import { UserPlusIcon } from "lucide-react";

import { CreateClientDrawer } from "@/app/platform/components/CreateClientDrawer";
import { cn } from "@/lib/utils";

type ClientsHeaderActionsProps = {
  count: number;
  className?: string;
};

export function ClientsHeaderActions({ count, className }: ClientsHeaderActionsProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <>
      <div className={cn("flex flex-col gap-2 text-sm text-muted-foreground", className)}>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-black/8 bg-white/70 px-4 text-[0.82rem] font-medium text-foreground shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UserPlusIcon className="size-3.5" />
          Agregar cliente
        </button>

        <p className="text-sm text-muted-foreground">
          {count === 1 ? "1 cliente" : `${count} clientes`}
        </p>
      </div>

      <CreateClientDrawer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </>
  );
}
