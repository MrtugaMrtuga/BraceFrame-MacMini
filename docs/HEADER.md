# Home header (bloqueado)

O header é o **primeiro** bloco de conteúdo em Início — antes do streak, do countdown, do CTA «Tirar fotos de hoje» e do fluxo de Captura.

Não é GoSmile. O mark é o frame coral + sorriso do ícone da app (`public/icons/icon.svg`).

## Copy e composição

| Peça | Lock |
| --- | --- |
| Mark | Frame coral + sorriso (ícone da app) |
| Título | `BraceFrame` (exacto) |
| Tagline | `o teu sorriso em curso` (mute, debaixo do título) |
| Eixo | Mark à esquerda + wordmark empilhado à direita |
| Safe area | ~56px abaixo do topo, depois da status bar |

Horizontal pad: **24px** nas duas peles.

## Skin A · Kids (`skin-kids`)

- Mark **52×52** — `public/icons/mark-52.png`
- Título 34px, weight 700–800 (800), tracking `-0.03em`, ink `#1a1210`
- Tagline 14px, mute `#9a8b86`
- Gap mark→texto 14px
- Espaço debaixo do header 20px + hairline `#f0e4e0`

## Skin B · Adultos (`skin-adultos`)

- Mark **44×44** — `public/icons/mark-44.png`
- Título 28px, weight 600–700 (700), tracking `-0.02em`, ink `#0a0a0a`
- Tagline 13px, mute `#6e6e73`
- Gap mark→texto 12px
- Espaço debaixo do header 16px + hairline `#d2d2d7`

O `src` do mark muda com o toggle Kids / Adultos já existente (onboarding + Definições).

## PNG do mark

Todos gerados a partir do mesmo SVG (coral frame + smile). Sem G de GoSmile.

| Ficheiro | Uso |
| --- | --- |
| `public/icons/mark-40.png` | reserva |
| `public/icons/mark-44.png` | Adultos header |
| `public/icons/mark-52.png` | Kids header |
| `public/icons/mark-64.png` | reserva |
| `public/icons/mark-88.png` | reserva |
| `public/icons/mark-128.png` | reserva |

Regenerar: `npm run icons`.

## Fora de âmbito

Tab bar, Captura, e o resto do LOOK V2 não mudam com este lock.
