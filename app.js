// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
let appData = {
  tools: [],
  prompts: [],
  cases: []
};

let favorites = {
  tools: new Set(),
  prompts: new Set(),
  cases: new Set()
};

let currentTab = 'tools';
let currentFilters = {
  category: null,
  tag: null,
  search: ''
};

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
  initTelegramWebApp();
  loadSettings();
  loadFavorites();
  loadData();
  setupEventListeners();
  checkOnlineStatus();
});

// ===== TELEGRAM WEB APP =====
function initTelegramWebApp() {
  if (window.Telegram && window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
    
    // Установка цвета темы
    const theme = localStorage.getItem('theme') || 'dark';
    if (theme === 'dark') {
      tg.setHeaderColor('#1a1a2e');
      tg.setBackgroundColor('#1a1a2e');
    } else {
      tg.setHeaderColor('#f5f5f5');
      tg.setBackgroundColor('#f5f5f5');
    }
    
    // Обработка закрытия
    tg.onEvent('viewportChanged', () => {
      tg.expand();
    });
  }
}

// ===== ЗАГРУЗКА ДАННЫХ =====
async function loadData() {
  try {
    // Пытаемся загрузить из кэша
    const cached = localStorage.getItem('appDataCache');
    if (cached) {
      const cachedData = JSON.parse(cached);
      const cacheTime = localStorage.getItem('appDataCacheTime');
      const now = Date.now();
      
      // Используем кэш, если он свежее 24 часов
      if (cacheTime && (now - parseInt(cacheTime)) < 86400000) {
        appData = cachedData;
        renderCurrentTab();
        showToast('Данные загружены из кэша', 'success');
      }
    }
    
    // Пытаемся загрузить свежие данные
    try {
      const response = await fetch('data.json');
      if (response.ok) {
        const data = await response.json();
        appData = data;
        localStorage.setItem('appDataCache', JSON.stringify(data));
        localStorage.setItem('appDataCacheTime', Date.now().toString());
        renderCurrentTab();
        showToast('Данные обновлены', 'success');
      }
    } catch (error) {
      console.warn('Не удалось загрузить данные с сервера, используем кэш');
      if (!cached) {
        showToast('Ошибка загрузки данных. Проверьте подключение к интернету.', 'error');
      }
    }
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
    showToast('Ошибка загрузки данных', 'error');
  }
}

// ===== НАСТРОЙКИ =====
function loadSettings() {
  const theme = localStorage.getItem('theme') || 'dark';
  const fontSize = localStorage.getItem('fontSize') || 'medium';
  const buttonSize = localStorage.getItem('buttonSize') || 'medium';
  
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.setAttribute('data-font-size', fontSize);
  document.documentElement.setAttribute('data-button-size', buttonSize);
  
  const themeSelect = document.getElementById('theme-select');
  const fontSizeSelect = document.getElementById('font-size-select');
  const buttonSizeSelect = document.getElementById('button-size-select');
  
  if (themeSelect) themeSelect.value = theme;
  if (fontSizeSelect) fontSizeSelect.value = fontSize;
  if (buttonSizeSelect) buttonSizeSelect.value = buttonSize;
}

function saveSettings() {
  const theme = document.getElementById('theme-select').value;
  const fontSize = document.getElementById('font-size-select').value;
  const buttonSize = document.getElementById('button-size-select').value;
  
  localStorage.setItem('theme', theme);
  localStorage.setItem('fontSize', fontSize);
  localStorage.setItem('buttonSize', buttonSize);
  
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.setAttribute('data-font-size', fontSize);
  document.documentElement.setAttribute('data-button-size', buttonSize);
  
  // Обновляем Telegram Web App тему
  if (window.Telegram && window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp;
    if (theme === 'dark') {
      tg.setHeaderColor('#1a1a2e');
      tg.setBackgroundColor('#1a1a2e');
    } else {
      tg.setHeaderColor('#f5f5f5');
      tg.setBackgroundColor('#f5f5f5');
    }
  }
  
  showToast('Настройки сохранены', 'success');
}

// ===== ЗАКЛАДКИ =====
function loadFavorites() {
  const saved = localStorage.getItem('favorites');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      favorites.tools = new Set(parsed.tools || []);
      favorites.prompts = new Set(parsed.prompts || []);
      favorites.cases = new Set(parsed.cases || []);
    } catch (e) {
      console.error('Ошибка загрузки закладок:', e);
    }
  }
}

function saveFavorites() {
  const toSave = {
    tools: Array.from(favorites.tools),
    prompts: Array.from(favorites.prompts),
    cases: Array.from(favorites.cases)
  };
  localStorage.setItem('favorites', JSON.stringify(toSave));
}

function toggleFavorite(type, id) {
  if (favorites[type].has(id)) {
    favorites[type].delete(id);
  } else {
    favorites[type].add(id);
  }
  saveFavorites();
  renderCurrentTab();
  updateFavoriteButtons(type, id);
}

function isFavorite(type, id) {
  return favorites[type].has(id);
}

function updateFavoriteButtons(type, id) {
  const btn = document.getElementById(`favorite-${type}-btn`);
  if (btn) {
    btn.classList.toggle('active', isFavorite(type, id));
    btn.setAttribute('aria-label', isFavorite(type, id) ? 'Удалить из закладок' : 'Добавить в закладки');
  }
}

// ===== НАВИГАЦИЯ =====
function setupEventListeners() {
  // Навигация по вкладкам
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const tab = btn.dataset.tab;
      if (tab) {
        switchTab(tab);
      }
    });
  });
  
  // Поиск
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentFilters.search = e.target.value.toLowerCase();
      const clearBtn = document.getElementById('search-clear');
      if (clearBtn) {
        clearBtn.style.display = currentFilters.search ? 'flex' : 'none';
      }
      renderCurrentTab();
    });
  }
  
  // Очистка поиска
  const searchClear = document.getElementById('search-clear');
  if (searchClear) {
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      currentFilters.search = '';
      searchClear.style.display = 'none';
      renderCurrentTab();
    });
  }
  
  // Модальные окна
  setupModalListeners();
  
  // Настройки
  setupSettingsListeners();
  
  // Экспорт/импорт
  setupExportImportListeners();
  
  // Оффлайн статус
  window.addEventListener('online', () => {
    document.getElementById('offline-indicator').style.display = 'none';
    loadData();
  });
  
  window.addEventListener('offline', () => {
    document.getElementById('offline-indicator').style.display = 'block';
  });
}

function switchTab(tab) {
  currentTab = tab;
  
  // Обновляем активную кнопку
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  
  // Обновляем активную вкладку
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === `${tab}-tab`);
  });
  
  // Очищаем фильтры
  currentFilters.category = null;
  currentFilters.tag = null;
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.value = '';
  }
  currentFilters.search = '';
  const searchClear = document.getElementById('search-clear');
  if (searchClear) {
    searchClear.style.display = 'none';
  }
  
  renderCurrentTab();
}

// ===== РЕНДЕРИНГ =====
function renderCurrentTab() {
  const container = document.getElementById(`${currentTab}-grid`);
  if (!container) return;
  
  let items = [];
  let filteredItems = [];
  
  switch (currentTab) {
    case 'tools':
      items = appData.tools || [];
      break;
    case 'prompts':
      items = appData.prompts || [];
      break;
    case 'cases':
      items = appData.cases || [];
      break;
  }
  
  // Фильтрация
  filteredItems = filterItems(items);
  
  // Рендеринг
  if (filteredItems.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-text">Ничего не найдено</div>
      </div>
    `;
  } else {
    container.innerHTML = filteredItems.map(item => {
      switch (currentTab) {
        case 'tools':
          return renderToolCard(item);
        case 'prompts':
          return renderPromptCard(item);
        case 'cases':
          return renderCaseCard(item);
      }
    }).join('');
    
    // Добавляем обработчики событий
    attachCardListeners();
  }
  
  // Обновляем фильтры (отключены)
  updateFilters();
}

function filterItems(items) {
  return items.filter(item => {
    // Поиск
    if (currentFilters.search) {
      const searchLower = currentFilters.search.toLowerCase();
      const searchableText = [
        item.name || item.title,
        item.short || item.description,
        (item.tags || []).join(' '),
        item.category || '',
        item.prompt_text || ''
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(searchLower)) {
        return false;
      }
    }
    
    // Фильтр по категории
    if (currentFilters.category && item.category !== currentFilters.category) {
      return false;
    }
    
    // Фильтр по тегу
    if (currentFilters.tag && (!item.tags || !item.tags.includes(currentFilters.tag))) {
      return false;
    }
    
    return true;
  });
}

function updateFilters() {
  // Фильтры отключены - убираем их из интерфейса
  const container = document.getElementById('filter-container');
  if (container) {
    container.innerHTML = '';
  }
}

// ===== РЕНДЕРИНГ КАРТОЧЕК =====
function renderToolCard(tool) {
  const isFav = isFavorite('tools', tool.id);
  return `
    <div class="card" data-id="${tool.id}" data-type="tool">
      <div class="card-header">
        <div>
          <h3 class="card-title">${escapeHtml(tool.name)}</h3>
        </div>
        <button class="card-favorite ${isFav ? 'active' : ''}" 
                data-type="tools" 
                data-id="${tool.id}"
                aria-label="${isFav ? 'Удалить из закладок' : 'Добавить в закладки'}">
          ⭐
        </button>
      </div>
      <p class="card-short">${escapeHtml(tool.short)}</p>
    </div>
  `;
}

function renderPromptCard(prompt) {
  const isFav = isFavorite('prompts', prompt.id);
  return `
    <div class="card" data-id="${prompt.id}" data-type="prompt">
      <div class="card-header">
        <div>
          <h3 class="card-title">${escapeHtml(prompt.title)}</h3>
        </div>
        <button class="card-favorite ${isFav ? 'active' : ''}" 
                data-type="prompts" 
                data-id="${prompt.id}"
                aria-label="${isFav ? 'Удалить из закладок' : 'Добавить в закладки'}">
          ⭐
        </button>
      </div>
      ${prompt.notes ? `<p class="card-short">${escapeHtml(prompt.notes)}</p>` : ''}
    </div>
  `;
}

function renderCaseCard(caseItem) {
  const isFav = isFavorite('cases', caseItem.id);
  return `
    <div class="card" data-id="${caseItem.id}" data-type="case">
      <div class="card-header">
        <div>
          <h3 class="card-title">${escapeHtml(caseItem.title)}</h3>
        </div>
        <button class="card-favorite ${isFav ? 'active' : ''}" 
                data-type="cases" 
                data-id="${caseItem.id}"
                aria-label="${isFav ? 'Удалить из закладок' : 'Добавить в закладки'}">
          ⭐
        </button>
      </div>
      <p class="card-short">${escapeHtml(caseItem.description)}</p>
    </div>
  `;
}

function attachCardListeners() {
  document.querySelectorAll('.card').forEach(card => {
    const type = card.dataset.type;
    const id = card.dataset.id;
    
    // Клик по карточке
    card.addEventListener('click', (e) => {
      // Игнорируем клики по кнопке избранного
      if (e.target.closest('.card-favorite')) {
        return;
      }
      
      if (type === 'tool') {
        openToolModal(id);
      } else if (type === 'prompt') {
        openPromptModal(id);
      } else if (type === 'case') {
        openCaseModal(id);
      }
    });
    
    // Кнопка избранного
    const favBtn = card.querySelector('.card-favorite');
    if (favBtn) {
      favBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const favType = favBtn.dataset.type;
        const favId = favBtn.dataset.id;
        toggleFavorite(favType, favId);
      });
    }
  });
}

// ===== МОДАЛЬНЫЕ ОКНА =====
function setupModalListeners() {
  // Промпт модалка
  const promptModal = document.getElementById('prompt-modal');
  const promptClose = document.getElementById('modal-close');
  const copyPromptBtn = document.getElementById('copy-prompt-btn');
  const copyTemplateBtn = document.getElementById('copy-template-btn');
  const favoritePromptBtn = document.getElementById('favorite-prompt-btn');
  
  if (promptClose) {
    promptClose.addEventListener('click', () => closeModal('prompt-modal'));
  }
  
  if (copyPromptBtn) {
    // Универсальная обработка для всех устройств
    const handleCopyPrompt = (e) => {
      e.stopPropagation();
      copyPrompt();
    };
    
    copyPromptBtn.addEventListener('click', handleCopyPrompt);
    // Для мобильных устройств также обрабатываем touch события
    copyPromptBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      handleCopyPrompt(e);
    }, { passive: false });
  }
  
  if (copyTemplateBtn) {
    // Универсальная обработка для всех устройств
    const handleCopyTemplate = (e) => {
      e.stopPropagation();
      copyPromptAsTemplate();
    };
    
    copyTemplateBtn.addEventListener('click', handleCopyTemplate);
    // Для мобильных устройств также обрабатываем touch события
    copyTemplateBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      handleCopyTemplate(e);
    }, { passive: false });
  }
  
  if (favoritePromptBtn) {
    favoritePromptBtn.addEventListener('click', () => {
      const id = promptModal.dataset.id;
      if (id) {
        toggleFavorite('prompts', id);
        updateFavoriteButtons('prompts', id);
      }
    });
  }
  
  // Инструмент модалка
  const toolModal = document.getElementById('tool-modal');
  const toolClose = document.getElementById('tool-modal-close');
  const toolLinkBtn = document.getElementById('tool-link-btn');
  const favoriteToolBtn = document.getElementById('favorite-tool-btn');
  
  if (toolClose) {
    toolClose.addEventListener('click', () => closeModal('tool-modal'));
  }
  
  if (favoriteToolBtn) {
    favoriteToolBtn.addEventListener('click', () => {
      const id = toolModal.dataset.id;
      if (id) {
        toggleFavorite('tools', id);
        updateFavoriteButtons('tools', id);
      }
    });
  }
  
  // Кейс модалка
  const caseModal = document.getElementById('case-modal');
  const caseClose = document.getElementById('case-modal-close');
  const favoriteCaseBtn = document.getElementById('favorite-case-btn');
  
  if (caseClose) {
    caseClose.addEventListener('click', () => closeModal('case-modal'));
  }
  
  if (favoriteCaseBtn) {
    favoriteCaseBtn.addEventListener('click', () => {
      const id = caseModal.dataset.id;
      if (id) {
        toggleFavorite('cases', id);
        updateFavoriteButtons('cases', id);
      }
    });
  }
  
  // Закрытие по клику вне модалки
  [promptModal, toolModal, caseModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal.id);
        }
      });
    }
  });
  
  // Закрытие по Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });
}

function openPromptModal(id) {
  const prompt = appData.prompts.find(p => p.id === id);
  if (!prompt) return;
  
  const modal = document.getElementById('prompt-modal');
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');
  const favoriteBtn = document.getElementById('favorite-prompt-btn');
  const copyPromptBtn = document.getElementById('copy-prompt-btn');
  const copyTemplateBtn = document.getElementById('copy-template-btn');
  
  modal.dataset.id = id;
  title.textContent = prompt.title;
  
  let html = '';
  if (prompt.category) {
    html += `<p><strong>Категория:</strong> ${escapeHtml(prompt.category)}</p>`;
  }
  if (prompt.notes) {
    html += `<p>${escapeHtml(prompt.notes)}</p>`;
  }
  html += `<div style="background: var(--bg-primary); padding: 16px; border-radius: 8px; margin: 16px 0;">`;
  html += `<pre style="white-space: pre-wrap; word-wrap: break-word; font-family: inherit; margin: 0;">${escapeHtml(prompt.prompt_text)}</pre>`;
  html += `</div>`;
  
  if (prompt.difficulty) {
    html += `<p><strong>Сложность:</strong> ${escapeHtml(prompt.difficulty)}</p>`;
  }
  
  body.innerHTML = html;
  
  // Обновляем кнопку избранного
  if (favoriteBtn) {
    favoriteBtn.classList.toggle('active', isFavorite('prompts', id));
  }
  
  // Убеждаемся, что кнопки доступны и кликабельны
  if (copyPromptBtn) {
    copyPromptBtn.style.pointerEvents = 'auto';
    copyPromptBtn.style.zIndex = '10';
  }
  
  if (copyTemplateBtn) {
    copyTemplateBtn.style.pointerEvents = 'auto';
    copyTemplateBtn.style.zIndex = '10';
  }
  
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function openToolModal(id) {
  const tool = appData.tools.find(t => t.id === id);
  if (!tool) return;
  
  const modal = document.getElementById('tool-modal');
  const title = document.getElementById('tool-modal-title');
  const body = document.getElementById('tool-modal-body');
  const linkBtn = document.getElementById('tool-link-btn');
  const favoriteBtn = document.getElementById('favorite-tool-btn');
  
  modal.dataset.id = id;
  title.textContent = tool.name;
  
  let html = `<p class="card-short">${escapeHtml(tool.short)}</p>`;
  
  if (tool.advantages && tool.advantages.length > 0) {
    html += `<h3>Преимущества:</h3><ul>`;
    tool.advantages.forEach(adv => {
      html += `<li>${escapeHtml(adv)}</li>`;
    });
    html += `</ul>`;
  }
  
  if (tool.use_cases && tool.use_cases.length > 0) {
    html += `<h3>Как использовать на уроке:</h3><ul>`;
    tool.use_cases.forEach(uc => {
      html += `<li>${escapeHtml(uc)}</li>`;
    });
    html += `</ul>`;
  }
  
  if (tool.example_prompt) {
    html += `<h3>Пример промпта:</h3>`;
    html += `<div style="background: var(--bg-primary); padding: 16px; border-radius: 8px; margin: 16px 0;">`;
    html += `<pre style="white-space: pre-wrap; word-wrap: break-word; font-family: inherit; margin: 0;">${escapeHtml(tool.example_prompt)}</pre>`;
    html += `</div>`;
  }
  
  if (tool.tags && tool.tags.length > 0) {
    html += `<div class="card-tags" style="margin-top: 16px;">`;
    tool.tags.forEach(tag => {
      html += `<span class="card-tag">${escapeHtml(tag)}</span>`;
    });
    html += `</div>`;
  }
  
  body.innerHTML = html;
  
  if (linkBtn) {
    linkBtn.href = tool.link;
    linkBtn.textContent = `Открыть ${tool.name}`;
  }
  
  if (favoriteBtn) {
    favoriteBtn.classList.toggle('active', isFavorite('tools', id));
  }
  
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function openCaseModal(id) {
  const caseItem = appData.cases.find(c => c.id === id);
  if (!caseItem) return;
  
  const modal = document.getElementById('case-modal');
  const title = document.getElementById('case-modal-title');
  const body = document.getElementById('case-modal-body');
  const favoriteBtn = document.getElementById('favorite-case-btn');
  
  modal.dataset.id = id;
  title.textContent = caseItem.title;
  
  let html = `<p class="card-short">${escapeHtml(caseItem.description)}</p>`;
  
  if (caseItem.learning_objectives && caseItem.learning_objectives.length > 0) {
    html += `<h3>Задачи для учеников:</h3><ul>`;
    caseItem.learning_objectives.forEach(obj => {
      html += `<li>${escapeHtml(obj)}</li>`;
    });
    html += `</ul>`;
  }
  
  if (caseItem.scenario) {
    html += `<h3>Сценарий:</h3><p>${escapeHtml(caseItem.scenario)}</p>`;
  }
  
  if (caseItem.questions && caseItem.questions.length > 0) {
    html += `<h3>Вопросы для анализа:</h3><ul>`;
    caseItem.questions.forEach(q => {
      html += `<li>${escapeHtml(q)}</li>`;
    });
    html += `</ul>`;
  }
  
  if (caseItem.solutions && caseItem.solutions.length > 0) {
    html += `<h3>Варианты решений:</h3>`;
    caseItem.solutions.forEach((sol, idx) => {
      html += `<div style="margin-bottom: 16px; padding: 12px; background: var(--bg-primary); border-radius: 8px;">`;
      html += `<strong>${idx + 1}. ${escapeHtml(sol.option)}</strong>`;
      if (sol.pros) html += `<p style="margin: 8px 0 4px; color: var(--success);">✓ ${escapeHtml(sol.pros)}</p>`;
      if (sol.cons) html += `<p style="margin: 4px 0; color: var(--error);">✗ ${escapeHtml(sol.cons)}</p>`;
      html += `</div>`;
    });
  }
  
  if (caseItem.steps && caseItem.steps.length > 0) {
    html += `<h3>Рекомендации по проведению:</h3><ol>`;
    caseItem.steps.forEach(step => {
      html += `<li>${escapeHtml(step)}</li>`;
    });
    html += `</ol>`;
  }
  
  if (caseItem.materials && caseItem.materials.length > 0) {
    html += `<h3>Дополнительные материалы:</h3><ul>`;
    caseItem.materials.forEach(mat => {
      html += `<li>${escapeHtml(mat)}</li>`;
    });
    html += `</ul>`;
  }
  
  if (caseItem.duration) {
    html += `<p><strong>Длительность:</strong> ${escapeHtml(caseItem.duration)}</p>`;
  }
  
  body.innerHTML = html;
  
  if (favoriteBtn) {
    favoriteBtn.classList.toggle('active', isFavorite('cases', id));
  }
  
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

function closeAllModals() {
  closeModal('prompt-modal');
  closeModal('tool-modal');
  closeModal('case-modal');
}

async function copyPrompt() {
  const modal = document.getElementById('prompt-modal');
  const id = modal.dataset.id;
  if (!id) return;
  
  const prompt = appData.prompts.find(p => p.id === id);
  if (!prompt) return;
  
  const success = await copyToClipboard(prompt.prompt_text);
  if (success) {
    showToast('Промпт скопирован', 'success');
  }
}

async function copyPromptAsTemplate() {
  const modal = document.getElementById('prompt-modal');
  const id = modal.dataset.id;
  if (!id) return;
  
  const prompt = appData.prompts.find(p => p.id === id);
  if (!prompt) return;
  
  // Заменяем плейсхолдеры на примеры
  let template = prompt.prompt_text
    .replace(/\[предмет\]/g, 'биология')
    .replace(/\[класс\]/g, '8')
    .replace(/\[тема\]/g, 'Иммунитет');
  
  const success = await copyToClipboard(template);
  if (success) {
    showToast('Шаблон скопирован', 'success');
  }
}

async function copyToClipboard(text) {
  try {
    // Пробуем Telegram Web App API (если доступен)
    if (window.Telegram && window.Telegram.WebApp) {
      try {
        window.Telegram.WebApp.ready();
        // Telegram Web App может иметь свой способ копирования
        // Пробуем стандартный API
      } catch (e) {
        console.log('Telegram Web App доступен, но без специального API копирования');
      }
    }
    
    // Пробуем современный Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      // Проверяем, что мы в безопасном контексте (HTTPS или localhost)
      if (window.isSecureContext || location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        await navigator.clipboard.writeText(text);
        return true;
      }
    }
    
    // Fallback для старых браузеров и мобильных устройств
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.width = '2em';
    textarea.style.height = '2em';
    textarea.style.padding = '0';
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.boxShadow = 'none';
    textarea.style.background = 'transparent';
    textarea.style.opacity = '0';
    textarea.style.zIndex = '9999';
    textarea.setAttribute('readonly', '');
    document.body.appendChild(textarea);
    
    // Для мобильных устройств используем другой подход
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      textarea.contentEditable = true;
      textarea.readOnly = false;
      const range = document.createRange();
      range.selectNodeContents(textarea);
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        selection.removeAllRanges();
      }
      selection.addRange(range);
      textarea.setSelectionRange(0, 999999);
    } else {
      textarea.focus();
      textarea.select();
    }
    
    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      return successful;
    } catch (err) {
      document.body.removeChild(textarea);
      throw err;
    }
  } catch (err) {
    console.error('Ошибка копирования:', err);
    // Показываем текст в модальном окне для ручного копирования
    showToast('Нажмите на текст промпта для выделения', 'error');
    return false;
  }
}

// ===== НАСТРОЙКИ =====
function setupSettingsListeners() {
  const settingsBtn = document.getElementById('settings-btn');
  const settingsPanel = document.getElementById('settings-panel');
  const settingsClose = document.getElementById('settings-close');
  const themeSelect = document.getElementById('theme-select');
  const fontSizeSelect = document.getElementById('font-size-select');
  const buttonSizeSelect = document.getElementById('button-size-select');
  const clearCacheBtn = document.getElementById('clear-cache-btn');
  
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      settingsPanel.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  }
  
  if (settingsClose) {
    settingsClose.addEventListener('click', () => {
      settingsPanel.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      saveSettings();
    });
  }
  
  if (themeSelect) {
    themeSelect.addEventListener('change', saveSettings);
  }
  
  if (fontSizeSelect) {
    fontSizeSelect.addEventListener('change', saveSettings);
  }
  
  if (buttonSizeSelect) {
    buttonSizeSelect.addEventListener('change', saveSettings);
  }
  
  if (clearCacheBtn) {
    clearCacheBtn.addEventListener('click', () => {
      if (confirm('Очистить кэш? Данные будут перезагружены при следующем подключении к интернету.')) {
        localStorage.removeItem('appDataCache');
        localStorage.removeItem('appDataCacheTime');
        showToast('Кэш очищен', 'success');
      }
    });
  }
  
  // Закрытие по клику вне панели
  if (settingsPanel) {
    settingsPanel.addEventListener('click', (e) => {
      if (e.target === settingsPanel) {
        settingsPanel.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        saveSettings();
      }
    });
  }
}

// ===== ЭКСПОРТ/ИМПОРТ =====
function setupExportImportListeners() {
  const exportBtn = document.getElementById('export-btn');
  const importBtn = document.getElementById('import-btn');
  const importFile = document.getElementById('import-file');
  
  if (exportBtn) {
    exportBtn.addEventListener('click', exportData);
  }
  
  if (importBtn) {
    importBtn.addEventListener('click', () => {
      importFile.click();
    });
  }
  
  if (importFile) {
    importFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        importData(file);
      }
    });
  }
}

function exportData() {
  const dataToExport = {
    tools: appData.tools,
    prompts: appData.prompts,
    cases: appData.cases,
    favorites: {
      tools: Array.from(favorites.tools),
      prompts: Array.from(favorites.prompts),
      cases: Array.from(favorites.cases)
    },
    exportDate: new Date().toISOString()
  };
  
  const json = JSON.stringify(dataToExport, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ai-teacher-base-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showToast('Данные экспортированы', 'success');
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      
      if (imported.tools) appData.tools = imported.tools;
      if (imported.prompts) appData.prompts = imported.prompts;
      if (imported.cases) appData.cases = imported.cases;
      
      if (imported.favorites) {
        favorites.tools = new Set(imported.favorites.tools || []);
        favorites.prompts = new Set(imported.favorites.prompts || []);
        favorites.cases = new Set(imported.favorites.cases || []);
        saveFavorites();
      }
      
      localStorage.setItem('appDataCache', JSON.stringify(appData));
      localStorage.setItem('appDataCacheTime', Date.now().toString());
      
      renderCurrentTab();
      showToast('Данные импортированы', 'success');
    } catch (error) {
      console.error('Ошибка импорта:', error);
      showToast('Ошибка импорта данных', 'error');
    }
  };
  reader.readAsText(file);
}

// ===== УТИЛИТЫ =====
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function checkOnlineStatus() {
  const indicator = document.getElementById('offline-indicator');
  if (!navigator.onLine) {
    indicator.style.display = 'block';
  }
}

// ===== ПЕРЕХВАТ ОШИБОК =====
window.addEventListener('error', (e) => {
  console.error('Ошибка:', e.error);
  showToast('Произошла ошибка. Проверьте консоль.', 'error');
});

