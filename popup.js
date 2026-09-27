// ==========================================
// 1. CONFIG & DATA ARRAYS
// ==========================================
const suffixes = [
  " Million", " Billion", " Trillion", " Quadrillion", " Quintillion", 
  " Sextillion", " Septillion", " Octillion", " Nonillion", " Decillion", 
  " Undecillion", " Duodecillion", " Tredecillion", " Quattuordecillion", 
  " Quindecillion", " Sexdecillion", " Septendecillion", " Octodecillion", 
  " Novemdecillion", " Vigintillion"
];

const buildingKeys = [
  'cursor', 'grandma', 'farm', 'mine', 'factory',
  'bank', 'temple', 'wizard_tower', 'shipment', 'alchemy_lab',
  'portal', 'time_machine', 'antimatter_condenser', 'prism', 'chancemaker'
];

const costs = { 
  cursor: 15, grandma: 100, farm: 1100, mine: 12000, factory: 130000,
  bank: 1400000, temple: 20000000, wizard_tower: 330000000, shipment: 5100000000, 
  alchemy_lab: 75000000000, portal: 1000000000000, time_machine: 14000000000000, 
  antimatter_condenser: 170000000000000, prism: 2100000000000000, chancemaker: 26000000000000000 
};

const production = { 
  cursor: 0.5, grandma: 5, farm: 20, mine: 50, factory: 200,
  bank: 1400, temple: 7800, wizard_tower: 44000, shipment: 260000, 
  alchemy_lab: 1600000, portal: 10000000, time_machine: 65000000, 
  antimatter_condenser: 430000000, prism: 2900000000, chancemaker: 21000000000 
};

const updatesData = [
  { 
    version: "v2.1", 
    date: "Sep 27, 2026", 
    changes: ["Added Settings & Decimal customization", "Added Artifacts system & Milk artifact", "Scaled Prestige requirements"] 
  },
  { 
    version: "v2.0", 
    date: "Sep 27, 2026", 
    changes: ["Added 10 new buildings", "Added 15 click upgrades"] 
  }
];

const clickUpgradesConfig = [
  { id: 'plastic_mouse',    name: 'Plastic Mouse',    cost: 50,     power: 1,    img: 'images/plastic_mouse.png' },
  { id: 'iron_mouse',       name: 'Iron Mouse',       cost: 500,    power: 3,    img: 'images/iron_mouse.png' },
  { id: 'titanium_mouse',   name: 'Titanium Mouse',   cost: 2000,   power: 10,   img: 'images/titanium_mouse.png' },
  { id: 'diamond_mouse',    name: 'Diamond Mouse',    cost: 10000,  power: 50,   img: 'images/diamond_mouse.png' },
  { id: 'antimatter_mouse', name: 'Antimatter Mouse', cost: 100000, power: 500,  img: 'images/antimatter_mouse.png' },
  { id: 'quantum_mouse',    name: 'Quantum Mouse',    cost: 1000000,     power: 2500,    img: 'images/quantum_mouse.png' },
  { id: 'singularity_mouse',name: 'Singularity Mouse',cost: 10000000,    power: 15000,   img: 'images/singularity_mouse.png' },
  { id: 'cosmic_mouse',     name: 'Cosmic Mouse',     cost: 100000000,   power: 100000,  img: 'images/cosmic_mouse.png' },
  { id: 'galactic_mouse',   name: 'Galactic Mouse',   cost: 1000000000,  power: 750000,  img: 'images/galactic_mouse.png' },
  { id: 'universal_mouse',  name: 'Universal Mouse',  cost: 10000000000, power: 5000000, img: 'images/universal_mouse.png' },
  { id: 'multiverse_mouse', name: 'Multiverse Mouse', cost: 100000000000,power: 35000000,img: 'images/multiverse_mouse.png' },
  { id: 'infinity_mouse',   name: 'Infinity Mouse',   cost: 1000000000000,power: 250000000,img: 'images/infinity_mouse.png' },
  { id: 'god_mouse',        name: 'God Mouse',        cost: 10000000000000,power: 2000000000,img: 'images/god_mouse.png' },
  { id: 'omniscience_mouse',name: 'Omniscience Mouse',cost: 100000000000000,power: 15000000000,img: 'images/omniscience_mouse.png' },
  { id: 'celestial_mouse',  name: 'Celestial Mouse',  cost: 1000000000000000,power: 100000000000,img: 'images/celestial_mouse.png' }
];

// ==========================================
// 2. STATE
// ==========================================
let gameLoaded = false; 
let internalGame = {
  cookies: 0, 
  cursors: 0, grandmas: 0, farms: 0, mines: 0, factories: 0,
  banks: 0, temples: 0, wizard_towers: 0, shipments: 0, alchemy_labs: 0, 
  portals: 0, time_machines: 0, antimatter_condensers: 0, prisms: 0, chancemakers: 0,
  ownedUpgrades: [], prestigeLevel: 0, prestigeCoins: 0, 
  decimals: 2,
  artifacts: { milk: { owned: false, equipped: false } },
  lastSaveTime: Date.now()
};

// ==========================================
// 3. HELPER FUNCTIONS
// ==========================================
function formatNumber(num) {
  const dec = internalGame.decimals || 2;
  if (num < 1000000) return num.toFixed(dec).replace(/\.?0+$/, '');
  const suffixIndex = Math.floor(Math.log10(num) / 3) - 2;
  if (suffixIndex < suffixes.length) {
    const shortValue = (num / Math.pow(1000, suffixIndex + 2));
    return shortValue.toFixed(dec) + suffixes[suffixIndex];
  }
  return num.toExponential(dec).replace("+", "");
}

function getPrestigeCost(level) {
  let base = 1000000;
  for (let i = 0; i < level; i++) {
    if (i % 2 === 0) base *= 500;
    else base *= 2;
  }
  return base;
}

function getPropName(type) {
  if (type === 'factory') return 'factories';
  if (type === 'wizard_tower') return 'wizard_towers';
  if (type === 'alchemy_lab') return 'alchemy_labs';
  if (type === 'time_machine') return 'time_machines';
  return type + 's';
}

function getMultiplier() {
  let mult = 1;
  if (internalGame.prestigeLevel > 0) {
    mult = 2 + ((internalGame.prestigeLevel - 1) * 0.5);
  }
  if (internalGame.artifacts.milk && internalGame.artifacts.milk.equipped) {
    mult *= 2;
  }
  return mult;
}

function calculateCPS() {
  let rawCPS = 0;
  buildingKeys.forEach(type => {
    let propName = getPropName(type);
    const count = internalGame[propName] || 0;
    rawCPS += count * production[type];
  });
  return rawCPS * getMultiplier();
}

function calculateClickPower() {
  let power = 1; 
  clickUpgradesConfig.forEach(upg => {
    if (internalGame.ownedUpgrades.includes(upg.id)) {
      power += upg.power;
    }
  });
  return power * getMultiplier();
}

// ==========================================
// 4. DOM ELEMENTS
// ==========================================
const els = {
  loadingScreen: document.getElementById('loadingScreen'), 
  homeScreen: document.getElementById('homeScreen'),
  upgradesScreen: document.getElementById('upgradesScreen'),
  prestigeScreen: document.getElementById('prestigeScreen'),
  casinoScreen: document.getElementById('casinoScreen'),
  updatesScreen: document.getElementById('updatesScreen'),
  helpScreen: document.getElementById('helpScreen'),
  settingsScreen: document.getElementById('settingsScreen'),
  artifactsScreen: document.getElementById('artifactsScreen'),
  
  navUpgradesBtn: document.getElementById('navUpgradesBtn'),
  navPrestigeBtn: document.getElementById('navPrestigeBtn'),
  navCasinoBtn: document.getElementById('navCasinoBtn'),
  navUpdatesBtn: document.getElementById('navUpdatesBtn'),
  navHelpBtn: document.getElementById('navHelpBtn'),
  navSettingsBtn: document.getElementById('navSettingsBtn'),
  navArtifactsBtn: document.getElementById('navArtifactsBtn'),
  
  backToHomeFromUpgrades: document.getElementById('backToHomeFromUpgrades'),
  backToHomeFromPrestige: document.getElementById('backToHomeFromPrestige'),
  backToHomeFromCasino: document.getElementById('backToHomeFromCasino'),
  backToHomeFromUpdates: document.getElementById('backToHomeFromUpdates'),
  backToHomeFromHelp: document.getElementById('backToHomeFromHelp'),
  backToHomeFromSettings: document.getElementById('backToHomeFromSettings'),
  backToHomeFromArtifacts: document.getElementById('backToHomeFromArtifacts'),
  
  slot1: document.getElementById('slot1'),
  slot2: document.getElementById('slot2'),
  slot3: document.getElementById('slot3'),
  betInput: document.getElementById('betInput'),
  gambleBtn: document.getElementById('gambleBtn'),
  casinoResult: document.getElementById('casinoResult'),

  updateContentArea: document.getElementById('updateContentArea'),
  prevPageBtn: document.getElementById('prevPageBtn'),
  nextPageBtn: document.getElementById('nextPageBtn'),
  pageIndicator: document.getElementById('pageIndicator'),
  clickUpgradeList: document.getElementById('clickUpgradeList'),
  cookieDisplay: document.getElementById('cookieDisplay'),
  cpsDisplay: document.getElementById('cpsDisplay'),
  cpcDisplay: document.getElementById('cpcDisplay'),
  doPrestigeBtn: document.getElementById('doPrestigeBtn'),
  currentMultDisplay: document.getElementById('currentMultDisplay'),
  prestigeLevelDisplay: document.getElementById('prestigeLevelDisplay'),
  prestigeCoinsDisplay: document.getElementById('prestigeCoinsDisplay'),
  prestigeCoinsPrestigeDisplay: document.getElementById('prestigeCoinsPrestigeDisplay'),
  prestigeReqDisplay: document.getElementById('prestigeReqDisplay'),
  messageBox: document.getElementById('messageBox'),
  bigCookie: document.getElementById('bigCookie'),
  resetBtn: document.getElementById('resetBtn'),
  settingsResetBtn: document.getElementById('settingsResetBtn'),
  decimalSelect: document.getElementById('decimalSelect'),
  milkDisplay: document.getElementById('milkDisplay'),
  artifactBoostsDisplay: document.getElementById('artifactBoostsDisplay'),
  buyArtifactMilk: document.getElementById('buyArtifactMilk'),
  actionArtifactMilk: document.getElementById('actionArtifactMilk')
};

// ==========================================
// 5. GAME ACTIONS & LOOPS
// ==========================================
function updateUI() {
  els.cookieDisplay.textContent = formatNumber(internalGame.cookies);
  els.cpsDisplay.textContent = formatNumber(calculateCPS());
  els.cpcDisplay.textContent = formatNumber(calculateClickPower());
  
  buildingKeys.forEach(type => updateBuildingUI(type));
  updateUpgradeVisuals();
  
  els.currentMultDisplay.textContent = getMultiplier().toFixed(1) + "x";
  els.prestigeLevelDisplay.textContent = internalGame.prestigeLevel;
  els.prestigeCoinsDisplay.textContent = internalGame.prestigeCoins;
  els.prestigeCoinsPrestigeDisplay.textContent = internalGame.prestigeCoins;
  els.prestigeReqDisplay.textContent = formatNumber(getPrestigeCost(internalGame.prestigeLevel));

  if (internalGame.artifacts.milk && internalGame.artifacts.milk.equipped) {
    els.milkDisplay.style.display = 'block';
    els.artifactBoostsDisplay.textContent = "Artifact Boosts: Glass of Milk (+100% Production)";
  } else {
    els.milkDisplay.style.display = 'none';
    els.artifactBoostsDisplay.textContent = "Artifact Boosts: None";
  }

  updateArtifactUI();
}

function updateBuildingUI(type) {
  const countEl = document.getElementById(type + 'Count');
  const costEl = document.getElementById(type + 'Cost');
  let propName = getPropName(type);
  let count = internalGame[propName] || 0;
  const currentCost = Math.floor(costs[type] * Math.pow(1.15, count));
  
  if(countEl) countEl.textContent = count;
  if(costEl) costEl.textContent = formatNumber(currentCost);
}

function clickCookie() {
  internalGame.cookies += calculateClickPower();
  updateUI();
  saveGame(); 
}

function buyBuilding(type) {
  let propName = getPropName(type);
  const count = internalGame[propName] || 0;
  const cost = Math.floor(costs[type] * Math.pow(1.15, count));
  
  if (internalGame.cookies >= cost) {
    internalGame.cookies -= cost;
    internalGame[propName]++;
    updateUI();
    saveGame(); 
  } else {
    showMessage("Not enough cookies!");
  }
}

function buyClickUpgrade(upg) {
  if (internalGame.ownedUpgrades.includes(upg.id)) return;
  if (internalGame.cookies >= upg.cost) {
    internalGame.cookies -= upg.cost;
    internalGame.ownedUpgrades.push(upg.id);
    updateUI();
    saveGame(); 
    showMessage(`Bought ${upg.name}!`);
  } else {
    showMessage("Not enough cookies!");
  }
}

function performPrestige() {
  const reqCost = getPrestigeCost(internalGame.prestigeLevel);
  if (internalGame.cookies < reqCost) {
    showMessage(`Need ${formatNumber(reqCost)} Cookies!`);
    return;
  }
  if (confirm(`Are you sure? Ascend to gain +1 Prestige Coin and Level up!`)) {
    internalGame.prestigeLevel += 1;
    internalGame.prestigeCoins += 1;
    internalGame.cookies = 0;
    buildingKeys.forEach(type => { internalGame[getPropName(type)] = 0; });
    internalGame.ownedUpgrades = [];
    saveGame(); 
    renderUpgradeList(); 
    updateUI();
    switchScreen('home');
    showMessage("PRESTIGE SUCCESSFUL!");
  }
}

function showMessage(txt) {
  els.messageBox.textContent = txt;
  setTimeout(() => els.messageBox.textContent = "", 2000);
}

function saveGame() {
  if (!gameLoaded) return; 
  chrome.storage.local.set({ 'cookieClickerSaveV6': internalGame });
}

function loadGame() {
  chrome.storage.local.get(['cookieClickerSaveV6'], function(result) {
    if (result.cookieClickerSaveV6) {
      const saved = result.cookieClickerSaveV6;
      internalGame = { ...internalGame, ...saved };
      const keys = ['cookies', 'prestigeLevel', 'prestigeCoins', 'decimals', ...buildingKeys.map(t => getPropName(t))];
      keys.forEach(key => {
        if (isNaN(internalGame[key])) internalGame[key] = 0;
      });
      if (els.decimalSelect) els.decimalSelect.value = internalGame.decimals || 2;
      
      const now = Date.now();
      const earned = calculateCPS() * ((now - (internalGame.lastSaveTime || now)) / 1000);
      if (earned > 0) {
        internalGame.cookies += earned;
        showMessage(`You earned ${formatNumber(earned)} cookies offline!`);
      }
    }
    gameLoaded = true; 
    updateUI();
  });
}

function resetGame() {
  if(confirm("Delete Save completely?")) {
    internalGame = { 
      cookies: 0, cursors: 0, grandmas: 0, farms: 0, mines: 0, factories: 0,
      banks: 0, temples: 0, wizard_towers: 0, shipments: 0, alchemy_labs: 0, 
      portals: 0, time_machines: 0, antimatter_condensers: 0, prisms: 0, chancemakers: 0,
      ownedUpgrades: [], prestigeLevel: 0, prestigeCoins: 0, decimals: 2,
      artifacts: { milk: { owned: false, equipped: false } }, lastSaveTime: Date.now() 
    };
    if (els.decimalSelect) els.decimalSelect.value = 2;
    saveGame();
    renderUpgradeList(); 
    updateUI();
    switchScreen('home');
    showMessage("Full Reset.");
  }
}

function handleMilkArtifactClick() {
  const milk = internalGame.artifacts.milk;
  if (!milk.owned) {
    if (internalGame.prestigeCoins >= 1) {
      internalGame.prestigeCoins -= 1;
      milk.owned = true;
      milk.equipped = true;
      showMessage("Bought Glass of Milk!");
    } else {
      showMessage("Not enough Prestige Coins!");
    }
  } else {
    milk.equipped = !milk.equipped;
    showMessage(milk.equipped ? "Equipped Glass of Milk!" : "Unequipped Glass of Milk!");
  }
  updateUI();
  saveGame();
}

function updateArtifactUI() {
  const milk = internalGame.artifacts.milk;
  if (!milk.owned) {
    els.actionArtifactMilk.textContent = "Buy";
  } else {
    els.actionArtifactMilk.textContent = milk.equipped ? "Unequip" : "Equip";
  }
}

// ==========================================
// 6. EVENT LISTENERS & NAVIGATION
// ==========================================
els.bigCookie.addEventListener('click', clickCookie);
if (els.resetBtn) els.resetBtn.addEventListener('click', resetGame);
if (els.settingsResetBtn) els.settingsResetBtn.addEventListener('click', resetGame);
els.doPrestigeBtn.addEventListener('click', performPrestige);
els.buyArtifactMilk.addEventListener('click', handleMilkArtifactClick);

if (els.decimalSelect) {
  els.decimalSelect.addEventListener('change', (e) => {
    internalGame.decimals = parseInt(e.target.value) || 2;
    updateUI();
    saveGame();
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    clickCookie();
  }
});

buildingKeys.forEach(type => {
  const formattedName = type.charAt(0).toUpperCase() + type.slice(1).replace(/_([a-z])/g, (g) => g[1].toUpperCase());
  const btn = document.getElementById('buy' + formattedName);
  if (btn) {
    btn.addEventListener('click', () => buyBuilding(type));
  }
});

function switchScreen(screenName) {
  ['homeScreen', 'upgradesScreen', 'prestigeScreen', 'casinoScreen', 'updatesScreen', 'helpScreen', 'settingsScreen', 'artifactsScreen'].forEach(s => {
    els[s].classList.add('hidden');
  });
  if (screenName === 'home') els.homeScreen.classList.remove('hidden');
  if (screenName === 'upgrades') els.upgradesScreen.classList.remove('hidden');
  if (screenName === 'prestige') els.prestigeScreen.classList.remove('hidden');
  if (screenName === 'casino') els.casinoScreen.classList.remove('hidden');
  if (screenName === 'updates') els.updatesScreen.classList.remove('hidden');
  if (screenName === 'help') els.helpScreen.classList.remove('hidden');
  if (screenName === 'settings') els.settingsScreen.classList.remove('hidden');
  if (screenName === 'artifacts') els.artifactsScreen.classList.remove('hidden');
}

els.navUpgradesBtn.addEventListener('click', () => switchScreen('upgrades'));
els.navPrestigeBtn.addEventListener('click', () => switchScreen('prestige'));
els.navCasinoBtn.addEventListener('click', () => switchScreen('casino'));
els.navUpdatesBtn.addEventListener('click', () => switchScreen('updates'));
els.navHelpBtn.addEventListener('click', () => switchScreen('help'));
els.navSettingsBtn.addEventListener('click', () => switchScreen('settings'));
els.navArtifactsBtn.addEventListener('click', () => switchScreen('artifacts'));

els.backToHomeFromUpgrades.addEventListener('click', () => switchScreen('home'));
els.backToHomeFromPrestige.addEventListener('click', () => switchScreen('home'));
els.backToHomeFromCasino.addEventListener('click', () => switchScreen('home'));
els.backToHomeFromUpdates.addEventListener('click', () => switchScreen('home'));
els.backToHomeFromHelp.addEventListener('click', () => switchScreen('home'));
els.backToHomeFromSettings.addEventListener('click', () => switchScreen('home'));
els.backToHomeFromArtifacts.addEventListener('click', () => switchScreen('home'));

function renderUpgradeList() {
  els.clickUpgradeList.innerHTML = ''; 
  clickUpgradesConfig.forEach(upg => {
    const div = document.createElement('div');
    div.className = 'upgrade';
    div.id = `upg-${upg.id}`;
    div.innerHTML = `<img src="${upg.img}" class="icon-img"><div class="info"><b>${upg.name}</b> (+${formatNumber(upg.power)} Click)<div class="cost">Cost: ${formatNumber(upg.cost)}</div></div>`;
    div.addEventListener('click', () => buyClickUpgrade(upg));
    els.clickUpgradeList.appendChild(div);
  });
}

function updateUpgradeVisuals() {
  clickUpgradesConfig.forEach(upg => {
    const div = document.getElementById(`upg-${upg.id}`);
    if (!div) return;
    if (internalGame.ownedUpgrades.includes(upg.id)) {
      div.classList.add('purchased');
      div.querySelector('.cost').textContent = "Owned";
    }
  });
}

let currentPage = 1;
const updatesPerPage = 3; 

function renderUpdateLog() {
  els.updateContentArea.innerHTML = ''; 
  const startIndex = (currentPage - 1) * updatesPerPage;
  const currentUpdates = updatesData.slice(startIndex, startIndex + updatesPerPage);
  const totalPages = Math.ceil(updatesData.length / updatesPerPage);
  currentUpdates.forEach(upd => {
    const entry = document.createElement('div');
    entry.className = 'update-entry';
    let listItems = '';
    upd.changes.forEach(change => { listItems += `<li>${change}</li>`; });
    entry.innerHTML = `<div class="update-version">${upd.version} <span class="update-date">${upd.date}</span></div><ul class="update-list">${listItems}</ul>`;
    els.updateContentArea.appendChild(entry);
  });
  els.pageIndicator.textContent = `${currentPage}/${totalPages || 1}`;
  els.prevPageBtn.disabled = (currentPage === 1);
  els.nextPageBtn.disabled = (currentPage === totalPages || totalPages === 0);
}

els.prevPageBtn.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderUpdateLog(); } });
els.nextPageBtn.addEventListener('click', () => { const totalPages = Math.ceil(updatesData.length / updatesPerPage); if (currentPage < totalPages) { currentPage++; renderUpdateLog(); } });

// Casino Logic
els.gambleBtn.addEventListener('click', () => {
  const bet = parseInt(els.betInput.value);
  if (isNaN(bet) || bet <= 0) { els.casinoResult.textContent = "Enter a valid bet!"; return; }
  if (bet > internalGame.cookies) { els.casinoResult.textContent = "Not enough cookies!"; return; }
  internalGame.cookies -= bet;
  updateUI();
  els.gambleBtn.disabled = true;
  els.casinoResult.textContent = "Spinning...";

  let spins = 0;
  const interval = setInterval(() => {
    els.slot1.textContent = Math.floor(Math.random() * 10);
    els.slot2.textContent = Math.floor(Math.random() * 10);
    els.slot3.textContent = Math.floor(Math.random() * 10);
    spins++;
    if (spins >= 20) {
      clearInterval(interval);
      const n1 = Math.floor(Math.random() * 10);
      const n2 = Math.floor(Math.random() * 10);
      const n3 = Math.floor(Math.random() * 10);
      els.slot1.textContent = n1; els.slot2.textContent = n2; els.slot3.textContent = n3;
      els.gambleBtn.disabled = false;

      let win = 0;
      if (n1 === 7 && n2 === 7 && n3 === 7) { win = bet * 34; els.casinoResult.textContent = `JACKPOT 777! Won ${formatNumber(win)}!`; els.casinoResult.style.color = "gold"; }
      else if (n1 === n2 && n2 === n3) { win = bet * 8; els.casinoResult.textContent = `TRIPLE! Won ${formatNumber(win)}!`; els.casinoResult.style.color = "#2ecc71"; }
      else if (n1 === n2 || n2 === n3) { win = bet * 3; els.casinoResult.textContent = `PAIR! Won ${formatNumber(win)}!`; els.casinoResult.style.color = "#3498db"; }
      else { els.casinoResult.textContent = "Lost! Try again."; els.casinoResult.style.color = "#e74c3c"; saveGame(); return; }

      internalGame.cookies += win;
      saveGame();
    }
  }, 100);
});

// ==========================================
// 7. INITIALIZE GAME RUNTIME
// ==========================================
initGame();

function initGame() {
  loadGame();
  renderUpgradeList(); 
  renderUpdateLog(); 
  setTimeout(() => {
    els.loadingScreen.classList.add('fade-out');
    setTimeout(() => { els.loadingScreen.style.display = 'none'; }, 800); 
  }, 3000);
}

setInterval(() => {
  if (!gameLoaded) return; 
  internalGame.cookies += calculateCPS(); 
  internalGame.lastSaveTime = Date.now();
  updateUI();
  saveGame(); 
}, 1000);