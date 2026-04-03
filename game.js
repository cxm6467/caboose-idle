// =============================================================================
// GAME STATE
// =============================================================================

const state = {
  resources: {
    gold: {
      value: 0,
      perClick: 1,
    },
  },
  skills: {
    miner: {
      id: "miner",
      name: "Miner",
      description: "A grizzled peasant who digs for gold in the hills.",
      level: 0,
      baseCost: 10,
      costMultiplier: 1.15,
      baseRate: 1,
    },
  },
  lastTick: Date.now(),
};

// =============================================================================
// DERIVED HELPERS
// =============================================================================

function getSkillCost(skill) {
  return Math.floor(skill.baseCost * Math.pow(skill.costMultiplier, skill.level));
}

function getSkillRate(skill) {
  return skill.level * skill.baseRate;
}

function getTotalGoldPerSecond() {
  return Object.values(state.skills).reduce(function(total, skill) {
    return total + getSkillRate(skill);
  }, 0);
}

// =============================================================================
// BUY SKILL
// =============================================================================

function buySkill(skillId) {
  var skill = state.skills[skillId];
  var cost = getSkillCost(skill);
  if (state.resources.gold.value < cost) return;
  state.resources.gold.value -= cost;
  skill.level += 1;
  render();
}

// =============================================================================
// GAME LOOP
// =============================================================================

function tick() {
  var now = Date.now();
  var delta = (now - state.lastTick) / 1000;
  Object.values(state.skills).forEach(function(skill) {
    state.resources.gold.value += getSkillRate(skill) * delta;
  });
  state.lastTick = now;
  render();
}

setInterval(tick, 100);

// =============================================================================
// RENDER
// =============================================================================

function renderSkills() {
  var list = document.getElementById("skills-list");

  Object.values(state.skills).forEach(function(skill) {
    var cost = getSkillCost(skill);
    var rate = getSkillRate(skill);
    var canAfford = state.resources.gold.value >= cost;

    var card = document.getElementById("skill-" + skill.id);

    if (!card) {
      card = document.createElement("div");
      card.className = "skill-card";
      card.id = "skill-" + skill.id;

      // --- skill-info ---
      var infoDiv = document.createElement("div");
      infoDiv.className = "skill-info";

      var nameH3 = document.createElement("h3");
      nameH3.textContent = skill.name;

      var descP = document.createElement("p");
      descP.className = "skill-description";
      descP.textContent = skill.description;

      var levelP = document.createElement("p");
      levelP.appendChild(document.createTextNode("Level: "));
      var levelStrong = document.createElement("strong");
      levelStrong.className = "skill-level";
      levelStrong.textContent = "0";
      levelP.appendChild(levelStrong);

      var rateP = document.createElement("p");
      rateP.appendChild(document.createTextNode("Producing: "));
      var rateStrong = document.createElement("strong");
      rateStrong.className = "skill-rate";
      rateStrong.textContent = "0.0";
      rateP.appendChild(rateStrong);
      rateP.appendChild(document.createTextNode(" gold/sec"));

      infoDiv.appendChild(nameH3);
      infoDiv.appendChild(descP);
      infoDiv.appendChild(levelP);
      infoDiv.appendChild(rateP);

      // --- skill-actions ---
      var actionsDiv = document.createElement("div");
      actionsDiv.className = "skill-actions";

      var buyBtn = document.createElement("button");
      buyBtn.className = "skill-buy-btn";
      buyBtn.dataset.skill = skill.id;
      buyBtn.appendChild(document.createTextNode("Buy ("));
      var costSpan = document.createElement("span");
      costSpan.className = "skill-cost";
      costSpan.textContent = cost;
      buyBtn.appendChild(costSpan);
      buyBtn.appendChild(document.createTextNode(" gold)"));

      actionsDiv.appendChild(buyBtn);

      card.appendChild(infoDiv);
      card.appendChild(actionsDiv);
      list.appendChild(card);
    }

    card.querySelector(".skill-level").textContent = skill.level;
    card.querySelector(".skill-rate").textContent = rate.toFixed(1);
    card.querySelector(".skill-cost").textContent = cost;
    card.querySelector(".skill-buy-btn").disabled = !canAfford;
  });
}

function render() {
  document.getElementById("gold-value").textContent = Math.floor(state.resources.gold.value);
  document.getElementById("gold-rate").textContent = "(+" + getTotalGoldPerSecond().toFixed(1) + "/sec)";
  renderSkills();
}

// =============================================================================
// INPUT
// =============================================================================

document.getElementById("click-btn").addEventListener("click", function() {
  state.resources.gold.value += state.resources.gold.perClick;
  render();
});

document.getElementById("skills-list").addEventListener("click", function(e) {
  var btn = e.target.closest(".skill-buy-btn");
  if (!btn) return;
  buySkill(btn.dataset.skill);
});
// =============================================================================
// SAVE / LOAD
// =============================================================================

function save() {
  localStorage.setItem("caboose-idle-save", JSON.stringify({
    gold: state.resources.gold.value,
    skills: Object.fromEntries(
      Object.entries(state.skills).map(function(entry) {
        return [entry[0], { level: entry[1].level }];
      })
    ),
  }));
}

function sanitizeSave(data) {
  var gold = Number(data.gold);
  if (!isFinite(gold) || gold < 0) gold = 0;
  if (gold > 1e15) gold = 1e15;
  data.gold = gold;

  if (data.skills && typeof data.skills === "object") {
    Object.keys(data.skills).forEach(function(id) {
      var skill = data.skills[id];
      var level = Math.floor(Number(skill.level));
      if (!isFinite(level) || level < 0) level = 0;
      if (level > 1000) level = 1000;
      data.skills[id].level = level;
    });
  }

  return data;
}

function load() {
  var raw = localStorage.getItem("caboose-idle-save");
  if (!raw) return;
  var data = sanitizeSave(JSON.parse(raw));
  if (data.gold) state.resources.gold.value = data.gold;
  if (data.skills) {
    Object.entries(data.skills).forEach(function(entry) {
      var id = entry[0];
      var saved = entry[1];
      if (state.skills[id]) {
        state.skills[id].level = saved.level;
      }
    });
  }
}

load();
setInterval(save, 5000);
