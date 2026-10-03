const appState = {
  data: null,
  team: getStoredTeam(),
  favorites: getStoredFavorites(),
  searchIndex: []
};

function normalizeTeam(team) {
  const normalized = Array.from({ length: 4 }, (_, index) => team?.[index] ?? null);
  return normalized;
}

const pathIconMap = {
  Knight: 'assets/icons/path/Preservation.png',
  Rogue: 'assets/icons/path/Hunt.png',
  Mage: 'assets/icons/path/Erudition.png',
  Warlock: 'assets/icons/path/Nihility.png',
  Warrior: 'assets/icons/path/Destruction.png',
  Shaman: 'assets/icons/path/Harmony.png',
  Priest: 'assets/icons/path/Abundance.png',
  Memory: 'assets/icons/path/Remembrance.png',
  Elation: 'assets/icons/path/Elation.png'
};

const pathLocalizationMap = {
  Knight: 'Сохранение',
  Rogue: 'Охота',
  Mage: 'Эрудиция',
  Warlock: 'Небытие',
  Warrior: 'Разрушение',
  Shaman: 'Гармония',
  Priest: 'Изобилие',
  Memory: 'Память',
  Elation: 'Радость'
};

const elementIconMap = {
  Fire: 'assets/icons/element/Fire.png',
  Ice: 'assets/icons/element/Ice.png',
  Wind: 'assets/icons/element/Wind.png',
  Thunder: 'assets/icons/element/Thunder.png',
  Quantum: 'assets/icons/element/Quantum.png',
  Imaginary: 'assets/icons/element/Imaginary.png',
  Physical: 'assets/icons/element/Physical.png'
};

const elementLocalizationMap = {
  Fire: 'Огненный',
  Ice: 'Ледяной',
  Wind: 'Ветряной',
  Thunder: 'Электрический',
  Quantum: 'Квантовый',
  Imaginary: 'Мнимый',
  Physical: 'Физический'
};

const playerCharacterDisplayName = 'Первопроходец';
const playerCharacterNameMap = {
  8001: playerCharacterDisplayName,
  8002: playerCharacterDisplayName,
  8003: playerCharacterDisplayName,
  8004: playerCharacterDisplayName,
  8005: playerCharacterDisplayName,
  8006: playerCharacterDisplayName,
  8007: playerCharacterDisplayName,
  8008: playerCharacterDisplayName,
  8009: playerCharacterDisplayName,
  8010: playerCharacterDisplayName
};

function getStoredTeam() {
  try {
    const saved = localStorage.getItem('hsr-team');
    if (!saved) {
      return normalizeTeam([]);
    }

    const parsed = JSON.parse(saved);
    return normalizeTeam(Array.isArray(parsed) ? parsed : []);
  } catch (error) {
    console.warn('Local storage is unavailable:', error);
    return normalizeTeam([]);
  }
}

function getStoredFavorites() {
  try {
    const saved = localStorage.getItem('hsr-favorites');
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed)
      ? [...new Set(parsed.filter((item) => typeof item === 'string' && /^(character|lightcone|relic):[^:]+$/.test(item)))]
      : [];
  } catch (error) {
    console.warn('Избранное недоступно в локальном хранилище:', error);
    return [];
  }
}

function saveTeam() {
  localStorage.setItem('hsr-team', JSON.stringify(appState.team));
}

function saveFavorites() {
  localStorage.setItem('hsr-favorites', JSON.stringify(appState.favorites));
}

function updateTeamSummary() {
  const count = appState.team.filter(Boolean).length;
  const summary = document.getElementById('team-summary');
  const pill = document.getElementById('team-count-pill');

  if (summary) {
    summary.textContent = `Команда: ${count}/4`;
  }

  if (pill) {
    pill.textContent = `${count}/4`;
  }
}

function normalizePath(pathName) {
  return getLocalizedPath(pathName || 'Неизвестно');
}

function getLocalizedPath(pathName) {
  return pathLocalizationMap[pathName] || pathName || 'Неизвестно';
}

function getLocalizedElement(elementName) {
  return elementLocalizationMap[elementName] || elementName || 'Неизвестно';
}

function getDisplayCharacterName(character) {
  const playerCharacterName = playerCharacterNameMap[character?.id];
  if (playerCharacterName) {
    return playerCharacterName;
  }

  const name = String(character?.localizedName || character?.name || '').trim();
  if (name && !/^\{.*\}$/i.test(name)) {
    return name;
  }

  return 'Неизвестно';
}

function formatRarity(rarity) {
  return Array.from({ length: +rarity || 0 }, () => '★').join('');
}

function formatSourceDescription(description) {
  const formatted = String(description || '')
    .replace(/\{F#([^}]*)\}\{M#([^}]*)\}/g, '$1 / $2')
    .replace(/\{[FM]#([^}]*)\}/g, '$1')
    .replace(/\{NICKNAME\}/g, playerCharacterDisplayName);
  return /#\d+\[[^\]]+\]/.test(formatted) ? '' : formatted;
}

function getElementIcon(element) {
  return elementIconMap[element] || 'assets/icons/element/Fire.png';
}

function getPathIcon(pathName) {
  return pathIconMap[pathName] || 'assets/icons/path/Hunt.png';
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function getEntity(kind, id) {
  const collections = {
    character: appState.data.characters,
    lightcone: appState.data.lightCones,
    relic: appState.data.relicSets
  };
  if (!Object.prototype.hasOwnProperty.call(collections, kind)) return null;
  const collection = collections[kind];
  return collection?.find((item) => String(item.id) === String(id));
}

function getEntityName(kind, item) {
  return kind === 'character' ? getDisplayCharacterName(item) : item.localizedName || item.name;
}

function getDetailUrl(kind, id) {
  return `detail.html?type=${encodeURIComponent(kind)}&id=${encodeURIComponent(id)}`;
}

function getFavoriteKey(kind, id) {
  return `${kind}:${id}`;
}

function isFavorite(kind, id) {
  return appState.favorites.includes(getFavoriteKey(kind, id));
}

function renderFavoriteButton(kind, item) {
  const favorite = isFavorite(kind, item.id);
  const name = escapeHtml(getEntityName(kind, item));
  return `<button class="favorite-btn${favorite ? ' is-favorite' : ''}" type="button" data-favorite-type="${kind}" data-favorite-id="${escapeHtml(item.id)}" aria-pressed="${favorite}" aria-label="${favorite ? 'Убрать из избранного' : 'Добавить в избранное'}: ${name}" title="${favorite ? 'Убрать из избранного' : 'Добавить в избранное'}">${favorite ? '★' : '☆'}</button>`;
}

function toggleFavorite(kind, id) {
  const key = getFavoriteKey(kind, id);
  appState.favorites = isFavorite(kind, id)
    ? appState.favorites.filter((favorite) => favorite !== key)
    : [...appState.favorites, key];
  saveFavorites();

  document.querySelectorAll('[data-favorite-type][data-favorite-id]').forEach((button) => {
    if (button.dataset.favoriteType !== kind || button.dataset.favoriteId !== String(id)) return;
    const favorite = isFavorite(kind, id);
    button.classList.toggle('is-favorite', favorite);
    button.setAttribute('aria-pressed', String(favorite));
    button.setAttribute('aria-label', `${favorite ? 'Убрать из избранного' : 'Добавить в избранное'}: ${getEntityName(kind, getEntity(kind, id))}`);
    button.title = favorite ? 'Убрать из избранного' : 'Добавить в избранное';
    button.textContent = favorite ? '★' : '☆';
  });
  updateFavoritesCount();

  if (document.body.dataset.page === 'favorites') renderFavoritesPage();
  if (document.body.dataset.page === 'home') renderHomeFavorites();
}

function setupGlobalLayout() {
  const nav = document.querySelector('.nav-menu');
  if (nav) {
    const currentPage = document.body.dataset.page;
    const detailType = new URLSearchParams(window.location.search).get('type');
    const groups = [
      { label: 'ОБЗОР', links: [['Главная', 'index.html', 'home']] },
      { label: 'БАЗА ДАННЫХ', links: [['Персонажи', 'characters.html', 'characters'], ['Световые конусы', 'lightcones.html', 'lightcones'], ['Реликвии', 'relics.html', 'relics']] },
      { label: 'ИНСТРУМЕНТЫ', links: [['Тимбилдер', 'teambuilder.html', 'teambuilder'], ['Избранное', 'favorites.html', 'favorites']] },
      { label: 'ПРОЕКТ', links: [['О проекте', 'about.html', 'about'], ['Обратная связь', 'feedback.html', 'feedback']] }
    ];
    nav.replaceChildren();
    groups.forEach((group) => {
      const groupElement = document.createElement('div');
      groupElement.className = 'nav-group';
      const label = document.createElement('p');
      label.className = 'nav-group-label';
      label.textContent = group.label;
      groupElement.append(label);
      group.links.forEach(([text, href, page]) => {
        const link = document.createElement('a');
        link.className = 'nav-item';
        link.href = href;
        link.innerHTML = '<span class="nav-dot" aria-hidden="true"></span>';
        link.append(document.createTextNode(text));
        if (currentPage === page || (currentPage === 'detail' && page === `${detailType}s`)) link.classList.add('active');
        groupElement.append(link);
      });
      nav.append(groupElement);
    });
  }

  const main = document.querySelector('.main-panel');
  const pageHeader = main?.querySelector('.page-header');
  if (!main || !pageHeader || document.getElementById('global-search')) return;

  const tools = document.createElement('div');
  tools.className = 'global-tools';
  tools.innerHTML = `
    <div class="global-search-wrap">
      <label for="global-search">Поиск по базе</label>
      <input id="global-search" type="search" placeholder="Персонаж, конус или набор реликвий..." autocomplete="off" aria-controls="global-search-results" aria-expanded="false" />
      <div id="global-search-results" class="global-search-results" role="listbox" aria-label="Результаты поиска" hidden></div>
    </div>
    <a class="favorites-shortcut" href="favorites.html">Избранное <span id="favorites-count">0</span></a>
  `;
  main.insertBefore(tools, pageHeader);
}

function buildSearchIndex() {
  appState.searchIndex = [
    ...appState.data.characters.map((item) => ({ kind: 'character', item, name: getDisplayCharacterName(item), category: 'Персонажи', terms: `${item.name} ${item.localizedName || ''} ${item.description || ''} ${getLocalizedPath(item.path)} ${getLocalizedElement(item.element)}` })),
    ...appState.data.lightCones.map((item) => ({ kind: 'lightcone', item, name: getEntityName('lightcone', item), category: 'Световые конусы', terms: `${item.name} ${item.localizedName || ''} ${item.description || ''} ${item.localizedDescription || ''} ${getLocalizedPath(item.path)}` })),
    ...appState.data.relicSets.map((item) => ({ kind: 'relic', item, name: getEntityName('relic', item), category: 'Реликвии', terms: `${item.name} ${item.localizedName || ''} ${item.bonus || ''} ${(item.localizedBonuses || []).join(' ')}` }))
  ].map((entry) => ({ ...entry, searchable: `${entry.name} ${entry.terms}`.toLocaleLowerCase('ru') }));
  updateFavoritesCount();
}

function updateFavoritesCount() {
  const count = document.getElementById('favorites-count');
  if (count) count.textContent = String(appState.favorites.length);
}

function setupGlobalSearch() {
  const input = document.getElementById('global-search');
  const results = document.getElementById('global-search-results');
  if (!input || !results) return;

  input.addEventListener('input', () => {
    const query = input.value.trim().toLocaleLowerCase('ru');
    if (!query) {
      results.hidden = true;
      results.replaceChildren();
      input.setAttribute('aria-expanded', 'false');
      return;
    }

    const matches = [];
    for (const entry of appState.searchIndex) {
      if (entry.searchable.includes(query)) matches.push(entry);
      if (matches.length === 8) break;
    }

    if (!matches.length) {
      results.innerHTML = '<p class="search-empty">Ничего не найдено. Попробуйте другой запрос.</p>';
    } else {
      results.innerHTML = matches.map((entry) => `
        <a class="search-result" role="option" href="${getDetailUrl(entry.kind, entry.item.id)}">
          <span class="search-result-category">${entry.category}</span>
          <strong>${escapeHtml(entry.name)}</strong>
          <span>${escapeHtml(entry.kind === 'character' ? `${getLocalizedPath(entry.item.path)} · ${getLocalizedElement(entry.item.element)}` : entry.kind === 'lightcone' ? getLocalizedPath(entry.item.path) : 'Набор')}</span>
        </a>
      `).join('');
    }

    results.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  });

  input.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    results.hidden = true;
    input.setAttribute('aria-expanded', 'false');
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.global-search-wrap')) {
      results.hidden = true;
      input.setAttribute('aria-expanded', 'false');
    }
  });
}

function setActiveNav() {
  const pagePath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-item').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === pagePath || (pagePath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

async function loadData() {
  if (appState.data) return appState.data;

  const response = await fetch('data/data.json');

  if (!response.ok) {
    throw new Error('Массив данных не загрузился');
  }

  appState.data = await response.json();
  return appState.data;
}

async function loadEntityDetails() {
  const response = await fetch('data/entity-details.json', { cache: 'no-cache' });
  if (!response.ok) {
    throw new Error('Не удалось загрузить подробные данные StarRailRes.');
  }
  return response.json();
}

function renderCatalogCard(kind, item) {
  const name = escapeHtml(getEntityName(kind, item));
  const detailUrl = getDetailUrl(kind, item.id);
  const rawDescription = kind === 'character' ? item.description : kind === 'lightcone' ? (item.localizedDescription || item.description) : (item.localizedBonuses || [item.bonus]).filter(Boolean).join(' ');
  const description = formatSourceDescription(rawDescription);
  const meta = kind === 'character'
    ? `<span class="meta-badge">${formatRarity(item.rarity)}</span>`
    : kind === 'lightcone'
      ? `<span class="meta-badge">${formatRarity(item.rarity)}</span>`
      : '<span class="meta-badge">Набор</span>';
  const tags = kind === 'character'
    ? `<span class="tag"><span class="tag-icon"><img src="${getPathIcon(item.path)}" alt="" /></span>${normalizePath(item.path)}</span><span class="tag"><span class="tag-icon"><img src="${getElementIcon(item.element)}" alt="" /></span>${getLocalizedElement(item.element)}</span>`
    : kind === 'lightcone'
      ? `<span class="tag"><span class="tag-icon"><img src="${getPathIcon(item.path)}" alt="" /></span>${normalizePath(item.path)}</span>`
      : '';

  return `
    <article class="result-card catalog-card" data-kind="${kind}" data-id="${escapeHtml(item.id)}" tabindex="0" aria-label="${name} — подробнее">
      <div class="media">
        <a class="card-image-link" href="${detailUrl}" aria-label="Подробнее: ${name}">
          <img src="${escapeHtml(item.image)}" alt="${name}" loading="lazy" />
        </a>
        ${renderFavoriteButton(kind, item)}
      </div>
      <div class="content">
        <div class="card-meta">${meta}</div>
        <h3 class="card-title"><a href="${detailUrl}">${name}</a></h3>
        ${description ? `<p class="card-description">${escapeHtml(description)}</p>` : ''}
        ${tags ? `<div class="card-tags">${tags}</div>` : ''}
        <div class="card-actions"><a class="btn btn-secondary" href="${detailUrl}">Подробнее</a></div>
      </div>
    </article>
  `;
}

function renderHomePage() {
  const featuredCharacters = appState.data.characters.slice(0, 3);
  const featuredLightCones = appState.data.lightCones.slice(0, 3);
  const featuredRelics = appState.data.relicSets.slice(0, 3);

  document.getElementById('featured-characters').innerHTML = featuredCharacters.map((item) => renderCatalogCard('character', item)).join('');
  document.getElementById('featured-lightcones').innerHTML = featuredLightCones.map((item) => renderCatalogCard('lightcone', item)).join('');
  document.getElementById('featured-relics').innerHTML = featuredRelics.map((item) => renderCatalogCard('relic', item)).join('');

  const stats = document.getElementById('dashboard-stats');
  if (stats) {
    stats.innerHTML = [
      ['Персонажи', appState.data.characters.length, 'characters.html'],
      ['Световые конусы', appState.data.lightCones.length, 'lightcones.html'],
      ['Наборы реликвий', appState.data.relicSets.length, 'relics.html']
    ].map(([label, total, href]) => `<a class="dashboard-stat" href="${href}"><span>${label}</span><strong>${total}</strong></a>`).join('');
  }
  renderHomeFavorites();
}

function renderHomeFavorites() {
  const section = document.getElementById('home-favorites');
  const list = document.getElementById('home-favorites-list');
  if (!section || !list || !appState.data) return;
  const favorites = appState.favorites.map((key) => {
    const [kind, id] = key.split(':');
    const item = getEntity(kind, id);
    return item ? { kind, item } : null;
  }).filter(Boolean).slice(0, 6);
  section.hidden = favorites.length === 0;
  list.innerHTML = favorites.map(({ kind, item }) => renderCatalogCard(kind, item)).join('');
}

function renderCharactersPage() {
  const searchInput = document.getElementById('character-search');
  const raritySelect = document.getElementById('character-rarity');
  const pathSelect = document.getElementById('character-path');
  const elementSelect = document.getElementById('character-element');
  const list = document.getElementById('character-list');
  const resetButton = document.getElementById('reset-characters');
  const sortSelect = document.getElementById('character-sort');
  const resultCount = document.getElementById('character-result-count');

  const paths = [...new Set(appState.data.characters.map((character) => character.path))].sort();
  const elements = [...new Set(appState.data.characters.map((character) => character.element))].sort();

  pathSelect.innerHTML = '<option value="all">Все</option>' + paths.map((path) => `<option value="${path}">${getLocalizedPath(path)}</option>`).join('');
  elementSelect.innerHTML = '<option value="all">Все</option>' + elements.map((element) => `<option value="${element}">${getLocalizedElement(element)}</option>`).join('');

  function filterCharacters() {
    const value = searchInput.value.trim().toLowerCase();
    const rarity = raritySelect.value;
    const path = pathSelect.value;
    const element = elementSelect.value;
    const sort = sortSelect ? sortSelect.value : 'name-asc';

    const filtered = appState.data.characters.filter((character) => {
      const matchSearch = !value || getDisplayCharacterName(character).toLocaleLowerCase('ru').includes(value) || character.name.toLocaleLowerCase('ru').includes(value) || (character.description || '').toLocaleLowerCase('ru').includes(value);
      const matchRarity = rarity === 'all' || String(character.rarity) === rarity;
      const matchPath = path === 'all' || character.path === path;
      const matchElement = element === 'all' || character.element === element;
      return matchSearch && matchRarity && matchPath && matchElement;
    });

    filtered.sort((first, second) => sort === 'rarity-desc'
      ? second.rarity - first.rarity || getDisplayCharacterName(first).localeCompare(getDisplayCharacterName(second), 'ru')
      : getDisplayCharacterName(first).localeCompare(getDisplayCharacterName(second), 'ru'));
    if (resultCount) resultCount.textContent = `Найдено: ${filtered.length}`;
    renderCharacterCards(filtered, list);
  }

  searchInput.addEventListener('input', filterCharacters);
  raritySelect.addEventListener('change', filterCharacters);
  pathSelect.addEventListener('change', filterCharacters);
  elementSelect.addEventListener('change', filterCharacters);
  if (sortSelect) sortSelect.addEventListener('change', filterCharacters);
  resetButton.addEventListener('click', () => {
    searchInput.value = '';
    raritySelect.value = 'all';
    pathSelect.value = 'all';
    elementSelect.value = 'all';
    if (sortSelect) sortSelect.value = 'name-asc';
    filterCharacters();
  });

  filterCharacters();
}

function renderCharacterCards(characters, listElement) {
  if (!characters.length) {
    listElement.innerHTML = '<div class="empty-state">Персонажи не найдены. Попробуйте изменить фильтры.</div>';
    return;
  }

  listElement.innerHTML = characters.map((character) => renderCatalogCard('character', character)).join('');
}

function renderLightConePage() {
  const searchInput = document.getElementById('lightcone-search');
  const raritySelect = document.getElementById('lightcone-rarity');
  const pathSelect = document.getElementById('lightcone-path');
  const resetButton = document.getElementById('reset-lightcones');
  const list = document.getElementById('lightcone-list');

  const paths = [...new Set(appState.data.lightCones.map((cone) => cone.path))].sort();
  pathSelect.innerHTML = '<option value="all">Все</option>' + paths.map((path) => `<option value="${path}">${getLocalizedPath(path)}</option>`).join('');

  function filterCones() {
    const value = searchInput.value.trim().toLowerCase();
    const rarity = raritySelect.value;
    const path = pathSelect.value;

    const filtered = appState.data.lightCones.filter((cone) => {
      const matchSearch = !value || cone.name.toLocaleLowerCase('ru').includes(value) || (cone.localizedName || '').toLocaleLowerCase('ru').includes(value) || (cone.description || '').toLocaleLowerCase('ru').includes(value) || (cone.localizedDescription || '').toLocaleLowerCase('ru').includes(value);
      const matchRarity = rarity === 'all' || String(cone.rarity) === rarity;
      const matchPath = path === 'all' || cone.path === path;
      return matchSearch && matchRarity && matchPath;
    });

    const resultCount = document.getElementById('lightcone-result-count');
    if (resultCount) resultCount.textContent = `Найдено: ${filtered.length}`;
    renderLightConeCards(filtered, list);
  }

  searchInput.addEventListener('input', filterCones);
  raritySelect.addEventListener('change', filterCones);
  pathSelect.addEventListener('change', filterCones);
  resetButton.addEventListener('click', () => {
    searchInput.value = '';
    raritySelect.value = 'all';
    pathSelect.value = 'all';
    filterCones();
  });

  renderLightConeCards(appState.data.lightCones, list);
}

function renderLightConeCards(cones, listElement) {
  if (!cones.length) {
    listElement.innerHTML = '<div class="empty-state">Конусы не найдены. Попробуйте изменить фильтры.</div>';
    return;
  }

  listElement.innerHTML = cones.map((cone) => renderCatalogCard('lightcone', cone)).join('');
}

function renderRelicsPage() {
  const searchInput = document.getElementById('relic-search');
  const raritySelect = document.getElementById('relic-tier');
  const list = document.getElementById('relic-list');
  const resetButton = document.getElementById('reset-relics');

  function filterRelics() {
    const value = searchInput.value.trim().toLowerCase();
    const rarity = raritySelect?.value || 'all';

    const filtered = appState.data.relicSets.filter((relic) => {
      const matchSearch = !value || relic.name.toLocaleLowerCase('ru').includes(value) || (relic.localizedName || '').toLocaleLowerCase('ru').includes(value) || (relic.bonus || '').toLocaleLowerCase('ru').includes(value) || (relic.localizedBonuses || []).join(' ').toLocaleLowerCase('ru').includes(value);
      const matchRarity = rarity === 'all' || (relic.rarity && String(relic.rarity) === rarity);
      return matchSearch && matchRarity;
    });

    const resultCount = document.getElementById('relic-result-count');
    if (resultCount) resultCount.textContent = `Найдено: ${filtered.length}`;
    renderRelicCards(filtered, list);
  }

  searchInput.addEventListener('input', filterRelics);
  raritySelect?.addEventListener('change', filterRelics);
  resetButton.addEventListener('click', () => {
    searchInput.value = '';
    if (raritySelect) raritySelect.value = 'all';
    filterRelics();
  });

  renderRelicCards(appState.data.relicSets, list);
}

function renderRelicCards(relics, listElement) {
  if (!relics.length) {
    listElement.innerHTML = '<div class="empty-state">Наборы не найдены. Попробуйте изменить фильтры.</div>';
    return;
  }

  listElement.innerHTML = relics.map((relic) => renderCatalogCard('relic', relic)).join('');
}

function renderFavoritesPage() {
  const container = document.getElementById('favorites-content');
  if (!container || !appState.data) return;
  const groups = [
    ['character', 'Персонажи', appState.data.characters],
    ['lightcone', 'Световые конусы', appState.data.lightCones],
    ['relic', 'Реликвии', appState.data.relicSets]
  ].map(([kind, title, records]) => ({
    kind,
    title,
    items: appState.favorites
      .filter((key) => key.startsWith(`${kind}:`))
      .map((key) => records.find((item) => String(item.id) === key.slice(kind.length + 1)))
      .filter(Boolean)
  }));
  const count = groups.reduce((total, group) => total + group.items.length, 0);
  if (!count) {
    container.innerHTML = '<div class="empty-state"><h2>Пока нет избранного</h2><p>Нажмите ☆ на карточке персонажа, светового конуса или набора реликвий, чтобы сохранить его здесь.</p></div>';
    return;
  }
  container.innerHTML = groups.filter((group) => group.items.length).map((group) => `
    <section class="section favorite-group" aria-labelledby="favorites-${group.kind}">
      <div class="section-heading"><h2 id="favorites-${group.kind}">${group.title}</h2><span class="result-count">${group.items.length}</span></div>
      <div class="card-grid">${group.items.map((item) => renderCatalogCard(group.kind, item)).join('')}</div>
    </section>
  `).join('');
}

function getSourceIcon(icon) {
  if (!icon) return '';
  return `assets/${icon.replace(/^icon\//, 'icons/')}`;
}

function renderDetailRecords(records, kind) {
  if (!records?.length) {
    return '<p class="detail-unavailable">В доступных данных StarRailRes этот раздел не представлен.</p>';
  }
  return `<div class="detail-record-list">${records.map((record) => {
    const description = formatSourceDescription(record.description);
    return `
      <article class="detail-record">
        ${record.icon ? `<img class="detail-record-icon" src="${getSourceIcon(record.icon)}" alt="" loading="lazy" />` : ''}
        <div>
          <div class="detail-record-heading">
            ${kind === 'eidolon' && record.rank ? `<span class="meta-badge">Эйдолон ${record.rank}</span>` : ''}
            ${record.type ? `<span class="meta-pill">${escapeHtml(record.type)}</span>` : ''}
          </div>
          <h3>${escapeHtml(record.name || (kind === 'trace' ? 'След' : ''))}</h3>
          ${description ? `<p>${escapeHtml(description)}</p>` : ''}
        </div>
      </article>
    `;
  }).join('')}</div>`;
}

async function renderDetailPage() {
  const container = document.getElementById('detail-content');
  const params = new URLSearchParams(window.location.search);
  const kind = params.get('type');
  const id = params.get('id');
  const isSupportedKind = ['character', 'lightcone', 'relic'].includes(kind);
  const item = isSupportedKind ? getEntity(kind, id) : null;
  if (!container) return;
  if (!item) {
    container.innerHTML = '<div class="empty-state"><h2>Запись не найдена</h2><p>Проверьте адрес или вернитесь в каталог.</p><a class="btn btn-secondary" href="index.html">На главную</a></div>';
    return;
  }

  let details;
  try {
    container.innerHTML = '<div class="status-box">Загружаем подробности из набора данных StarRailRes…</div>';
    details = await loadEntityDetails();
  } catch (error) {
    console.error(error);
    container.innerHTML = '<div class="status-box error">Не удалось загрузить подробные данные. Попробуйте обновить страницу.</div>';
    return;
  }
  const source = kind === 'character'
    ? details.characters?.[String(item.id)]
    : kind === 'lightcone'
      ? details.lightCones?.[String(item.id)]
      : details.relicSets?.[String(item.id)];
  const title = kind === 'character' ? getDisplayCharacterName(item) : source?.localizedName || getEntityName(kind, item);
  const canonicalName = kind === 'character' ? getDisplayCharacterName(item) : item.name;
  const translatedDescription = formatSourceDescription(kind === 'lightcone' && source?.description ? source.description : item.localizedDescription || item.description);
  const headingTitle = escapeHtml(title);
  const overview = kind === 'character'
    ? `
      <div class="detail-hero">
        <div class="detail-art"><img src="${escapeHtml(item.image)}" alt="${headingTitle}" /></div>
        <div class="detail-summary">
          <p class="eyebrow">Профиль персонажа</p>
          <h2>${headingTitle}</h2>
          ${canonicalName !== title ? `<p class="detail-alias">${escapeHtml(canonicalName)}</p>` : ''}
          <div class="detail-badges">
            <span class="meta-badge">${formatRarity(item.rarity)}</span>
            <span class="tag"><span class="tag-icon"><img src="${getPathIcon(item.path)}" alt="" /></span>${normalizePath(item.path)}</span>
            <span class="tag"><span class="tag-icon"><img src="${getElementIcon(item.element)}" alt="" /></span>${getLocalizedElement(item.element)}</span>
          </div>
          <p class="detail-note">Подробные способности и следы приведены по локализованным данным StarRailRes.</p>
          ${renderFavoriteButton(kind, item)}
        </div>
      </div>
      <div class="detail-basic"><h3>Основная информация</h3><dl><div><dt>Путь</dt><dd>${normalizePath(item.path)}</dd></div><div><dt>Тип урона</dt><dd>${getLocalizedElement(item.element)}</dd></div><div><dt>Редкость</dt><dd>${formatRarity(item.rarity)}</dd></div></dl></div>
    `
    : kind === 'lightcone'
      ? `
        <div class="detail-hero detail-hero-compact">
          <div class="detail-art"><img src="${escapeHtml(item.image)}" alt="${headingTitle}" /></div>
          <div class="detail-summary"><p class="eyebrow">Световой конус</p><h2>${headingTitle}</h2>${canonicalName !== title ? `<p class="detail-alias">${escapeHtml(canonicalName)}</p>` : ''}<div class="detail-badges"><span class="meta-badge">${formatRarity(item.rarity)}</span><span class="tag"><span class="tag-icon"><img src="${getPathIcon(item.path)}" alt="" /></span>${normalizePath(item.path)}</span></div>${renderFavoriteButton(kind, item)}</div>
        </div>
        <section class="detail-section"><h3>Описание</h3><p class="detail-long-text">${escapeHtml(translatedDescription || 'Описание в доступных данных не представлено.').replace(/\n/g, '<br>')}</p></section>
      `
      : `
        <div class="detail-hero detail-hero-compact">
          <div class="detail-art"><img src="${escapeHtml(item.image)}" alt="${headingTitle}" /></div>
          <div class="detail-summary"><p class="eyebrow">Комплект реликвий</p><h2>${headingTitle}</h2>${canonicalName !== title ? `<p class="detail-alias">${escapeHtml(canonicalName)}</p>` : ''}<div class="detail-badges"><span class="meta-badge">Набор реликвий</span></div>${renderFavoriteButton(kind, item)}</div>
        </div>
        <section class="detail-section"><h3>Бонусы комплекта</h3>${source?.bonuses?.length ? `<ul class="bonus-list">${source.bonuses.map((bonus) => `<li><span>${escapeHtml(bonus)}</span></li>`).join('')}</ul>` : `<p class="detail-unavailable">Бонусы в доступных данных StarRailRes не указаны.</p>`}</section>
        ${source?.pieces?.length ? `<section class="detail-section"><h3>Предметы комплекта</h3><div class="relic-piece-grid">${source.pieces.map((piece) => `<article class="relic-piece">${piece.icon ? `<img src="${getSourceIcon(piece.icon)}" alt="" loading="lazy" />` : ''}<div><strong>${escapeHtml(piece.name)}</strong>${piece.rarities?.length ? `<span>Редкость: ${piece.rarities.map(formatRarity).join(' · ')}</span>` : ''}</div></article>`).join('')}</div></section>` : ''}
      `;

  const hasCharacterDetails = kind === 'character';
  container.innerHTML = `
    <a class="back-link" href="${kind === 'character' ? 'characters.html' : kind === 'lightcone' ? 'lightcones.html' : 'relics.html'}">← Вернуться в каталог</a>
    <div class="detail-page">
      ${hasCharacterDetails ? `
        <nav class="detail-tabs" aria-label="Разделы персонажа">
          <a href="#overview">Обзор</a><a href="#skills">Навыки</a><a href="#traces">Следы</a><a href="#eidolons">Эйдолоны</a>
        </nav>
      ` : ''}
      <section id="overview" class="detail-overview">${overview}</section>
      ${hasCharacterDetails ? `
        <section class="detail-section" id="skills"><h2>Навыки</h2>${renderDetailRecords(source?.skills, 'skill')}</section>
        <section class="detail-section" id="traces"><h2>Следы</h2>${renderDetailRecords(source?.traces, 'trace')}</section>
        <section class="detail-section" id="eidolons"><h2>Эйдолоны</h2>${renderDetailRecords(source?.eidolons, 'eidolon')}</section>
      ` : ''}
    </div>
  `;
}

function setupFavoriteInteractions() {
  document.body.addEventListener('click', (event) => {
    const button = event.target.closest('[data-favorite-type][data-favorite-id]');
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    toggleFavorite(button.dataset.favoriteType, button.dataset.favoriteId);
  });
}

function setupCatalogCardInteractions() {
  document.body.addEventListener('click', (event) => {
    const card = event.target.closest('.catalog-card');
    if (!card || event.target.closest('a, button')) return;
    window.location.href = getDetailUrl(card.dataset.kind, card.dataset.id);
  });

  document.body.addEventListener('keydown', (event) => {
    const card = event.target.closest('.catalog-card');
    if (!card || event.target !== card || event.key !== 'Enter') return;
    event.preventDefault();
    window.location.href = getDetailUrl(card.dataset.kind, card.dataset.id);
  });
}

function renderAvailableCharacters(searchValue = '') {
  const available = document.getElementById('team-available');
  if (!available || !appState.data) {
    return;
  }

  const query = searchValue.trim().toLowerCase();
  const characters = appState.data.characters.filter((character) => {
    const isReserved = appState.team.includes(character.id);
    if (isReserved) return false;
    if (!query) return true;

    const displayName = getDisplayCharacterName(character).toLowerCase();
    const localizedElement = getLocalizedElement(character.element).toLowerCase();
    const localizedPath = getLocalizedPath(character.path).toLowerCase();

    return (
      displayName.includes(query) ||
      localizedElement.includes(query) ||
      localizedPath.includes(query) ||
      character.name.toLowerCase().includes(query) ||
      character.element.toLowerCase().includes(query) ||
      character.path.toLowerCase().includes(query)
    );
  });

  if (!characters.length) {
    available.innerHTML = '<div class="empty-state">Персонажи не найдены. Попробуйте изменить поиск.</div>';
    return;
  }

  available.innerHTML = characters
    .map(
      (character) => `
        <button
          type="button"
          class="pick-card"
          data-action="add-character"
          data-character-id="${character.id}"
          draggable="true"
          aria-label="Добавить ${getDisplayCharacterName(character)} в команду"
        >
          <img src="${character.image}" alt="${getDisplayCharacterName(character)}" loading="lazy" />
          <span>
            <span class="name">${getDisplayCharacterName(character)}</span>
            <span class="meta">${getLocalizedElement(character.element)} · ${getLocalizedPath(character.path)}</span>
          </span>
        </button>
      `
    )
    .join('');
}

function renderTeamBuilder() {
  const available = document.getElementById('team-available');
  const slots = document.getElementById('team-slots');

  if (!appState.data) {
    return;
  }

  updateTeamSummary();

  const teamSearch = document.getElementById('team-search');
  const searchValue = teamSearch ? teamSearch.value : '';
  renderAvailableCharacters(searchValue);

  const slotsMarkup = Array.from({ length: 4 }, (_, index) => {
    const selectedCharacter = appState.team[index];
    const character = appState.data.characters.find((item) => item.id === selectedCharacter);

    if (character) {
      return `
        <div class="team-slot is-filled" data-index="${index}" tabindex="0" aria-label="Слот ${index + 1} заполнен ${getDisplayCharacterName(character)}">
          <div class="slot-info">
            <img src="${character.image}" alt="${getDisplayCharacterName(character)}" />
            <div>
              <strong>${getDisplayCharacterName(character)}</strong>
              <div class="meta-pill">${getLocalizedPath(character.path)}</div>
            </div>
          </div>
          <button class="remove-slot" type="button" data-action="remove-slot" data-index="${index}" aria-label="Удалить ${getDisplayCharacterName(character)}">×</button>
        </div>
      `;
    }

    return `
      <div class="team-slot" data-index="${index}" tabindex="0" aria-label="Слот ${index + 1} пустой">
        <div class="slot-info">
          <span>Слот ${index + 1}</span>
        </div>
        <span>Пусто</span>
      </div>
    `;
  }).join('');

  slots.innerHTML = slotsMarkup;
}

function setupDragAndDropHandlers() {
  document.body.addEventListener('dragstart', (event) => {
    const card = event.target.closest('[data-character-id]');
    if (!card || !event.dataTransfer) return;

    event.dataTransfer.setData('text/plain', card.dataset.characterId);
    event.dataTransfer.effectAllowed = 'copy';
    card.classList.add('dragging');
  });

  document.body.addEventListener('dragover', (event) => {
    const slot = event.target.closest('.team-slot');
    if (!slot) return;
    event.preventDefault();
    slot.classList.add('drag-over');
  });

  document.body.addEventListener('drop', (event) => {
    const slot = event.target.closest('.team-slot');
    if (!slot) return;
    event.preventDefault();
    slot.classList.remove('drag-over');

    const id = event.dataTransfer ? event.dataTransfer.getData('text/plain') : '';
    const index = Number(slot.dataset.index);
    if (id) addCharacterToTeam(id, index, true);
  });

  document.body.addEventListener('dragleave', (event) => {
    const slot = event.target.closest('.team-slot');
    if (!slot) return;
    if (!slot.contains(event.relatedTarget)) {
      slot.classList.remove('drag-over');
    }
  });

  document.body.addEventListener('dragend', () => {
    document.querySelectorAll('.pick-card').forEach((card) => card.classList.remove('dragging'));
    document.querySelectorAll('.team-slot').forEach((slot) => slot.classList.remove('drag-over'));
  });
}

function addCharacterToTeam(characterId, preferredIndex = null, replaceCurrent = false) {
  const character = appState.data.characters.find((entry) => entry.id === characterId);
  if (!character) return;

  const targetIndex = Number.isInteger(preferredIndex)
    ? preferredIndex
    : appState.team.findIndex((entry) => !entry);

  if (targetIndex < 0 || targetIndex >= 4) return;

  const existingIndex = appState.team.indexOf(characterId);
  if (existingIndex !== -1 && existingIndex !== targetIndex) {
    appState.team[existingIndex] = null;
  }

  if (!replaceCurrent && appState.team[targetIndex] && appState.team[targetIndex] !== characterId) {
    const fallbackIndex = appState.team.findIndex((entry) => !entry);
    if (fallbackIndex === -1) return;
    appState.team[fallbackIndex] = characterId;
    saveTeam();
    renderTeamBuilder();
    return;
  }

  appState.team[targetIndex] = characterId;
  saveTeam();
  renderTeamBuilder();
}

function removeCharacterFromSlot(index) {
  if (!Number.isInteger(index) || index < 0 || index >= 4) return;
  appState.team[index] = null;
  saveTeam();
  renderTeamBuilder();
}

function clearTeam() {
  appState.team = Array(4).fill(null);
  saveTeam();
  renderTeamBuilder();
}

function setupTeamInteractions() {
  document.body.addEventListener('click', (event) => {
    const actionTarget = event.target.closest('[data-action]');
    if (!actionTarget) return;

    const { action, index, characterId } = actionTarget.dataset;

    switch (action) {
      case 'add-character':
        addCharacterToTeam(characterId, appState.team.findIndex((entry) => !entry));
        break;
      case 'remove-slot':
        removeCharacterFromSlot(Number(index));
        break;
      case 'clear-team':
        clearTeam();
        break;
      default:
        break;
    }
  });

  document.body.addEventListener('keydown', (event) => {
    const card = event.target.closest('[data-character-id]');
    if (!card) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      addCharacterToTeam(card.dataset.characterId, appState.team.findIndex((entry) => !entry));
    }
  });

  const teamSearch = document.getElementById('team-search');
  if (teamSearch) {
    teamSearch.addEventListener('input', (event) => {
      renderAvailableCharacters(event.target.value);
    });
  }

  const clearButton = document.getElementById('clear-team');
  if (clearButton) {
    clearButton.addEventListener('click', clearTeam);
  }
}

function validateField(fieldName, value, checked = null) {
  if (fieldName === 'name') {
    return value.trim() ? '' : 'Поле имени обязательно.';
  }

  if (fieldName === 'email') {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : 'Введите корректный email.';
  }

  if (fieldName === 'message') {
    return value.trim() ? '' : 'Сообщение обязательно.';
  }

  if (fieldName === 'consent') {
    return checked ? '' : 'Необходимо согласие.';
  }

  return '';
}

function showFieldError(fieldName, message) {
  const errorNode = document.querySelector(`[data-error-for="${fieldName}"]`);
  if (errorNode) {
    errorNode.textContent = message;
  }
}

function setupFeedbackForm() {
  const form = document.getElementById('feedback-form');
  if (!form) return;

  const inputs = form.querySelectorAll('[data-field]');

  inputs.forEach((input) => {
    input.addEventListener('focus', () => {
      input.closest('.form-field')?.classList.add('focused');
    });

    input.addEventListener('blur', () => {
      const fieldName = input.name;
      const value = input.type === 'checkbox' ? input.checked : input.value;
      const message = validateField(fieldName, value, input.checked);
      showFieldError(fieldName, message);
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    let isValid = true;
    const successMessage = document.getElementById('form-success');

    inputs.forEach((input) => {
      const fieldName = input.name;
      const value = input.type === 'checkbox' ? input.checked : input.value;
      const message = validateField(fieldName, value, input.checked);
      showFieldError(fieldName, message);
      if (message) {
        isValid = false;
      }
    });

    if (!isValid) {
      successMessage.classList.remove('visible');
      return;
    }

    successMessage.classList.add('visible');
    form.reset();
  });
}

async function initPage() {
  setupGlobalLayout();
  setActiveNav();
  setupFavoriteInteractions();
  setupCatalogCardInteractions();
  window.__hsrReady = false;

  try {
    await loadData();
  } catch (error) {
    console.error(error);
    const page = document.body.dataset.page;
    const message = document.createElement('div');
    message.className = 'status-box error';
    message.textContent = 'Не удалось загрузить данные.';

    if (page === 'characters') {
      document.getElementById('character-list').appendChild(message);
    }
    if (page === 'lightcones') {
      document.getElementById('lightcone-list').appendChild(message);
    }
    if (page === 'relics') {
      document.getElementById('relic-list').appendChild(message);
    }
    if (page === 'teambuilder') {
      document.getElementById('team-available').appendChild(message);
    }
    return;
  }

  buildSearchIndex();
  setupGlobalSearch();
  const page = document.body.dataset.page;

  if (page === 'home') {
    renderHomePage();
  }

  if (page === 'characters') {
    renderCharactersPage();
  }

  if (page === 'lightcones') {
    renderLightConePage();
  }

  if (page === 'relics') {
    renderRelicsPage();
  }

  if (page === 'detail') {
    await renderDetailPage();
  }

  if (page === 'favorites') {
    renderFavoritesPage();
  }

  if (page === 'teambuilder') {
    renderTeamBuilder();
    setupDragAndDropHandlers();
    setupTeamInteractions();
  }

  if (page === 'feedback') {
    setupFeedbackForm();
  }

  window.__hsrReady = true;
}

document.addEventListener('DOMContentLoaded', initPage);
