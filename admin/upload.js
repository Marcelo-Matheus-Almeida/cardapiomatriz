const OWNER = 'Marcelo-Matheus-Almeida';
const REPOSITORY = 'cardapiomatriz';
const BRANCH = 'main';
const FILE_PATH = 'data/cardapio.json';
const DAY_KEYS = ['seg', 'ter', 'qua', 'qui', 'sex'];
const DAY_NAMES = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
const DAY_EMOJIS = ['🥩', '🍗', '🍖', '🥩', '🍲'];
const SECTION_TYPES = ['prato', 'acomp', 'salada', 'suco', 'sobremesa'];
const SECTION_NAMES = {
  prato: 'Prato Principal', acomp: 'Acompanhamentos', salada: 'Saladas',
  suco: 'Sucos', sobremesa: 'Sobremesa'
};
const SECTION_EMOJIS = { prato: '🍛', acomp: '🍚', salada: '🥗', suco: '🧃', sobremesa: '🍮' };
const COLUMN_BOUNDS = [[0.075, 0.273], [0.273, 0.46], [0.46, 0.64], [0.64, 0.815], [0.815, 0.985]];
const ROW_BOUNDS = [[0.15, 0.305], [0.305, 0.46], [0.46, 0.618], [0.618, 0.78], [0.78, 0.99]];

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
const weekInput = document.querySelector('#weekInput');
const validDateInput = document.querySelector('#validDateInput');
const validTimeInput = document.querySelector('#validTimeInput');
const imageDetails = document.querySelector('#imageDetails');
const sourceImage = document.querySelector('#sourceImage');

let accessToken = null;
let stagedMenu = null;
let publishComplete = false;
let currentAppVersion = null;
let imageObjectUrl = null;

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
      // O campo legado "main" não pertence ao JSON publicado.
      return {
        type: expectedType,
        title: cleanText(section.title || SECTION_NAMES[expectedType], SECTION_NAMES[expectedType]),
        emoji: cleanText(section.emoji || SECTION_EMOJIS[expectedType], `Emoji de ${SECTION_NAMES[expectedType]}`),
        items: section.items.map((item) => item.trim())
      };
    });

    return {
      key: DAY_KEYS[dayIndex],
      name: cleanText(day.name, 'Nome do dia'),
      emoji: cleanText(day.emoji || DAY_EMOJIS[dayIndex], 'Emoji do dia'),
      number: day.number,
      sections
    };
  });
  return { weekLabel, validUntil, days };
}

function localIso(date, time) {
  const local = new Date(`${date}T${time}:00`);
  if (!Number.isFinite(local.getTime())) throw new Error('Confira a data e o horário de validade.');
  const offsetMinutes = -local.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const offset = Math.abs(offsetMinutes);
  return `${date}T${time}:00${sign}${String(Math.floor(offset / 60)).padStart(2, '0')}:${String(offset % 60).padStart(2, '0')}`;
}

function dateInputValue(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function suggestedWeek() {
  const monday = new Date();
  monday.setHours(12, 0, 0, 0);
  const weekday = monday.getDay();
  monday.setDate(monday.getDate() - ((weekday + 6) % 7));
  if (weekday === 0 || weekday === 6) monday.setDate(monday.getDate() + 7);
  const friday = new Date(monday);
  friday.setDate(friday.getDate() + 4);
  return {
    weekLabel: `Semana de ${String(monday.getDate()).padStart(2, '0')}/${String(monday.getMonth() + 1).padStart(2, '0')}`,
    date: dateInputValue(friday)
  };
}

function setScheduleFields(menu) {
  const suggestion = suggestedWeek();
  weekInput.value = menu.weekLabel || suggestion.weekLabel;
  if (menu.validUntil) {
    const date = new Date(menu.validUntil);
    validDateInput.value = dateInputValue(date);
    validTimeInput.value = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  } else {
    validDateInput.value = suggestion.date;
    validTimeInput.value = '23:59';
  }
  updatePreviewMeta();
}

function updatePreviewMeta() {
  if (!weekInput.value || !validDateInput.value || !validTimeInput.value) {
    previewMeta.textContent = 'Preencha a semana e a validade abaixo.';
    return;
  }
  try {
    const expiry = new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'full', timeStyle: 'short', timeZone: 'America/Sao_Paulo'
    }).format(new Date(localIso(validDateInput.value, validTimeInput.value)));
    previewMeta.textContent = `${weekInput.value} · válido até ${expiry} (horário de Brasília)`;
  } catch (_) {
    previewMeta.textContent = 'Confira a semana e a validade abaixo.';
  }
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
      section.items.forEach((item) => {
        const entry = addText(list, 'li', item);
        entry.contentEditable = 'true';
        entry.spellcheck = true;
        entry.setAttribute('aria-label', `Editar item de ${section.title}, ${day.name}`);
      });
      category.appendChild(list);
      content.appendChild(category);
    });
    card.appendChild(content);
    preview.appendChild(card);
  });
  setScheduleFields(menu);
  previewSection.hidden = false;
}

function itemsFromPreview() {
  return Array.from(preview.querySelectorAll('.day-preview')).map((dayCard) =>
    Array.from(dayCard.querySelectorAll('.category')).map((category) =>
      Array.from(category.querySelectorAll('li')).map((item) => item.textContent.replace(/\s+/g, ' ').trim())
    )
  );
}

function collectApprovedMenu() {
  const weekLabel = cleanText(weekInput.value, 'Semana exibida');
  const validUntil = localIso(validDateInput.value, validTimeInput.value);
  const editedItems = itemsFromPreview();
  const menu = {
    weekLabel,
    validUntil,
    days: stagedMenu.days.map((day, dayIndex) => ({
      ...day,
      sections: day.sections.map((section, sectionIndex) => ({
        ...section,
        items: editedItems[dayIndex][sectionIndex]
      }))
    }))
  };
  if (menu.days.some((day) => day.sections.some((section) => section.items.some((item) => !item || item.startsWith('⚠ REVISAR:'))))) {
    throw new Error('Há uma categoria que o OCR não conseguiu ler. Corrija o aviso na prévia antes de publicar.');
  }
  return validateMenu(menu);
}

function linesToGrid(lines, width, height) {
  const grid = DAY_KEYS.map(() => SECTION_TYPES.map(() => []));
  lines.forEach((line) => {
    if (!line.bbox || (Number.isFinite(line.confidence) && line.confidence < 25)) return;
    const text = String(line.text || '').replace(/^[\s•·●▪\-–]+/, '').replace(/\s+/g, ' ').trim();
    if (!text) return;
    const x = ((line.bbox.x0 + line.bbox.x1) / 2) / width;
    const y = ((line.bbox.y0 + line.bbox.y1) / 2) / height;
    const column = COLUMN_BOUNDS.findIndex(([start, end]) => x >= start && x < end);
    const row = ROW_BOUNDS.findIndex(([start, end]) => y >= start && y < end);
    if (column < 0 || row < 0) return;
    grid[column][row].push({ text, top: line.bbox.y0, bottom: line.bbox.y1 });
  });

  return grid.map((dayRows) => dayRows.map((cellLines) => {
    cellLines.sort((a, b) => a.top - b.top);
    const items = [];
    cellLines.forEach((line) => {
      const previous = items[items.length - 1];
      if (previous && line.top - previous.bottom < height * 0.012) {
        previous.text = `${previous.text} ${line.text}`;
        previous.bottom = line.bottom;
      } else {
        items.push({ ...line });
      }
    });
    return items.map((item) => item.text.trim());
  }));
}

function menuFromOCR(grid) {
  const defaults = suggestedWeek();
  const days = DAY_KEYS.map((key, dayIndex) => ({
    key,
    name: DAY_NAMES[dayIndex],
    emoji: DAY_EMOJIS[dayIndex],
    number: dayIndex + 1,
    sections: SECTION_TYPES.map((type, sectionIndex) => ({
      type,
      title: SECTION_NAMES[type],
      emoji: SECTION_EMOJIS[type],
      items: grid[dayIndex][sectionIndex].length
        ? grid[dayIndex][sectionIndex]
        : ['⚠ REVISAR: OCR não identificou texto nesta categoria']
    }))
  }));
  return { weekLabel: defaults.weekLabel, validUntil: localIso(defaults.date, '23:59'), days };
}

async function readImage(file) {
  if (!window.Tesseract?.createWorker) throw new Error('O leitor de imagem não carregou. Verifique a conexão e tente novamente.');
  await sourceImage.decode();
  const width = sourceImage.naturalWidth;
  const height = sourceImage.naturalHeight;
  setStatus(fileStatus, 'Preparando o leitor de português. Na primeira vez pode demorar um pouco…');
  const worker = await window.Tesseract.createWorker('por', 1, {
    logger: (message) => {
      if (message.status === 'recognizing text' && Number.isFinite(message.progress)) {
        setStatus(fileStatus, `Lendo a imagem: ${Math.round(message.progress * 100)}%`);
      }
    }
  });
  try {
    const result = await worker.recognize(file);
    const grid = linesToGrid(result.data.lines || [], width, height);
    if (!grid.some((day) => day.some((cell) => cell.length))) throw new Error('Não consegui localizar os textos da tabela. Tente uma foto mais reta e com a tabela inteira visível.');
    return menuFromOCR(grid);
  } finally {
    await worker.terminate();
  }
}

function updatePublishButton() {
  publishButton.disabled = !accessToken || !stagedMenu || publishComplete || currentAppVersion === null;
}

async function loadFile(file) {
  stagedMenu = null;
  publishComplete = false;
  publishButton.disabled = true;
  publishButton.textContent = 'Aprovar e enviar ao GitHub';
  previewSection.hidden = true;
  imageDetails.hidden = true;
  setStatus(publishStatus, '');
  setStatus(fileStatus, '');
  if (!file) return;
  fileName.textContent = file.name;
  if (imageObjectUrl) URL.revokeObjectURL(imageObjectUrl);

  try {
    if (file.name.toLowerCase().endsWith('.json') || file.type === 'application/json') {
      stagedMenu = validateMenu(JSON.parse(await file.text()));
      renderPreview(stagedMenu);
      setStatus(fileStatus, 'JSON válido. Confira os dados e a prévia antes de aprovar.', 'success');
    } else if (file.type.startsWith('image/')) {
      imageObjectUrl = URL.createObjectURL(file);
      sourceImage.src = imageObjectUrl;
      imageDetails.hidden = false;
      const draft = await readImage(file);
      stagedMenu = validateMenu(draft);
      renderPreview(stagedMenu);
      const reviewCount = stagedMenu.days.reduce((total, day) => total + day.sections.filter((section) => section.items[0]?.startsWith('⚠ REVISAR:')).length, 0);
      setStatus(fileStatus, reviewCount
        ? `Leitura concluída, mas ${reviewCount} categoria(s) precisam de correção. Clique nos textos da prévia para editar.`
        : 'Leitura concluída. Confira os nomes reconhecidos; clique em qualquer prato para corrigir.', reviewCount ? 'error' : 'success');
    } else {
      throw new Error('Envie uma imagem JPG, PNG ou WEBP, ou um arquivo JSON.');
    }
    updatePublishButton();
  } catch (error) {
    stagedMenu = null;
    previewSection.hidden = true;
    setStatus(fileStatus, error.message || 'Não foi possível ler esse arquivo.', 'error');
    updatePublishButton();
  }
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

weekInput.addEventListener('input', updatePreviewMeta);
validDateInput.addEventListener('input', updatePreviewMeta);
validTimeInput.addEventListener('input', updatePreviewMeta);

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
  let approvedMenu;
  try {
    approvedMenu = collectApprovedMenu();
  } catch (error) {
    setStatus(publishStatus, error.message, 'error');
    return;
  }

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
  const confirmed = window.confirm(`A imagem e a prévia estão corretas? Isso vai substituir o cardápio no GitHub e iniciar o deploy da Netlify.\n\n${approvedMenu.weekLabel}\nVersão do app: ${appVersion}`);
  if (!confirmed) return;

  publishButton.disabled = true;
  publishButton.textContent = 'Enviando…';
  setStatus(publishStatus, 'Gravando o JSON no GitHub…');
  try {
    const url = `https://api.github.com/repos/${OWNER}/${REPOSITORY}/contents/${FILE_PATH}`;
    const current = await githubRequest(`${url}?ref=${BRANCH}`);
    const content = `${JSON.stringify({ ...approvedMenu, appVersion }, null, 2)}\n`;
    await githubRequest(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Atualiza cardápio: ${approvedMenu.weekLabel} (${appVersion})`,
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
