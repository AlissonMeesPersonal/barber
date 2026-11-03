# Neon — destino preparado em 2026-11-03

**IMPORTANTE: APENAS infraestrutura de homologação. NÃO migrar produção nem excluir Supabase.**
Conta Neon: organização Alisson (plano Free).
Região: `aws-us-east-2` (Ohio, EUA); PostgreSQL `17.11`.
A região não pode ser alterada após criação. Os dados pessoais e documentos da 26Fit **não devem ser copiados** para os EUA antes de revisar requisitos LGPD, transferência internacional e autorização da organização.
Os três projetos Neon foram criados como bancos independentes; o banco existente da Carolina Ferrareze não foi tocado.

## Proteções e validação
- `main` Neon permaneceu vazia; não está conectada à Vercel.
- `migration-preview` Neon foi criada isoladamente e testada com SELECT. Não usar `main` para ensaios.
- O Supabase de origem está ativo; não alterar suas chaves nem reiniciar serviços de produção.
- A branch GitHub `migration/supabase-to-neon` contém a documentação, mas não está implantada.
- Não existem dumps ou dados de usuários no GitHub.
- A transferência de dados ainda NÃO ocorreu. O backup independente/restore não foi realizado.
- Antes de iniciar importação: obter credenciais de conexão de leitura do Supabase em canal seguro, fazer backup verificado, portar schema real do banco (não somente migrations antigas), decidir Auth e restaurar arquivos.
- Usar URL Neon direta/unpooled para migrations/importações, URL pooled para funções serverless. **Nenhuma senha, URL de conexão com senha, segredos ou dumps devem ser versionados.**
- Para os três projetos, reavaliar URLs de retorno de autenticação, permissões/RLS e qualidade de serviço antes de atualizar Vercel Preview e depois Production.
- Consulte `docs/MIGRACAO_SUPABASE_NEON.md` e `scripts/migration/verify_counts.psql`.

## Identificadores NÃO secretos
- Origem Supabase: `vfyydxrekgbwwybxkovh`.
- Projeto Neon: `delicate-sun-78875637`.
- Banco Neon: `barberflow`.
- Branch principal Neon: `main` (`br-weathered-cake-bdust6m4`).
- Branch de teste Neon: `migration-preview` (`br-frosty-night-bd0hxl9s`).

## Configuração específica
- Neon Auth (Managed Better Auth) habilitado **somente na branch `migration-preview`**, sem usuários migrados.
- Buckets de homologação criados: `barber-branding` (leitura pública) e `barber-network-branding` (leitura pública), ambos vazios.
- Os 2 objetos reais do Supabase não foram copiados. Verificar URLs de logos e CDN antes de mudar a produção.
- Revalidar isolamento de barbearias, agendamentos concorrentes, memberships e permissões.

## Checklist imediato
- [x] Projeto Neon criado e PostgreSQL 17 verificado.
- [x] Branch Neon `migration-preview` criada e conexão testada.
- [ ] Backup de origem validado fora do código.
- [ ] Schema histórico revisado e schema real exportado.
- [ ] Plano de identidade/Auth e permissões concluído.
- [ ] Migração de dados e arquivos testada em `migration-preview`.
- [ ] Preview Vercel homologado e aprovado.
- [ ] Produção transferida, monitorada e comprovadamente sem dependência do Supabase.
- [ ] Cancelamento Supabase Pro autorizado depois das três aprovações.
