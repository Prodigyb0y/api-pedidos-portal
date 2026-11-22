"use client";
import { useState } from "react";
import { Copy } from "lucide-react";
export function CopyText({ text }: { text: string }) {
  const [status, setStatus] = useState("Copiar");
  return (
    <button
      type="button"
      aria-label={status}
      className="btn copy"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setStatus("Copiado");
        } catch {
          setStatus("Selecione o texto para copiar");
        }
      }}
    >
      <Copy size={14} aria-hidden="true" />
      <span role="status">{status}</span>
    </button>
  );
}
