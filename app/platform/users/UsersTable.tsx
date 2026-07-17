"use client";

import { useMemo, useState, useTransition, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { ChevronDownIcon } from "lucide-react";

import { deleteUser, updateUserRole } from "@/app/actions/users";
import type { PlatformUser } from "@/lib/profiles";
import { cn } from "@/lib/utils";

type UserRole = "Admin" | "Usuario";

type Feedback = {
  success: boolean;
  message: string;
};

type UsersTableProps = {
  users: PlatformUser[];
  currentUserId: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? "")
    .join("");
}

function normalizeRole(role: string): UserRole {
  return role === "Admin" ? "Admin" : "Usuario";
}

function getRoleMeta(role: UserRole) {
  if (role === "Admin") {
    return {
      label: "ADMIN",
      className:
        "border-emerald-200/80 bg-emerald-50 text-emerald-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]",
    };
  }

  return {
    label: "USUARIO",
    className:
      "border-rose-200/80 bg-rose-50 text-rose-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]",
  };
}

function getStatusMeta(status: string) {
  const normalized = status.trim().toLowerCase();

  if (normalized === "activo") {
    return {
      label: "Activo",
      dotClassName: "bg-emerald-500",
      badgeClassName:
        "border-emerald-200/80 bg-emerald-50 text-emerald-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]",
    };
  }

  if (normalized === "ausente") {
    return {
      label: "Ausente",
      dotClassName: "bg-amber-500",
      badgeClassName:
        "border-amber-200/80 bg-amber-50 text-amber-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]",
    };
  }

  if (normalized === "inactivo") {
    return {
      label: "Inactivo",
      dotClassName: "bg-slate-400",
      badgeClassName:
        "border-slate-200/90 bg-slate-100/90 text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]",
    };
  }

  return {
    label: status,
    dotClassName: "bg-slate-400",
    badgeClassName:
      "border-slate-200/90 bg-slate-100/90 text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]",
  };
}

export function UsersTable({ users, currentUserId }: UsersTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

  const initialRoles = useMemo(() => {
    return Object.fromEntries(users.map((entry) => [entry.id, normalizeRole(entry.role)]));
  }, [users]);

  const [roles, setRoles] = useState<Record<string, UserRole>>(() => initialRoles);

  const handleRoleChange = (userId: string) => {
    return (event: ChangeEvent<HTMLSelectElement>) => {
      const nextRole = normalizeRole(event.target.value);
      const previousRole = roles[userId] ?? normalizeRole(users.find((u) => u.id === userId)?.role ?? "Usuario");

      setFeedback(null);
      setRoles((current) => ({ ...current, [userId]: nextRole }));

      startTransition(async () => {
        setActiveUserId(userId);
        const result = await updateUserRole({ userId, role: nextRole });
        setFeedback(result);
        setActiveUserId(null);

        if (!result.success) {
          setRoles((current) => ({ ...current, [userId]: previousRole }));
          return;
        }

        router.refresh();
      });
    };
  };

  const handleDelete = (userId: string) => {
    const entry = users.find((user) => user.id === userId);
    const label = entry?.email ?? entry?.name ?? "este usuario";

    if (!window.confirm(`Eliminar ${label}? Esta accion no se puede deshacer.`)) {
      return;
    }

    setFeedback(null);

    startTransition(async () => {
      setActiveUserId(userId);
      const result = await deleteUser({ userId });
      setFeedback(result);
      setActiveUserId(null);

      if (!result.success) {
        return;
      }

      router.refresh();
    });
  };

  if (users.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-[1.75rem] border border-dashed border-black/10 bg-white/65 px-6 text-center backdrop-blur">
        <div className="max-w-md space-y-2">
          <p className="text-lg font-medium text-foreground">Aun no hay perfiles listados.</p>
          <p className="text-sm leading-6 text-muted-foreground">
            Usa el boton de agregar usuario para invitar el primer perfil.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {feedback?.message ? (
        <div className="mb-3 rounded-xl border border-black/10 bg-white px-4 py-3">
          <p
            className={cn(
              "text-sm",
              feedback.success ? "text-emerald-700" : "text-destructive",
            )}
            role="alert"
          >
            {feedback.message}
          </p>
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-black/10 bg-white">
        <div className="h-full overflow-auto">
          <table className="min-w-full table-fixed text-sm">
            <colgroup>
              <col className="w-12" />
              <col className="w-[28%]" />
              <col className="w-[26%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[16%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
            </colgroup>
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-black/10 text-xs text-muted-foreground">
                <th className="px-4 py-4 text-left font-medium">
                  <input
                    type="checkbox"
                    aria-label="Seleccionar todos"
                    checked={users.length > 0 && users.every((user) => selectedIds[user.id])}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setSelectedIds(() =>
                        Object.fromEntries(users.map((user) => [user.id, checked])),
                      );
                    }}
                    className="size-4 rounded border-black/20 accent-foreground"
                  />
                </th>
                <th className="px-4 py-4 text-left font-medium">Nombre</th>
                <th className="px-4 py-4 text-left font-medium">Email</th>
                <th className="px-4 py-4 text-left font-medium">Rol</th>
                <th className="px-4 py-4 text-left font-medium">Fecha alta</th>
                <th className="px-4 py-4 text-left font-medium">Ultima vez</th>
                <th className="px-4 py-4 text-left font-medium">Estado</th>
                <th className="px-4 py-4 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {users.map((entry) => {
                const roleValue = roles[entry.id] ?? normalizeRole(entry.role);
                const roleMeta = getRoleMeta(roleValue);
                const isRowPending = isPending && activeUserId === entry.id;
                const isSelf = entry.id === currentUserId;
                const statusMeta = getStatusMeta(entry.status);

                return (
                  <tr key={entry.id} className="bg-white">
                    <td className="px-4 py-4 align-middle">
                      <input
                        type="checkbox"
                        aria-label={`Seleccionar ${entry.name}`}
                        checked={Boolean(selectedIds[entry.id])}
                        onChange={(event) => {
                          const checked = event.target.checked;
                          setSelectedIds((current) => ({ ...current, [entry.id]: checked }));
                        }}
                        className="size-4 rounded border-black/20 accent-foreground"
                      />
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <div className="flex min-w-0 items-center gap-3">
                        {entry.avatarUrl ? (
                          <div className="size-10 shrink-0 overflow-hidden rounded-full bg-black/[0.06]">
                            <img
                              src={entry.avatarUrl}
                              alt={`Avatar de ${entry.name}`}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-black/[0.06] text-xs font-medium text-foreground">
                            {getInitials(entry.name) || "U"}
                          </div>
                        )}
                        <p className="truncate text-sm font-medium text-foreground">{entry.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <p className="truncate text-sm text-muted-foreground">{entry.email}</p>
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <div className="relative inline-flex w-full max-w-[10rem] items-center">
                        <select
                          value={roleValue}
                          disabled={isRowPending || isSelf}
                          onChange={handleRoleChange(entry.id)}
                          className={cn(
                            "h-8 w-full appearance-none rounded-full border px-3 pr-8 text-xs font-semibold uppercase tracking-wide outline-none transition-colors focus:border-[#8ab4f8] focus:bg-white disabled:cursor-not-allowed disabled:opacity-60",
                            roleMeta.className,
                          )}
                        >
                          <option value="Admin">ADMIN</option>
                          <option value="Usuario">USUARIO</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-current opacity-70">
                          <ChevronDownIcon className="size-3.5" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <p className="text-sm text-foreground">{entry.createdAtLabel}</p>
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <p className="text-sm text-muted-foreground">{entry.lastActiveLabel}</p>
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <span
                        className={cn(
                          "inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium",
                          statusMeta.badgeClassName,
                        )}
                      >
                        {statusMeta.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-middle text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(entry.id)}
                        disabled={isRowPending || isSelf}
                        className="inline-flex h-9 items-center justify-center rounded-full border border-red-200 px-5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
