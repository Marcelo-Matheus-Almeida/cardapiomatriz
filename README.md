# 🍽️ Cardápio da Semana — Refeitório Matriz Assaí (PWA)

App do cardápio semanal do refeitório da Matriz do Assaí Atacadista.

## 📂 Estrutura
```
cardapio-assai/
├── index.html          → página principal
├── manifest.json       → configuração do app (PWA)
├── sw.js               → service worker (instalação + offline)
├── css/style.css       → visual, grid, responsividade e tema secreto
├── js/script.js        → filtro, destaque do dia, efeitos, PWA e easter egg
└── assets/
    ├── logo-assai.png          → logo oficial (transparente)
    ├── aero-wallpaper.jpg      → wallpaper do modo secreto
    ├── icon-192.png            → ícone do app
    ├── icon-512.png            → ícone do app
    ├── icon-maskable-512.png   → ícone adaptável (Android)
    └── apple-touch-icon.png    → ícone do app (iOS)
```

## ⚠️ IMPORTANTE — o PWA só funciona via HTTPS
O "instalar" e o offline só funcionam quando servido pelo **Netlify** (https),
NÃO abrindo o index.html direto do arquivo (file://). No Netlify já funciona.

## 📲 Como instalar no celular
- **Android (Chrome):** aparece o botão "Instalar app" na tela OU menu ⋮ →
  "Adicionar à tela inicial".
- **iPhone (Safari):** botão Compartilhar → "Adicionar à Tela de Início".
Depois disso o site abre em tela cheia, com ícone do Assaí, como um app.

## 🖥️ Layout
- Desktop (≥1000px): 5 dias lado a lado. Tablet: 2–3 colunas. Celular: 1 coluna.

## ✏️ Atualizar (toda segunda)
1. Troque o banner `Semana de 10/08` no index.html.
2. Edite os itens de cada dia.
3. IMPORTANTE: ao publicar update grande, suba o número da versão em sw.js
   (CACHE = 'cardapio-assai-v2') para forçar a atualização do cache.

## 🤫 Modo secreto Frutiger Aero (Y2K + shitpost)
Ativa/desativa: logo do Assaí 3x · Konami (↑↑↓↓←→←→BA) · cantinho invisível
inferior direito (3 toques).
