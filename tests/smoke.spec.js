// @ts-check
/**
 * Testes de fumaça do Sistema Solar 3D.
 *
 * Cobrem o que quebrou (ou poderia quebrar) sem build: carregamento do three.js pelo
 * CDN, mensagem de erro acionável quando o CDN falha, montagem do HUD e plausibilidade
 * astronômica das distâncias exibidas.
 */
const { test, expect } = require('@playwright/test');

/** "0,984 UA" -> 0.984 */
const numero = (texto) => Number.parseFloat(String(texto).replace(',', '.'));

/** Coleta erros de página/console para o teste poder exigir "nenhum erro". */
function observarErros(page) {
  const erros = [];
  page.on('pageerror', (e) => erros.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') erros.push(`console: ${m.text()}`);
  });
  return erros;
}

const pronto = (page) => expect(page.locator('#loading')).toHaveClass(/hide/, { timeout: 60_000 });

test.describe('Sistema Solar 3D', () => {
  // Viewport de desktop enxuto (>900px mantém o layout com o painel sempre visível)
  test.use({ viewport: { width: 1100, height: 700 } });

  test('monta a cena, o HUD e não gera erros', async ({ page }) => {
    const erros = observarErros(page);

    await page.goto('/');
    await pronto(page);

    await expect(page.locator('#date')).toHaveText(/\d{4}/);

    // Pausa para o restante do teste não concorrer com o render por software do CI.
    await page.locator('#btnPause').click();

    await expect(page.locator('#labels .body-label')).toHaveCount(10); // Sol + 8 planetas + cometa
    await expect(page.locator('#focus option')).toHaveCount(11); // livre + 10 corpos
    await expect(page.locator('#infoDist')).toHaveText(/UA$/);

    expect(erros).toEqual([]);
  });

  test('continua funcional depois de mexer nos controles', async ({ page }) => {
    const erros = observarErros(page);

    await page.goto('/');
    await pronto(page);

    // Pausa primeiro: com o render sob demanda o app para de desenhar e o resto do
    // teste fica muito mais rápido (e exercise justamente o caminho "pausado").
    await page.locator('#btnPause').click();
    await expect(page.locator('#btnPause')).toHaveText('Retomar');

    // camadas: desliga e religa cada uma
    for (const id of ['#tOrbits', '#tLabels', '#tBelt', '#tComet', '#tBloom']) {
      await page.locator(id).click();
      await page.locator(id).click();
    }

    await page.locator('#btnPause').click();
    await expect(page.locator('#btnPause')).toHaveText('Pausar');

    await page.locator('#focus').selectOption('saturn');
    await expect(page.locator('#infoName')).toHaveText('Saturno');

    await page.locator('#btnReset').click();
    await expect(page.locator('#focus')).toHaveValue('');
    await expect(page.locator('#infoName')).toHaveText('Sol');

    expect(erros).toEqual([]);
  });

  test('as distâncias à Terra são astronomicamente plausíveis', async ({ page }) => {
    await page.goto('/');
    await pronto(page);

    // o relógio simulado anda enquanto não está pausado
    const antes = await page.locator('#date').textContent();
    await page.waitForTimeout(1500);
    await expect(page.locator('#date')).not.toHaveText(antes);

    await page.locator('#btnPause').click(); // congela a data para as medidas

    // Sol: a distância é a da Terra ao Sol (0,983–1,017 UA)
    await expect
      .poll(async () => numero(await page.locator('#infoDist').textContent()))
      .toBeGreaterThan(0.98);
    expect(numero(await page.locator('#infoDist').textContent())).toBeLessThan(1.02);

    // Júpiter: 3,9–6,5 UA
    await page.locator('#focus').selectOption('jupiter');
    await expect(page.locator('#infoName')).toHaveText('Júpiter');
    await expect
      .poll(async () => numero(await page.locator('#infoDist').textContent()))
      .toBeGreaterThan(3.9);
    expect(numero(await page.locator('#infoDist').textContent())).toBeLessThan(6.5);
  });

  test('o botão Hoje salta para a data atual', async ({ page }) => {
    await page.goto('/');
    await pronto(page);

    await page.locator('#btnPause').click(); // imobiliza o relógio simulado
    await page.locator('#btnToday').click();

    const hoje = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC'
    });
    await expect(page.locator('#date')).toHaveText(hoje);
  });

  test('CDN indisponível mostra erro acionável em vez de travar no loading', async ({ page }) => {
    await page.route('**/unpkg.com/**', (rota) => rota.abort());

    await page.goto('/');

    await expect(page.locator('#loading h2')).toHaveText('Não foi possível iniciar', { timeout: 30_000 });
    await expect(page.locator('#progressText button')).toHaveText('Tentar novamente');
    await expect(page.locator('#loading')).not.toHaveClass(/hide/);
  });
});
