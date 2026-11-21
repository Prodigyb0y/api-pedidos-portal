import 'server-only'
import { z } from 'zod'

export const base = process.env.API_BASE_URL || 'https://api-pedidos-mu.vercel.app'
const n = z.number().nonnegative()
const totals = z.object({ chamadas:n, sucesso:n, erros:n, custo_usd:n, custo_medio_usd:n.nullable(), latencia_mediana_ms:n.nullable(), pedidos_processados:n, pedidos_pendentes:n })
const usage = z.object({ mes:totals, hoje:totals, aviso:z.string().nullable().optional(), base:z.string(), gasto_do_mes_usd:n, teto_do_mes_usd:n, por_rota_no_mes:z.record(z.string(),totals) })
const operation = z.object({summary:z.string().optional(),description:z.string().optional(),parameters:z.array(z.unknown()).optional(),requestBody:z.unknown().optional(),responses:z.record(z.string(),z.object({description:z.string(),content:z.unknown().optional()}))})
const spec = z.object({ openapi:z.string(), info:z.object({version:z.string()}), paths:z.record(z.string(),z.record(z.string(),operation)), components:z.object({schemas:z.record(z.string(),z.unknown())}).optional() })
async function read<T>(path:string, seconds:number, schema:z.ZodType<T>):Promise<T|null>{
  try { const response=await fetch(new URL(path,base),{next:{revalidate:seconds},signal:AbortSignal.timeout(8000)}); if(!response.ok)return null; return schema.parse(await response.json()) } catch { return null }
}
export const readUsage=()=>read('/api/v1/uso',30,usage)
export const readSpec=()=>read('/api/openapi.json',3600,spec)
export const format=(value:number|null,digits=6)=>value===null?'—':value.toLocaleString('pt-BR',{maximumFractionDigits:digits})
export type Usage=z.infer<typeof usage>
export type Operation=z.infer<typeof operation>
