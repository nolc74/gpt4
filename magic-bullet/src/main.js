import { GameEngine } from "./engine.js";

const $ = id => document.getElementById(id);
const canvas = $("game-canvas");
const ctx = canvas.getContext("2d");
const engine = new GameEngine((type, detail) => handleEvent(type, detail));
const W = canvas.width, H = canvas.height;
let lastTime = 0, toastTimer = 0, joystickPointer = null;
const joystick = $("joystick");
const stick = $("joy-stick");
const joystickRadius = 35;

function handleEvent(type, detail) {
  if (type === "kill") showToast(`${detail.name} 처치! +${detail.gold}G`);
  if (type === "level") showToast(`레벨 업! Lv. ${engine.player.level}`);
  if (type === "key") showToast("유물 열쇠를 획득했어!");
  if (type === "dead") {
    $("death-overlay").classList.remove("hidden");
    $("combat-status").textContent = "전투 종료";
  }
  if (type === "pause") $("combat-status").textContent = detail ? "일시정지" : "자동 전투 진행 중";
  if (type === "retry") {
    $("death-overlay").classList.add("hidden");
    $("combat-status").textContent = "자동 전투 진행 중";
    showToast("전투를 다시 시작했어.");
  }
  if (type === "not-enough-gold") showToast("골드가 부족해!");
  if (type === "upgrade") { showToast("강화 완료!"); renderHud(); }
}

function showToast(message) {
  const el = $("toast");
  el.textContent = message;
  el.classList.add("show");
  toastTimer = 1.7;
}

function renderHud() {
  const p = engine.player;
  $("level-label").textContent = `Lv. ${p.level}`;
  $("hero-level").textContent = `Lv. ${p.level}`;
  $("gold-label").textContent = p.gold.toLocaleString("ko-KR");
  $("hp-value").textContent = `${Math.ceil(p.hp)} / ${p.maxHp}`;
  $("hp-bar").style.width = `${Math.max(0, p.hp / p.maxHp * 100)}%`;
  $("mp-value").textContent = `${Math.ceil(p.mp)} / ${p.maxMp}`;
  $("mp-bar").style.width = `${p.mp / p.maxMp * 100}%`;
  $("xp-value").textContent = `${p.exp} / ${p.expToNext}`;
  $("xp-bar").style.width = `${p.exp / p.expToNext * 100}%`;
  $("kill-count").textContent = p.kills.toLocaleString("ko-KR");
  $("attack-value").textContent = p.attack;
  $("stat-vitality").textContent = p.vitality;
  $("stat-magic").textContent = p.magic;
  $("stat-strength").textContent = p.strength;
  $("stat-agility").textContent = p.agility;
  $("stat-sense").textContent = p.sense;
  $("stat-spirit").textContent = p.spirit;
  $("relic-count").textContent = `${p.relics.length.toLocaleString("ko-KR")} / 3,001`;
  $("upgrade-attack").disabled = p.gold < 50;
  $("upgrade-hp").disabled = p.gold < 50;
  $("upgrade-mp").disabled = p.gold < 50;
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, H);
  gradient.addColorStop(0, "#18344b");
  gradient.addColorStop(0.55, "#1b454b");
  gradient.addColorStop(1, "#102d35");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < 5; i++) {
    const x = 34 + i * 190;
    ctx.fillStyle = "#29465c";
    ctx.fillRect(x, 22, 17, 330);
    ctx.fillRect(x + 84, 22, 17, 330);
    ctx.beginPath();
    ctx.arc(x + 50, 85, 50, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = "#80d8d0";
    ctx.globalAlpha = 0.12;
    ctx.fillRect(x + 17, 75, 67, 250);
    ctx.globalAlpha = 1;
  }

  ctx.fillStyle = "#19383e";
  ctx.fillRect(0, 355, W, H - 355);
  ctx.strokeStyle = "#65b9a9";
  ctx.globalAlpha = 0.18;
  ctx.lineWidth = 2;
  for (let x = 0; x < W; x += 60) {
    ctx.beginPath(); ctx.moveTo(x, 355); ctx.lineTo(x - 55, H); ctx.stroke();
  }
  for (let y = 390; y < H; y += 42) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  for (let i = 0; i < 13; i++) {
    const x = (i * 139 + 42) % W, y = 405 + (i % 3) * 37;
    ctx.beginPath(); ctx.arc(x, y, 10 + i % 3 * 4, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  const aura = ctx.createRadialGradient(490, 220, 4, 490, 220, 260);
  aura.addColorStop(0, "#65eddb22");
  aura.addColorStop(1, "#65eddb00");
  ctx.fillStyle = aura;
  ctx.fillRect(200, 0, 580, 480);
}

function ellipse(x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawMonster(m) {
  const bob = Math.sin(m.phase) * 2;
  ellipse(m.x, m.y + 18, m.radius + 3, 7, "#07131b99");
  if (m.id === "MON_002") {
    ellipse(m.x, m.y + bob, m.radius, m.radius * 0.72, m.hitFlash ? "#eaffff" : m.color);
    ellipse(m.x - 6, m.y - 5 + bob, 3, 4, "#143a49");
    ellipse(m.x + 6, m.y - 5 + bob, 3, 4, "#143a49");
  } else {
    ellipse(m.x, m.y + bob, 18, 14, m.hitFlash ? "#fff" : m.color);
    ellipse(m.x - 7, m.y - 16 + bob, 5, 16, "#d5c4e9");
    ellipse(m.x + 7, m.y - 16 + bob, 5, 16, "#d5c4e9");
    ellipse(m.x - 7, m.y - 16 + bob, 2, 9, "#f2aacb");
    ellipse(m.x + 7, m.y - 16 + bob, 2, 9, "#f2aacb");
    ctx.strokeStyle = "#eee0ff";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(m.x + 11, m.y - 5 + bob); ctx.lineTo(m.x + 24, m.y - 17 + bob); ctx.stroke();
  }
  ctx.fillStyle = "#091523";
  ctx.fillRect(m.x - 20, m.y - 31 + bob, 40, 4);
  ctx.fillStyle = "#ed8be5";
  ctx.fillRect(m.x - 20, m.y - 31 + bob, 40 * Math.max(0, m.currentHp / m.hp), 4);
}

function drawPlayer() {
  const p = engine.position;
  ellipse(p.x, p.y + 21, 23, 8, "#07131c99");
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.fillStyle = "#263f78";
  ctx.beginPath(); ctx.moveTo(-12, -1); ctx.lineTo(-19, 28); ctx.lineTo(17, 28); ctx.lineTo(11, -1); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#dceaf8";
  ctx.beginPath(); ctx.arc(0, -5, 13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#50395f";
  ctx.beginPath(); ctx.arc(0, -10, 14, Math.PI, Math.PI * 2); ctx.lineTo(13, -1); ctx.lineTo(-12, -1); ctx.closePath(); ctx.fill();
  ellipse(5, -5, 2, 2, "#23334b");
  ctx.strokeStyle = "#a9d9ed"; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(9, 8); ctx.lineTo(18, 15); ctx.stroke();
  ellipse(19, 16, 4, 4, "#8ceaff");
  ctx.restore();
}

function draw() {
  drawBackground();
  for (const m of engine.monsters) drawMonster(m);
  for (const s of engine.projectiles) {
    const glow = ctx.createRadialGradient(s.x, s.y, 1, s.x, s.y, 21);
    glow.addColorStop(0, "#ffffff");
    glow.addColorStop(0.25, "#a4f6ff");
    glow.addColorStop(1, "#3aaaff00");
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(s.x, s.y, 21, 0, Math.PI * 2); ctx.fill();
    ellipse(s.x, s.y, 7, 7, "#f0ffff");
  }
  drawPlayer();
  for (const particle of engine.particles) {
    ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
    ellipse(particle.x, particle.y, 2.5, 2.5, particle.color);
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#e5f5ff";
  ctx.font = "bold 15px 'Noto Sans KR', sans-serif";
  ctx.fillText("1층 · 초원 회랑", 22, 36);
  ctx.fillStyle = "#b3cbd8";
  ctx.font = "11px 'Noto Sans KR', sans-serif";
  ctx.fillText("탑의 마력이 오래된 바닥 문양을 따라 흐른다", 22, 55);
  if (engine.paused) {
    ctx.fillStyle = "#07101b99"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#fff"; ctx.font = "bold 30px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("일시정지", W / 2, H / 2); ctx.textAlign = "left";
  }
}

function loop(time) {
  const delta = Math.min(0.04, (time - lastTime) / 1000 || 0);
  lastTime = time;
  engine.update(delta);
  draw();
  renderHud();
  if (toastTimer > 0) {
    toastTimer -= delta;
    if (toastTimer <= 0) $("toast").classList.remove("show");
  }
  requestAnimationFrame(loop);
}

function updateJoystick(event) {
  const rect = joystick.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  let dx = event.clientX - centerX;
  let dy = event.clientY - centerY;
  const max = rect.width * 0.31;
  const distance = Math.hypot(dx, dy);
  if (distance > max) { dx = dx / distance * max; dy = dy / distance * max; }
  stick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  engine.setMovement(dx / max, dy / max);
}

function resetJoystick() {
  joystickPointer = null;
  stick.style.transform = "translate(-50%, -50%)";
  engine.setMovement(0, 0);
}
joystick.addEventListener("pointerdown", event => {
  event.preventDefault();
  joystickPointer = event.pointerId;
  joystick.setPointerCapture(event.pointerId);
  updateJoystick(event);
});
joystick.addEventListener("pointermove", event => {
  if (event.pointerId === joystickPointer) updateJoystick(event);
});
joystick.addEventListener("pointerup", resetJoystick);
joystick.addEventListener("pointercancel", resetJoystick);
joystick.addEventListener("lostpointercapture", resetJoystick);

const keyMap = {
  w: [0, -1], arrowup: [0, -1],
  s: [0, 1], arrowdown: [0, 1],
  a: [-1, 0], arrowleft: [-1, 0],
  d: [1, 0], arrowright: [1, 0]
};
const pressed = new Set();
function updateKeyboard() {
  let x = 0, y = 0;
  for (const key of pressed) { x += keyMap[key][0]; y += keyMap[key][1]; }
  engine.setMovement(x, y);
}
window.addEventListener("keydown", event => {
  const key = event.key.toLowerCase();
  if (keyMap[key]) { pressed.add(key); updateKeyboard(); event.preventDefault(); }
});
window.addEventListener("keyup", event => {
  const key = event.key.toLowerCase();
  if (keyMap[key]) { pressed.delete(key); updateKeyboard(); }
});
window.addEventListener("blur", () => { pressed.clear(); resetJoystick(); });

$("pause-button").addEventListener("click", () => engine.togglePause());
$("retry-button").addEventListener("click", () => engine.retry());
$("upgrade-attack").addEventListener("click", () => engine.upgrade("attack"));
$("upgrade-hp").addEventListener("click", () => engine.upgrade("hp"));
$("upgrade-mp").addEventListener("click", () => engine.upgrade("mp"));

document.querySelectorAll(".tab").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(tab => tab.classList.toggle("active", tab === button));
    document.querySelectorAll(".tab-content").forEach(panel => panel.classList.add("hidden"));
    $(`tab-${button.dataset.tab}`).classList.remove("hidden");
  });
});

function resizeWorld() {
  const rect = canvas.getBoundingClientRect();
  const scale = Math.min(rect.width / W, rect.height / H);
  engine.setWorldSize(W, H);
}
window.addEventListener("resize", resizeWorld);
resizeWorld();
renderHud();
requestAnimationFrame(loop);
