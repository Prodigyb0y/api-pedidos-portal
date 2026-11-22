import { inputSchema, orderSchema } from "../../../../lib/order-contract";

const limit = 8192;
const messages: Record<number, string> = {
  400: "Envie um pedido em texto de 10 a 1.000 caracteres.",
  401: "A credencial da demonstração não está disponível.",
  403: "O acesso à demonstração não foi autorizado.",
  413: "O corpo do pedido é muito grande. Reduza o texto.",
  415: "Envie o pedido no formato JSON.",
  422: "Informe o item e a quantidade no texto do pedido.",
  429: "A cota diária da demonstração acabou. Tente em outro dia.",
  500: "Não foi possível concluir o pedido.",
  502: "Não foi possível obter uma resposta válida da API.",
  503: "O envio está indisponível por configuração do serviço.",
  504: "O tempo de espera terminou. O pedido pode ter sido processado. Não houve reenvio.",
};
function reply(data: unknown, status: number, id?: string) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...(id ? { "x-id-pedido": id } : {}),
    },
  });
}
function fail(status: number, code: string, id?: string) {
  return reply(
    {
      erro: {
        codigo: code,
        mensagem:
          code === "teto_de_gasto"
            ? "O teto mensal de gasto foi atingido. Consulte a página Uso."
            : code === "servico_inacessivel"
              ? "Não foi possível conectar à API. Nenhum reenvio foi feito."
              : (messages[status] ?? messages[500]),
      },
    },
    status,
    id,
  );
}
async function readBody(req: Request) {
  const reader = req.body?.getReader();
  if (!reader) throw Error();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let bytes = 0,
    text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > limit) {
        await reader.cancel();
        throw new RangeError();
      }
      text += decoder.decode(value, { stream: true });
    }
    return JSON.parse(text + decoder.decode()) as unknown;
  } finally {
    reader.releaseLock();
  }
}
export async function POST(req: Request) {
  const key = process.env.DEMO_API_KEY?.trim();
  const origin = req.headers.get("origin");
  if (
    (origin && origin !== new URL(req.url).origin) ||
    req.headers.get("sec-fetch-site") === "cross-site"
  )
    return fail(403, "origem_invalida");
  if (!key) return fail(503, "demo_indisponivel");
  if (
    req.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !==
    "application/json"
  )
    return fail(415, "formato_invalido");
  if (Number(req.headers.get("content-length")) > limit)
    return fail(413, "corpo_grande");
  let raw: unknown;
  try {
    raw = await readBody(req);
  } catch (e) {
    return e instanceof RangeError
      ? fail(413, "corpo_grande")
      : fail(400, "json_invalido");
  }
  const input = inputSchema.safeParse(raw);
  if (!input.success) return fail(400, "entrada_invalida");
  let url: URL;
  try {
    url = new URL(
      "/api/v1/processar",
      process.env.API_BASE_URL || "https://api-pedidos-mu.vercel.app",
    );
    if (url.protocol !== "https:" || url.username || url.password)
      throw Error();
  } catch {
    return fail(503, "configuracao_invalida");
  }
  const id = crypto.randomUUID(),
    signal = AbortSignal.timeout(30000);
  try {
    const res = await fetch(url, {
      method: "POST",
      redirect: "error",
      cache: "no-store",
      signal,
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "x-id-pedido": id,
      },
      body: JSON.stringify(input.data),
    });
    let payload;
    try {
      payload = await res.json();
    } catch {
      if (signal.aborted) return fail(504, "tempo_excedido", id);
      return fail(
        res.ok ? 502 : res.status >= 400 ? res.status : 502,
        "resposta_invalida",
        id,
      );
    }
    if (!res.ok) {
      const c = payload?.erro?.codigo;
      const code =
        typeof c === "string" &&
        /^[a-z][a-z0-9_]{0,59}$/.test(c) &&
        !c.includes(key)
          ? c
          : "falha_da_api";
      return fail(res.status >= 400 ? res.status : 502, code, id);
    }
    const parsed = orderSchema.safeParse(payload);
    if (!parsed.success || JSON.stringify(parsed.data).includes(key))
      return fail(502, "resposta_invalida", id);
    return reply(parsed.data, 200, id);
  } catch {
    return signal.aborted
      ? fail(504, "tempo_excedido", id)
      : fail(502, "servico_inacessivel", id);
  }
}
