/* eslint-disable no-console */
(() => {
  "use strict";

  // --- Data (edit later) ---
  const MODELS = [
    {
      key: "alice",
      name: "Alice",
      url: "https://alice.yandex.ru/",
      country: "Россия",
      desc: "Большая языковая модель, разработанная... (заглушка для описания).",
    },
    {
      key: "gigachat",
      name: "GigaChat",
      url: "https://gigachat.sber.ru/",
      country: "Россия",
      desc: "Большая языковая модель, разработанная... (заглушка для описания).",
    },
    {
      key: "deepseek",
      name: "Deepseek Chat",
      url: "https://www.deepseek.com/",
      country: "Китай",
      desc: "Большая языковая модель, разработанная... (заглушка для описания).",
    },
    {
      key: "qwen",
      name: "Qwen",
      url: "https://chat.qwen.ai/",
      country: "Китай",
      desc: "Большая языковая модель, разработанная... (заглушка для описания).",
    },
    {
      key: "mistral",
      name: "Mistral",
      url: "https://mistral.ai/",
      country: "Франция/США (Европа/США)",
      desc: "Большая языковая модель, разработанная... (заглушка для описания).",
    },
  ];

  const CASES = [
    { id: 1, title: "Кейс 1", subtitle: "Визуальный тест (4 варианта)", desc: "Один вопрос с карточками-ответами, анимации верно/неверно." },
    { id: 2, title: "Кейс 2", subtitle: "Исторический платформер (игра)", desc: "Прототип 2D-платформера: прыжки по платформам-датам, верный ответ открывает путь." },
    { id: 3, title: "Кейс 3", subtitle: "Аналоговые часы с анимацией", desc: "HTML/CSS часы с цифрами и анимированной секундной стрелкой." },
    { id: 4, title: "Кейс 4", subtitle: "Планетарная модель атома", desc: "Визуализация ядра и 3 орбит электронов с анимацией." },
    { id: 5, title: "Кейс 5", subtitle: "Интерактивная модель клетки", desc: "Плоский дизайн, органеллы с подписями и hover-описаниями." },
    { id: 6, title: "Кейс 6", subtitle: "Диаграмма Венна (drag-and-drop)", desc: "Перетаскиваемые блоки характеристик с проверкой правильности размещения." },
    { id: 7, title: "Кейс 7", subtitle: "Опросник + шкала Лайкерта + радар", desc: "5 вопросов, интерактивная шкала и итоговый radar chart (фейковый)." },
    { id: 8, title: "Кейс 8", subtitle: "Панель обратной связи (МЧМ)", desc: "Интерактивные зоны: мусорник, чемодан, мясорубка — голосование кликом." },
  ];

  const PROMPTS = [
    {
      id: 1,
      title: "Кейс 1: Визуальный тест с 4 вариантами ответа (один верный)",
      text:
        'Визуальный Тест с 4 Вариантами Ответа (Один Верный):\n' +
        'Создай HTML/CSS/JavaScript тест из одного вопроса: "Какой элемент таблицы Менделеева имеет атомный номер 6?". ' +
        "Представь вопрос и четыре стилизованные, анимированные карточки с вариантами ответа: " +
        "А) Кислород, Б) Углерод, В) Азот, Г) Золото. " +
        "При выборе верного ответа (Углерод) карточка должна ярко засветиться зеленым цветом и появится короткая анимация фейерверка. " +
        "При неверном ответе карточка краснеет и немного трясется. " +
        "Используй белый фон и сделай верстку адаптивной. " +
        "Верни ТОЛЬКО HTML/CSS/JS код.\n",
    },
    {
      id: 2,
      title: "Кейс 2: Исторический платформер (игра)",
      text:
        "Исторический Платформер (Игра):\n" +
        'Создай HTML/CSS/JavaScript прототип простого 2D-платформера. Главный герой (небольшая анимированная иконка студента) должен прыгать вверх по "плашкам" (платформам). ' +
        'Наверху экрана отображается вопрос: "В каком году закончилась Великая Отечественная война?". ' +
        "Платформы представляют собой даты: 1941, 1945, 1949. " +
        "Когда персонаж прыгает на верную дату (1945), платформа подсвечивается зеленым, и он может прыгать дальше. " +
        "Если он прыгает на неверную дату, он падает вниз. " +
        "Используй базовую физику прыжка и обнаружение столкновений. " +
        "Используй белый фон и сделай верстку адаптивной. " +
        "Верни ТОЛЬКО HTML/CSS/JS код.\n",
    },
    {
      id: 3,
      title: "Кейс 3: Аналоговые часы с анимацией",
      text:
        "Аналоговые Часы с Анимацией (Ваш Пример):\n" +
        "Создай HTML/CSS аналоговые часы, показывающие 09:24:01. " +
        "Добавь цифры (или римские числа) и анимированную с помощью CSS секундную стрелку. " +
        "Сделай верстку адаптивной и используй белый фон. " +
        "Верни ТОЛЬКО HTML/CSS код без форматирования Markdown и пояснений.\n",
    },
    {
      id: 4,
      title: "Кейс 4: Модель атома (планетарная)",
      text:
        "Модель Атома (Планетарная):\n" +
        "Создай HTML/CSS/JavaScript визуализацию планетарной модели атома (ядро и орбиты электронов). " +
        "Ядро должно быть в центре. " +
        "Три электрона должны двигаться по трем разным орбитам с помощью CSS анимации. " +
        "Сделай траектории орбит полупрозрачными. " +
        "Используй белый фон и сделай верстку адаптивной. " +
        "Верни ТОЛЬКО HTML/CSS/JS код.\n",
    },
    {
      id: 5,
      title: "Кейс 5: Интерактивная модель клетки (биология)",
      text:
        "Интерактивная Модель Клетки (Биология)\n" +
        "Создай HTML/CSS/JavaScript интерактивную, стилизованную модель животной клетки. " +
        "Клетка должна иметь четко различимые и подписанные органеллы (ядро, митохондрии, эндоплазматическая сеть, цитоплазма). " +
        'При наведении курсора (hover) на любую органеллу, она должна плавно увеличиваться и высвечивать краткое описание своей функции (например, "Митохондрии: энергетическая станция клетки"). ' +
        'Используй современный, "плоский" (flat) дизайн с яркими цветами. ' +
        "Используй белый фон и сделай верстку адаптивной. " +
        "Верни ТОЛЬКО HTML/CSS/JS код.\n",
    },
    {
      id: 6,
      title: "Кейс 6: Диаграмма Венна (сравнение персонажей)",
      text:
        "Диаграмма Венна для Сравнения Персонажей (Литература)\n" +
        "Создай HTML/CSS/JavaScript интерактивную Диаграмму Венна (два пересекающихся круга) для сравнения двух литературных персонажей (например, Онегин и Ленский). " +
        "Круги должны быть стилизованы и иметь полупрозрачную область пересечения. " +
        "Три текстовых блока с характеристиками должны быть перетаскиваемыми (drag-and-drop): " +
        "1. Общие черты (для пересечения), 2. Черты Онегина (для левого круга), 3. Черты Ленского (для правого круга). " +
        "При правильном размещении блок должен зафиксироваться и подсветиться зеленым. " +
        "Используй белый фон и сделай верстку адаптивной. " +
        "Верни ТОЛЬКО HTML/CSS/JS код.\n",
    },
    {
      id: 7,
      title: "Кейс 7: Анкета-опросник + шкала Лайкерта + радар",
      text:
        "Создай HTML/CSS/JavaScript анкету-опросник из 5 вопросов (например, \"Чувствую ли я себя в безопасности в классе?\"). " +
        "Ответы должны быть представлены в виде анимированной шкалы Лайкерта (5 градаций: \"Полностью не согласен\" до \"Полностью согласен\"). " +
        "При выборе ответа, соответствующая отметка на шкале должна подсвечиваться. " +
        "В конце отобрази стилизованный график-радар (Radar Chart) с общими результатами (фейковыми). " +
        "Верни ТОЛЬКО HTML/CSS/JS код.\n",
    },
    {
      id: 8,
      title: 'Кейс 8: Панель обратной связи "Мусорник, Чемодан, Мясорубка"',
      text:
        'Интерактивная Панель Обратной Связи "Мусорник, Чемодан, Мясорубка"\n' +
        'Создай HTML/CSS/JavaScript интерактивную панель обратной связи, состоящую из трех крупных, стилизованных зон-контейнеров:\n' +
        "1. 🗑️ Мусорник (Выбросить): Для материала, который не пригодился.\n" +
        "2. 🧳 Чемодан (Взять с собой): Для ценной информации, которую будут использовать.\n" +
        "3. ⚙️ Мясорубка (Обдумать): Для материала, требующего осмысления/доработки.\n" +
        "Каждая зона должна иметь стилизованный, крупный, хорошо узнаваемый значок (например, иконку мусорного бака, чемодана, мясорубки или шестеренок) и заголовок. " +
        'Под каждой зоной должен находиться счетчик "голосов" (лайков), изначально установленный на 0.\n' +
        "При клике (или касании на интерактивной панели) на любую из трех зон, соответствующий счетчик должен анимированно увеличиваться на единицу, " +
        "а сама зона должна ярко подсвечиваться (например, пульсировать или менять тень) в течение короткого времени, имитируя процесс голосования/лайка.\n" +
        "Требования:\n" +
        "• Крупный, чистый дизайн, оптимизированный для сенсорного экрана.\n" +
        "• CSS анимации для подсветки при клике и увеличения счетчика.\n" +
        "• Используй белый фон и сделай верстку адаптивной.\n" +
        "Верни ТОЛЬКО HTML/CSS/JS код.\n",
    },
  ];

  // --- Case result files (loaded into iframes) ---
  // Key format: caseId -> modelKey -> relative file path (from index.html)
  const CASE_RESULT_FILES = {
    1: {
      alice: "case/1/alice.html",
      gigachat: "case/1/gigachat.html",
      deepseek: "case/1/deepseek.html",
      qwen: "case/1/qwen.html",
      mistral: "case/1/mistral.html",
    },
    2: {
      alice: "case/2/alice.html",
      gigachat: "case/2/gigachat.html",
      deepseek: "case/2/deepseek.html",
      qwen: "case/2/qwen.html",
      mistral: "case/2/mistral.html",
    },
    3: {
      alice: "case/3/alice.html",
      gigachat: "case/3/gigachat.html",
      deepseek: "case/3/deepseek.html",
      qwen: "case/3/qwen.html",
      mistral: "case/3/mistral.html",
    },
    4: {
      alice: "case/4/alice.html",
      gigachat: "case/4/gigachat.html",
      deepseek: "case/4/deepseek.html",
      qwen: "case/4/qwen.html",
      mistral: "case/4/mistral.html",
    },
    5: {
      alice: "case/5/alice.html",
      gigachat: "case/5/gigachat.html",
      deepseek: "case/5/deepseek.html",
      qwen: "case/5/qwen.html",
      mistral: "case/5/mistral.html",
    },
    6: {
      alice: "case/6/alice.html",
      gigachat: "case/6/gigachat.html",
      deepseek: "case/6/deepseek.html",
      qwen: "case/6/qwen.html",
      mistral: "case/6/mistral.html",
    },
    7: {
      alice: "case/7/alice.html",
      gigachat: "case/7/gigachat.html",
      deepseek: "case/7/deepseek.html",
      qwen: "case/7/qwen.html",
      mistral: "case/7/mistral.html",
    },
    8: {
      alice: "case/8/alice.html",
      gigachat: "case/8/gigachat.html",
      deepseek: "case/8/deepseek.html",
      qwen: "case/8/qwen.html",
      mistral: "case/8/mistral.html",
    },
  };

  // --- DOM helpers ---
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (ch) => {
      switch (ch) {
        case "&":
          return "&amp;";
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case '"':
          return "&quot;";
        case "'":
          return "&#039;";
        default:
          return ch;
      }
    });
  }

  function toast(message) {
    let el = $("#toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      el.className = "toast";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add("is-visible");
    window.clearTimeout(toast._t);
    toast._t = window.setTimeout(() => el.classList.remove("is-visible"), 1400);
  }

  // --- Case prompt helpers ---
  function getPromptByCaseId(caseId) {
    return PROMPTS.find((p) => p.id === caseId) || null;
  }

  // --- Network cards ---
  function renderNetworks() {
    const grid = $("#netsGrid");
    if (!grid) return;
    grid.innerHTML = MODELS.map((m) => {
      const safeUrl = escapeHtml(m.url);
      return `
        <article class="card" data-model="${escapeHtml(m.key)}">
          <div class="card-head">
            <div>
              <div class="card-title">${escapeHtml(m.name)}</div>
              <div class="card-meta">${escapeHtml(m.country)}</div>
            </div>
            <span class="pill pill-primary">Контент</span>
          </div>
          <p class="card-desc">${escapeHtml(m.desc)}</p>
          <div class="card-actions">
            <a class="btn btn-small" href="${safeUrl}" target="_blank" rel="noreferrer">Открыть сайт</a>
          </div>
        </article>
      `;
    }).join("");
  }

  // --- Benchmark (7 cases + 5 model views) ---
  let activeCaseId = 1;
  let activeModelKey = MODELS[0]?.key ?? "alice";

  function getResultFile(caseId, modelKey) {
    return CASE_RESULT_FILES?.[caseId]?.[modelKey] || "";
  }

  function mountCaseOutputs(caseId) {
    const mapping = CASE_RESULT_FILES?.[caseId] || {};
    MODELS.forEach((m) => {
      const outId = `case${caseId}-${m.key}-output`;
      const host = document.getElementById(outId);
      const src = mapping[m.key] || "";
      if (!host) return;

      // Update hint in the window bar
      const windowEl = host.closest(".result-window");
      const hintEl = windowEl ? windowEl.querySelector(".result-window-hint") : null;
      if (hintEl) hintEl.textContent = src ? "Загружено" : "Нет данных";

      if (!src) {
        host.innerHTML = `<div class="placeholder">Нет результата для <strong>${escapeHtml(m.name)}</strong> в <strong>кейсе ${caseId}</strong>.</div>`;
        return;
      }

      // Avoid remount if already mounted with same src
      const existing = host.querySelector("iframe.result-frame");
      if (existing && existing.getAttribute("src") === src) return;

      host.textContent = "";
      const iframe = document.createElement("iframe");
      iframe.className = "result-frame";
      iframe.setAttribute("title", `Результат: ${m.name} — кейс ${caseId}`);
      // Важно для корректной работы примеров:
      // - allow-modals: примеры с alert()
      // - allow-same-origin: localStorage и доступ к размерам документа (когда браузер разрешит)
      iframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-modals");
      iframe.setAttribute("scrolling", "no");
      iframe.setAttribute("referrerpolicy", "no-referrer");
      iframe.src = src;
      iframe.addEventListener("load", () => {
        // Пытаемся подогнать высоту под контент, чтобы внутри iframe не было полос прокрутки.
        // Если браузер не даст доступ к содержимому (часто бывает на file://), останется fallback height из CSS.
        const tryResize = () => {
          try {
            const doc = iframe.contentDocument;
            if (!doc) return false;
            const body = doc.body;
            const html = doc.documentElement;
            const h = Math.max(
              body ? body.scrollHeight : 0,
              body ? body.offsetHeight : 0,
              html ? html.scrollHeight : 0,
              html ? html.offsetHeight : 0,
              html ? html.clientHeight : 0,
            );
            if (h > 0) iframe.style.height = `${h}px`;
            return h > 0;
          } catch {
            return false;
          }
        };

        // Несколько попыток (на случай поздней отрисовки/шрифтов/анимаций)
        tryResize();
        setTimeout(tryResize, 120);
        setTimeout(tryResize, 420);
        setTimeout(tryResize, 900);
      });
      host.appendChild(iframe);
    });
  }

  function setActiveModel(modelKey) {
    activeModelKey = modelKey;
    const view = $("#caseView");
    if (!view) return;

    $$(".model-tab[data-model-tab]", view).forEach((btn) => {
      const active = btn.dataset.modelTab === modelKey;
      btn.classList.toggle("is-active", active);
    });

    $$(".result-window[data-model-window]", view).forEach((win) => {
      const active = win.dataset.modelWindow === modelKey;
      win.toggleAttribute("hidden", !active);
    });
  }

  let caseSearchQuery = "";
  let caseSearchTimer = 0;

  function caseMatchesQuery(c, q) {
    if (!q) return true;
    const p = getPromptByCaseId(c.id);
    const hay = `${c.title} ${c.subtitle} ${c.desc} ${p?.title || ""} ${p?.text || ""}`.toLowerCase();
    return hay.includes(q);
  }

  function getVisibleCases() {
    const q = caseSearchQuery.trim().toLowerCase();
    return CASES.filter((c) => caseMatchesQuery(c, q));
  }

  function renderCaseNav() {
    const list = $("#caseList");
    if (!list) return;
    const visible = getVisibleCases();
    list.innerHTML = visible.length
      ? visible.map((c) => {
      const active = c.id === activeCaseId;
      return `
        <button class="case-item ${active ? "is-active" : ""}" type="button" data-case="${c.id}">
          <span class="case-item-title">${escapeHtml(c.title)}</span>
          <span class="case-item-sub">${escapeHtml(c.subtitle)}</span>
        </button>
      `;
    }).join("")
      : `<div class="case-empty">Ничего не найдено. Попробуйте изменить запрос.</div>`;

    $$(".case-item[data-case]", list).forEach((btn) => {
      btn.addEventListener("click", () => {
        activeCaseId = Number(btn.dataset.case);
        renderCaseNav();
        renderCaseView();
      });
    });
  }

  function renderCaseView() {
    const view = $("#caseView");
    if (!view) return;

    const c = CASES.find((x) => x.id === activeCaseId) ?? CASES[0];
    const prompt = getPromptByCaseId(c.id);
    const modelTabs = MODELS.map((m) => {
      const active = m.key === activeModelKey;
      return `
        <button class="model-tab ${active ? "is-active" : ""}" type="button" data-model-tab="${escapeHtml(m.key)}">
          ${escapeHtml(m.name)}
        </button>
      `;
    }).join("");

    const windows = MODELS.map((m) => {
      const isActive = m.key === activeModelKey;
      const outId = `case${c.id}-${m.key}-output`;
      return `
        <section class="result-window" ${isActive ? "" : "hidden"} data-model-window="${escapeHtml(m.key)}" aria-label="Результат: ${escapeHtml(m.name)}">
          <div class="result-window-bar">
            <div class="result-window-title">${escapeHtml(m.name)} · ${escapeHtml(c.title)}</div>
            <div class="result-window-actions">
              <div class="result-window-hint"></div>
              <button class="result-reload" type="button" data-reload-frame="true" aria-label="Перезагрузить результат">
                Перезагрузить
              </button>
            </div>
          </div>
          <div class="result-window-body">
            <div id="${escapeHtml(outId)}"></div>
          </div>
        </section>
      `;
    }).join("");

    view.innerHTML = `
      <header class="case-head">
        <div>
          <h3 class="case-title">${escapeHtml(c.title)}: ${escapeHtml(c.subtitle)}</h3>
          <p class="case-desc">${escapeHtml(c.desc)}</p>
        </div>
        <div class="pill">ID: case${c.id}</div>
      </header>

      <section class="case-prompt" aria-label="Промпт кейса">
        <div class="case-prompt-head">
          <div class="case-prompt-title">Промпт</div>
          <button class="btn btn-small" type="button" data-copy-prompt="${c.id}">Копировать</button>
        </div>
        <pre>${escapeHtml(prompt?.text || "Промпт не задан.")}</pre>
      </section>

      <div class="model-tabs" role="tablist" aria-label="Нейросети в кейсе">
        ${modelTabs}
      </div>

      <div class="case-results" aria-label="Окна результатов">
        ${windows}
      </div>
    `;

    $$(".model-tab[data-model-tab]", view).forEach((btn) => {
      btn.addEventListener("click", () => {
        setActiveModel(btn.dataset.modelTab);
      });
    });

    // Reload button (per window)
    $$("[data-reload-frame]", view).forEach((btn) => {
      btn.addEventListener("click", () => {
        const win = btn.closest(".result-window");
        if (!win) return;
        const iframe = win.querySelector("iframe.result-frame");
        if (!iframe) return;
        const src = iframe.getAttribute("src") || "";
        // Reload by resetting src (works even with sandbox)
        iframe.setAttribute("src", src);
      });
    });

    // Copy prompt button
    const copyBtn = view.querySelector("[data-copy-prompt]");
    if (copyBtn) {
      copyBtn.addEventListener("click", async () => {
        const id = Number(copyBtn.getAttribute("data-copy-prompt"));
        const p = getPromptByCaseId(id);
        const text = p?.text || "";
        try {
          await navigator.clipboard.writeText(text);
          toast("Промпт скопирован");
        } catch {
          toast("Не удалось скопировать");
        }
      });
    }

    // Mount actual outputs (iframes) for this case and activate current model
    mountCaseOutputs(c.id);
    setActiveModel(activeModelKey);
  }

  function bindCaseSearch() {
    const input = $("#caseSearch");
    if (!input) return;
    input.addEventListener("input", () => {
      window.clearTimeout(caseSearchTimer);
      const next = input.value;
      caseSearchTimer = window.setTimeout(() => {
        caseSearchQuery = next;
        const visible = getVisibleCases();
        if (!visible.some((c) => c.id === activeCaseId) && visible.length) {
          activeCaseId = visible[0].id;
        }
        renderCaseNav();
        renderCaseView();
      }, 140); // debounce (асинхронный фильтр)
    });
  }

  function initYear() {
    const y = $("#year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  function init() {
    initYear();
    renderNetworks();
    bindCaseSearch();
    renderCaseNav();
    renderCaseView();
  }

  document.addEventListener("DOMContentLoaded", init);
})();


