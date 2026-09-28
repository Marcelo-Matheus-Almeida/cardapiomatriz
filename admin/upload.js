const OWNER = 'Marcelo-Matheus-Almeida';
const REPOSITORY = 'cardapiomatriz';
const BRANCH = 'main';
const FILE_PATH = 'data/cardapio.json';
const DAY_KEYS = ['seg', 'ter', 'qua', 'qui', 'sex'];
const SECTION_TYPES = ['prato', 'acomp', 'salada', 'suco', 'sobremesa'];
const SECTION_NAMES = {
  prato: 'Prato Principal', acomp: 'Acompanhamentos', salada: 'Saladas',
  suco: 'Sucos', sobremesa: 'Sobremesa'
};

const loginButton = document.querySelector('#loginButton');
const authStatus = document.querySelector('#authStatus');
const fileInput = document.querySelector('#fileInput');
const dropZone = document.querySelector('#dropZone');
const fileName = document.querySelector('#fileName');
const fileStatus = document.querySelector('#fileStatus');
const previewSection = document.querySelector('#previewSection');
const previewMeta = document.querySelector('#previewMeta');
const preview = document.querySelector('#preview');
const publishButton = document.querySelector('#publishButton');
const publishStatus = document.querySelector('#publishStatus');

let accessToken = null;
let stagedMenu = null;
let publishComplete = false;
let currentAppVersion = null;

fetch('../data/cardapio.json', { cache: 'no-store' })
  .then((response) => response.ok ? response.json() : null)
  .then((menu) => { currentAppVersion = typeof menu?.appVersion === 'string' ? menu.appVersion : ''; updatePublishButton(); })
  .catch(() => { currentAppVersion = ''; updatePublishButton(); });

function setStatus(element, message, kind = '') {
  element.textContent = message;
  element.className = `${element === fileStatus ? 'status' : 'publish-status'} ${kind}`.trim();
}

function cleanText(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label}: preencha um texto válido.`);
  return value.trim();
}

function validateMenu(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('O JSON precisa conter um objeto de cardápio.');
  const weekLabel = cleanText(input.weekLabel, 'Semana exibida');
  const validUntil = cleanText(input.validUntil, 'Validade');
  if (!/^\d{4}-\d\d-\d\dT\d\d:\d\d(?::\d\d(?:\.\d+)?)?(?:Z|[+-]\d\d:\d\d)$/i.test(validUntil) || !Number.isFinite(Date.parse(validUntil))) {
    throw new Error('A validade deve ser uma data e hora ISO com fuso, por exemplo 2026-10-02T23:59:59-03:00.');
  }
  if (!Array.isArray(input.days) || input.days.length !== DAY_KEYS.length) throw new Error('O arquivo precisa ter exatamente os cinco dias úteis, de segunda a sexta.');

  const days = input.days.map((day, dayIndex) => {
    if (!day || day.key !== DAY_KEYS[dayIndex]) throw new Error('Organize os dias nesta ordem: seg, ter, qua, qui, sex.');
    if (day.number !== dayIndex + 1) throw new Error(`Use ${dayIndex + 1} como número de ${day.name || DAY_KEYS[dayIndex]}.`);
    if (!Array.isArray(day.sections) || day.sections.length !== SECTION_TYPES.length) throw new Error(`${day.name || DAY_KEYS[dayIndex]} precisa ter as cinco categorias do cardápio.`);

    const sections = day.sections.map((section, sectionIndex) => {
      const expectedType = SECTION_TYPES[sectionIndex];
      if (!section || section.type !== expectedType) throw new Error(`Em ${day.name || DAY_KEYS[dayIndex]}, as categorias devem estar nesta ordem: prato, acompanhamentos, saladas, sucos, sobremesa.`);
      if (!Array.isArray(section.items) || section.items.length === 0 || section.items.some((item) => typeof item !== 'string' || !item.trim())) {
        throw new Error(`${SECTION_NAMES[expectedType]} de ${day.name || DAY_KEYS[dayIndex]} precisa ter ao menos um item de texto.`);
      }
      // O campo legado "main" não faz parte do formato do painel nem do site.
      return {
        type: expectedType,
        title: cleanText(section.title || SECTION_NAMES[expectedType], SECTION_NAMES[expectedType]),
        emoji: cleanText(section.emoji, `Emoji de ${SECTION_NAMES[expectedType]}`),
        items: section.items.map((item) => item.trim())
      };
    });

    return {
      key: DAY_KEYS[dayIndex],
      name: cleanText(day.name, 'Nome do dia'),
      emoji: cleanText(day.emoji, 'Emoji do dia'),
      number: day.number,
      sections
    };
  });

  return { weekLabel, validUntil, days };
}

function addText(parent, tag, text, className) {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  parent.appendChild(element);
  return element;
}

function renderPreview(menu) {
  preview.replaceChildren();
  menu.days.forEach((day) => {
    const card = document.createElement('article');
    card.className = 'day-preview';
    const heading = document.createElement('div');
    heading.className = 'day-title';
    addText(heading, 'span', day.emoji, 'emoji');
    addText(heading, 'strong', day.name);
    card.appendChild(heading);

    const content = document.createElement('div');
    content.className = 'day-content';
    day.sections.forEach((section) => {
      const category = document.createElement('section');
      category.className = 'category';
      category.dataset.type = section.type;
      addText(category, 'h3', `${section.emoji} ${section.title}`);
      const list = document.createElement('ul');
      section.items.forEach((item) => addText(list, 'li', item));
      category.appendChild(list);
      content.appendChild(category);
    });
    card.appendChild(content);
    preview.appendChild(card);
  });

  const expiry = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'full', timeStyle: 'short', timeZone: 'America/Sao_Paulo'
  }).format(new Date(menu.validUntil));
  previewMeta.textContent = `${menu.weekLabel} · válido até ${expiry} (horário de Brasília)`;
  previewSection.hidden = false;
}

async function loadFile(file) {
  stagedMenu = null;
  publishComplete = false;
  publishButton.disabled = true;
  previewSection.hidden = true;
  setStatus(publishStatus, '');
  if (!file) return;
  fileName.textContent = file.name;
  try {
    const parsed = JSON.parse(await file.text());
    stagedMenu = validateMenu(parsed);
    renderPreview(stagedMenu);
    setStatus(fileStatus, 'Arquivo válido. Confira a prévia antes de aprovar.', 'success');
    updatePublishButton();
  } catch (error) {
    setStatus(fileStatus, error.message || 'Não foi possível ler esse arquivo JSON.', 'error');
  }
}

function updatePublishButton() {
  publishButton.disabled = !accessToken || !stagedMenu || publishComplete || currentAppVersion === null;
}

loginButton.addEventListener('click', () => {
  if (!window.netlify?.default) {
    authStatus.textContent = 'O serviço de login não carregou. Atualize a página e tente novamente.';
    return;
  }
  loginButton.disabled = true;
  authStatus.textContent = 'Aguardando autenticação do GitHub…';
  const authenticator = new window.netlify.default({});
  authenticator.authenticate({ provider: 'github', scope: 'repo' }, (error, result) => {
    loginButton.disabled = false;
    if (error || !result?.token) {
      authStatus.textContent = `Não foi possível conectar ao GitHub${error ? `: ${error}` : '.'}`;
      return;
    }
    accessToken = result.token;
    authStatus.textContent = 'GitHub conectado. A aprovação usará sua conta e permissão no repositório.';
    loginButton.textContent = 'Conectado';
    loginButton.disabled = true;
    updatePublishButton();
  });
});

fileInput.addEventListener('change', () => loadFile(fileInput.files[0]));
['dragenter', 'dragover'].forEach((eventName) => dropZone.addEventListener(eventName, (event) => {
  event.preventDefault();
  dropZone.classList.add('dragging');
}));
['dragleave', 'drop'].forEach((eventName) => dropZone.addEventListener(eventName, (event) => {
  event.preventDefault();
  dropZone.classList.remove('dragging');
}));
dropZone.addEventListener('drop', (event) => {
  const file = event.dataTransfer.files[0];
  if (file) loadFile(file);
});

async function githubRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${accessToken}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers || {})
    }
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || `GitHub respondeu com erro ${response.status}.`);
  return result;
}

function base64Utf8(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

publishButton.addEventListener('click', async () => {
  if (!accessToken || !stagedMenu || publishComplete) return;
  const enteredVersion = window.prompt(
    `Informe a nova versão do app. A versão atual é ${currentAppVersion || 'desconhecida'}.`,
    ''
  );
  if (enteredVersion === null) return;
  const appVersion = enteredVersion.trim();
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,39}$/.test(appVersion)) {
    setStatus(publishStatus, 'Informe uma versão de 1 a 40 caracteres: letras, números, ponto, hífen ou sublinhado.', 'error');
    return;
  }
  if (appVersion === currentAppVersion) {
    setStatus(publishStatus, 'A versão precisa ser diferente da atual para criar um cache novo.', 'error');
    return;
  }
  const confirmed = window.confirm(`A prévia está correta? Isso vai substituir o cardápio no GitHub e iniciar o deploy da Netlify.\n\n${stagedMenu.weekLabel}\nVersão do app: ${appVersion}`);
  if (!confirmed) return;

  publishButton.disabled = true;
  publishButton.textContent = 'Enviando…';
  setStatus(publishStatus, 'Lendo a versão atual do arquivo no GitHub…');
  try {
    const url = `https://api.github.com/repos/${OWNER}/${REPOSITORY}/contents/${FILE_PATH}`;
    const current = await githubRequest(`${url}?ref=${BRANCH}`);
    const content = `${JSON.stringify({ ...stagedMenu, appVersion }, null, 2)}\n`;
    await githubRequest(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Atualiza cardápio: ${stagedMenu.weekLabel} (${appVersion})`,
        content: base64Utf8(content),
        sha: current.sha,
        branch: BRANCH
      })
    });
    publishComplete = true;
    publishButton.textContent = 'Enviado ao GitHub';
    setStatus(publishStatus, 'Atualização enviada. O GitHub registrou o commit e a Netlify iniciará o deploy automaticamente.', 'success');
  } catch (error) {
    setStatus(publishStatus, `Não foi possível publicar: ${error.message}`, 'error');
    publishButton.textContent = 'Tentar publicar novamente';
    updatePublishButton();
  }
});
