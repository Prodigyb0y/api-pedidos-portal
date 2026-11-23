# Portal da API de Pedidos com IA

Portal de demonstração da **API de Pedidos com IA** (Gutenberg Systems, empresa e dados 100% fictícios). Ele mostra a API funcionando: o visitante cola um pedido de compra em texto livre e vê os campos extraídos, o status, o e-mail de pendências e o custo da chamada.

**Este repositório é só a interface.** O problema, os resultados medidos, a arquitetura, os prompts, os testes e o fluxo do n8n estão no repositório principal: **https://github.com/Prodigyb0y/api-pedidos-ia**

Site publicado: https://api-pedidos-portal.vercel.app
API publicada: https://api-pedidos-mu.vercel.app

## Páginas

| Rota | O que mostra |
|---|---|
| / | Início, com números de uso vindos da API (/api/v1/uso) |
| /console | Console de teste com 4 exemplos e abas Campos, E-mail, JSON e Chamada |
| /uso | Uso e custo medidos pela API |
| /documentacao | Documentação gerada a partir de /api/openapi.json |
| /como-integra | Como integrar a API (por exemplo, pelo n8n) |

## Como funciona

O navegador nunca chama a API com chave. O Console envia o texto para a rota do servidor /api/demo/processar, que lê a variável DEMO_API_KEY no servidor e repassa a chamada para a API. A chave não vai para o navegador nem para o HTML.

## Tecnologias

Next.js, TypeScript e Tailwind CSS, gerados no v0 (Vercel) e publicados na Vercel. A interface foi gerada no v0 a partir de prompts e planos definidos pelo autor; o registro de cada etapa está em https://github.com/Prodigyb0y/api-pedidos-ia/blob/main/docs/vibe_coding.md

## Como rodar localmente

Variáveis de ambiente: DEMO_API_KEY (segredo da chave demo da API, nunca versionado) e, opcionalmente, API_BASE_URL (padrão: a API publicada).

Comandos: pnpm install, depois pnpm dev.

## Limitações

Feito para demonstração, com dados fictícios e limite diário de uso na API. A acessibilidade foi verificada por inspeção e teclado nas páginas principais; não houve teste com leitor de tela, movimento reduzido nem a ordem completa do Tab.
