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
      card.innerHTML =
        "<div class=\"skill-info\">" +
          "<h3>" + skill.name + "</h3>" +
          "<p class=\"skill-description\">" + skill.description + "</p>" +
          "<p>Level: <strong class=\"skill-level\">0</strong></p>" +
          "<p>Producing: <strong class=\"skill-rate\">0.0</strong> gold/sec</p>" +
        "</div>" +
        "<div class=\"skill-actions\">" +
          "<button class=\"skill-buy-btn\" data-skill=\"" + skill.id + "\">Buy (<span class=\"skill-cost\">" + cost + "</span> gold)</button>" +
        "</div>";
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

function load() {
  var raw = localStorage.getItem("caboose-idle-save");
  if (!raw) return;
  var data = JSON.parse(raw);
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
