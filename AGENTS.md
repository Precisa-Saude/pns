# Specific instructions — pns

> This file holds ONLY the rules specific to this repository. The
> shared rules across the precisa-saude ecosystem (tone, git, hooks,
> reviews, worktrees, source verification, test coverage, code
> conventions) live in `@precisa-saude/agent-instructions`.
>
> **Read the shared base online:**
> https://github.com/Precisa-Saude/tooling/blob/main/packages/agent-instructions/AGENTS.md
>
> Claude Code loads both files (shared base + this one) via imports in
> `CLAUDE.md`. Update the base with:
> `pnpm update @precisa-saude/agent-instructions`.

## Overview

Pacote `@precisa-saude/pns` — percentis populacionais ponderados de biomarcadores a partir do microdado da Pesquisa Nacional de Saúde (PNS/IBGE). Pipeline de ingestão fica em `packages/pns-archive` (interno, não publicado).

## Structure

```
packages/
  pns-core/      # @precisa-saude/pns — superfície pública, tabelas embarcadas
  pns-archive/   # privado: FTP IBGE → parser fixed-width → percentis
```

## Vintage and schema — onda é imutável

Cada onda da PNS (2014–2015, 2019, 2024) tem schema próprio: lista de analitos, códigos de coluna, estrutura de pesos. Tratar cada onda como artefato imutável:

- Novo schema vai em **novo subdiretório** `src/waves/<onda>/`. Nunca editar `src/waves/2014-2015/` para "atualizar" para outra onda.
- Quando uma onda nova chega, copiar o template e reescrever — não generalizar entre ondas.
- O dicionário oficial é a única fonte. Não inferir códigos de coluna a partir de nomes lógicos (regra "no fabrication" do shared base).

## Granularidade — macro-região, sim; UF/município, não

A subamostra laboratorial publicada da PNS (Fiocruz, arquivo `EXAMES-PNS-2013-FINAL`) **não distribui UF/UPA** — a coluna `regiao` (macro-região, 5 categorias IBGE) é a granularidade geográfica mais fina disponível. Tabelas de percentis embarcam apenas macro-região.

- Consumidores que têm a UF do usuário devem usar `macroRegionFor(uf)` para reduzir antes de consultar.
- **UF e município não são suportados em nenhuma circunstância** com a fonte atual. Tentar descer abaixo de macro-região por proxy é o failure mode "plausible-but-wrong" descrito no shared base.
- Linkagem com o microdado principal PNS 2013 (que tem UF) requer acordo de microdado restrito Fiocruz/IBGE — fora do escopo deste pacote OSS.

## Cell size — n ≥ 30 ou `undefined`

Toda célula `{analito, macro-região, faixa-etária, sexo}` materializa percentis só se `n ≥ 30`. Abaixo disso, retornar `undefined`. Não relaxar o threshold sem revisão estatística. (Na onda 2014–2015 todas as 240 células do MVP atendem o threshold com folga.)

## Pesos amostrais

Sempre usar a coluna de peso da **subamostra laboratorial** (não a da PNS geral). Confirmar no Manual de Exames Laboratoriais antes de qualquer recompute. Quantis sem peso saem errados — usar `weightedQuantile` exportado por `@precisa-saude/pns`.

## Commit scopes

Valid scopes: `core`, `archive`, `docs`, `ci`, `deps`.

## Worktree — specific values

Worktree flow and commands are in the shared base. The canonical config
lives in `package.json` under `"worktree"`. For quick reference:

| Field         | Value                                      |
| ------------- | ------------------------------------------ |
| Port registry | `/tmp/pns-worktree-ports.json`             |
| Services      | (filled in when the repo adds dev servers) |

Launch a dev server in a feature worktree:

```bash
pnpm exec precisa-worktree dev --detach
```
