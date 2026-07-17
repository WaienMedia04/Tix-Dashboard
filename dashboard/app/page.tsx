"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
// @clerk/nextjs v7 cambió el useSignIn por defecto a una API basada en
// signals (signIn.password()/.finalize()); usamos el subpath /legacy para
// la API clásica create()/attemptFirstFactor()/attemptSecondFactor(), que
// sigue siendo primera clase y con contrato de tipos completamente estable.
import { useSignIn } from "@clerk/nextjs/legacy";
import { EmpresaNoEncontradaError, SesionInvalidaError, me } from "@/lib/api";
import { BrandMark } from "@/components/BrandMark";
import { Iridescence } from "@/components/Iridescence";
import CurvedInput from "@/components/CurvedInput";

type Vista = "login" | "mfa" | "confiar-dispositivo" | "olvide-email" | "olvide-codigo";

async function redirigirTrasLogin(
  router: ReturnType<typeof useRouter>,
  setError: (msg: string) => void,
): Promise<void> {
  try {
    const sesion = await me();
    // TOTP (verificación en dos pasos) requiere el plan Pro de Clerk, que
    // todavía no está activo — el enforcement obligatorio para CEO/RRHH
    // queda deshabilitado hasta que se active el plan pago. La página
    // /mfa-enroll y la sección "Seguridad" de Configuración quedan listas
    // para cuando se retome esto.
    if (!sesion.empresa) {
      setError("Tu cuenta no está asociada a ninguna empresa.");
      return;
    }
    router.push(
      sesion.usuario.rol === "TALENTO" ? `/${sesion.empresa.slug}/mi-espacio` : `/${sesion.empresa.slug}/dashboard`,
    );
  } catch (err) {
    if (err instanceof SesionInvalidaError) {
      setError("No se pudo verificar la sesión. Intenta de nuevo.");
    } else if (err instanceof EmpresaNoEncontradaError) {
      setError(err.message);
    } else {
      setError("No se pudo conectar con el servidor.");
    }
  }
}

function AccesoInterno() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded, signIn, setActive } = useSignIn();
  const initialError =
    searchParams.get("error") === "sesion_invalida"
      ? "Tu sesión ya no es válida. Ingresa de nuevo."
      : null;

  const [vista, setVista] = useState<Vista>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [codigoMfa, setCodigoMfa] = useState("");
  const [codigoConfianza, setCodigoConfianza] = useState("");
  const [emailReset, setEmailReset] = useState("");
  const [codigoReset, setCodigoReset] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [error, setError] = useState<string | null>(initialError);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(valorPassword: string) {
    const emailLimpio = email.trim();
    if (!isLoaded || !signIn || !emailLimpio || !valorPassword || loading) return;
    setError(null);
    setLoading(true);
    try {
      const intento = await signIn.create({ strategy: "password", identifier: emailLimpio, password: valorPassword });
      if (intento.status === "complete") {
        await setActive({ session: intento.createdSessionId });
        await redirigirTrasLogin(router, setError);
        return;
      }
      if (intento.status === "needs_second_factor") {
        setVista("mfa");
        setLoading(false);
        return;
      }
      if (intento.status === "needs_client_trust") {
        // Dispositivo/navegador nuevo — Clerk exige confirmar por correo antes
        // de completar el login, independiente de si la cuenta tiene TOTP.
        const factorCorreo = intento.supportedSecondFactors?.find((f) => f.strategy === "email_code");
        if (factorCorreo && factorCorreo.strategy === "email_code") {
          await signIn.prepareSecondFactor({ strategy: "email_code", emailAddressId: factorCorreo.emailAddressId });
          setVista("confiar-dispositivo");
          setLoading(false);
          return;
        }
      }
      setError("No se pudo iniciar sesión.");
      setLoading(false);
    } catch {
      setError("Correo o contraseña incorrectos.");
      setLoading(false);
    }
  }

  async function handleSubmitConfianza(codigo: string) {
    if (!isLoaded || !signIn || !codigo || loading) return;
    setError(null);
    setLoading(true);
    try {
      const intento = await signIn.attemptSecondFactor({ strategy: "email_code", code: codigo });
      if (intento.status === "complete") {
        await setActive({ session: intento.createdSessionId });
        await redirigirTrasLogin(router, setError);
        return;
      }
      setError("Código incorrecto.");
      setLoading(false);
    } catch {
      setError("Código incorrecto.");
      setLoading(false);
    }
  }

  async function handleSubmitMfa(codigo: string) {
    if (!isLoaded || !signIn || !codigo || loading) return;
    setError(null);
    setLoading(true);
    try {
      const intento = await signIn.attemptSecondFactor({ strategy: "totp", code: codigo });
      if (intento.status === "complete") {
        await setActive({ session: intento.createdSessionId });
        await redirigirTrasLogin(router, setError);
        return;
      }
      setError("Código incorrecto.");
      setLoading(false);
    } catch {
      setError("Código incorrecto.");
      setLoading(false);
    }
  }

  async function handleEnviarCodigoReset(correo: string) {
    if (!isLoaded || !signIn || !correo || loading) return;
    setError(null);
    setLoading(true);
    try {
      await signIn.create({ strategy: "reset_password_email_code", identifier: correo.trim() });
      setMensaje("Código enviado. Revisa tu correo.");
      setVista("olvide-codigo");
      setLoading(false);
    } catch {
      setError("No se pudo enviar el código. Verifica el correo.");
      setLoading(false);
    }
  }

  async function handleConfirmarNuevaPassword(nuevaPassword: string) {
    if (!isLoaded || !signIn || !codigoReset || !nuevaPassword || loading) return;
    setError(null);
    setLoading(true);
    try {
      const verificado = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: codigoReset,
      });
      if (verificado.status !== "needs_new_password") {
        setError("Código incorrecto.");
        setLoading(false);
        return;
      }
      const listo = await signIn.resetPassword({ password: nuevaPassword });
      if (listo.status === "complete") {
        await setActive({ session: listo.createdSessionId });
        await redirigirTrasLogin(router, setError);
        return;
      }
      setError("No se pudo restablecer la contraseña.");
      setLoading(false);
    } catch {
      setError("Código incorrecto o contraseña inválida.");
      setLoading(false);
    }
  }

  function volverALogin() {
    setVista("login");
    setError(null);
    setMensaje(null);
    setCodigoMfa("");
    setCodigoConfianza("");
    setEmailReset("");
    setCodigoReset("");
    setPasswordNueva("");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0">
        <Iridescence
          color={[0.4392156862745098, 0.3176470588235294, 0.6470588235294118]}
          mouseReact={false}
          amplitude={0.1}
          speed={1.0}
        />
      </div>
      <div className="absolute inset-x-0 top-6 z-10 flex justify-center">
        <BrandMark variant="onDark" />
      </div>

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center text-center">
        {vista === "login" && (
          <>
            <h1 className="font-sans text-3xl font-semibold text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.4)]">
              Acceso al panel
            </h1>
            <p className="mt-2 text-sm text-white/75 drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]">
              Ingresa con tu correo y contraseña.
            </p>

            <div className="mt-8 flex w-full flex-col gap-2.5">
              <CurvedInput
                value={email}
                onChange={setEmail}
                type="email"
                placeholder="Correo electrónico"
                theme="dark"
                showButton={false}
                width="100%"
                bend={6}
                height={56}
              />
              <CurvedInput
                value={password}
                onChange={setPassword}
                onSubmit={handleSubmit}
                type="password"
                placeholder="Contraseña"
                buttonText={loading ? "Verificando..." : "Ingresar"}
                theme="dark"
                showIcon={false}
                buttonColor="#8B5CF6"
                buttonGradient={["#22D3EE", "#8B5CF6", "#D946EF"]}
                width="100%"
                bend={6}
                height={56}
              />
            </div>

            <button
              onClick={() => setVista("olvide-email")}
              className="mt-4 text-sm text-white/70 underline-offset-2 hover:text-white hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </>
        )}

        {vista === "mfa" && (
          <>
            <h1 className="font-sans text-3xl font-semibold text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.4)]">
              Verificación en dos pasos
            </h1>
            <p className="mt-2 text-sm text-white/75 drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]">
              Ingresa el código de tu app autenticadora.
            </p>

            <div className="mt-8 flex w-full flex-col gap-2.5">
              <CurvedInput
                value={codigoMfa}
                onChange={setCodigoMfa}
                onSubmit={handleSubmitMfa}
                type="text"
                placeholder="Código de 6 dígitos"
                buttonText={loading ? "Verificando..." : "Verificar"}
                theme="dark"
                showIcon={false}
                buttonColor="#8B5CF6"
                buttonGradient={["#22D3EE", "#8B5CF6", "#D946EF"]}
                width="100%"
                bend={6}
                height={56}
              />
            </div>

            <button onClick={volverALogin} className="mt-4 text-sm text-white/70 underline-offset-2 hover:text-white hover:underline">
              Volver
            </button>
          </>
        )}

        {vista === "confiar-dispositivo" && (
          <>
            <h1 className="font-sans text-3xl font-semibold text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.4)]">
              Confirma este dispositivo
            </h1>
            <p className="mt-2 text-sm text-white/75 drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]">
              Te enviamos un código por correo para confirmar que eres tú.
            </p>

            <div className="mt-8 flex w-full flex-col gap-2.5">
              <CurvedInput
                value={codigoConfianza}
                onChange={setCodigoConfianza}
                onSubmit={handleSubmitConfianza}
                type="text"
                placeholder="Código de verificación"
                buttonText={loading ? "Verificando..." : "Verificar"}
                theme="dark"
                showIcon={false}
                buttonColor="#8B5CF6"
                buttonGradient={["#22D3EE", "#8B5CF6", "#D946EF"]}
                width="100%"
                bend={6}
                height={56}
              />
            </div>

            <button onClick={volverALogin} className="mt-4 text-sm text-white/70 underline-offset-2 hover:text-white hover:underline">
              Volver
            </button>
          </>
        )}

        {vista === "olvide-email" && (
          <>
            <h1 className="font-sans text-3xl font-semibold text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.4)]">
              Restablecer contraseña
            </h1>
            <p className="mt-2 text-sm text-white/75 drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]">
              Te enviaremos un código a tu correo.
            </p>

            <div className="mt-8 flex w-full flex-col gap-2.5">
              <CurvedInput
                value={emailReset}
                onChange={setEmailReset}
                onSubmit={handleEnviarCodigoReset}
                type="email"
                placeholder="Correo electrónico"
                buttonText={loading ? "Enviando..." : "Enviar código"}
                theme="dark"
                showIcon={false}
                buttonColor="#8B5CF6"
                buttonGradient={["#22D3EE", "#8B5CF6", "#D946EF"]}
                width="100%"
                bend={6}
                height={56}
              />
            </div>

            <button onClick={volverALogin} className="mt-4 text-sm text-white/70 underline-offset-2 hover:text-white hover:underline">
              Volver
            </button>
          </>
        )}

        {vista === "olvide-codigo" && (
          <>
            <h1 className="font-sans text-3xl font-semibold text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.4)]">
              Nueva contraseña
            </h1>
            <p className="mt-2 text-sm text-white/75 drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]">
              Ingresa el código que te enviamos y tu nueva contraseña.
            </p>

            <div className="mt-8 flex w-full flex-col gap-2.5">
              <CurvedInput
                value={codigoReset}
                onChange={setCodigoReset}
                type="text"
                placeholder="Código de verificación"
                theme="dark"
                showButton={false}
                width="100%"
                bend={6}
                height={56}
              />
              <CurvedInput
                value={passwordNueva}
                onChange={setPasswordNueva}
                onSubmit={handleConfirmarNuevaPassword}
                type="password"
                placeholder="Nueva contraseña"
                buttonText={loading ? "Guardando..." : "Guardar"}
                theme="dark"
                showIcon={false}
                buttonColor="#8B5CF6"
                buttonGradient={["#22D3EE", "#8B5CF6", "#D946EF"]}
                width="100%"
                bend={6}
                height={56}
              />
            </div>

            <button onClick={volverALogin} className="mt-4 text-sm text-white/70 underline-offset-2 hover:text-white hover:underline">
              Volver
            </button>
          </>
        )}

        {error && <p className="mt-4 text-sm text-rose-300 drop-shadow-[0_1px_6px_rgba(0,0,0,0.4)]">{error}</p>}
        {mensaje && <p className="mt-4 text-sm text-emerald-300 drop-shadow-[0_1px_6px_rgba(0,0,0,0.4)]">{mensaje}</p>}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <AccesoInterno />
    </Suspense>
  );
}
