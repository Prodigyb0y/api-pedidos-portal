"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, LockKeyhole, PencilLine } from "lucide-react";
import type { Order } from "@/lib/order-contract";
import { ResultTabs } from "./result-tabs";
const examples = [
  [
    "Pedido completo",
    "O setor de Criação solicita 12 unidades de caderno A5, a R$ 18,50 por unidade, da fornecedora fictícia Papel Lunar. Entregar até 15/12/2026.",
  ],
  [
    "Pedido pendente",
    "Precisamos comprar 8 caixas de etiquetas adesivas para o almoxarifado.",
  ],
  [
    "Prazo relativo",
    "A equipe de Eventos precisa de 20 unidades de crachá até a próxima sexta-feira.",
  ],
  [
    "Não é pedido",
    "O encontro da equipe foi transferido para a sala de leitura. Obrigado pelo aviso!",
  ],
];
export function OrderConsole({ enabled }: { enabled: boolean }) {
  const [text, setText] = useState(""),
    [busy, setBusy] = useState(false),
    [result, setResult] = useState<Order | null>(null),
    [call, setCall] = useState<{ text: string; id: string } | null>(null),
    [error, setError] = useState<{ message: string; code: string } | null>(
      null,
    );
  const lock = useRef(false),
    editor = useRef<HTMLTextAreaElement>(null);
  const valid = text.trim().length >= 10 && text.length <= 1000;
  async function submit() {
    if (!enabled || !valid || lock.current) return;
    lock.current = true;
    setBusy(true);
    setResult(null);
    setError(null);
    setCall(null);
    try {
      const submitted = text.trim();
      const r = await fetch("/api/demo/processar", {
        method: "POST",
        redirect: "error",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ texto: submitted }),
      });
      const id = r.headers.get("x-id-pedido");
      if (id) setCall({ text: submitted, id });
      const data = await r.json();
      if (!r.ok) {
        setError({
          message:
            data.erro?.mensagem ??
            "O serviço não conseguiu processar o pedido.",
          code: data.erro?.codigo ?? "falha_da_api",
        });
        if (r.status === 422)
          requestAnimationFrame(() => editor.current?.focus());
      } else setResult(data);
    } catch {
      setError({
        message:
          "A resposta não chegou. O pedido pode ter sido processado; nenhum reenvio foi feito.",
        code: "falha_de_rede",
      });
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <>
      {!enabled && (
        <div className="availability" role="status">
          <LockKeyhole size={18} />
          <div>
            <strong>Envio desabilitado</strong>
            <p>
              A credencial da demonstração não está configurada no servidor.
              Você ainda pode explorar os exemplos e as abas.
            </p>
          </div>
        </div>
      )}
      <div className="console-grid">
        <section className="panel editor">
          <div className="console-head">
            <PencilLine size={19} />
            <h2>Pedido de compra</h2>
          </div>
          <p>Escolha um exemplo ou escreva seu próprio texto.</p>
          <div className="chips">
            {examples.map(([name, value]) => (
              <button
                disabled={busy}
                key={name}
                onClick={() => {
                  setText(value);
                  editor.current?.focus();
                }}
              >
                {name}
              </button>
            ))}
          </div>
          <label htmlFor="order-text">Texto do pedido</label>
          <textarea
            id="order-text"
            ref={editor}
            value={text}
            disabled={busy}
            onChange={(e) => setText(e.target.value)}
            maxLength={1000}
            placeholder="Descreva o item, a quantidade e as condições de compra…"
            aria-describedby="text-guide"
          />
          <div className="counter" id="text-guide">
            <span>Mínimo de 10 caracteres</span>
            <span>{text.length} / 1.000</span>
          </div>
          <button
            className="btn submit"
            disabled={!enabled || busy || !valid}
            onClick={submit}
          >
            {busy ? "Processando…" : "Processar pedido"}
            <ArrowRight size={15} />
          </button>
        </section>
        <section className="panel result">
          <ResultTabs
            result={result}
            call={call}
            busy={busy}
            error={error?.message}
          />
          {error?.code === "teto_de_gasto" && (
            <Link className="btn" href="/uso">
              Consultar uso
            </Link>
          )}
        </section>
      </div>
    </>
  );
}
