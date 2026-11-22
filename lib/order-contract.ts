import { z } from "zod";

export const inputSchema = z.strictObject({
  texto: z.string().max(1000).trim().min(10),
});
const missingField = z.enum([
  "solicitante_area",
  "prazo_entrega",
  "valor_unitario",
  "fornecedor",
]);
export const orderSchema = z.object({
  status: z.enum(["completo", "pendente"]),
  dados: z.object({
    solicitante_area: z.string().nullable(),
    item: z.string(),
    quantidade: z.number().positive(),
    unidade: z.enum(["un", "kg", "m", "l", "cx"]).nullable(),
    prazo_entrega: z.iso.date().nullable(),
    valor_unitario: z.number().nonnegative().nullable(),
    moeda: z.enum(["BRL", "USD", "EUR"]).nullable(),
    fornecedor: z.string().nullable(),
  }),
  faltantes: z.array(missingField),
  email: z
    .object({
      assunto: z.string(),
      corpo: z.string(),
      campos_citados: z.array(missingField).optional(),
    })
    .nullable(),
  custo_usd: z.number().nonnegative(),
  latencia_modelo_ms: z.number().int().nonnegative(),
  modelo: z.string().optional(),
  tokens_entrada: z.number().optional(),
  tokens_saida: z.number().optional(),
  chamadas_ao_modelo: z.number().optional(),
});
export type Order = z.infer<typeof orderSchema>;
export const fields: Record<keyof Order["dados"], string> = {
  solicitante_area: "Área solicitante",
  item: "Item",
  quantidade: "Quantidade",
  unidade: "Unidade",
  prazo_entrega: "Prazo de entrega",
  valor_unitario: "Valor unitário",
  moeda: "Moeda",
  fornecedor: "Fornecedor",
};
