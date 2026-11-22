const { test, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const ts = require("typescript");
const fs = require("node:fs");
require.extensions[".ts"] = (mod, file) =>
  mod._compile(
    ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    file,
  );
const { POST } = require("../app/api/demo/processar/route.ts");
const secret = "somente-fixture-nao-utilizavel";
const complete = {
  status: "completo",
  dados: {
    solicitante_area: "Oficina",
    item: "papel",
    quantidade: 2,
    unidade: "cx",
    prazo_entrega: "2026-12-15",
    valor_unitario: 12,
    moeda: "BRL",
    fornecedor: "Lua",
  },
  faltantes: [],
  email: null,
  custo_usd: 0.0001,
  latencia_modelo_ms: 34,
};
const original = global.fetch;
let requests, reply;
beforeEach(() => {
  process.env.API_BASE_URL = "https://simulado.invalid";
  process.env.DEMO_API_KEY = secret;
  requests = [];
  reply = () => Response.json(complete);
  global.fetch = async (url, init) => {
    requests.push({ url: String(url), init });
    return reply();
  };
});
afterEach(() => {
  global.fetch = original;
});
const submit = (
  body = JSON.stringify({ texto: "Comprar duas caixas de papel." }),
  headers = {},
) =>
  POST(
    new Request("https://portal.invalid/api/demo/processar", {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body,
    }),
  );
test("um POST por envio, URL fixa, UUIDs distintos, chave só no servidor", async () => {
  const ids = new Set();
  for (let i = 0; i < 2; i++) {
    const r = await submit();
    assert.equal(r.status, 200);
    assert.equal(r.headers.get("cache-control"), "no-store");
    assert.equal(r.headers.get("x-api-key"), null);
    assert.deepEqual(await r.json(), complete);
    const { url, init } = requests[i];
    assert.equal(url, "https://simulado.invalid/api/v1/processar");
    assert.equal(init.headers["x-api-key"], secret);
    assert.equal(init.redirect, "error");
    assert.equal(init.method, "POST");
    const id = r.headers.get("x-id-pedido");
    assert.match(id, /^[0-9a-f-]{36}$/);
    assert.equal(init.headers["x-id-pedido"], id);
    ids.add(id);
  }
  assert.equal(requests.length, 2);
  assert.equal(ids.size, 2);
});
test("pendente é sucesso com e-mail", async () => {
  const pending = {
    ...complete,
    status: "pendente",
    dados: { ...complete.dados, fornecedor: null },
    faltantes: ["fornecedor"],
    email: { assunto: "Fornecedor", corpo: "Qual é o fornecedor?" },
  };
  reply = () => Response.json(pending);
  assert.deepEqual(await (await submit()).json(), pending);
});
test("sem chave, origem externa, corpo ou formato inválido: zero chamadas", async () => {
  for (const [body, headers, status] of [
    ["x", {}, 400],
    [JSON.stringify({ texto: "x" }), {}, 400],
    [JSON.stringify({ texto: "a".repeat(1001) }), {}, 400],
    ["x".repeat(8200), {}, 413],
    ["{}", { "content-type": "text/plain" }, 415],
    ["{}", { origin: "https://outro.invalid" }, 403],
  ])
    assert.equal((await submit(body, headers)).status, status);
  delete process.env.DEMO_API_KEY;
  assert.equal((await submit()).status, 503);
  assert.equal(requests.length, 0);
});
for (const [status, code] of [
  [422, "pedido_sem_item"],
  [429, "limite_diario"],
  [503, "teto_de_gasto"],
  [503, "sem_configuracao"],
  [502, "falha_modelo"],
  [401, "sem_chave"],
  [403, "chave_invalida"],
  [500, "inesperado"],
])
  test(`erro ${status} ${code}: sem vazamento ou repetição`, async () => {
    reply = () =>
      Response.json({ erro: { codigo: code, mensagem: secret } }, { status });
    const r = await submit();
    assert.equal(r.status, status);
    const data = await r.json();
    assert.equal(data.erro.codigo, code);
    assert.ok(!JSON.stringify(data).includes(secret));
    assert.equal(requests.length, 1);
  });
test("resposta incompatível ou com segredo é descartada", async () => {
  for (const data of [{}, { ...complete, modelo: secret }]) {
    reply = () => Response.json(data);
    const r = await submit();
    assert.equal(r.status, 502);
    assert.ok(!(await r.text()).includes(secret));
  }
});
test("falha de rede não repete a chamada", async () => {
  reply = () => {
    throw new TypeError();
  };
  assert.equal((await submit()).status, 502);
  assert.equal(requests.length, 1);
});
test("timeout informa resultado incerto sem repetir", async (t) => {
  t.mock.method(AbortSignal, "timeout", () => AbortSignal.abort());
  reply = () => {
    throw new DOMException("", "TimeoutError");
  };
  const r = await submit();
  assert.equal(r.status, 504);
  assert.match(await r.text(), /pode ter sido processado/);
  assert.equal(requests.length, 1);
});

test("apresentação formata moeda e data sem alterar valores ausentes", () => {
  const { displayField } = require("../lib/display-field.ts");
  assert.equal(
    displayField("valor_unitario", 18.5, "BRL").replace(/\s/g, " "),
    "R$ 18,50",
  );
  assert.equal(displayField("valor_unitario", 18.5, "XYZ"), "18,50 XYZ");
  assert.equal(displayField("valor_unitario", 18.5, null), 18.5);
  assert.equal(displayField("valor_unitario", null, "BRL"), "Não informado");
  assert.equal(displayField("prazo_entrega", "2026-12-15", null), "15/12/2026");
});
