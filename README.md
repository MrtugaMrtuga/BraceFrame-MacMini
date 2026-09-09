# BraceFrame

PWA do diário de sorriso — «o teu sorriso em curso».

Webapp local-first (IndexedDB + localStorage). Sem conta. Sem portal de clínica. Sem IA. Sem pagamentos.

## Correr

```bash
npm install
npm run dev
```

Build de produção:

```bash
npm run build
npm run preview
```

Abre no telemóvel (Safari iOS ou Chrome Android) via a URL da rede local, ou no desktop para desenvolver. A câmara pede permissão; se recusares, podes escolher uma foto.

## Instalar (PWA)

- **Chrome Android:** banner «Instalar» ou menu → Adicionar ao ecrã inicial.
- **Safari iOS:** Partilhar → Adicionar ao ecrã de início. O prompt na app explica o caminho.

HTTPS (ou localhost) é obrigatório para câmara, PWA e notificações.

## Tabs e rotas

| Sítio | Função |
| --- | --- |
| Início | Dias com aparelho, higiene, Conselhos, CTA «Tirar fotos de hoje» |
| Captura | Frente · Sorriso · Oclusão |
| Galeria | Slider «Antes / Agora» (vazia: copy por pele) |
| Consultas | CRUD local, lembrete, `.ics` |
| Reveal | Time-lapse 9:16 + apresentação do caso (marca de água Free) |
| Conselhos | `#/conselhos` — vídeos locais + atalhos |
| Urgência | `#/urgencia` — fio preso / afta / bracket solto |
| Comida | `#/comida` — semáforo verde / amarelo / vermelho |
| Definições | `#/definicoes` — pele Kids / Adultos |

**Pro** é só um stub «Pro em breve». Sem StoreKit / Stripe.

## Fatia A

Lista completa: [`docs/fatia-a.md`](docs/fatia-a.md). LOOK V2 (duas peles): [`docs/LOOK-v2.md`](docs/LOOK-v2.md).

## Host futuro

Deploy pensado para `*.evob.org` / Mac Mini. Vercel não é o destino principal.

## Marca

Tokens V2: [`src/styles/tokens-kids.css`](src/styles/tokens-kids.css) e [`src/styles/tokens-adultos.css`](src/styles/tokens-adultos.css). Boards: [`docs/design.md`](docs/design.md). Ícones PWA: `public/apple-touch-icon.png` (180) e `public/icons/icon-192.png` / `icon-512.png`. PNG 1024: [`docs/icon-1024.png`](docs/icon-1024.png).
