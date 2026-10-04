# Sistema Solar 3D

Animação interativa do Sistema Solar em tempo real, feita com **Three.js** (WebGL) em um único arquivo HTML — sem build, sem instalação.

![stack](https://img.shields.io/badge/three.js-0.169-6cf) ![sem build](https://img.shields.io/badge/build-nenhum-ffb347) [![Demo](https://img.shields.io/badge/demo-GitHub%20Pages-2ea44f?logo=github)](https://mkazimoto.github.io/SistemaSolar3D/) [![Verificações](https://github.com/mkazimoto/SistemaSolar3D/actions/workflows/ci.yml/badge.svg)](https://github.com/mkazimoto/SistemaSolar3D/actions/workflows/ci.yml)

**▶ Demo ao vivo: <https://mkazimoto.github.io/SistemaSolar3D/>** — publicado pelo GitHub Pages (veja [Publicação](#publicação)).

![Sistema Solar 3D — vista geral do sistema com órbitas, cinturões e o cometa 1P/Halley](docs/preview.png)

<sub>Vista geral: órbitas keplerianas, cinturão de asteroides, Cinturão de Kuiper, o cometa 1P/Halley e a data simulada no cabeçalho.</sub>

## Como executar

**Opção 0 — online**
Abra <https://mkazimoto.github.io/SistemaSolar3D/> (publicado automaticamente pelo workflow
`.github/workflows/deploy-pages.yml` a cada push na `main`).

**Opção 1 — direto no navegador**
Dê um duplo clique em `index.html`.

**Opção 2 — servidor local (recomendado se quiser evitar restrições do `file://`)**
Dê um duplo clique em `servir.bat` (requer Node.js) ou execute:

```powershell
node servidor.js 5500
```

Depois abra <http://localhost:5500>.

> O Three.js é carregado de CDN (unpkg), então é necessária conexão com a internet na primeira carga.

## Controles

| Ação | Como |
|---|---|
| Orbitar | arrastar com o mouse |
| Zoom | scroll |
| Focar um astro | clicar nele (ou usar o seletor **Foco**) |
| Pausar / retomar | botão **Pausar** ou `Espaço` |
| Velocidade do tempo | slider (0,05 a 500 dias por segundo) |
| Tamanho dos astros | slider (0,4× a 3×) — não altera as órbitas |
| Voltar à visão geral | botão **Resetar câmera** ou `R` |
| Ir para a data de hoje | botão **Hoje** ou `H` |
| Atalhos | `+` / `-` velocidade · `O` órbitas · `L` rótulos · `R` reset · `H` hoje |

Camadas que podem ser ligadas/desligadas: órbitas, rótulos, cinturão de asteroides,
cometa 1P/Halley e o efeito de brilho (*bloom*).

## O que está simulado

- **Órbitas keplerianas reais**: cada planeta usa os elementos orbitais J2000 (semi-eixo
  maior, excentricidade, inclinação, longitude do nodo ascendente Ω e argumento do periélio ω)
  e a anomalia média em J2000, de modo que as posições são as **reais e aproximadas** para a
  data simulada. A equação de Kepler (Newton-Raphson) é resolvida a cada quadro, então os
  planetas aceleram no periélio e desaceleram no afélio.
- **Eclíptica única**: órbitas dos planetas, cometa, cinturão de asteroides e Cinturão de
  Kuiper ficam todos no mesmo plano, e o eixo de rotação de cada planeta é perpendicular à
  sua órbita (inclinado pela obliquidade real) — é o que põe os anéis e as bandas na
  orientação correta.
- **Rotação e inclinação axial** de cada planeta (Vênus e Urano com rotação retrógrada;
  Urano com eixo inclinado 98°).
- **Luas**: Lua, Fobos, Deimos, as quatro luas galileanas, Encélado, Titã, Titânia e Tritão,
  girando no plano equatorial do respectivo planeta.
- **Anéis de Saturno** (com a Divisão de Cassini) e os anéis tênues de Urano.
- **Cinturão de asteroides** (1.600 rochas instanciadas), **Cinturão de Kuiper** e o
  **cometa 1P/Halley** com cauda que aponta sempre para o lado oposto ao Sol e cresce
  perto do periélio.
- **Data simulada** exibida no cabeçalho (parte de 1º de janeiro de 2026; o botão **Hoje**
  salta para a data atual) e **distância atual à Terra**, calculada das posições reais, no
  painel do astro selecionado.

### Texturas

Todas as texturas são **geradas proceduralmente** em canvas no navegador (ruído de valor +
FBM): continentes, calotas polares, nuvens e luzes noturnas da Terra, bandas turbulentas e a
Grande Mancha Vermelha de Júpiter, granulação solar e poeira lunar com crateras. Nenhum
arquivo de imagem externo é usado.

### Escalas

As distâncias e os tamanhos são **comprimidos** para caber na tela de forma legível
(distância ∝ √AU, raio ∝ R^0,55) — a proporção entre órbitas e períodos, porém, é
astronomicamente correta.

## Capturas

Vista aproximada de Saturno: bandas atmosféricas, anéis com a Divisão de Cassini e as luas Titã e Encélado.

![Saturno em detalhe, com anéis e luas](docs/saturno.png)

## Estrutura

```
index.html                          aplicação completa (HTML + CSS + JS em módulo)
servidor.js                         servidor estático mínimo, sem dependências (Node)
servir.bat                          sobe o servidor e abre o navegador
docs/                               capturas de tela usadas neste README
.nojekyll                           publica os arquivos como estão (sem processamento Jekyll)
.github/workflows/deploy-pages.yml  publicação automática no GitHub Pages
.github/workflows/ci.yml            validações a cada push / pull request
.editorconfig · .gitattributes      padronização de fim de linha e indentação
package.json                        só ferramentas de verificação (a aplicação não depende dele)
playwright.config.js                configuração dos testes de fumaça
tests/smoke.spec.js                 testes de fumaça (Playwright)
tools/check-syntax.mjs              valida a sintaxe do módulo embutido em index.html
```

## Verificações

A aplicação continua **sem build e sem dependências**: o `index.html` roda sozinho. O
`package.json` existe apenas para as verificações de desenvolvimento — nenhum arquivo dele é
publicado nem usado em tempo de execução.

```powershell
npm install                 # ferramentas de verificação
npx playwright install chromium   # apenas na primeira vez
npm run verificar           # sintaxe + HTML + testes
```

| Comando | O que verifica |
|---|---|
| `npm run check:syntax` | extrai o módulo ES embutido em `index.html` e valida a sintaxe com `node --check` (sem dependências — pega erro de edição/merge no arquivo principal) |
| `npm run lint:html` | `html-validate` no `index.html` |
| `npm test` | testes de fumaça com Playwright: montagem do HUD sem erros, controles (camadas, pausa, foco, reset), plausibilidade astronômica das distâncias à Terra, botão **Hoje** e o caso de **CDN indisponível** (que precisa mostrar erro acionável em vez de travar no *loading*) |

O workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) roda as três etapas a cada
push na `main` e em pull requests, **em paralelo ao deploy** — a publicação não depende delas,
então uma falha aqui aparece como aviso e não como site fora do ar.

## Publicação

O workflow `.github/workflows/deploy-pages.yml` publica o `index.html` no GitHub Pages sem etapa
de build, a cada push na `main` (ou manualmente em **Actions → Publicar no GitHub Pages → Run
workflow**). Ele se adapta às duas formas de configuração do Pages e nunca falha por causa da
origem escolhida:

| Origem em Settings → Pages | O que o workflow faz |
|---|---|
| **GitHub Actions** (recomendado) | Monta `_site/` com o `index.html` e publica por artefato (`configure-pages` → `upload-pages-artifact` → `deploy-pages`). Só o `index.html` vai para o ar, e o deploy é registrado no ambiente `github-pages`. |
| **Deploy from a branch** | Detecta a origem em branch, emite um aviso (`::warning`) e ignora o deploy por artefato — o site é publicado pela própria origem. A execução termina verde, sem falsos negativos. |

> Enquanto o Pages **não estiver habilitado**, o workflow falha logo no início com a orientação
de habilitá-lo: o `GITHUB_TOKEN` não tem permissão para criar o site do Pages (a action
`configure-pages` exige um PAT com escopo `repo`, ou um GitHub App com `administration:write` +
`pages:write`). Esse passo único é feito pelo dono do repositório.
