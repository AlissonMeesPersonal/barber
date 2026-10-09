# BarberFlow

SaaS multi-tenant para barbearias. Primeira entrega: estrutura de interface e modelo de dados.

## Stack
Next.js (App Router), React, TypeScript, Supabase/PostgreSQL e Vercel.

## Desenvolvimento
```bash
npm install
npm run dev
```
Abra http://localhost:3000.

## Atenção
A interface inicial é uma demonstração interativa com dados fictícios. Não grava agendamentos reais nem substitui a futura API transacional. O arquivo `supabase/migrations/0001_initial.sql` define o esquema inicial e políticas de isolamento. A migração deve ser aplicada apenas em **novo projeto Supabase dedicado ao BarberFlow**, após revisão.

## Rotas
- `/`: apresentação da plataforma
- `/demo`: gestão com indicadores, colaboradores e personalização simulada
- `/agendar`: experiência demonstrativa de agendamento

## Próximas integrações
Autenticação de gestores, API de slots e reservas atômicas, painel conectado a PostgreSQL, auditoria, cashback e WhatsApp. Não conectar cliente direto às tabelas administrativas nem usar service role no navegador.
