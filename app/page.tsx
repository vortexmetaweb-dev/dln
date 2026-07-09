import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/platform");
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative hidden min-h-screen overflow-hidden lg:flex">
          <Image
            src="/login.jpg"
            alt="Terminal logistica con contenedores"
            fill
            priority
            className="object-cover object-center"
            sizes="(min-width: 1024px) 55vw, 0vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,12,24,0.18)_0%,rgba(4,7,18,0.56)_38%,rgba(3,6,16,0.92)_100%)]" />
          <div className="absolute inset-y-0 left-0 w-px bg-white/10" />
          <div className="absolute inset-y-0 left-8 w-px bg-white/8" />

        </section>

        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-14 sm:px-10 lg:px-16 xl:px-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(29,78,216,0.09),transparent_34%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-border/80" />

          <div className="relative z-10 w-full max-w-md">
            <div className="mb-12 flex flex-col gap-8">
             

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  <h2 className="text-4xl leading-none font-semibold tracking-[-0.05em] text-foreground sm:text-5xl">
                    Cotizador DLN 
                  </h2>
                </div>

                <p className="max-w-sm text-sm leading-7 text-muted-foreground sm:text-base">
                  Ingresa tu correo y contraseña para acceder a tu cuenta y
                  continuar dentro de la plataforma.
                </p>
              </div>
            </div>

            <LoginForm />

            <div className="mt-14 flex flex-col gap-5 text-center text-sm text-muted-foreground">
              <p className="text-balance">
                Plataforma desarrollada por{" "}
                <span className="font-medium text-foreground">
                  MetaWeb Dev Solutions
                </span>
              </p>

              <div className="flex items-center justify-center gap-5">
                <Link
                  href="#"
                  className="transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
                >
                  Políticas
                </Link>
                <span className="text-border">•</span>
                <Link
                  href="#"
                  className="transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
                >
                  Privacidad
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
