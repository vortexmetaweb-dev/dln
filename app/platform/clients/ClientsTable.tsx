"use client";

import { Building2Icon, Globe2Icon, MailIcon, PhoneIcon } from "lucide-react";

import type { PlatformClient } from "@/lib/clients";
import { cn } from "@/lib/utils";

type ClientsTableProps = {
  clients: PlatformClient[];
};

function getCompanyInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? "")
    .join("");
}

export function ClientsTable({ clients }: ClientsTableProps) {
  if (clients.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-[1.75rem] border border-dashed border-black/10 bg-white/65 px-6 text-center backdrop-blur">
        <div className="max-w-md space-y-2">
          <p className="text-lg font-medium text-foreground">Aun no hay clientes.</p>
          <p className="text-sm leading-6 text-muted-foreground">
            Agrega el primer cliente para comenzar a cotizar mas rapido.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-[#d7e2f1] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(248,250,255,0.98)_100%)] shadow-[0_18px_60px_rgba(16,24,40,0.08)] backdrop-blur-xl">
      <div className="border-b border-[#dfe7f3] bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(249,251,255,0.82)_100%)] px-6 py-4">
        <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1.25fr)_7.5rem] items-center gap-4 text-[0.69rem] font-medium uppercase tracking-[0.18em] text-[#6b7280]">
          <span>Empresa</span>
          <span>Contacto</span>
          <span>Alta</span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3">
        {clients.map((client) => (
          <div
            key={client.id}
            className="group grid grid-cols-[minmax(0,1.6fr)_minmax(0,1.25fr)_7.5rem] items-center gap-4 border-b border-[#e8edf5] px-3 py-3.5 transition-colors duration-200 hover:bg-[#f7faff] last:border-b-0"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#d6deeb] bg-[linear-gradient(180deg,#ffffff_0%,#eef4fb_100%)] text-[0.72rem] font-semibold text-[#334155] shadow-[0_3px_12px_rgba(148,163,184,0.18)]">
                {client.logoUrl ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url("${client.logoUrl}")` }}
                    aria-hidden="true"
                  />
                ) : null}
                <span className={client.logoUrl ? "sr-only" : ""}>
                  {getCompanyInitials(client.company) || "C"}
                </span>
              </div>

              <div className="min-w-0 space-y-0.5">
                <p className="truncate text-[0.95rem] font-medium tracking-[-0.02em] text-[#111827]">
                  {client.company}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.78rem] text-[#6b7280]">
                  <span className="inline-flex items-center gap-1.5">
                    <Globe2Icon className="size-3.5 text-[#94a3b8]" />
                    {client.country}
                  </span>
                </div>
              </div>
            </div>

            <div className="min-w-0">
              <div className="grid gap-1.5 text-[0.78rem] text-[#6b7280]">
                <div className="inline-flex min-w-0 items-center gap-1.5">
                  <MailIcon className="size-3.5 text-[#94a3b8]" />
                  <span className="truncate">{client.email}</span>
                </div>
                <div className="inline-flex min-w-0 items-center gap-1.5">
                  <PhoneIcon className="size-3.5 text-[#94a3b8]" />
                  <span className="truncate">{client.phone}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center text-[0.82rem] text-[#6b7280]">
              {client.createdAtLabel}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-[#e8edf5] bg-white/65 px-6 py-3">
        <div className="flex items-center gap-2 text-[0.78rem] text-[#6b7280]">
          <Building2Icon className="size-3.5 text-[#94a3b8]" />
          <span className={cn("truncate")}>Clientes guardados en public.clients</span>
        </div>
      </div>
    </div>
  );
}

