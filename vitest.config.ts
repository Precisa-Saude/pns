import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      // Stubs com schema/analitos ainda não preenchidos a partir do
      // dicionário oficial do IBGE — não são exercitáveis até a
      // primeira materialização real (ver pns-archive/README.md).
      exclude: ['**/dist/**', '**/tsup.config.ts', '**/src/index.ts', '**/src/waves/**'],
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
});
