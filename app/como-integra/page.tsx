import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Braces,
  GitBranch,
  Mail,
  Table2,
} from "lucide-react";
import { CopyText } from "@/components/copy-text";
export const metadata = {
  title: "Como integra",
  description:
    "Conheça o fluxo fictício de compras no n8n, do formulário ao registro do pedido.",
};
const steps = [
  {
    icon: ClipboardList,
    title: "Formulário",
    node: "n8n Form Trigger",
    text: "O solicitante descreve a compra em texto livre e envia o formulário.",
  },
  {
    icon: Braces,
    title: "Processamento",
    node: "POST /api/v1/processar",
    text: "A API extrai os campos e prepara o e-mail se houver pendências.",
  },
  {
    icon: GitBranch,
    title: "Decisão",
    node: "IF",
    text: "O status completo segue direto ao registro; o pendente passa pelo e-mail.",
  },
  {
    icon: Mail,
    title: "E-mail ao solicitante",
    node: "Gmail",
    text: "O solicitante recebe uma mensagem pedindo apenas as informações que faltam.",
  },
  {
    icon: Table2,
    title: "Registro em tabela",
    node: "n8n Data Table",
    text: "O fluxo registra o pedido com seu status para acompanhamento.",
  },
];
const request = `POST /api/v1/processar
Content-Type: application/json
x-api-key: SUA_CHAVE
x-id-pedido: pedido-ficticio-001

{"texto": "Precisamos de 8 caixas de etiquetas."}`;
export default function IntegrationGuide() {
  return (
    <article className="guide">
      <div className="pageintro">
        <div className="eyebrow">GUIA DE INTEGRAÇÃO · N8N</div>
        <h1>
          Como integra<span>.</span>
        </h1>
        <p>
          Compras recebe pedidos em texto livre. Em segundos, o fluxo extrai os
          campos e escreve o e-mail de pendências.
        </p>
        <Link className="btn" href="/console">
          Testar no Console <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
      <section>
        <div className="section-head">
          <h2>O caminho do pedido</h2>
          <span className="rule" />
        </div>
        <ol className="guide-steps" role="list">
          {steps.map(({ icon: Icon, title, node, text }, i) => (
            <li key={node}>
              <div className="step-label">
                <span>0{i + 1}</span>
                <Icon size={19} aria-hidden="true" />
              </div>
              <h3>{title}</h3>
              <code>{node}</code>
              <p>{text}</p>
            </li>
          ))}
        </ol>
        <p className="notice guide-errors">
          <strong>Caminho de erro.</strong> Em respostas 4xx ou 5xx, o fluxo
          consulta <code>erro.codigo</code> e registra o caso como{" "}
          <code>bloqueado</code>, <code>pedido_sem_item</code> ou{" "}
          <code>revisar</code>.
        </p>
      </section>
      <section className="section panel">
        <div className="section-head">
          <h2>O que o n8n envia</h2>
          <CopyText text={request} />
        </div>
        <pre>
          <code>{request}</code>
        </pre>
        <p>
          Reenvios com o mesmo <code>x-id-pedido</code> em até 24 horas
          reutilizam a resposta, sem novo custo.
        </p>
      </section>
      <div className="guide-notes section">
        <section className="panel">
          <h2>Garantias da API</h2>
          <ul>
            <li>
              A API não inventa dados: um campo obrigatório ausente volta vazio
              e o pedido fica pendente.
            </li>
            <li>
              O e-mail só é aceito se citar exatamente os campos faltantes.
            </li>
            <li>Há um teto mensal de gasto e um limite diário por chave.</li>
            <li>O log não guarda o texto do pedido nem o e-mail.</li>
          </ul>
        </section>
        <section className="panel">
          <h2>Limitações</h2>
          <ul>
            <li>
              Um texto que não é pedido recebe 422; nesse caso, o fluxo não
              responde ao solicitante.
            </li>
            <li>Pedidos completos não geram aviso para Compras.</li>
            <li>A comparação manual tem apenas cinco cronometragens.</li>
          </ul>
        </section>
      </div>
    </article>
  );
}
