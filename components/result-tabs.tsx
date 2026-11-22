"use client";
import { useState } from "react";
import { Tabs } from "@base-ui/react/tabs";
import { Braces, Copy, Terminal } from "lucide-react";
import { fields, type Order } from "@/lib/order-contract";
const names = ["Campos", "E-mail", "JSON", "Chamada"];
function CopyText({ text }: { text: string }) {
  const [status, setStatus] = useState("Copiar");
  return (
    <button
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
      <Copy size={13} />
      <span role="status">{status}</span>
    </button>
  );
}
export function ResultTabs({
  result,
  call,
  busy,
  error,
}: {
  result: Order | null;
  call: { text: string; id: string } | null;
  busy: boolean;
  error?: string;
}) {
  const json = JSON.stringify(result, null, 2),
    email = result?.email;
  const curl = call
    ? [
        'curl --request POST "${API_BASE_URL}/api/v1/processar"',
        "  -H 'Content-Type: application/json'",
        "  -H 'x-api-key: <CHAVE_MASCARADA>'",
        `  -H 'x-id-pedido: ${call.id}'`,
        `  --data '${JSON.stringify({ texto: call.text }).replaceAll("'", "'\\''")}'`,
      ].join(" \\\n")
    : "";
  return (
    <>
      <div className="console-head">
        <Terminal size={19} />
        <h2>Resultado</h2>
      </div>
      <p aria-live="polite">
        {busy
          ? "Aguardando resposta da API…"
          : result
            ? `Pedido ${result.status} · ${result.custo_usd.toLocaleString("pt-BR", { maximumFractionDigits: 12 })} USD · ${result.latencia_modelo_ms} ms (modelo)`
            : "Resposta do último envio."}
      </p>
      {error && (
        <p role="alert" className="console-error">
          {error}
        </p>
      )}
      <Tabs.Root defaultValue="Campos">
        <Tabs.List className="console-tabs" aria-label="Resultado do pedido">
          {names.map((name) => (
            <Tabs.Tab key={name} value={name}>
              {name}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {names.map((name) => (
          <Tabs.Panel key={name} value={name}>
            {name === "Chamada" && call ? (
              <>
                <h3>Chamada equivalente</h3>
                <pre>{curl}</pre>
                <CopyText key={call.id} text={curl} />
              </>
            ) : !result ? (
              <div className="waiting">
                <Braces size={24} />
                <strong>
                  {busy
                    ? "Processando pedido…"
                    : error
                      ? "Sem resultado válido"
                      : "Nenhum pedido processado"}
                </strong>
                <p>
                  {busy
                    ? "Aguarde o retorno da API."
                    : error
                      ? "Confira a mensagem acima."
                      : "O resultado aparecerá aqui após o envio."}
                </p>
              </div>
            ) : name === "Campos" ? (
              <dl className="field-list">
                {(Object.keys(fields) as (keyof Order["dados"])[]).map((k) => (
                  <div key={k}>
                    <dt>{fields[k]}</dt>
                    <dd>
                      {result.dados[k] ?? "Não informado"}
                      {result.faltantes.some((f) => f === k) && (
                        <small>Pendente</small>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : name === "E-mail" ? (
              email ? (
                <>
                  <h3>{email.assunto}</h3>
                  <p className="email-body">{email.corpo}</p>
                  <CopyText
                    key={call?.id}
                    text={`${email.assunto}\n\n${email.corpo}`}
                  />
                </>
              ) : (
                <p className="waiting">
                  Não há e-mail de pendências para este pedido.
                </p>
              )
            ) : name === "JSON" ? (
              <>
                <pre>
                  {json
                    .split(/("(?:[^"\\]|\\.)*"\s*:)/g)
                    .map((s, i) => (i % 2 ? <b key={i}>{s}</b> : s))}
                </pre>
                <CopyText key={call?.id} text={json} />
              </>
            ) : null}
          </Tabs.Panel>
        ))}
      </Tabs.Root>
    </>
  );
}
