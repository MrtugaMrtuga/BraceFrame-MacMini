# Fatia 1 — Adesão (local-first)

## PT

Hub **Hoje** (substitui Início na tab bar). O doente marca o que fez hoje: elásticos (4 slots), horas de alinhador (relógio só em uso, meta 22 h) e OFM/removível (1 check de noite). «Cumpri» é um toque — corte às 23:59, sem undo no dia seguinte.

Tudo fica em IndexedDB, chave `patientId:data`. Sem Sheets, sem GCP, sem APIs pagas (isso é Fatia 8; há um stub `adherenceSink`).

**% uso** = tarefas feitas / tarefas activas hoje. Elásticos conta como 1 tarefa, não 4. O plano em Definições esconde tarefas inactivas.

Kids: streak dourado é o herói. Adultos: o % é o herói; sem ouro, sem streak. Copy PT-PT, tu/teu nos Kids. Nunca «compliance».

O diário de fotos/higiene/conselhos ficou em `#/diario` (header LOOK V2 intacto). Captura, Galeria, Consultas e Reveal não mudam.

## EN

**Hoje** is the Fatia 1 hub (replaces Início in the tab bar). Local IndexedDB diary: 4 daily elastic slots, aligner wear clock (22 h target, ticks only while “em uso”), one OFM/night check. One-tap «Cumpri»; locked after 23:59.

Usage % = completed active tasks / active tasks (elastics = 1 task). Plan toggles hide unused appliances. Kids show a gold streak; adults show % only.

Photo/hygiene home remains at `#/diario`. No deploy, no clinic portal, no paid Google APIs.
