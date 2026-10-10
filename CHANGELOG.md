## [1.3.2](https://github.com/Precisa-Saude/pns/compare/v1.3.1...v1.3.2) (2026-10-10)

### Bug Fixes

* **ci:** guard de release compara desde a última release, não o push ([#20](https://github.com/Precisa-Saude/pns/issues/20)) ([d8b53bc](https://github.com/Precisa-Saude/pns/commit/d8b53bc9a6488be7f30d68ec27cb3fce47b082c9))
* **ci:** publish-watch aceita pacote sem tag quando bate com o package.json ([#19](https://github.com/Precisa-Saude/pns/issues/19)) ([093edbb](https://github.com/Precisa-Saude/pns/commit/093edbbdb67cd65c19523147b92bd091f844d543)), closes [#48](https://github.com/Precisa-Saude/pns/issues/48) [tooling#52](https://github.com/Precisa-Saude/tooling/issues/52)
* **ci:** publish-watch compara a versão do pacote, não a maior tag ([#18](https://github.com/Precisa-Saude/pns/issues/18)) ([cb95914](https://github.com/Precisa-Saude/pns/commit/cb959146e3febf279719630981266ff0c4caef70)), closes [tooling#51](https://github.com/Precisa-Saude/tooling/issues/51)
* quebra volta a gerar versão maior ([#23](https://github.com/Precisa-Saude/pns/issues/23)) ([415fbde](https://github.com/Precisa-Saude/pns/commit/415fbdebb450f02b94081a1804ca7a268358672a))

### CI/CD

* adotar tooling v3 versionado com política de revisão ([#24](https://github.com/Precisa-Saude/pns/issues/24)) ([dc46572](https://github.com/Precisa-Saude/pns/commit/dc46572f09c9347c348a3f6f8e4f5b4fbf560861))
* definir política explícita para revisão externa ([#25](https://github.com/Precisa-Saude/pns/issues/25)) ([2d31957](https://github.com/Precisa-Saude/pns/commit/2d31957366fc88c84521894c0e63f6bf279d5311))
* sincroniza template de review-dispatch (pr_number como number) ([#22](https://github.com/Precisa-Saude/pns/issues/22)) ([d91207f](https://github.com/Precisa-Saude/pns/commit/d91207f746dd9f22ee81a00ea70d01a5842f8c92))

### Chores

* **ci:** sincroniza templates do cli 1.13.1 ([#17](https://github.com/Precisa-Saude/pns/issues/17)) ([4aa3803](https://github.com/Precisa-Saude/pns/commit/4aa3803e3c8d39d0230321598e48ee2afbbeba04)), closes [tooling#47](https://github.com/Precisa-Saude/tooling/issues/47) [tooling#48](https://github.com/Precisa-Saude/tooling/issues/48) [tooling#50](https://github.com/Precisa-Saude/tooling/issues/50)
* **ci:** sincroniza templates e declara divergências deliberadas ([#16](https://github.com/Precisa-Saude/pns/issues/16)) ([36a2a7c](https://github.com/Precisa-Saude/pns/commit/36a2a7cf284deb01b18c7ad2e2db5cbc7fae0fb5))

## [1.3.1](https://github.com/Precisa-Saude/pns/compare/v1.3.0...v1.3.1) (2026-08-03)

### Bug Fixes

* **ci:** completa o .precisa.json para o doctor voltar a auditar ([#15](https://github.com/Precisa-Saude/pns/issues/15)) ([6a27fbe](https://github.com/Precisa-Saude/pns/commit/6a27fbef64a0c98e91111389be42780ee689190b)), closes [Precisa-Saude/tooling#42](https://github.com/Precisa-Saude/tooling/issues/42)

### CI/CD

* atualizar GitHub Actions para o runtime Node 24 ([#13](https://github.com/Precisa-Saude/pns/issues/13)) ([ce51f79](https://github.com/Precisa-Saude/pns/commit/ce51f79df092760a6fd3a8e9bb630c86456e6251))
* pin actions e adicionar tripwire publish-watch (postmortem TanStack) ([#9](https://github.com/Precisa-Saude/pns/issues/9)) ([ad4f396](https://github.com/Precisa-Saude/pns/commit/ad4f39634b125840608471a043cc93122e521e37))

### Chores

* **ci:** publish-watch passa de cron 15min para diário ([#10](https://github.com/Precisa-Saude/pns/issues/10)) ([8f9e088](https://github.com/Precisa-Saude/pns/commit/8f9e088590cbf02b8e4bb56aee6df0e613a292f9))

## [1.3.0](https://github.com/Precisa-Saude/pns/compare/v1.2.0...v1.3.0) (2026-05-13)

### Features

* **ci:** sincroniza workflows com o template do tooling ([#7](https://github.com/Precisa-Saude/pns/issues/7)) ([c9b5b55](https://github.com/Precisa-Saude/pns/commit/c9b5b556da066ac0fcec272c449077059a3888ea)), closes [#6](https://github.com/Precisa-Saude/pns/issues/6) [#30](https://github.com/Precisa-Saude/pns/issues/30) [#31](https://github.com/Precisa-Saude/pns/issues/31)

### Bug Fixes

* **ci:** adiciona .releaserc.cjs para que semantic-release commite o bump de versão ([#6](https://github.com/Precisa-Saude/pns/issues/6)) ([019e7ea](https://github.com/Precisa-Saude/pns/commit/019e7ea3717fae93adbd51d93cdb242138188f1d)), closes [#3](https://github.com/Precisa-Saude/pns/issues/3) [#4](https://github.com/Precisa-Saude/pns/issues/4) [#5](https://github.com/Precisa-Saude/pns/issues/5)
* **ci:** desabilita o guard require_package_changes no release job ([#8](https://github.com/Precisa-Saude/pns/issues/8)) ([27e287a](https://github.com/Precisa-Saude/pns/commit/27e287aae3409efadc660f366c03b44bdb5daa8c)), closes [#6](https://github.com/Precisa-Saude/pns/issues/6) [#7](https://github.com/Precisa-Saude/pns/issues/7) [#3](https://github.com/Precisa-Saude/pns/issues/3) [#4](https://github.com/Precisa-Saude/pns/issues/4) [#5](https://github.com/Precisa-Saude/pns/issues/5)
