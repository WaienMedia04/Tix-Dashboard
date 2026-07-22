"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { type PizarraPersona, type PizarraPost, crearPizarraPost, fetchPizarraDirectorio } from "@/lib/api";
import { codificarMencion } from "@/lib/pizarra-texto";
import { Avatar } from "@/components/Avatar";

export function PizarraComposer({
  slug,
  onPublicado,
  prefill,
}: {
  slug: string;
  onPublicado: (post: PizarraPost) => void;
  /** Cambia de referencia cada vez que algo externo (ej. "Responder" en la pregunta del día) quiere precargar el texto. */
  prefill?: { texto: string } | null;
}) {
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [directorio, setDirectorio] = useState<PizarraPersona[] | null>(null);
  const [mencionActiva, setMencionActiva] = useState<{ inicio: number; query: string } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchPizarraDirectorio(slug)
      .then(setDirectorio)
      .catch(() => setDirectorio([]));
  }, [slug]);

  useEffect(() => {
    if (!prefill) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- precarga intencional al hacer clic en "Responder"
    setTexto(prefill.texto);
    textareaRef.current?.focus();
  }, [prefill]);

  function actualizarMencion(valor: string, cursor: number) {
    const antes = valor.slice(0, cursor);
    const idx = antes.lastIndexOf("@");
    if (idx === -1) {
      setMencionActiva(null);
      return;
    }
    const fragmento = antes.slice(idx + 1);
    if (/\s/.test(fragmento) || fragmento.includes("[")) {
      setMencionActiva(null);
      return;
    }
    setMencionActiva({ inicio: idx, query: fragmento });
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setTexto(e.target.value);
    actualizarMencion(e.target.value, e.target.selectionStart);
  }

  function elegirMencion(persona: PizarraPersona) {
    if (!mencionActiva) return;
    const el = textareaRef.current;
    const cursor = el?.selectionStart ?? texto.length;
    const token = codificarMencion(persona.nombre, persona.id);
    const nuevo = `${texto.slice(0, mencionActiva.inicio)}${token} ${texto.slice(cursor)}`;
    setTexto(nuevo);
    setMencionActiva(null);
    requestAnimationFrame(() => {
      el?.focus();
      const pos = mencionActiva.inicio + token.length + 1;
      el?.setSelectionRange(pos, pos);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!texto.trim() || enviando) return;
    setEnviando(true);
    try {
      const post = await crearPizarraPost(slug, texto.trim());
      onPublicado(post);
      setTexto("");
    } catch {
      // el usuario puede reintentar
    } finally {
      setEnviando(false);
    }
  }

  const sugerencias =
    mencionActiva && directorio
      ? directorio.filter((p) => p.nombre.toLowerCase().includes(mencionActiva.query.toLowerCase())).slice(0, 6)
      : [];

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="relative rounded-xl border border-border/70 bg-background p-3"
    >
      <textarea
        ref={textareaRef}
        value={texto}
        onChange={handleChange}
        placeholder="Escribe un agradecimiento, un aviso, o menciona a alguien con @…"
        maxLength={500}
        rows={3}
        className="w-full resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
      />

      {mencionActiva && sugerencias.length > 0 && (
        <div className="absolute bottom-full left-3 z-20 mb-1 w-56 overflow-hidden rounded-md border border-border bg-popover shadow-elegant">
          {sugerencias.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => elegirMencion(p)}
              className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs hover:bg-accent"
            >
              <Avatar nombreCompleto={p.nombre} fotoUrl={p.fotoUrl} size="sm" />
              {p.nombre}
            </button>
          ))}
        </div>
      )}

      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-[11px] text-muted-foreground">{texto.length}/500 · usa @ para mencionar a alguien</span>
        <button
          type="submit"
          disabled={!texto.trim() || enviando}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
        >
          <Send className="h-3.5 w-3.5" />
          Publicar
        </button>
      </div>
    </form>
  );
}
