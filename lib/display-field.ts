export function displayField(
  key: string,
  value: string | number | null,
  currency: string | null,
) {
  if (value === null) return "Não informado";
  if (key === "prazo_entrega" && typeof value === "string")
    return value.replace(/^(\d{4})-(\d{2})-(\d{2})$/, "$3/$2/$1");
  if (key !== "valor_unitario" || typeof value !== "number" || !currency)
    return value;
  try {
    // Intl accepts unknown three-letter codes as currencies and prefixes them to the amount.
    if (
      new Intl.DisplayNames("pt-BR", { type: "currency", fallback: "none" }).of(
        currency,
      )
    ) {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency,
      }).format(value);
    }
  } catch {
    /* Malformed codes use the same literal fallback as unknown ones. */
  }
  return `${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 20 })} ${currency}`;
}
