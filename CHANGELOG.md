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
