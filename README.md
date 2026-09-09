# BraceFrame

PWA do diário de sorriso — «o teu sorriso em curso».

Webapp local-first (IndexedDB). Sem conta. Sem portal de clínica. Sem IA. Sem pagamentos nesta v1.

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

## O que entra na v1

| Tab | Função |
| --- | --- |
| Início | Dias com aparelho, CTA «Tirar fotos de hoje», últimas, semana |
| Captura | Frente · Sorriso · Oclusão · `getUserMedia` + fallback de ficheiro |
| Galeria | Slider vertical «Antes / Agora» |
| Consultas | CRUD local, lembrete in-app, `.ics` se o push falhar |
| Reveal | Vídeo 9:16 (Canvas + MediaRecorder) com marca de água Free |

**Pro** é só um stub «Pro em breve» (reveal limpo). Sem StoreKit / Stripe nesta versão.

## Host futuro

Deploy pensado para `*.evob.org` / Mac Mini. Vercel não é o destino principal.

## Marca

Tokens e ícone bloqueado: [`docs/tokens.md`](docs/tokens.md). Boards: [`docs/design.md`](docs/design.md). Ícone 1024: [`docs/icon-1024.png`](docs/icon-1024.png).
