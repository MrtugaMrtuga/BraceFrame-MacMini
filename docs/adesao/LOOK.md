# BraceFrame · Fatia 1 — Adesão (locked 15 set 2026)

Feedback Mariana. Skins V2 Kids / Adultos. Coral `#ff5a4a`. **Sem GoSmile G.**  
Mark: `/workspace/braceframe/icon-1024.png` (já locked).

Fatia 1 = o doente marca o que fez hoje: elásticos, horas de alinhador, OFM/removível. Check **cumpri**. Streak (Kids) ou % de uso (Adultos).

## Tab bar (actualizado)

`Hoje · Captura · Galeria · Consultas · Reveal`

**Hoje** substitui Início como home da Fatia 1 (hub de adesão). Captura e o resto não mudam.

## Tarefas (mesmo modelo nas duas skins)

| Tarefa | Input | Cumpri |
|---|---|---|
| **Elásticos** | 4 slots do dia (manhã · tarde · lanche · noite). Contador N/4 | check por slot |
| **Alinhadores** | Relógio de horas (meta típica 22 h). Toggle *em uso* / *retirados* | horas acumulam só em uso |
| **OFM / removível** | 1 check (noite, ou o que o plano mandar) | «Cumpri» único |

Plano do orto define quais tarefas estão activas (nem todos têm OFM). Tarefas inactivas **não** aparecem no hub.

## Check «cumpri»

- Um toque, imediato. Sem modal de confirmação.
- Corte às **23:59** do dia — sem undo no dia seguinte.
- Kids copy: **Cumpri** / **Cumpri · noite**
- Adultos copy: **Marcar como cumprido** / **Marcar noite como cumprida**
- Nunca «submeter», «registar adesão», «compliance».

## Kids (Skin A)

Tokens: `v2/tokens-kids.css` (page `#fff8f6`, coral CTA, streak `#ffb020`, radius 24/999/18).

| Peça | Spec |
|---|---|
| Hub **Hoje** | Chip ouro «★ N dias»; anel % coral; lista de tarefas com check coral + mini-barra; CTA coral «Cumpri o que faltava» (marca o 1.º em falta) |
| Elásticos | Hero **N / 4**; 4 dots (fill coral = feito); CTA «Cumpri · [slot]» |
| Alinhadores | Anel 18 h / 22 h; CTAs «Estão postos» (fill) e «Tirei agora» (outline) |
| OFM | Estado «Ainda não»; CTA «Cumpri · OFM noite»; aviso streak se faltar |
| Motivação | Gold streak + wash «Continua o streak». Sem dentes cartoon, sem mascote |

Copy: «Quase lá», «Falta o da noite», «Continua o streak». Tu/teu. Nunca «paciente».

## Adultos (Skin B)

Tokens: `v2/tokens-adultos.css` (page `#f5f5f7`, CTA ink `#0a0a0a`, coral só no anel/%/tab, radius 12/8/10). **Sem gold. Sem streak.**

| Peça | Spec |
|---|---|
| Hub **Adesão** | Anel % + «Uso de hoje»; rows com rail coral se feito; acção «feito» / «marcar» |
| Elásticos | 3/4 + chips Manhã/Tarde/Lanche/Noite; CTA ink |
| Alinhadores | Anel horas; «Em uso» ink / «Retirados» outline |
| OFM | Row no hub + CTA ink «Marcar OFM como cumprido» |

Copy sóbria: «Por cumprir», «Faltam 4 horas para a meta de hoje». Sem «Continua o streak».

## % uso

`feito / tarefas activas hoje` (elásticos conta como 1 tarefa, não 4). Anel coral sobre track line. Número no centro. Adultos: o % é o herói. Kids: o streak é o herói; % é apoio.

## Fora de âmbito

- Sem portal do ortodontista nesta fatia
- Sem GoSmile chrome / G
- Sem EHR, sem «compliance score» clínico
- Sem undo no dia seguinte
- Ícone PWA **não** muda

## Boards

`/workspace/braceframe/adesao/`

| Ficheiro | |
|---|---|
| `LOOK.md` | esta spec |
| `board-kids.png` | Hoje · Elásticos · Alinhadores · OFM |
| `board-adultos.png` | Hub · Elásticos · Alinhadores |
| `board-compare.png` | lado a lado |
| `screen-*.png` | ecrãs soltos |

LOOK-v2.md: Fatia 1 aponta para esta pasta.
