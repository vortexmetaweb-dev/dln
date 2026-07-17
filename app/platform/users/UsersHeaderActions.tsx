"use client";

import { useState } from "react";
import { UserPlusIcon } from "lucide-react";

import { CreateUserDrawer } from "@/app/platform/components/CreateUserDrawer";
import { cn } from "@/lib/utils";

type UsersHeaderActionsProps = {
  count: number;
  className?: string;
};

export function UsersHeaderActions({ count, className }: UsersHeaderActionsProps) {
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);

  return (
    <>
      <div className={cn("flex items-center justify-end gap-4 text-sm text-muted-foreground", className)}>
        <p className="text-sm text-muted-foreground">
          {count === 1 ? "1 resultado" : `${count} resultados`}
        </p>

        <button
          type="button"
          onClick={() => setIsCreateUserOpen(true)}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 text-[0.82rem] font-medium text-foreground shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-colors hover:bg-black/[0.02]"
        >
          <UserPlusIcon className="size-3.5" />
          Agregar
        </button>
      </div>

      <CreateUserDrawer
        isOpen={isCreateUserOpen}
        onClose={() => setIsCreateUserOpen(false)}
      />
    </>
  );
}
