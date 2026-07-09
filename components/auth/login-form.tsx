"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRightIcon } from "lucide-react";

import { login, type LoginFormState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const initialState: LoginFormState = {
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" className="h-12 w-full rounded-2xl" disabled={pending}>
      {pending ? "Entrando..." : "Entrar"}
      {!pending && <ArrowRightIcon data-icon="inline-end" />}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(login, initialState);

  return (
    <form className="flex flex-col gap-8" action={formAction}>
      <FieldGroup>
        <Field data-invalid={Boolean(state?.errors?.email?.length)}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="tu@empresa.com"
            defaultValue="metawbdevsolutions@gmail.com"
            autoComplete="email"
            aria-invalid={Boolean(state?.errors?.email?.length)}
            className="h-12 rounded-2xl px-4"
          />
          <FieldError errors={state?.errors?.email?.map((message) => ({ message }))} />
        </Field>

        <Field data-invalid={Boolean(state?.errors?.password?.length)}>
          <FieldLabel htmlFor="password">Contraseña</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Ingresa tu contraseña"
            autoComplete="current-password"
            aria-invalid={Boolean(state?.errors?.password?.length)}
            className="h-12 rounded-2xl px-4"
          />
          <FieldDescription className="sr-only">
            Campo de acceso seguro para autenticar la cuenta.
          </FieldDescription>
          <FieldError errors={state?.errors?.password?.map((message) => ({ message }))} />
        </Field>
      </FieldGroup>

      <div className="flex flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <Field orientation="horizontal" className="gap-3">
          <Checkbox id="remember" defaultChecked />
          <FieldContent className="gap-0">
            <FieldLabel htmlFor="remember" className="font-normal">
              Recordarme
            </FieldLabel>
          </FieldContent>
        </Field>
      </div>

      {state?.message ? (
        <p className="text-sm text-destructive" role="alert">
          {state.message}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
