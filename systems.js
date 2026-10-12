/* RTRS Clicker — expanded Cookie Clicker-inspired systems.
   All timers use timestamps so effects survive reloads and work offline. */
const RADIO_NEWS = [
  '📡 Служба мониторинга: чистота эфира сегодня выше нормы.',
  '🛰️ Спутники зарегистрировали новый сигнал из глубокого космоса.',
  '📻 Радиолюбители сообщают о необычном усилении несущей частоты.',
  '⚡ Инженеры напоминают: улучшения работают даже когда вы не кликаете.',
  '🌌 В лаборатории обнаружены следы древней гармоники.',
  '🗼 Новая башня расширила зону покрытия ещё на один сектор.',
  '🔭 Астрономы просят не направлять квантовый луч на Луну.',
  '🎙️ Редакция эфира благодарит операторов за стабильное вещание.'
];

const SYSTEM_BUFF_LABELS = {
  goldenProd: 'Сверхпроводимость',
  goldenClick: 'Клик-френзи',
  gardenProd: 'Фермент роста'
};

const STOCKS = [
  {id:'antenna',name:'Антенны',icon:'📡',base:18},
  {id:'tower',name:'Вышки',icon:'🗼',base:29},
  {id:'radio',name:'Радиостанции',icon:'🎙️',base:42},
  {id:'satellite',name:'Спутники',icon:'🛰️',base:61},
  {id:'quantum',name:'Квантовые узлы',icon:'⚛️',base:88}
];

const GARDEN_SEEDS = [
  {id:'spark',name:'Искра',icon:'✨',cost:1200,growMs:2*60*1000,reward:1.25,desc:'Быстро растёт, небольшой бонус'},
  {id:'resonance',name:'Резонанс',icon:'💠',cost:45000,growMs:7*60*1000,reward:1.5,desc:'Усиливает эфир на время'},
  {id:'quantum',name:'Квантовый мох',icon:'🌌',cost:2e6,growMs:18*60*1000,reward:2,desc:'Редкий урожай и сильный бонус'}
];

const LEGACY_UPGRADES = [
  {id:'starter',name:'Стартовый импульс',icon:'🚀',cost:1,desc:'После любого сброса начинаете с 10 000 сигналов.'},
  {id:'golden',name:'Маяк удачи',icon:'✨',cost:2,desc:'Золотые сигналы появляются на 25% чаще.'},
  {id:'offline',name:'Автономная сеть',icon:'🌙',cost:3,desc:'Офлайн-доход повышается с 50% до 75%.'},
  {id:'signalAmp',name:'Орбитальный усилитель',icon:'🛰️',cost:5,desc:'Производство сигналов +15% навсегда.'},
  {id:'clickCore',name:'Ядро оператора',icon:'👆',cost:8,desc:'Сила клика ×1,5 навсегда.'},
  {id:'stockMarket',name:'Биржа будущего',icon:'📈',cost:13,desc:'Открывает биржу сразу после Великого сброса.'}
];

const EXTRA_ACH = [
  {id:'gold1',nm:'Поймал волну',ic:'✨',desc:'Поймать первый золотой сигнал',ck:()=>G.goldenClicks>=1},
  {id:'gold25',nm:'Охотник за эфиром',ic:'🌟',desc:'Поймать 25 золотых сигналов',ck:()=>G.goldenClicks>=25},
  {id:'elder1',nm:'Старый эфир',ic:'👁️',desc:'Пробудить старейшин эфира',ck:()=>!!G.elderAwake},
  {id:'wrinkler1',nm:'Сборщик помех',ic:'🪱',desc:'Удалить первого паразита сигнала',ck:()=>!!G.wrinklersPopped&&G.wrinklersPopped>=1},
  {id:'lump1',nm:'Кристалл времени',ic:'💎',desc:'Собрать кристалл гармоники',ck:()=>G.sugarLumps>=1},
  {id:'garden5',nm:'Зелёный оператор',ic:'🌱',desc:'Собрать 5 урожаев в саду',ck:()=>G.gardenHarvests>=5},
  {id:'market1',nm:'Первый трейдер',ic:'📈',desc:'Купить первую акцию',ck:()=>Object.values(G.stockOwned||{}).some(v=>v>0)},
  {id:'seasonSet',nm:'Четыре сезона',ic:'🍀',desc:'Собрать все 4 радиоартефакта',ck:()=>['winter','spring','summer','autumn'].every(k=>(G.seasonDrops||{})[k]>=1)},
  {id:'mod5',nm:'Точная настройка',ic:'🎛️',desc:'Прокачать модулятор до 5 уровня',ck:()=>G.modulatorLevel>=5},
  {id:'allSystems',nm:'Центр управления',ic:'🧭',desc:'Открыть старейшин, сад и биржу',ck:()=>!!G.elderAwake&&!!G.stockUnlocked&&G.gardenHarvests>=1}
];

function allAchievements() {
  return ACH.concat(EXTRA_ACH);
}

function systemProductionMultiplier() {
  let m = 1;
  const achievementCount = Object.values(G.ach || {}).filter(Boolean).length;
  m *= 1 + Math.min(0.5, achievementCount * 0.005);
  m *= 1 + Math.max(0, Number(G.modulatorLevel) || 0) * 0.1;
  if (G.legacyUpgrades && G.legacyUpgrades.signalAmp) m *= 1.15;
  if (G.seasonReward) m *= 1.1;
  return Number.isFinite(m) ? m : 1;
}

function systemClickMultiplier() {
  let m = 1 + Math.max(0, Number(G.modulatorLevel) || 0) * 0.02;
  if (G.legacyUpgrades && G.legacyUpgrades.clickCore) m *= 1.5;
  return Number.isFinite(m) ? m : 1;
}

function goldenIntervalMs() {
  return (45000 + Math.random() * 60000) * (G.legacyUpgrades && G.legacyUpgrades.golden ? 0.75 : 1);
}

function ensureSystemsState() {
  if (!Array.isArray(G.wrinklers)) G.wrinklers = [];
  if (!Array.isArray(G.gardenPlots)) G.gardenPlots = [null,null,null];
  while (G.gardenPlots.length < 3) G.gardenPlots.push(null);
  if (!G.legacyUpgrades || typeof G.legacyUpgrades !== 'object') G.legacyUpgrades = {};
  if (!G.stockOwned || typeof G.stockOwned !== 'object') G.stockOwned = {};
  if (!G.stockPrices || typeof G.stockPrices !== 'object') G.stockPrices = {};
  if (!G.seasonDrops || typeof G.seasonDrops !== 'object') G.seasonDrops = {winter:0,spring:0,summer:0,autumn:0};
  ['winter','spring','summer','autumn'].forEach(k => {
    if (!Number.isFinite(G.seasonDrops[k])) G.seasonDrops[k] = 0;
  });
  STOCKS.forEach(s => {
    if (!Number.isFinite(G.stockPrices[s.id]) || G.stockPrices[s.id] <= 0) G.stockPrices[s.id] = s.base;
    if (!Number.isFinite(G.stockOwned[s.id])) G.stockOwned[s.id] = 0;
  });
  if (!Number.isFinite(G.sugarLumps)) G.sugarLumps = 0;
  if (!Number.isFinite(G.goldenClicks)) G.goldenClicks = 0;
  if (!Number.isFinite(G.wrinklersPopped)) G.wrinklersPopped = 0;
  if (!Number.isFinite(G.gardenHarvests)) G.gardenHarvests = 0;
  if (!Number.isFinite(G.modulatorLevel)) G.modulatorLevel = 0;
  if (!Number.isFinite(G.legacyTokens)) G.legacyTokens = 0;
  if (!Number.isFinite(G.wrinklerNext)) G.wrinklerNext = 0;
  if (!Number.isFinite(G.goldenNext)) G.goldenNext = 0;
  if (!Number.isFinite(G.goldenUntil)) G.goldenUntil = 0;
  if (!Number.isFinite(G.lumpNext)) G.lumpNext = 0;
}

function systemNotify(title, body) {
  if (typeof notify === 'function') notify(title, body);
}

function addSignalReward(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return;
  G.sig += n;
  G.tot += n;
  G.totAll += n;
}

function tickSpecialSystems(now, dt) {
  ensureSystemsState();
  let shouldRecalc = false;

  // Remove expired effects centrally, so multipliers never get stuck after a timer ends.
  Object.keys(G.boosters).forEach(k => {
    const b = G.boosters[k];
    if (b && b.dur && now - b.ts >= b.dur * 1000) {
      delete G.boosters[k];
      shouldRecalc = true;
    }
  });

  if (!G.goldenUnlocked && G.totAll >= 500) {
    G.goldenUnlocked = true;
    G.goldenNext = now + 8000;
    systemNotify('✨ Поймай сигнал', 'Иногда в эфире появляется золотой импульс. Нажми на него!');
    save();
  }
  if (G.goldenUnlocked) {
    if (G.goldenUntil > 0 && now >= G.goldenUntil) {
      G.goldenUntil = 0;
      G.goldenWrath = false;
      G.goldenNext = now + goldenIntervalMs();
    } else if (G.goldenUntil <= 0) {
      if (!G.goldenNext || G.goldenNext < now - 60000) G.goldenNext = now + 12000;
      if (now >= G.goldenNext) {
        G.goldenUntil = now + 13000;
        G.goldenWrath = !!G.elderAwake && Math.random() < 0.33;
        systemNotify(G.goldenWrath ? '☠️ Помеха в эфире!' : '✨ Золотой сигнал!', G.goldenWrath ? 'Рискни поймать сигнал: эффект может быть опасным.' : 'Он исчезнет через 13 секунд.');
      }
    }
  }
  renderGoldenSignal(now);

  // Elder interference parasites steal a slice of production but return it with interest when popped.
  if (G.elderAwake) {
    if (!G.wrinklerNext) G.wrinklerNext = now + 18000;
    if (now >= G.wrinklerNext) {
      if (G.wrinklers.length < 8) {
        G.wrinklers.push({id:'w' + now.toString(36) + Math.floor(Math.random()*1000).toString(36),stored:0,bornAt:now});
        systemNotify('🪱 Паразит сигнала', 'Он поглощает часть производства. Нажми на него, чтобы забрать накопленное.');
      }
      G.wrinklerNext = now + 18000 + Math.random() * 22000;
    }
  }

  // Time crystals (sugar-lump equivalent): first crystal matures quickly, later ones steadily.
  if (G.totAll >= 1e6) {
    if (!G.lumpNext) G.lumpNext = now + 5 * 60 * 1000;
    if (now >= G.lumpNext && !G.lumpReady) {
      G.lumpReady = true;
      systemNotify('💎 Кристалл созрел', 'Забери кристалл в разделе «Системы».');
    }
  }

  // Unlock the exchange permanently after the first meaningful production milestone.
  if (!G.stockUnlocked && (G.totAll >= 1e5 || (G.legacyUpgrades && G.legacyUpgrades.stockMarket))) {
    G.stockUnlocked = true;
    systemNotify('📈 Биржа эфира открыта', 'Покупай акции, следи за ценами и собирай дивиденды.');
  }

  // Market moves every 30 seconds. A small dividend rewards long-term holdings.
  if (G.stockUnlocked && (!G.stockLast || now - G.stockLast >= 30000)) {
    let dividend = 0;
    STOCKS.forEach(s => {
      const price = getStockPrice(s);
      const drift = (Math.random() - 0.48) * 0.14;
      G.stockPrices[s.id] = Math.max(1, Math.round(price * (1 + drift) * 10) / 10);
      dividend += (G.stockOwned[s.id] || 0) * G.stockPrices[s.id] * 0.0005;
    });
    G.stockLast = now;
    if (dividend > 0) addSignalReward(dividend);
  }

  if (shouldRecalc && typeof recalc === 'function') recalc();
}

function renderGoldenSignal(now) {
  const btn = document.getElementById('goldenSignal');
  if (!btn) return;
  const active = !!G.goldenUnlocked && G.goldenUntil > now;
  btn.style.display = active ? 'flex' : 'none';
  btn.classList.toggle('wrath', !!G.goldenWrath);
  const mode = G.goldenWrath ? 'wrath' : 'golden';
  if (btn.dataset.mode !== mode) {
    btn.innerHTML = G.goldenWrath ? '☠️<span>СИГНАЛ ПОМЕХ</span>' : '✨<span>ЗОЛОТОЙ СИГНАЛ</span>';
    btn.dataset.mode = mode;
  }
  btn.setAttribute('aria-hidden', active ? 'false' : 'true');
}

function clickGoldenSignal(event) {
  if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
  const now = Date.now();
  if (!G.goldenUnlocked || !G.goldenUntil || now > G.goldenUntil) return;
  const isWrath = !!G.goldenWrath;
  G.goldenUntil = 0;
  G.goldenWrath = false;
  G.goldenNext = now + goldenIntervalMs();
  G.goldenClicks = (G.goldenClicks || 0) + 1;

  if (isWrath) {
    const roll = Math.random();
    if (roll < 0.36 && G.sig > 0) {
      const loss = Math.min(G.sig, Math.max(Cache.click * 50, G.sig * 0.07));
      G.sig -= loss;
      G.boosters.goldenProd = {ts:now,dur:40};
      systemNotify('☠️ Чёрный сигнал', 'Потеряно ' + fmt(loss) + ' сигналов, но производство ×7 на 40 секунд.');
    } else if (roll < 0.72) {
      G.boosters.e3 = {ts:now,dur:20};
      systemNotify('☠️ Глушение', 'Производство снижено на 20 секунд.');
    } else {
      G.boosters.goldenClick = {ts:now,dur:13};
      systemNotify('⚡ Помеха обернулась силой', 'Клик-френзи ×777 на 13 секунд!');
    }
  } else {
    const roll = Math.random();
    if (roll < 0.34) {
      G.boosters.goldenProd = {ts:now,dur:77};
      systemNotify('⚡ Сверхпроводимость', 'Производство ×7 на 77 секунд!');
    } else if (roll < 0.58) {
      G.boosters.goldenClick = {ts:now,dur:13};
      systemNotify('👆 Клик-френзи', 'Сила клика ×777 на 13 секунд!');
    } else if (roll < 0.84) {
      const cap = Math.max(Cache.click * 13, Cache.sps * 900);
      const payout = Math.max(Cache.click * 13, Math.min(G.sig * 0.15, cap));
      addSignalReward(payout);
      systemNotify('💰 Удачный эфир', 'Получено +' + fmt(payout) + ' сигналов.');
    } else {
      G.boosters.e1 = {ts:now,dur:180};
      systemNotify('🛰️ Ионосферный всплеск', 'Производство ×3 на 3 минуты!');
    }
  }

  const relics = ['winter','spring','summer','autumn'];
  if (Math.random() < 0.14) {
    const relic = relics[Math.floor(Math.random() * relics.length)];
    G.seasonDrops[relic] = (G.seasonDrops[relic] || 0) + 1;
    systemNotify('🍀 Найден радиоартефакт', ({winter:'❄️ Зимний кристалл',spring:'🌱 Весенний росток',summer:'☀️ Летняя искра',autumn:'🍂 Осенний резонатор'})[relic]);
    if (!G.seasonReward && relics.every(k => G.seasonDrops[k] >= 1)) {
      G.seasonReward = true;
      systemNotify('🌈 Гармония четырёх сезонов', 'Постоянный бонус производства +10%!');
    }
  }
  recalc();
  renderAll();
  save();
}

function popWrinkler(id) {
  ensureSystemsState();
  const i = G.wrinklers.findIndex(w => w.id === id);
  if (i < 0) return;
  const w = G.wrinklers[i];
  const reward = Math.max(0, (Number(w.stored) || 0) * 1.1);
  G.wrinklers.splice(i, 1);
  G.wrinklersPopped = (G.wrinklersPopped || 0) + 1;
  addSignalReward(reward);
  systemNotify('🪱 Помеха устранена', 'Возвращено ' + fmt(reward) + ' сигналов с бонусом 10%.');
  recalc();
  renderSystems();
  save();
}

function buyElders() {
  ensureSystemsState();
  const cost = 1e7;
  if (G.elderAwake || G.sig < cost || G.totAll < cost) return;
  G.sig -= cost;
  G.elderAwake = true;
  G.wrinklerNext = Date.now() + 12000;
  recalc();
  renderAll();
  save();
  systemNotify('👁️ Старейшины эфира пробуждены', 'Паразиты будут поглощать часть сигнала, но их можно лопать ради прибыли.');
}

function claimSugarLump() {
  ensureSystemsState();
  if (!G.lumpReady || Date.now() < G.lumpNext) return;
  G.sugarLumps = (G.sugarLumps || 0) + 1;
  G.lumpReady = false;
  G.lumpNext = Date.now() + 45 * 60 * 1000;
  systemNotify('💎 Кристалл собран', 'У вас теперь ' + G.sugarLumps + ' кристалл(ов) гармоники.');
  renderAll();
  save();
}

function buyModulator() {
  ensureSystemsState();
  if (G.modulatorLevel >= 20) return;
  const cost = 1 + Math.floor(G.modulatorLevel / 3);
  if (G.sugarLumps < cost) return;
  G.sugarLumps -= cost;
  G.modulatorLevel++;
  recalc();
  renderAll();
  save();
  systemNotify('🎛️ Модулятор улучшен', 'Уровень ' + G.modulatorLevel + ': производство +10%, клик +2%.');
}

function buyLegacyUpgrade(id) {
  ensureSystemsState();
  const u = LEGACY_UPGRADES.find(x => x.id === id);
  if (!u || G.legacyUpgrades[id] || G.legacyTokens < u.cost) return;
  G.legacyTokens -= u.cost;
  G.legacyUpgrades[id] = true;
  if (id === 'stockMarket') G.stockUnlocked = true;
  recalc();
  renderAll();
  save();
  systemNotify('🌌 Наследие разблокировано', u.name + ': ' + u.desc);
}

function renderLegacySection() {
  ensureSystemsState();
  let h = '<div class="psec legacy-section"><h3>🌌 Небесное наследие</h3><p>Орбитальные жетоны выдаются за «Великий сброс». Купленные свойства остаются навсегда.</p><div class="legacy-balance">Доступно жетонов: <b>' + fmt(G.legacyTokens) + '</b></div>';
  LEGACY_UPGRADES.forEach(u => {
    const owned = !!G.legacyUpgrades[u.id];
    const afford = G.legacyTokens >= u.cost;
    h += '<div class="legacy-row' + (owned ? ' owned' : '') + '"><div class="legacy-icon">' + u.icon + '</div><div class="legacy-copy"><div class="legacy-name">' + u.name + '</div><div class="legacy-desc">' + u.desc + '</div></div><div class="legacy-buy"><div>' + (owned ? 'Куплено' : fmt(u.cost) + ' жет.') + '</div><button class="pbtn blu" ' + (owned || !afford ? 'disabled' : '') + ' onclick="buyLegacyUpgrade(\'' + u.id + '\')">' + (owned ? '✓' : 'Купить') + '</button></div></div>';
  });
  h += '</div>';
  return h;
}

function marketScale() {
  return Math.max(1, Math.pow(Math.max(1, (G.totAll || 0) / 1e5), 0.08));
}

function getStockPrice(stock) {
  ensureSystemsState();
  const p = Number(G.stockPrices[stock.id]);
  return Number.isFinite(p) && p > 0 ? p : stock.base * marketScale();
}

function buyStock(id) {
  ensureSystemsState();
  if (!G.stockUnlocked) return;
  const s = STOCKS.find(x => x.id === id);
  if (!s) return;
  const price = getStockPrice(s);
  if (G.sig < price) return;
  G.sig -= price;
  G.stockOwned[id] = (G.stockOwned[id] || 0) + 1;
  renderSystems();
  save();
}

function sellStock(id) {
  ensureSystemsState();
  const s = STOCKS.find(x => x.id === id);
  if (!s || (G.stockOwned[id] || 0) <= 0) return;
  const price = getStockPrice(s);
  G.stockOwned[id]--;
  G.sig += price;
  renderSystems();
  save();
  systemNotify('📈 Акция продана', 'На баланс возвращено ' + fmt(price) + ' сигналов.');
}

function plantSeed(slot, seedId) {
  ensureSystemsState();
  if (!G.stockUnlocked || slot < 0 || slot >= 3 || G.gardenPlots[slot]) return;
  const seed = GARDEN_SEEDS.find(x => x.id === seedId);
  if (!seed || G.sig < seed.cost) return;
  G.sig -= seed.cost;
  G.gardenPlots[slot] = {seedId:seed.id,plantedAt:Date.now()};
  renderSystems();
  save();
  systemNotify('🌱 Семя посажено', seed.name + ' созреет через ' + Math.ceil(seed.growMs / 60000) + ' мин.');
}

function harvestSeed(slot) {
  ensureSystemsState();
  const plot = G.gardenPlots[slot];
  if (!plot) return;
  const seed = GARDEN_SEEDS.find(x => x.id === plot.seedId);
  if (!seed) { G.gardenPlots[slot] = null; return; }
  const readyAt = plot.plantedAt + seed.growMs;
  if (Date.now() < readyAt) return;
  const reward = Math.max(seed.cost * seed.reward, Cache.sps * (seed.id === 'spark' ? 60 : seed.id === 'resonance' ? 180 : 420));
  addSignalReward(reward);
  G.gardenPlots[slot] = null;
  G.gardenHarvests = (G.gardenHarvests || 0) + 1;
  const now = Date.now();
  const old = G.boosters.gardenProd;
  const elapsed = old && old.dur ? Math.max(0, old.dur - (now - old.ts) / 1000) : 0;
  G.boosters.gardenProd = {ts:now,dur:Math.min(900, elapsed + (seed.id === 'spark' ? 60 : seed.id === 'resonance' ? 180 : 360))};
  if (G.gardenHarvests % 5 === 0) G.sugarLumps = (G.sugarLumps || 0) + 1;
  recalc();
  renderAll();
  save();
  systemNotify('🌿 Урожай собран', '+' + fmt(reward) + ' сигналов и временный бонус производства.');
}

function renderSystems() {
  const root = document.getElementById('xList');
  if (!root) return;
  ensureSystemsState();
  const now = Date.now();
  let h = '';

  h += '<div class="slbl">✨ Золотые сигналы и редкие события</div>';
  let goldenText = 'Ожидаем чистую частоту';
  if (!G.goldenUnlocked) goldenText = 'Разблокируется после 500 сигналов за всё время';
  else if (G.goldenUntil > now) goldenText = 'Сигнал активен — поймай его на экране!';
  else goldenText = 'Следующий импульс скоро появится в эфире';
  h += '<div class="system-card"><div class="system-card-icon">✨</div><div class="system-card-main"><div class="system-card-title">Золотой сигнал</div><div class="system-card-desc">' + goldenText + '</div><div class="system-card-meta">Поймано: ' + (G.goldenClicks || 0) + ' · Случайный бонус, иногда ×7 производство или ×777 к клику</div></div></div>';

  h += '<div class="slbl">👁️ Старейшины эфира</div>';
  if (!G.elderAwake) {
    const canWake = G.totAll >= 1e7 && G.sig >= 1e7;
    h += '<div class="system-card"><div class="system-card-icon">👁️</div><div class="system-card-main"><div class="system-card-title">Пробудить старейшин</div><div class="system-card-desc">Откроет паразитов сигнала. Они забирают часть дохода, но при удалении возвращают накопленное с +10%.</div><div class="system-card-meta">Требование: 10 млн всего заработано · Цена: 10 млн</div><button class="pbtn red" ' + (canWake ? '' : 'disabled') + ' onclick="buyElders()">Пробудить</button></div></div>';
  } else {
    const siphon = Math.min(50, G.wrinklers.length * 5);
    h += '<div class="system-card"><div class="system-card-icon">🪱</div><div class="system-card-main"><div class="system-card-title">Паразиты эфира: ' + G.wrinklers.length + '/8</div><div class="system-card-desc">Сейчас поглощают до ' + siphon + '% производства. Нажми на паразита над башней или лопни его ниже.</div></div></div>';
    if (!G.wrinklers.length) h += '<div class="system-empty">Пока чисто. Первый паразит может появиться в ближайшее время.</div>';
    G.wrinklers.forEach(w => {
      h += '<div class="system-card"><div class="system-card-icon">🪱</div><div class="system-card-main"><div class="system-card-title">Накоплено ' + fmt(w.stored || 0) + '</div><div class="system-card-desc">После удаления вернётся ' + fmt((w.stored || 0) * 1.1) + ' сигналов.</div></div><button class="pbtn blu" onclick="popWrinkler(\'' + w.id + '\')">Лопнуть</button></div>';
    });
  }

  h += '<div class="slbl">💎 Кристаллы гармоники</div>';
  const lumpReady = !!G.lumpReady && now >= G.lumpNext;
  let lumpText = 'Кристаллы появляются после 1 млн сигналов за текущий цикл; урожай сада каждые 5 раз тоже даёт кристалл.';
  if (G.totAll >= 1e6 && !lumpReady) lumpText = 'Следующий кристалл: ' + (G.lumpNext ? Math.max(0,Math.ceil((G.lumpNext-now)/60000)) + ' мин.' : 'созревает');
  if (lumpReady) lumpText = 'Кристалл созрел — можно забрать!';
  h += '<div class="system-card"><div class="system-card-icon">💎</div><div class="system-card-main"><div class="system-card-title">Кристаллы гармоники: ' + (G.sugarLumps || 0) + '</div><div class="system-card-desc">' + lumpText + '</div></div><button class="pbtn blu" ' + (lumpReady ? '' : 'disabled') + ' onclick="claimSugarLump()">Собрать</button></div>';

  const modCost = 1 + Math.floor(G.modulatorLevel / 3);
  h += '<div class="system-card"><div class="system-card-icon">🎛️</div><div class="system-card-main"><div class="system-card-title">Модулятор — уровень ' + G.modulatorLevel + '/20</div><div class="system-card-desc">Каждый уровень: +10% производства и +2% к силе клика.</div><div class="system-card-meta">Следующее улучшение: ' + (G.modulatorLevel >= 20 ? 'максимум достигнут' : modCost + ' кристалл(а)') + '</div></div><button class="pbtn blu" ' + (G.sugarLumps < modCost || G.modulatorLevel >= 20 ? 'disabled' : '') + ' onclick="buyModulator()">Улучшить</button></div>';

  h += '<div class="slbl">📈 Биржа эфира</div>';
  if (!G.stockUnlocked) {
    h += '<div class="system-empty">Биржа откроется после 100 000 сигналов за текущий цикл или через постоянное улучшение в престиже.</div>';
  } else {
    h += '<div class="system-card"><div class="system-card-icon">💹</div><div class="system-card-main"><div class="system-card-title">Рынок обновляется каждые 30 секунд</div><div class="system-card-desc">Цены колеблются, а акции приносят небольшие дивиденды. Покупай, когда дёшево, продавай, когда подорожало.</div></div></div>';
    STOCKS.forEach(s => {
      const price = getStockPrice(s);
      const owned = G.stockOwned[s.id] || 0;
      h += '<div class="system-card stock-card"><div class="system-card-icon">' + s.icon + '</div><div class="system-card-main"><div class="system-card-title">' + s.name + '</div><div class="system-card-meta">Цена: ' + fmt(price) + ' · У вас: ' + owned + '</div></div><div class="stock-actions"><button class="pbtn blu" ' + (G.sig < price ? 'disabled' : '') + ' onclick="buyStock(\'' + s.id + '\')">Купить</button><button class="pbtn red" ' + (owned <= 0 ? 'disabled' : '') + ' onclick="sellStock(\'' + s.id + '\')">Продать</button></div></div>';
    });
  }

  h += '<div class="slbl">🌱 Сад частот</div>';
  h += '<div class="system-card"><div class="system-card-icon">🌿</div><div class="system-card-main"><div class="system-card-title">Лабораторные культуры</div><div class="system-card-desc">Посади семена, подожди, затем собери урожай: он приносит сигналы и временно усиливает производство. Таймеры идут даже пока игра закрыта.</div></div></div>';
  G.gardenPlots.forEach((plot, i) => {
    h += '<div class="system-card garden-plot"><div class="system-card-icon">' + (plot ? '🌱' : '🪴') + '</div><div class="system-card-main"><div class="system-card-title">Грядка ' + (i + 1) + '</div>';
    if (!plot) {
      h += '<div class="system-card-desc">Выбери культуру для посадки.</div><div class="seed-actions">';
      GARDEN_SEEDS.forEach(seed => {
        h += '<button class="seed-btn" ' + (G.sig < seed.cost || !G.stockUnlocked ? 'disabled' : '') + ' onclick="plantSeed(' + i + ',\'' + seed.id + '\')">' + seed.icon + ' ' + seed.name + ' · ' + fmt(seed.cost) + '</button>';
      });
      h += '</div>';
    } else {
      const seed = GARDEN_SEEDS.find(x => x.id === plot.seedId);
      const readyAt = seed ? plot.plantedAt + seed.growMs : now;
      const ready = now >= readyAt;
      h += '<div class="system-card-desc">' + (seed ? seed.icon + ' ' + seed.name : 'Неизвестное семя') + ' · ' + (ready ? 'Созрело!' : 'Осталось ' + Math.ceil((readyAt-now)/60000) + ' мин.') + '</div>';
      h += '<button class="pbtn blu" ' + (ready ? '' : 'disabled') + ' onclick="harvestSeed(' + i + ')">Собрать</button>';
    }
    h += '</div></div>';
  });

  h += '<div class="slbl">🍀 Радиоартефакты</div>';
  const relicNames = {winter:'❄️ Зима',spring:'🌱 Весна',summer:'☀️ Лето',autumn:'🍂 Осень'};
  h += '<div class="relic-grid">';
  Object.keys(relicNames).forEach(k => {
    h += '<div class="relic-item"><span>' + relicNames[k] + '</span><b>' + (G.seasonDrops[k] || 0) + '</b></div>';
  });
  h += '</div>';
  h += '<div class="system-empty">' + (G.seasonReward ? '🌈 Гармония собрана: постоянный бонус производства +10% активен.' : 'У каждого золотого сигнала есть 14% шанс найти артефакт. Собери по одному каждого вида для постоянного бонуса +10%.') + '</div>';

  root.innerHTML = h;
}

function cycleRadioNews() {
  const el = document.getElementById('radioNewsText');
  if (!el) return;
  const total = RADIO_NEWS.length;
  const idx = Math.floor(Math.random() * total);
  el.textContent = RADIO_NEWS[idx];
}

function renderWrinklers() {
  const layer = document.getElementById('wrinklerLayer');
  if (!layer) return;
  ensureSystemsState();
  const active = G.elderAwake ? G.wrinklers.slice(0,8) : [];
  const signature = active.map(w => w.id).join('|');
  if (layer.dataset.signature === signature) {
    active.forEach(w => {
      const btn = layer.querySelector('[data-wid="' + w.id + '"]');
      if (btn) btn.title = 'Накоплено ' + fmt(w.stored || 0) + ' сигналов. Нажми, чтобы забрать с бонусом.';
    });
    return;
  }
  layer.dataset.signature = signature;
  layer.innerHTML = '';
  if (!active.length) return;
  active.forEach((w,i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'wrinkler';
    b.dataset.wid = w.id;
    b.style.left = ([3,77,10,71,0,82,25,58][i]) + '%';
    b.style.top = ([18,22,58,59,42,43,72,73][i]) + '%';
    b.title = 'Накоплено ' + fmt(w.stored || 0) + ' сигналов. Нажми, чтобы забрать с бонусом.';
    b.innerHTML = '🪱';
    b.addEventListener('click', function(e) {
      e.stopPropagation();
      popWrinkler(w.id);
    });
    layer.appendChild(b);
  });
}
