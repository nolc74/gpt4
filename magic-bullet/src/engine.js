import { GAME_CONFIG, INITIAL_PLAYER, MONSTERS, expRequired } from "./data.js";

const clone = value => JSON.parse(JSON.stringify(value));

export class GameEngine {
  constructor(onEvent = () => {}) {
    this.onEvent = onEvent;
    this.player = clone(INITIAL_PLAYER);
    this.player.expToNext = expRequired(this.player.level);
    this.projectiles = [];
    this.monsters = [];
    this.particles = [];
    this.elapsed = 0;
    this.fireTimer = 0;
    this.spawnTimer = 0;
    this.paused = false;
    this.dead = false;
    this.width = 960;
    this.height = 600;
    this.position = { x: 280, y: 315 };
    this.direction = { x: 0, y: 0 };
    this.nextMonsterId = 1;
    this.load();
    this.spawnMonster("meadowHare", 3);
  }

  load() {
    try {
      const saved = localStorage.getItem("magic-bullet-save-v1");
      if (!saved) return;
      const data = JSON.parse(saved);
      if (data?.player && Number.isFinite(data.player.level)) {
        this.player = { ...this.player, ...data.player };
        this.player.expToNext = expRequired(this.player.level);
      }
      if (data?.position && Number.isFinite(data.position.x) && Number.isFinite(data.position.y)) {
        this.position = data.position;
      }
    } catch { /* Ignore corrupt local saves and start fresh. */ }
  }

  save() {
    try {
      localStorage.setItem("magic-bullet-save-v1", JSON.stringify({
        player: this.player,
        position: this.position
      }));
    } catch { /* Storage may be unavailable in private browsing. */ }
  }

  setWorldSize(width, height) {
    this.width = width;
    this.height = height;
    this.position.x = Math.max(28, Math.min(width - 28, this.position.x));
    this.position.y = Math.max(90, Math.min(height - 28, this.position.y));
  }

  setMovement(x, y) {
    const length = Math.hypot(x, y);
    if (length > 1) { x /= length; y /= length; }
    this.direction = { x, y };
  }

  spawnMonster(type = "meadowHare", count = 1) {
    const template = MONSTERS[type] ?? MONSTERS.meadowHare;
    for (let i = 0; i < count; i++) {
      if (this.monsters.length >= GAME_CONFIG.monsterSpawnLimit) return;
      const side = Math.random() < 0.5 ? -1 : 1;
      const x = side < 0 ? 45 : this.width - 45;
      const y = 120 + Math.random() * Math.max(80, this.height - 170);
      this.monsters.push({
        ...template,
        instanceId: this.nextMonsterId++,
        x, y,
        currentHp: template.hp,
        hitFlash: 0,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  nearestMonster() {
    let target = null;
    let bestDistance = Infinity;
    for (const monster of this.monsters) {
      const distance = Math.hypot(monster.x - this.position.x, monster.y - this.position.y);
      if (distance < bestDistance) { bestDistance = distance; target = monster; }
    }
    return target;
  }

  update(delta) {
    if (this.paused || this.dead) return;
    const dt = Math.min(delta, 0.04);
    this.elapsed += dt;
    const p = this.position;
    p.x += this.direction.x * GAME_CONFIG.playerMoveSpeed * dt;
    p.y += this.direction.y * GAME_CONFIG.playerMoveSpeed * dt;
    p.x = Math.max(26, Math.min(this.width - 26, p.x));
    p.y = Math.max(95, Math.min(this.height - 25, p.y));

    this.fireTimer -= dt;
    const target = this.nearestMonster();
    if (target && this.fireTimer <= 0) {
      const angle = Math.atan2(target.y - p.y, target.x - p.x);
      this.projectiles.push({
        x: p.x + Math.cos(angle) * 22,
        y: p.y + Math.sin(angle) * 22,
        vx: Math.cos(angle) * GAME_CONFIG.projectileSpeed,
        vy: Math.sin(angle) * GAME_CONFIG.projectileSpeed,
        life: 1.8,
        damage: this.player.attack
      });
      this.fireTimer = 1 / this.player.attackSpeed;
      this.emit("fire");
    }

    this.updateProjectiles(dt);
    this.updateMonsters(dt);
    this.updateParticles(dt);

    this.spawnTimer += dt;
    if (this.spawnTimer > 2.5 && this.monsters.length < 3) {
      this.spawnMonster(this.elapsed > 35 ? "manaSlime" : "meadowHare");
      this.spawnTimer = 0;
    }
  }

  updateProjectiles(dt) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const shot = this.projectiles[i];
      shot.x += shot.vx * dt;
      shot.y += shot.vy * dt;
      shot.life -= dt;
      let hit = false;
      for (const monster of this.monsters) {
        if (Math.hypot(shot.x - monster.x, shot.y - monster.y) <= monster.radius + GAME_CONFIG.projectileRadius) {
          const damage = Math.max(1, shot.damage - monster.defense);
          monster.currentHp -= damage;
          monster.hitFlash = 0.12;
          this.addBurst(shot.x, shot.y, "#9beaff", 8);
          hit = true;
          if (monster.currentHp <= 0) this.defeatMonster(monster);
          break;
        }
      }
      if (hit || shot.life <= 0 || shot.x < -20 || shot.x > this.width + 20 || shot.y < -20 || shot.y > this.height + 20) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  updateMonsters(dt) {
    for (const monster of [...this.monsters]) {
      const dx = this.position.x - monster.x;
      const dy = this.position.y - monster.y;
      const distance = Math.hypot(dx, dy) || 1;
      monster.phase += dt * 3;
      monster.hitFlash = Math.max(0, monster.hitFlash - dt);
      if (distance > monster.radius + 17) {
        monster.x += dx / distance * monster.speed * dt;
        monster.y += dy / distance * monster.speed * dt;
      } else {
        this.player.hp = Math.max(0, this.player.hp - monster.attack * dt);
        if (this.player.hp <= 0) {
          this.dead = true;
          this.emit("dead");
          this.save();
        }
      }
    }
  }

  defeatMonster(monster) {
    const index = this.monsters.findIndex(item => item.instanceId === monster.instanceId);
    if (index < 0) return;
    this.monsters.splice(index, 1);
    this.player.kills++;
    this.player.gold += monster.gold;
    this.gainExp(monster.exp);
    this.addBurst(monster.x, monster.y, monster.color, 20);
    if (Math.random() < GAME_CONFIG.relicKeyDropChance) {
      this.player.relicKeys++;
      this.emit("key");
    }
    this.emit("kill", monster);
    this.save();
  }

  gainExp(amount) {
    this.player.exp += amount;
    while (this.player.exp >= this.player.expToNext) {
      this.player.exp -= this.player.expToNext;
      this.player.level++;
      this.player.expToNext = expRequired(this.player.level);
      this.player.maxHp += 50;
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 50);
      this.player.maxMp += 25;
      this.player.mp = Math.min(this.player.maxMp, this.player.mp + 25);
      this.emit("level");
    }
  }

  addBurst(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 35 + Math.random() * 130;
      this.particles.push({
        x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: 0.25 + Math.random() * 0.4, maxLife: 0.65, color
      });
    }
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vx *= 0.96;
      particle.vy *= 0.96;
      particle.life -= dt;
      if (particle.life <= 0) this.particles.splice(i, 1);
    }
  }

  upgrade(stat) {
    const cost = 50;
    if (this.player.gold < cost) { this.emit("not-enough-gold"); return false; }
    this.player.gold -= cost;
    if (stat === "attack") this.player.attack += 2;
    if (stat === "hp") {
      this.player.maxHp += 20;
      this.player.hp += 20;
    }
    if (stat === "mp") {
      this.player.maxMp += 10;
      this.player.mp += 10;
    }
    this.save();
    this.emit("upgrade");
    return true;
  }

  togglePause() {
    if (this.dead) return;
    this.paused = !this.paused;
    this.emit("pause", this.paused);
  }

  retry() {
    this.dead = false;
    this.player.hp = this.player.maxHp;
    this.position = { x: this.width * 0.29, y: this.height * 0.53 };
    this.projectiles = [];
    this.monsters = [];
    this.spawnMonster("meadowHare", 3);
    this.save();
    this.emit("retry");
  }

  emit(type, detail) { this.onEvent(type, detail); }
}
