const { defineConfig } = require('@playwright/test');

/* Porta dedicada aos testes, para não conflitar com o uso normal do app (5500). */
const PORTA = 5599;

module.exports = defineConfig({
  testDir: './tests',
  timeout: 120_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  // O WebGL no CI roda por software e satura a CPU: em paralelo os testes disputariam
  // o processador e estourariam os tempos. Um worker mantém a suíte determinística.
  workers: 1,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORTA}`,
    // No CI o WebGL roda por software (SwiftShader); o flag evita o bloqueio sem GPU.
    launchOptions: { args: ['--enable-unsafe-swiftshader'] }
  },
  webServer: {
    command: `node servidor.js ${PORTA}`,
    url: `http://localhost:${PORTA}`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000
  }
});
