import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const html = await readFile('index.html', 'utf8');
const systemsSource = await readFile('systems.js', 'utf8');

const marker = html.indexOf('const TG = window.Telegram?.WebApp || null;');
assert.notEqual(marker, -1, 'main game script bootstrap exists');
const scriptStart = html.lastIndexOf('<script>', marker);
const scriptEnd = html.indexOf('</script>', marker);
assert.ok(scriptStart >= 0 && scriptEnd > scriptStart, 'main inline script boundaries exist');
const mainScript = html.slice(scriptStart + '<script>'.length, scriptEnd);

new vm.Script(mainScript, { filename: 'inline-game.js' });
new vm.Script(systemsSource, { filename: 'systems.js' });

assert.ok(html.includes('<script src="./systems.js"></script>'), 'systems script is loaded');
assert.ok(html.includes('data-tab="x"') && html.includes('id="tx"'), 'systems tab is connected');
assert.ok(html.includes('id="goldenSignal"'), 'golden signal control exists');
assert.ok(html.includes('id="wrinklerLayer"'), 'wrinklers have a clickable layer');
assert.ok(mainScript.includes('tickSpecialSystems(now,dt)'), 'special systems are wired into the game loop');
assert.ok(mainScript.includes("Number.isFinite(G.freqTotal)?G.freqTotal:G.freq"), 'prestige rewards are cumulative and not repeatedly claimable');
assert.ok(mainScript.includes("'last'"), 'save loader restores the last-save timestamp');

const deterministicMath = Object.create(Math);
let randomValues = [0.1, 0.9];
deterministicMath.random = () => randomValues.length ? randomValues.shift() : 0.9;

const context = {
  G: { sig: 0, tot: 0, totAll: 0, freq: 2, harm: 0, ach: {}, legacyUpgrades: {} },
  Cache: { sps: 10, click: 1 },
  ACH: [],
  Math: deterministicMath,
  document: { getElementById: () => null },
  fmt: n => String(Math.floor(Number(n) || 0)),
  save: () => {},
  recalc: () => {},
  renderAll: () => {},
  notify: () => {}
};
vm.createContext(context);
vm.runInContext(systemsSource + '\nglobalThis.__systemsTest = { ensureSystemsState, systemProductionMultiplier, buyStock, sellStock, clickGoldenSignal, plantSeed, harvestSeed, popWrinkler };', context);

const api = context.__systemsTest;
api.ensureSystemsState();
assert.equal(context.G.freqTotal, 2, 'old saves migrate earned prestige into the lifetime tally');
assert.equal(context.G.gardenPlots.length, 3, 'garden always has three plots');
assert.equal(context.G.stockOwned.antenna, 0, 'stock holdings initialize safely');

context.G.ach = {a: true, b: true};
context.G.modulatorLevel = 2;
context.G.legacyUpgrades = {signalAmp: true};
context.G.seasonReward = true;
const expectedProd = (1 + 2 * 0.005) * (1 + 2 * 0.1) * 1.15 * 1.1;
assert.ok(Math.abs(api.systemProductionMultiplier() - expectedProd) < 1e-9, 'permanent progression multipliers combine predictably');

context.G = {
  sig: 100, tot: 42, totAll: 42, stockUnlocked: true,
  stockPrices: {antenna: 25}, stockOwned: {antenna: 0},
  stockLast: 0, gardenPlots: [null, null, null], seasonDrops: {}
};
api.ensureSystemsState();
api.buyStock('antenna');
assert.equal(context.G.sig, 75, 'buying stock deducts the quoted price');
assert.equal(context.G.stockOwned.antenna, 1, 'buying stock records one share');
api.sellStock('antenna');
assert.equal(context.G.sig, 100, 'selling at the same price restores the cash balance');
assert.equal(context.G.totAll, 42, 'selling assets cannot be exploited to farm prestige');

context.G = {
  sig: 1000, tot: 0, totAll: 500, goldenUnlocked: true,
  goldenUntil: Date.now() + 10000, goldenWrath: false, goldenClicks: 0,
  goldenNext: 0, boosters: {}, seasonDrops: {winter:0,spring:0,summer:0,autumn:0},
  stockOwned: {}, stockPrices: {}, stockUnlocked: false, gardenPlots: [null,null,null]
};
context.Cache = {sps: 10, click: 1};
api.ensureSystemsState();
api.clickGoldenSignal({ stopPropagation() {} });
assert.equal(context.G.goldenClicks, 1, 'clicking an active golden signal is recorded');
assert.ok(context.G.boosters.goldenProd || context.G.boosters.goldenClick || context.G.boosters.e1, 'golden signal grants a timed effect');
assert.equal(context.G.goldenUntil, 0, 'golden signal can only be claimed once');

context.G = {
  sig: 10000, tot: 0, totAll: 0, stockUnlocked: true,
  gardenPlots: [null, null, null], boosters: {}, sugarLumps: 0
};
context.Cache = {sps: 10, click: 1};
api.ensureSystemsState();
api.plantSeed(0, 'spark');
assert.ok(context.G.gardenPlots[0], 'planting consumes a seed and creates a garden timer');
context.G.gardenPlots[0].plantedAt = Date.now() - 3 * 60 * 1000;
api.harvestSeed(0);
assert.equal(context.G.gardenPlots[0], null, 'ready crop can be harvested');
assert.equal(context.G.gardenHarvests, 1, 'harvest progression is counted');
assert.ok(context.G.boosters.gardenProd, 'harvesting grants a timed production buff');

console.log('RTRS Clicker validation passed: syntax, UI wiring, save migration, multipliers, market ledger, golden signals, and garden.');
