# Fatia A (V2)

Produto local-first. Sem contas, backend, Stripe ou APIs pagas.

## O que entra

1. **Reveal time-lapse + apresentação do caso** — 9:16 com vários quadros se houver fotos; no fim semana, dias com aparelho, intervalo de datas e CTA «o teu sorriso em curso». Free mantém marca de água. Pro continua «Pro em breve».
2. **Conselhos** — cartões no Início + rota `#/conselhos`. Vídeos locais (higiene, limpeza, material) em `public/conselhos/`. Sem YouTube. Sem 6ª tab (cinco tabs no telemóvel já enchem).
3. **Kids / Adultos** — LOOK V2 bloqueado. Ver [`LOOK-v2.md`](LOOK-v2.md). Onboarding + Definições.
4. **Higiene + streak** — checklist local (manhã, noite, fio, elásticos opcionais). Streak e ouro **só na pele Kids**. Adultos vêem o checklist sem gamificação. Banner in-app se faltar; Notification API só se já houver permissão.
5. **Urgência + comida semáforo** — `#/urgencia` e `#/comida`, a partir do Início ou de Conselhos. Disclaimer curto; nunca «paciente».

## Entradas

| Sítio | Rota |
| --- | --- |
| Início → Conselhos / Urgência / Comida | `#/conselhos` `#/urgencia` `#/comida` |
| Início → engrenagem | `#/definicoes` |
| Tabs | `#/` (`Hoje`) `#/captura` `#/galeria` `#/consultas` `#/reveal` |
