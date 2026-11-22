import { OrderConsole } from "@/components/order-console";
import "./console.css";
export const metadata = { title: "Console de teste" };
export default function ConsolePage() {
  return (
    <>
      <div className="pageintro">
        <div className="eyebrow">AMBIENTE DE TESTE</div>
        <h1>
          Console de teste<span>.</span>
        </h1>
        <p>
          Escreva um pedido fictício e confira os campos extraídos e as
          pendências.
        </p>
      </div>
      <OrderConsole enabled={Boolean(process.env.DEMO_API_KEY?.trim())} />
    </>
  );
}
