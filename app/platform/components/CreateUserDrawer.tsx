"use client";

import {
  useCallback,
  useEffect,
  useState,
  useTransition,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { ChevronDownIcon, PlusIcon, XIcon } from "lucide-react";

import { createUsers, type CreateUsersActionState } from "@/app/actions/users";
import { cn } from "@/lib/utils";

type CreateUserDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

type InviteRole = "Admin" | "Usuario";

type InviteRow = {
  id: string;
  email: string;
  password: string;
  role: InviteRole;
};

function getEmptyRow(index: number): InviteRow {
  return {
    id: `invite-${index}`,
    email: "",
    password: "",
    role: "Usuario",
  };
}

const initialRows: InviteRow[] = [getEmptyRow(1)];

export function CreateUserDrawer({
  isOpen,
  onClose,
}: CreateUserDrawerProps) {
  const [rows, setRows] = useState<InviteRow[]>(initialRows);
  const [feedback, setFeedback] = useState<CreateUsersActionState | null>(null);
  const [isPending, startTransition] = useTransition();

  const closeDrawer = useCallback(() => {
    setRows(initialRows);
    setFeedback(null);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDrawer();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [closeDrawer, isOpen]);

  const handleEmailChange = (id: string) => {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;

      setRows((current) =>
        current.map((row) => (row.id === id ? { ...row, email: value } : row)),
      );
    };
  };

  const handlePasswordChange = (id: string) => {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;

      setRows((current) =>
        current.map((row) =>
          row.id === id ? { ...row, password: value } : row,
        ),
      );
    };
  };

  const handleRoleChange = (id: string) => {
    return (event: ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value as InviteRole;

      setRows((current) =>
        current.map((row) => (row.id === id ? { ...row, role: value } : row)),
      );
    };
  };

  const handleAddAnother = () => {
    setRows((current) => [
      ...current,
      getEmptyRow(current.length + 1),
    ]);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const result = await createUsers(
        rows.map(({ email, password, role }) => ({
          email,
          password,
          role,
        })),
      );

      setFeedback(result);

      if (result.success) {
        closeDrawer();
      }
    });
  };

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar panel de invitaciones"
        onClick={closeDrawer}
        className={cn(
          "fixed inset-0 z-40 bg-black/20 transition-opacity duration-[350ms] ease-in-out",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        aria-hidden={!isOpen}
        className={cn(
          "fixed right-4 top-4 z-50 w-[24.5rem] max-w-[calc(100vw-2rem)] translate-x-[110%] overflow-hidden rounded-[1.75rem] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.16)] transition-transform duration-[350ms] ease-in-out",
          isOpen && "translate-x-0",
        )}
      >
        <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-4">
          <div className="min-w-0">
            <h2 className="text-[1.55rem] font-medium tracking-[-0.05em] text-[#111111]">
              Añadir Usuarios
            </h2>
            <p className="mt-1 text-[0.88rem] leading-5 text-[#6f6f68]">
              Añadir usuarios a tu espacio de trabajo actual
            </p>
          </div>

          <button
            type="button"
            onClick={closeDrawer}
            className="inline-flex size-8 items-center justify-center rounded-full text-[#6f6f68] transition-colors hover:bg-black/[0.04] hover:text-[#111111]"
            aria-label="Cerrar"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        <div className="px-3.5 pb-3.5 pt-2">
          <form
            onSubmit={handleSubmit}
            className="mx-auto w-full rounded-[1.5rem] border border-[#e5e7eb] bg-white px-4 py-4.5"
          >
            <div className="grid gap-3">
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-[minmax(0,1.15fr)_minmax(0,0.9fr)_6.25rem] gap-2"
                >
                  <input
                    value={row.email}
                    onChange={handleEmailChange(row.id)}
                    type="email"
                    placeholder="Correo"
                    autoComplete="email"
                    className="h-10 min-w-0 rounded-full border border-[#e5e7eb] bg-white px-3.5 text-[0.82rem] text-[#111111] outline-none placeholder:text-[#6f6f68] focus:bg-white"
                  />

                  <input
                    value={row.password}
                    onChange={handlePasswordChange(row.id)}
                    type="password"
                    placeholder="Contrasena"
                    autoComplete="new-password"
                    className="h-10 min-w-0 rounded-full border border-[#e5e7eb] bg-white px-3.5 text-[0.82rem] text-[#111111] outline-none placeholder:text-[#6f6f68] focus:bg-white"
                  />

                  <div className="relative min-w-0">
                    <select
                      value={row.role}
                      onChange={handleRoleChange(row.id)}
                      className="h-10 w-full appearance-none rounded-full border border-[#e5e7eb] bg-white px-3 pr-7 text-[0.78rem] text-[#111111] outline-none focus:bg-white"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Usuario">Usuario</option>
                    </select>

                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#6f6f68]">
                      <ChevronDownIcon className="size-3.5" />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddAnother}
                disabled={isPending}
                className="mt-1 inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#e5e7eb] bg-white px-4 text-[0.875rem] font-medium text-[#111111] transition-colors hover:bg-[#f8fafc]"
              >
                <PlusIcon className="size-3.5" />
                Add another
              </button>
            </div>

            {feedback?.message ? (
              <p
                className={cn(
                  "mt-3 text-[0.78rem]",
                  feedback.success ? "text-emerald-600" : "text-destructive",
                )}
                role="alert"
              >
                {feedback.message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isPending}
              className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-full bg-[#111111] px-4 text-[0.84rem] font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Creando..." : "Crear usuarios"}
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
