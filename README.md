<div align="center">

# 🍽️ Cardápio da Semana — Refeitório Assaí

**Progressive Web App (PWA) para exibição do cardápio semanal do refeitório da Matriz do Assaí Atacadista.**

Um site leve, responsivo e instalável, com destaque automático para o cardápio do dia, layout adaptativo (hero + grade no desktop, carrossel no mobile) e um easter egg escondido. 🥚

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)

![Sem dependências](https://img.shields.io/badge/depend%C3%AAncias-nenhuma-brightgreen?style=flat-square)
![Vanilla JS](https://img.shields.io/badge/vanilla-JS-yellow?style=flat-square)
![Responsivo](https://img.shields.io/badge/responsivo-100%25-blue?style=flat-square)
![Offline](https://img.shields.io/badge/funciona-offline-success?style=flat-square)

</div>

---

## ✨ Destaques

- 🗓️ **Destaque automático do dia** — o cardápio de hoje aparece em evidência assim que o site abre (baseado na data do dispositivo).
- 🖥️ **Layout adaptativo** — no desktop, um *hero* largo do dia + a grade completa da semana; no mobile, carrossel horizontal com *swipe*.
- 📲 **Instalável (PWA)** — pode ser adicionado à tela inicial e funciona **offline** via *service worker*.
- 🎨 **Identidade visual Assaí** — paleta oficial da marca, com fundo animado em *mesh gradient* e cartões em *glassmorphism*.
- ⚡ **Zero dependências** — HTML, CSS e JavaScript puro (*vanilla*). Sem frameworks, sem *build*.
- 🥚 **Easter egg secreto** — um tema alternativo escondido, ativado por combinações ocultas.

---

## 🖼️ Preview

> As imagens abaixo ilustram o layout desktop (hero + grade) e o mobile (carrossel).

<div align="center">

| Desktop | Mobile |
|:-------:|:------:|
| _hero do dia + grade da semana_ | _abre no dia atual + carrossel_ |

</div>

<!-- Dica: adicione capturas de tela reais em /docs e referencie aqui:
![Desktop](docs/preview-desktop.png)
![Mobile](docs/preview-mobile.png)
-->

---

## 🚀 Funcionalidades

| Recurso | Descrição |
|---|---|
| **Cardápio do dia** | Identifica o dia da semana e destaca automaticamente o cardápio correspondente. |
| **Hero (desktop)** | Painel amplo com as 5 categorias (prato principal, acompanhamentos, saladas, sucos e sobremesa) distribuídas em colunas. |
| **Carrossel (mobile)** | Navegação horizontal com *scroll-snap*, indicadores (*dots*) e abas de atalho. |
| **Filtro por abas** | Botões para pular direto para qualquer dia da semana. |
| **PWA / Offline** | *Manifest* + *service worker* com cache dos assets; instalação na tela inicial. |
| **Tema secreto** | Estética alternativa retrô ativada por *gestos/atalhos* ocultos, com persistência via `localStorage`. |

---

## 🛠️ Tecnologias

- **HTML5** semântico
- **CSS3** — Grid, Flexbox, *custom properties*, animações, *backdrop-filter*, *media queries*
- **JavaScript (ES6+)** — sem bibliotecas externas
- **Web APIs** — Service Worker, Web App Manifest, IntersectionObserver, `localStorage`, `matchMedia`

---

## 📂 Estrutura do projeto

```
cardapio-assai/
├── index.html            # Marcação e conteúdo do cardápio
├── manifest.json         # Configuração do PWA (nome, ícones, cores)
├── sw.js                 # Service worker (cache/offline)
├── css/
│   └── style.css         # Estilos, layout responsivo e temas
├── js/
│   └── script.js         # Lógica de UI, carrossel, PWA e interações
└── assets/
    ├── logo-assai.png
    ├── icon-192.png
    ├── icon-512.png
    ├── icon-maskable-512.png
    └── apple-touch-icon.png
```

---

## ▶️ Como executar localmente

Como o projeto usa **Service Worker**, ele precisa ser servido via **HTTP(S)** — abrir o `index.html` direto pelo `file://` não habilita o PWA.

**Opção 1 — Python:**
```bash
git clone https://github.com/<seu-usuario>/cardapio-assai.git
cd cardapio-assai
python -m http.server 8080
# acesse http://localhost:8080
```

**Opção 2 — Node (serve):**
```bash
npx serve .
```

**Opção 3 — VS Code:** extensão *Live Server* → *Open with Live Server*.

---

## 📲 Instalação (PWA)

- **Android (Chrome):** banner/botão **"Instalar app"** ou menu **⋮ → Adicionar à tela inicial**.
- **iOS (Safari):** **Compartilhar → Adicionar à Tela de Início**.

Após instalado, abre em tela cheia, com ícone próprio, como um aplicativo nativo.

---

## 🔄 Atualização do cardápio

O conteúdo é editado diretamente no `index.html`:

1. Atualize o texto do banner da semana (ex.: `Semana de 10/08`).
2. Edite os itens (`<li>`) de cada dia dentro dos blocos `.day-card`.

> O *hero* e o *carrossel* são gerados dinamicamente a partir dos cards — nenhuma outra alteração é necessária. Ao publicar mudanças estruturais, incremente a versão do cache em `sw.js`.

---

## 🌐 Deploy

Projeto 100% estático — compatível com qualquer hospedagem de arquivos:

- **Netlify** (deploy por *drag & drop* da pasta) ✅ *em produção*
- GitHub Pages
- Vercel / Cloudflare Pages

---

## 🗺️ Roadmap

- [ ] Captura de telas na pasta `docs/`
- [ ] Botão para exportar o cardápio em PDF
- [ ] Notificações do dia via Web Push
- [ ] Painel simples para edição do cardápio

---

## 📄 Licença

Distribuído sob a licença **MIT**. Consulte o arquivo `LICENSE` para mais detalhes.

> **Aviso:** a marca, o logotipo e a identidade visual do **Assaí Atacadista** pertencem aos seus respectivos detentores. Este é um projeto interno/demonstrativo, sem vínculo oficial.

---

<div align="center">

Feito com ❤️ e 🍚 para o refeitório da Matriz.

</div>
