// ========== INFINITE RUNNER GAME - MINION CHASE ==========
// FIXED VERSION - Resolves double coin HUD display and minion kill freeze

  // ========== AUDIO INITIALIZATION FOR GAME ==========
function initGameAudio() {
  console.log('🎵 Initializing gameplay audio...');
  
  // ✅ GUNAKAN bgmManager untuk MP3
  function initGameAudio() {
  console.log('🎵 Initializing gameplay audio...');
  
  const gameplayBGM = document.getElementById('gameplayBGM');
  if (gameplayBGM) {
    gameplayBGM.volume = 0.3;
    gameplayBGM.play().catch(err => {
      console.warn('❌ Autoplay blocked:', err);
      // Trigger play on user interaction
      document.addEventListener('click', () => {
        gameplayBGM.play();
      }, { once: true });
    });
    console.log('✅ Gameplay BGM started');
    }
  }
}
function playBossMusic() {
  console.log('🎵 Switching to boss music...');
  bgmManager.switchTo('boss', 300, 300);
}

function playVictoryMusic() {
  console.log('🎵 Playing victory music...');
  bgmManager.switchTo('victory', 300, 500);
}

function playGameOverMusic() {
  console.log('🎵 Playing game over music...');
  bgmManager.switchTo('gameover', 300, 500);
}

(() => {
  // ========== DOM ELEMENTS ==========
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d', { alpha: false });
  const scoreEl = document.getElementById('score');
  const highEl = document.getElementById('highscore');
  const stageEl = document.getElementById('stage');
  const pauseBtn = document.getElementById('pauseBtn');
  const comboEl = document.getElementById('combo');
  const pauseModal = document.getElementById('pauseModal');
  const sessionCoinsEl = document.getElementById('sessionCoins');

// ========== PAUSE MODAL FUNCTIONS ==========
function showPauseModal() {
  pauseModal.classList.add('active');
  paused = true;
}

function hidePauseModal() {
  pauseModal.classList.remove('active');
  paused = false;
}

window.resumeGame = function() {
  hidePauseModal();
};

window.goToMenu = function() {
  if (score > highscore) {
    highscore = score;
    localStorage.setItem(HIGHKEY, String(highscore));
  }
  if (bgmAudio) {
    bgmAudio.pause();
  }
  sessionStorage.setItem('loadingTarget', 'menu.html');
  window.location.href = 'loading.html';
};

window.restartGame = function() {
  if (bgmAudio) {
    bgmAudio.pause();
  }
  location.reload();
};

// ========== SHOW GAME OVER MODAL (IMPROVED) ==========
function showGameOverModal(finalScore, coins, minions, bosses, high, stage) {
  const modal = document.getElementById('gameOverModal');
  
  console.log('DEBUG GAMEOVER:', { finalScore, coins, minions, bosses, high, stage }); // ← DEBUG
  
  // ✅ SET FINAL SCORE
  document.getElementById('gameOverScore').textContent = finalScore.toLocaleString();
  
  // ✅ SET STATS - Pastikan ID cocok dengan HTML
  document.getElementById('gameOverMinions').textContent = minions;
  document.getElementById('gameOverBosses').textContent = bosses;
  document.getElementById('gameOverCoins').textContent = coins.toLocaleString();
  document.getElementById('gameOverStage').textContent = stage;
  
  // ✅ SET HIGH SCORE
  document.getElementById('gameOverHighScore').textContent = Math.max(finalScore, high).toLocaleString();
  
  // ✅ CHECK IF NEW HIGH SCORE
  const newHighScoreBadge = document.getElementById('newHighScoreBadge');
  if (newHighScoreBadge) {
    if (finalScore > high) {
      newHighScoreBadge.style.display = 'block';
    } else {
      newHighScoreBadge.style.display = 'none';
    }
  }
  
  // ✅ SHOW MODAL - LANGSUNG
  modal.classList.add('active');
}

// ========== GENERATE ACHIEVEMENTS ==========
function generateAchievements(minions, bosses, stage, score, highScore) {
  const container = document.getElementById('achievementsGrid');
  const achievements = [];
  
  // Define achievements
  if (minions >= 1) achievements.push({ icon: '🐤', name: 'First Kill' });
  if (minions >= 10) achievements.push({ icon: '📈', name: 'Massacre' });
  if (minions >= 50) achievements.push({ icon: '⚔️', name: 'Rampage' });
  if (bosses >= 1) achievements.push({ icon: '👑', name: 'Boss Slayer' });
  if (stage >= 3) achievements.push({ icon: '🚀', name: 'Stage 3' });
  if (score >= 5000) achievements.push({ icon: '💎', name: '5K Score' });
  if (score >= 10000) achievements.push({ icon: '👻', name: 'Legend' });
  if (score > highScore) achievements.push({ icon: '⭐', name: 'New Record' });
  
  if (achievements.length === 0) {
    container.innerHTML = '<div class="no-achievements">Keep playing to unlock achievements!</div>';
    return;
  }
  
  container.innerHTML = achievements.map((ach, index) => `
    <div class="achievement-badge" style="animation-delay: ${index * 0.1}s">
      <div class="badge-icon">${ach.icon}</div>
      <div class="badge-name">${ach.name}</div>
    </div>
  `).join('');
}
// ========== MAIN MENU FROM GAME OVER ==========
window.goToMenuFromGameOver = function() {
  hideGameOverModal();
  
  // Simpan high score jika lebih tinggi
  if (score > highscore) {
    highscore = score;
    localStorage.setItem(HIGHKEY, String(highscore));
  }
  
  // Stop musik
  if (bgmAudio) {
    bgmAudio.pause();
  }
  
  // Kembali ke menu
  window.location.href = 'menu.html';
};
  
  // ========== CANVAS SETUP ==========
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 70;
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  let W = canvas.width;
  let H = canvas.height;
  let GROUND_H = Math.round(H * 0.18);

  // ========== AUDIO SETUP ==========
  const BGM_URL = 'https://assets.mixkit.co/active_storage/sfx/2742/2742-preview.mp3';
  let bgmAudio = null;

  function initBGM() {
    // Menggunakan SimpleBGM Generator
    if (typeof simpleBGM !== 'undefined') {
      simpleBGM.playGameplayBGM();
    }
  }

  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  function playSound(frequency, duration, type = 'sine', volume = 0.3) {
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = frequency;
      osc.type = type;
      gain.gain.setValueAtTime(volume, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + Math.max(0.01, duration));
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + Math.max(0.01, duration));
    } catch (e) {}
  }

  // ========== STORAGE KEYS ==========
  const HIGHKEY = 'minion_chase_high_v1';
  const STATSKEY = 'minion_chase_stats_v1';
  const COINSKEY = 'minion_chase_coins_v1';

  // ========== POWERUP CONFIG ==========
  const POWERUPS = {
    RAPID_FIRE: { name: 'Rapid Fire', color: '#ff4444', bgColor: 'rgba(255, 68, 68, 0.2)', duration: 8, icon: '⚡' },
    SHIELD: { name: 'Shield', color: '#44ff44', bgColor: 'rgba(68, 255, 68, 0.2)', duration: 6, icon: '🛡️' },
    FREEZE: { name: 'Freeze', color: '#4488ff', bgColor: 'rgba(68, 136, 255, 0.2)', duration: 5, icon: '❄️' },
    DAMAGE: { name: 'Damage Boost', color: '#ff1111', bgColor: 'rgba(255, 17, 17, 0.2)', duration: 10, icon: '💥' },
    FIRE_RATE: { name: 'Fire Rate Boost', color: '#ffaa00', bgColor: 'rgba(255, 170, 0, 0.2)', duration: 8, icon: '🔥' },
    BULLET_SPLIT: { name: 'Bullet Split', color: '#00ffff', bgColor: 'rgba(0, 255, 255, 0.2)', duration: 7, icon: '⚔️' },
    MISSILE: { name: 'Missile Mode', color: '#ff00ff', bgColor: 'rgba(255, 0, 255, 0.2)', duration: 6, icon: '🚀' }
  };

  // ========== HELPER FUNCTIONS ==========
  const rand = (a, b) => a + Math.random() * (b - a);
  const rint = (a, b) => Math.floor(rand(a, b + 1));
  const rectsOverlap = (a, b) => !(a.x + a.w < b.x || a.x > b.x + b.w || a.y + a.h < b.y || a.y > b.y + b.h);
  const distance = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);

  // ========== PLAYER STATS CLASS ==========
  class PlayerStats {
    constructor() {
      this.loadStats();
      this.loadCoins();
    }

    loadStats() {
      const saved = localStorage.getItem(STATSKEY);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          this.hp = data.hp !== undefined ? data.hp : 20;
          this.damage = data.damage !== undefined ? data.damage : 1.0;
          this.criticalDamage = data.criticalDamage !== undefined ? data.criticalDamage : 1.5;
          this.criticalRate = data.criticalRate !== undefined ? data.criticalRate : 0.1;
          this.fireRate = data.fireRate !== undefined ? data.fireRate : 0.25;
          this.movement = data.movement !== undefined ? data.movement : 400;
          this.jumpSpeed = data.jumpSpeed !== undefined ? data.jumpSpeed : 950;
        } catch (e) {
          this.setDefaults();
        }
      } else {
        this.setDefaults();
      }
    }

    setDefaults() {
      this.hp = 20;
      this.damage = 1.0;
      this.criticalDamage = 1.5;
      this.criticalRate = 0.1;
      this.fireRate = 0.25;
      this.movement = 400;
      this.jumpSpeed = 950;
      this.saveStats();
    }

    saveStats() {
      localStorage.setItem(STATSKEY, JSON.stringify({
        hp: this.hp,
        damage: this.damage,
        criticalDamage: this.criticalDamage,
        criticalRate: this.criticalRate,
        fireRate: this.fireRate,
        movement: this.movement,
        jumpSpeed: this.jumpSpeed
      }));
    }

    loadCoins() {
      this.totalCoins = parseInt(localStorage.getItem(COINSKEY) || '0', 10);
    }

    saveCoins() {
      localStorage.setItem(COINSKEY, String(this.totalCoins));
    }

    addCoins(amount) {
      this.totalCoins += amount;
      this.saveCoins();
    }
  }

  const playerStats = new PlayerStats();

  // ========== CHARACTER ASSET LOADER ==========
  class CharacterAsset {
    constructor() {
      this.image = new Image();
      this.loaded = false;
      this.loadCharacter();
    }

    loadCharacter() {
      this.image.src = 'ROSSY.jpeg';
      this.image.onload = () => {
        this.loaded = true;
      };
      this.image.onerror = () => {
        console.warn('Character asset failed to load, using fallback');
        this.loaded = false;
      };
    }

    draw(ctx, x, y, w, h, alpha = 1) {
      ctx.globalAlpha = alpha;
      if (this.loaded) {
        ctx.drawImage(this.image, x, y, w, h);
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, w, h);
      }
      ctx.globalAlpha = 1;
    }
  }

  const characterAsset = new CharacterAsset();

  

// ========== ENHANCED TEXTURE GENERATOR ==========
class TextureGenerator {
  constructor() {
    this.grassTexture = this.createGrassTexture();
    this.skyTexture = this.createSkyTexture();
    this.cloudCanvas = this.createCloudTexture();
    this.dirtTexture = this.createDirtTexture();
    this.metalTexture = this.createMetalTexture();
  }

  // ========== IMPROVED GRASS TEXTURE ==========
  createGrassTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Base grass dengan gradient lebih natural
    const grassGradient = ctx.createLinearGradient(0, 0, 0, 256);
    grassGradient.addColorStop(0, '#3a8d4a');
    grassGradient.addColorStop(0.5, '#2f7a3a');
    grassGradient.addColorStop(1, '#256b30');
    ctx.fillStyle = grassGradient;
    ctx.fillRect(0, 0, 256, 256);

    // Add multiple layers of grass blades untuk depth
    for (let layer = 0; layer < 3; layer++) {
      const opacity = 0.4 - (layer * 0.1);
      for (let i = 0; i < 300; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const height = Math.random() * 12 + 6;
        const width = Math.random() * 2 + 1;
        
        ctx.strokeStyle = `rgba(100, 255, 120, ${opacity})`;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x, y + height);
        
        // Curved grass blades dengan wave effect
        const bendX = Math.sin(y * 0.05) * 3;
        ctx.bezierCurveTo(
          x + bendX, y + height - Math.random() * 5,
          x + bendX + Math.random() * 2, y + height / 2,
          x + bendX * 0.5, y
        );
        ctx.stroke();
      }
    }

    // Add soil/dirt particles
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const radius = Math.random() * 4 + 1;
      
      ctx.fillStyle = `rgba(139, 111, 71, ${Math.random() * 0.3 + 0.2})`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add pebbles
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const size = Math.random() * 3 + 1;
      
      ctx.fillStyle = `rgba(100, 90, 80, ${Math.random() * 0.4 + 0.3})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();

      // Highlight
      ctx.fillStyle = `rgba(150, 140, 130, ${Math.random() * 0.2})`;
      ctx.beginPath();
      ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    return canvas;
  }

  // ========== ENHANCED SKY TEXTURE ==========
  createSkyTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Multi-layer sky gradient untuk lebih realistic
    const skyGradient = ctx.createLinearGradient(0, 0, 0, 512);
    skyGradient.addColorStop(0, '#87CEEB');      // Top: Bright blue
    skyGradient.addColorStop(0.3, '#B0D9F5');    // Upper: Light blue
    skyGradient.addColorStop(0.6, '#E0F0FF');    // Middle: Very light
    skyGradient.addColorStop(0.85, '#A8D8EA');   // Lower: Medium blue
    skyGradient.addColorStop(1, '#90D1A8');      // Bottom: Horizon green
    
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, 512, 512);

    // Add cloud layers dengan noise
    for (let layer = 0; layer < 2; layer++) {
      const opacity = 0.15 - (layer * 0.05);
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * 512;
        const y = (layer + 1) * 100 + Math.random() * 50;
        const width = Math.random() * 60 + 40;
        const height = Math.random() * 30 + 15;
        
        // Smooth cloud shapes
        ctx.beginPath();
        ctx.arc(x, y, width * 0.4, 0, Math.PI * 2);
        ctx.arc(x + width * 0.25, y - height * 0.2, width * 0.35, 0, Math.PI * 2);
        ctx.arc(x - width * 0.25, y - height * 0.2, width * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Add atmospheric haze
    const hazeGradient = ctx.createLinearGradient(0, 300, 0, 512);
    hazeGradient.addColorStop(0, 'rgba(200, 220, 255, 0)');
    hazeGradient.addColorStop(1, 'rgba(150, 200, 220, 0.1)');
    ctx.fillStyle = hazeGradient;
    ctx.fillRect(0, 300, 512, 212);

    return canvas;
  }

  // ========== DIRT TEXTURE ==========
  createDirtTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Base dirt color
    const dirtGradient = ctx.createLinearGradient(0, 0, 0, 128);
    dirtGradient.addColorStop(0, '#8B7355');
    dirtGradient.addColorStop(1, '#6B5345');
    ctx.fillStyle = dirtGradient;
    ctx.fillRect(0, 0, 128, 128);

    // Noise pattern
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 128;
      const y = Math.random() * 128;
      const size = Math.random() * 2 + 0.5;
      
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.3})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Rock/grain details
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * 128;
      const y = Math.random() * 128;
      ctx.fillStyle = `rgba(139, 111, 71, ${Math.random() * 0.4})`;
      ctx.fillRect(x, y, Math.random() * 3 + 1, Math.random() * 3 + 1);
    }

    return canvas;
  }

  // ========== METAL TEXTURE ==========
  createMetalTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Base metallic color
    const metalGradient = ctx.createLinearGradient(0, 0, 128, 128);
    metalGradient.addColorStop(0, '#C0C0C0');
    metalGradient.addColorStop(0.5, '#A9A9A9');
    metalGradient.addColorStop(1, '#808080');
    ctx.fillStyle = metalGradient;
    ctx.fillRect(0, 0, 128, 128);

    // Add scratches untuk metallic effect
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 128;
      const y = Math.random() * 128;
      const length = Math.random() * 30 + 5;
      const angle = Math.random() * Math.PI;
      
      ctx.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.2})`;
      ctx.lineWidth = Math.random() * 2 + 0.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
      ctx.stroke();
    }

    // Add dark spots
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 128;
      const y = Math.random() * 128;
      const radius = Math.random() * 2 + 1;
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.2})`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    return canvas;
  }

  // ========== CLOUD TEXTURE ==========
  createCloudTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    
    // Main cloud body dengan multiple circles
    const cloudPoints = [
      { x: 50, y: 60, r: 40 },
      { x: 100, y: 45, r: 55 },
      { x: 170, y: 60, r: 45 },
      { x: 220, y: 50, r: 40 }
    ];

    for (const point of cloudPoints) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, point.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Shadow untuk depth
    ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
    ctx.beginPath();
    ctx.ellipse(128, 90, 100, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    return canvas;
  }
}

// ========== ENHANCED PHYSICS SYSTEM ==========
class PhysicsEngine {
  constructor() {
    this.gravity = H * 2.8;
    this.friction = 0.92;
    this.bounce = 0.6;
    this.airResistance = 0.98;
  }

  // Improved velocity calculation
  applyGravity(obj, dt) {
    if (!obj.onGround) {
      obj.vy += this.gravity * dt;
      obj.vy *= this.airResistance;
    }
  }

  // Better collision detection dengan normal vector
  handleCollision(obj, groundY) {
    if (obj.y + obj.h >= groundY) {
      obj.y = groundY - obj.h;
      
      if (obj.vy > 0) {
        obj.vy *= -this.bounce;
        if (Math.abs(obj.vy) < 50) {
          obj.vy = 0;
          obj.onGround = true;
        }
      }
    }
  }

  // Smooth movement interpolation
  lerp(current, target, t) {
    return current + (target - current) * t;
  }

  // Easing functions untuk smooth animations
  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
}

// ========== IMPROVED PARTICLE SYSTEM ==========
class Particle {
  constructor(x, y, vx, vy, color, life = 0.5, size = 4, type = 'normal') {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.life = life;
    this.maxLife = life;
    this.size = size;
    this.type = type;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 8;
    
    // Physics properties
    this.mass = size / 10;
    this.drag = 0.98;
    this.bounce = 0.4;
  }

  update(dt) {
    // Apply air resistance
    this.vx *= this.drag;
    this.vy *= this.drag;
    
    // Apply gravity dengan mass consideration
    this.vy += H * 2.5 * dt * this.mass;
    
    // Update position
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    
    // Rotation
    this.life -= dt;
    this.rotation += this.rotationSpeed * dt;
  }

  draw(ctx) {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.globalAlpha = alpha;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    if (this.type === 'sparkle') {
      // Improved sparkle effect
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 2);
      gradient.addColorStop(0, this.color);
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, this.size * 2, 0, Math.PI * 2);
      ctx.fill();

      // Sparkle core
      ctx.fillStyle = this.color;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const px = Math.cos(angle) * this.size;
        const py = Math.sin(angle) * this.size;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    } else if (this.type === 'blood') {
      // Enhanced blood effect
      const bloodGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
      bloodGradient.addColorStop(0, this.color);
      bloodGradient.addColorStop(1, 'rgba(139, 0, 0, 0.3)');
      ctx.fillStyle = bloodGradient;
      ctx.beginPath();
      ctx.arc(0, 0, this.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Default particle dengan gradient
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
      gradient.addColorStop(0, this.color);
      gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, this.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    ctx.globalAlpha = 1;
  }
}

    // Initialize physics engine
      const physicsEngine = new PhysicsEngine();

  // ========== MOUNTAIN CLASS ==========
  class Mountain {
    constructor(x, y, w, h, color) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.color = color;
      this.peakX = x + w / 2;
      this.baseY = y + h;
    }

    draw(ctx) {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.moveTo(this.x, this.baseY);
      ctx.lineTo(this.peakX, this.y);
      ctx.lineTo(this.x + this.w, this.baseY);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(this.peakX, this.y);
      ctx.lineTo(this.peakX - this.w * 0.1, this.y + this.h * 0.15);
      ctx.lineTo(this.peakX + this.w * 0.1, this.y + this.h * 0.15);
      ctx.closePath();
      ctx.fill();
    }
  }

  // ========== HP DISPLAY CLASS ==========
  class HPDisplay {
    constructor(maxHP) {
      this.maxHP = maxHP;
      this.currentHP = maxHP;
      this.displayHP = maxHP;
      this.damageFlashIntensity = 0;
      this.width = 300;
      this.height = 80;
    }

    takeDamage(amount) {
      this.currentHP = Math.max(0, this.currentHP - amount);
      this.damageFlashIntensity = 1;
    }

    heal(amount) {
      this.currentHP = Math.min(this.maxHP, this.currentHP + amount);
    }

    update(dt) {
      const hpDiff = this.displayHP - this.currentHP;
      if (Math.abs(hpDiff) > 0.5) {
        this.displayHP -= hpDiff * Math.min(1, dt * 3);
      } else {
        this.displayHP = this.currentHP;
      }

      if (this.damageFlashIntensity > 0) {
        this.damageFlashIntensity = Math.max(0, this.damageFlashIntensity - dt * 2);
      }
    }

    draw(ctx, x, y) {
      const hpPercent = Math.max(0, this.displayHP / this.maxHP);
      const barWidth = this.width - 50;

      const bgGradient = ctx.createLinearGradient(x, y, x, y + this.height);
      bgGradient.addColorStop(0, 'rgba(10, 20, 40, 0.9)');
      bgGradient.addColorStop(1, 'rgba(5, 10, 25, 0.95)');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(x, y, this.width, this.height);
      ctx.strokeStyle = `rgba(0, 255, 255, ${0.3 + this.damageFlashIntensity * 0.5})`;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, this.width, this.height);

      ctx.font = 'bold 40px Arial';
      ctx.fillStyle = '#ff6666';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('❤️', x + 15, y + this.height / 2);

      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('HP', x + 65, y + 18);

      ctx.font = 'bold 20px Arial';
      ctx.fillStyle = hpPercent > 0.3 ? '#00ff88' : '#ff6666';
      ctx.fillText(`${Math.ceil(this.currentHP)} / ${this.maxHP}`, x + 65, y + 45);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(x + 20, y + 58, barWidth, 16);

      const hpGradient = ctx.createLinearGradient(x + 20, y + 58, x + 20, y + 74);
      if (hpPercent > 0.5) {
        hpGradient.addColorStop(0, '#00ff88');
        hpGradient.addColorStop(1, '#00cc66');
      } else if (hpPercent > 0.25) {
        hpGradient.addColorStop(0, '#ffff00');
        hpGradient.addColorStop(1, '#ffaa00');
      } else {
        hpGradient.addColorStop(0, '#ff6666');
        hpGradient.addColorStop(1, '#ff3333');
      }

      ctx.fillStyle = hpGradient;
      const fillWidth = (barWidth - 4) * hpPercent;
      ctx.fillRect(x + 22, y + 60, fillWidth, 12);

      ctx.strokeStyle = hpGradient;
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 20, y + 58, barWidth, 16);

      if (this.damageFlashIntensity > 0) {
        ctx.fillStyle = `rgba(255, 100, 100, ${this.damageFlashIntensity * 0.3})`;
        ctx.fillRect(x, y, this.width, this.height);
      }
    }
  }

  // ========== PLAYER DEATH ANIMATION CLASS ==========
class PlayerDeathAnimation {
  constructor(player) {
    this.player = player;
    this.startX = player.x;
    this.startY = player.y;
    
    // Physics
    this.deathVx = (Math.random() - 0.5) * 400;
    this.deathVy = -300 - Math.random() * 100;
    this.rotationSpeed = (Math.random() - 0.5) * 15;
    this.currentRotation = 0;
    
    // Animation properties
    this.scale = 1;
    this.alpha = 1;
    this.duration = 2.5; // durasi total animasi
    this.elapsedTime = 0;
    this.showGameOver = true;
    
    // Particle effects
    this.particles = [];
    this.createDeathParticles();
    
    // Sound effects
    playSound(100, 0.4, 'sine', 0.3);
    playSound(80, 0.6, 'sine', 0.25);
  }

  createDeathParticles() {
    // Ledakan besar saat karakter mati
    spawnParticles(this.player.x, this.player.y, '#ff6b4a', 25, 350, 'sparkle');
    spawnParticles(this.player.x, this.player.y, '#ffaa00', 15, 250, 'blood');
    spawnParticles(this.player.x, this.player.y, '#ffff00', 10, 200, 'normal');
  }

  update(dt) {
    this.elapsedTime += dt;
    const progress = this.elapsedTime / this.duration;

    // ✨ SMOOTH PHYSICS PHASE (0-1.5s) - Jatuh dengan rotasi
    if (progress < 0.6) {
      // Gravity
      this.deathVy += H * 2.8 * dt;
      
      // Position update
      this.player.x += this.deathVx * dt;
      this.player.y += this.deathVy * dt;

      // Smooth rotation
      this.currentRotation += this.rotationSpeed * dt;
      this.deathVx *= 0.99;
      this.deathVy *= 0.99;
      this.rotationSpeed *= 0.98;

      // Slight scale down during fall
      this.scale = 1 - progress * 0.3;
      this.alpha = 1;
    } 
    // ✨ IMPACT & FADE PHASE (1.5-2.5s) - Jatuh dan fade out
    else {
      // Continue gravity tapi lebih slow
      this.deathVy += H * 1.5 * dt;
      this.player.y += this.deathVy * dt;
      
      // Fade out effect
      const fadeProgress = (progress - 0.6) / 0.4;
      this.alpha = Math.max(0, 1 - fadeProgress * 1.5);
      
      // Scale continues to shrink
      this.scale = Math.max(0.1, 1 - progress * 0.8);
      
      // Rotation slows down
      this.currentRotation += this.rotationSpeed * dt;
      this.rotationSpeed *= 0.95;
    }

    // Check if animasi selesai
    if (this.elapsedTime >= this.duration) {
      this.showGameOver = true;
      return true;
    }
    return false;
  }

  draw(ctx) {
    if (this.alpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = this.alpha;
    
    // Translate ke center player
    ctx.translate(this.player.x, this.player.y);
    ctx.rotate(this.currentRotation);
    ctx.scale(this.scale, this.scale);

    // Draw player character
    const pr = this.player.rect();
    characterAsset.draw(ctx, -pr.w / 2, -pr.h / 2, pr.w, pr.h, 1);

    // Add glow effect during death
    const glowIntensity = Math.sin(this.elapsedTime * 10) * 0.5 + 0.5;
    ctx.strokeStyle = `rgba(255, 107, 74, ${glowIntensity * 0.6})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, pr.w / 2 + 15, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }
}

  // ========== POWERUP UI CLASS ==========
  class PowerUpUI {
    constructor() {
      this.activePowerups = {};
      this.popupAnimations = [];
      this.offsetX = 20;
      this.offsetY = 120;
      this.maxDisplayed = 4;
      this.cardWidth = 250;
      this.cardHeight = 90;
    }

    addPowerup(type, config, duration) {
      const id = Math.random().toString(36).substr(2, 9);
      this.activePowerups[id] = {
        type,
        config,
        duration,
        maxDuration: duration,
        id
      };

      this.popupAnimations.push({
        x: W / 2,
        y: H / 2,
        vx: (Math.random() - 0.5) * 200,
        vy: -300 - Math.random() * 200,
        life: 0.8,
        maxLife: 0.8,
        text: `+${config.name}!`,
        config
      });

      playSound(1000, 0.1, 'sine', 0.3);
    }

    update(dt) {
      Object.keys(this.activePowerups).forEach(id => {
        const pu = this.activePowerups[id];
        pu.duration -= dt;
        if (pu.duration <= 0) {
          delete this.activePowerups[id];
        }
      });

      for (let i = this.popupAnimations.length - 1; i >= 0; i--) {
        const p = this.popupAnimations[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 300 * dt;
        p.life -= dt;
        if (p.life <= 0) {
          this.popupAnimations.splice(i, 1);
        }
      }
    }

    draw(ctx) {
      const powerups = Object.values(this.activePowerups);
      powerups.slice(0, this.maxDisplayed).forEach((pu, index) => {
        const x = this.offsetX;
        const y = this.offsetY + index * (this.cardHeight + 15);
        this.drawPowerupCard(ctx, x, y, pu);
      });

      this.popupAnimations.forEach(p => {
        const alpha = Math.max(0, p.life / p.maxLife);
        ctx.globalAlpha = alpha;
        ctx.font = 'bold 32px Arial';
        ctx.fillStyle = p.config.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = p.config.color;
        ctx.shadowBlur = 15;
        ctx.fillText(p.text, p.x, p.y);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      });
    }

    drawPowerupCard(ctx, x, y, powerup) {
      const timePercent = Math.max(0, powerup.duration / powerup.maxDuration);

      const bgGradient = ctx.createLinearGradient(x, y, x, y + this.cardHeight);
      bgGradient.addColorStop(0, powerup.config.bgColor);
      bgGradient.addColorStop(1, 'rgba(10, 20, 40, 0.8)');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(x, y, this.cardWidth, this.cardHeight);

      ctx.strokeStyle = powerup.config.color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, this.cardWidth, this.cardHeight);

      ctx.font = 'bold 50px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(powerup.config.icon, x + 45, y + this.cardHeight / 2);

      ctx.font = 'bold 13px Arial';
      ctx.fillStyle = powerup.config.color;
      ctx.textAlign = 'left';
      ctx.fillText(powerup.config.name, x + 90, y + 15);

      ctx.font = 'bold 14px Arial';
      ctx.fillStyle = '#aabbcc';
      ctx.fillText(`${powerup.duration.toFixed(1)}s`, x + 90, y + 35);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(x + 90, y + 48, 150, 8);

      const progGradient = ctx.createLinearGradient(x + 90, y + 48, x + 240, y + 48);
      progGradient.addColorStop(0, powerup.config.color);
      progGradient.addColorStop(1, 'rgba(255, 255, 255, 0.3)');
      ctx.fillStyle = progGradient;
      ctx.fillRect(x + 90, y + 48, 150 * timePercent, 8);

      ctx.strokeStyle = powerup.config.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 90, y + 48, 150, 8);
    }
  }

  // ========== SCORE MANAGER ==========
  class ScoreManager {
    constructor() {
      this.baseScore = 0;
      this.comboKills = 0;
      this.comboTimer = 0;
      this.comboMultiplier = 1;
      this.maxComboMultiplier = 10;
      this.comboResetTime = 3;
    }

    addScore(amount, type = 'default') {
      const multiplied = Math.floor(amount * this.comboMultiplier);

      switch(type) {
        case 'kill':
          this.baseScore += multiplied;
          this.comboKills++;
          this.comboTimer = this.comboResetTime;
          this.updateComboMultiplier();
          break;
        case 'boss_kill':
          this.baseScore += multiplied * 2;
          this.comboKills = 0;
          this.comboMultiplier = 1;
        default:
          this.baseScore += multiplied;
      }

      return multiplied;
    }

    updateComboMultiplier() {
      this.comboMultiplier = Math.min(
        this.maxComboMultiplier,
        1 + (Math.floor(this.comboKills / 3) * 0.5)
      );
    }

    update(dt) {
      if (this.comboTimer > 0) {
        this.comboTimer -= dt;
        if (this.comboTimer <= 0) {
          this.comboKills = 0;
          this.comboMultiplier = 1;
        }
      }
    }

    getComboMultiplier() {
      return this.comboMultiplier.toFixed(1);
    }

    getTotalScore() {
      return this.baseScore;
    }
  }

  // ========== BOSS STAGE MANAGER ==========
  class BossStageManager {
  constructor() {
    this.currentStage = 1;
    this.bossDefeated = false;
    this.nextBossScore = 10000;
    this.bossSpawned = false;
    this.bossIntroTime = 0;
    this.bossIntroMaxTime = 2;
    this.showingBossIntro = false;
    this.showingVictoryScreen = false;
    this.victoryCountdownTimer = 0;
    this.victoryCountdownDuration = 3; // ← REDUCED dari 5 ke 3 detik
    this.currentBoss = null; // ← TRACKING BOSS SAAT INI
  }

  shouldSpawnBoss(currentScore) {
    
    // ✅ Spawn boss HANYA jika belum spawn dan belum defeated
    return (currentScore >= this.nextBossScore)
      && !this.bossSpawned
      && !this.bossDefeated;
  }

  spawnBoss() {
    if (this.bossSpawned) return false;
    this.bossSpawned = true;
    this.showingBossIntro = true;
    this.bossIntroTime = 0;
    return true;
  }

  // ✅ CEK APAKAH BOSS MASIH ALIVE
  isBossAlive() {
    return this.currentBoss && this.currentBoss.health > 0;
  }


  onBossDefeated() {
    if (this.bossDefeated) return; // ← PREVENT DOUBLE TRIGGER
    this.bossDefeated = true;
    this.showingVictoryScreen = true;
    this.victoryCountdownTimer = 0;
    
    playSound(1500, 0.3, 'sine', 0.4); // Victory sound
    spawnParticles(W / 2, H / 2, '#ffff00', 40, 400, 'sparkle');
  }


  update(dt) {
    if (this.showingBossIntro) {
      this.bossIntroTime += dt;
      if (this.bossIntroTime >= this.bossIntroMaxTime) {
        this.showingBossIntro = false;
      }
    }

    if (this.showingVictoryScreen) {
      this.victoryCountdownTimer += dt;
      if (this.victoryCountdownTimer >= this.victoryCountdownDuration) {
        this.advanceToNextStage();
        this.showingVictoryScreen = false;
      }
    }
  }

   // ✅ KUNCI: Setiap stage, nextBossScore += 10000
  advanceToNextStage() {
    this.currentStage++;
    this.nextBossScore += 10000;
    this.bossSpawned = false;     // ← RESET untuk spawn boss baru
    this.bossDefeated = false;    // ← RESET untuk fight baru
    this.currentBoss = null;      // ← CLEAR reference
    
    const stageEl = document.getElementById('stage');
    if (stageEl) {
      stageEl.textContent = this.currentStage;
    }
    
    playSound(1000, 0.2, 'sine', 0.3);
    playSound(1200, 0.15, 'sine', 0.25);
  }

  getStage() {
    return this.currentStage;
  }

  getNextBossScore() {
    return this.nextBossScore;  // Menunjukkan kapan boss berikutnya spawn
  }

  // ✅ HANYA DRAW, JANGAN LOGIC
    drawBossIntro(ctx) {
    if (!this.showingBossIntro) return;

    const alpha = Math.min(1, this.bossIntroTime / 0.5);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, W, H);

    ctx.globalAlpha = 1;
    ctx.font = 'bold 60px Arial';
    ctx.fillStyle = '#ff6b4a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#ff6b4a';
    ctx.shadowBlur = 30;
    ctx.fillText(`STAGE ${this.currentStage}`, W / 2, H / 2 - 100);
    
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#00ffff';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 15;
    ctx.fillText(`👑 BOSS INCOMING 👑`, W / 2, H / 2 - 20);
    
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#ffaa00';
    ctx.shadowColor = '#ffaa00';
    ctx.shadowBlur = 10;
    ctx.fillText(`Defeat the boss to progress!`, W / 2, H / 2 + 40);
    
    ctx.shadowBlur = 0;
  }

  drawVictoryCountdown(ctx) {
    if (!this.showingVictoryScreen) return;

    const remainingTime = Math.ceil(this.victoryCountdownDuration - this.victoryCountdownTimer);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, W, H);
    
    const pulse = Math.sin(performance.now() / 300) * 0.15 + 0.85;
    ctx.fillStyle = `rgba(0, 255, 136, ${pulse * 0.1})`;
    ctx.fillRect(0, 0, W, H);
    
    ctx.font = 'bold 80px Arial';
    ctx.fillStyle = '#00ff88';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 40;
    ctx.fillText('🎉 VICTORY! 🎉', W / 2, H / 2 - 100);
    
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#ffff00';
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 30;
    ctx.fillText(`STAGE ${this.currentStage} CLEARED`, W / 2, H / 2 - 20);
    
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#00ffff';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 20;
    ctx.fillText(`NEXT: STAGE ${this.currentStage + 1}`, W / 2, H / 2 + 60);
    
    ctx.font = 'bold 72px Arial';
    ctx.fillStyle = remainingTime <= 1 ? '#ff6b4a' : '#ffaa00';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 25;
    ctx.fillText(remainingTime, W / 2, H / 2 + 160);
    
    ctx.shadowColor = 'transparent';
  }
}

  // ========== PLAYER CLASS ==========
  class Player {
    constructor(x, groundY) {
      this.x = x;
      this.groundY = groundY;
      this.w = Math.round(W * 0.055);
      this.h = Math.round(H * 0.13);
      this.reset();
    }

    reset() {
      this.y = this.groundY - this.h;
      this.vx = 0;
      this.vy = 0;
      this.onGround = true;
      this.alive = true;
      this.hp = playerStats.hp;
      this.maxHp = playerStats.hp;
      this.fireRate = playerStats.fireRate;
      this.fireTimer = 0;
      this.shieldActive = false;
      this.shieldTimer = 0;
      this.rapidFireActive = false;
      this.rapidFireTimer = 0;
      this.freezeActive = false;
      this.freezeTimer = 0;
      this.damageMultiplier = 1.0;
      this.fireRateBoostActive = false;
      this.fireRateBoostTimer = 0;
      this.bulletSplitActive = false;
      this.bulletSplitTimer = 0;
      this.missileActive = false;
      this.missileTimer = 0;
      this.speed = playerStats.movement;
      this.jumpPower = -playerStats.jumpSpeed;
      this.baseDamage = playerStats.damage;
      this.coins = 0;
      this.criticalRate = playerStats.criticalRate;
      this.criticalDamage = playerStats.criticalDamage;

      this.hpDisplay = new HPDisplay(this.maxHp);
      this.powerupUI = new PowerUpUI();
      this.activePowerups = {};
    }

    rect() {
      return { x: this.x, y: this.y, w: this.w, h: this.h };
    }

    centerX() {
      return this.x + this.w / 2;
    }

    centerY() {
      return this.y + this.h / 2;
    }

    getDamage() {
      let dmg = this.baseDamage * this.damageMultiplier;
      if (Math.random() < this.criticalRate) {
        dmg *= this.criticalDamage;
      }
      return dmg;
    }

    getFireRate() {
      let rate = this.fireRate;
      if (this.rapidFireActive) rate *= 0.4;
      if (this.fireRateBoostActive) rate *= 0.5;
      return rate;
    }

    canShoot() {
      return this.fireTimer <= 0;
    }

    shoot() {
      this.fireTimer = this.getFireRate();
      playSound(400, 0.05, 'sine', 0.2);
    }

    jump() {
      if (this.onGround) {
        this.vy = this.jumpPower;
        this.onGround = false;
        playSound(300, 0.08, 'sine', 0.18);
      }
    }

    heal(percentAmount) {
      const healAmount = this.maxHp * percentAmount;
      this.hp = Math.min(this.maxHp, this.hp + healAmount);
      this.hpDisplay.heal(healAmount);
      playSound(800, 0.2, 'sine', 0.25);
      spawnParticles(this.centerX(), this.centerY(), '#00ff88', 15, 200);
    }

    takeDamage() {
  if (!this.shieldActive) {
    this.hp -= 1;
    this.hpDisplay.takeDamage(1);
    playSound(200, 0.2, 'sine', 0.28);
    spawnParticles(this.centerX(), this.centerY(), '#ff4444', 12, 250);
    
    // Return apakah masih hidup atau tidak
    return this.hp > 0;
  } else if (this.shieldActive) {
    this.shieldActive = false;
    this.shieldTimer = 0;
    playSound(600, 0.08, 'sine', 0.2);
    spawnParticles(this.centerX(), this.centerY(), '#44ff44', 8, 180);
    return true;
  }
  return false;
}

    activatePowerup(type, config, duration) {
      const id = Math.random().toString(36).substr(2, 9);
      this.activePowerups[id] = {
        type,
        duration,
        startTime: performance.now()
      };
      this.powerupUI.addPowerup(type, config, duration);
      return id;
    }

    update(dt, input) {
      this.vx = 0;
      if (input.left) this.vx = -this.speed;
      if (input.right) this.vx = this.speed;

      this.x += this.vx * dt;
      this.x = Math.max(0, Math.min(W - this.w, this.x));

      if (!this.onGround || this.vy < 0) {
        this.vy += H * 2.8 * dt;
        this.y += this.vy * dt;
        if (this.y >= this.groundY - this.h) {
          this.y = this.groundY - this.h;
          this.vy = 0;
          this.onGround = true;
        }
      }

      if (this.shieldActive) {
        this.shieldTimer -= dt;
        if (this.shieldTimer <= 0) this.shieldActive = false;
      }
      if (this.rapidFireActive) {
        this.rapidFireTimer -= dt;
        if (this.rapidFireTimer <= 0) this.rapidFireActive = false;
      }
      if (this.freezeActive) {
        this.freezeTimer -= dt;
        if (this.freezeTimer <= 0) this.freezeActive = false;
      }
      if (this.fireRateBoostActive) {
        this.fireRateBoostTimer -= dt;
        if (this.fireRateBoostTimer <= 0) this.fireRateBoostActive = false;
      }
      if (this.bulletSplitActive) {
        this.bulletSplitTimer -= dt;
        if (this.bulletSplitTimer <= 0) this.bulletSplitActive = false;
      }
      if (this.missileActive) {
        this.missileTimer -= dt;
        if (this.missileTimer <= 0) this.missileActive = false;
      }

      this.fireTimer = Math.max(0, this.fireTimer - dt);
      this.hpDisplay.update(dt);
      this.powerupUI.update(dt);
    }

    draw(ctx) {
      const pr = this.rect();
      characterAsset.draw(ctx, pr.x, pr.y, pr.w, pr.h, 1);

      if (this.shieldActive) {
        ctx.strokeStyle = 'rgba(68, 255, 68, 0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(pr.x + pr.w / 2, pr.y + pr.h / 2, pr.w / 2 + 15, 0, Math.PI * 2);
        ctx.stroke();
      }

      this.hpDisplay.draw(ctx, 20, 20);
      this.powerupUI.draw(ctx);
    }
  }

  // ========== BULLET CLASS ==========
  class Bullet {
    constructor(x, y, damage = 1.0, type = 'normal') {
      this.x = x;
      this.y = y;
      this.w = Math.round(W * 0.015);
      this.h = Math.round(H * 0.008);
      this.speed = W * 0.8;
      this.damage = damage;
      this.type = type;
    }

    rect() {
      return { x: this.x, y: this.y, w: this.w, h: this.h };
    }

    update(dt) {
      this.x += this.speed * dt;
      if (this.type === 'missile') {
        this.y += Math.sin(this.x * 0.01) * 100 * dt;
      }
    }

    draw(ctx) {
      if (this.type === 'missile') {
        // Missile with glow effect
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Glow
        ctx.fillStyle = 'rgba(255, 0, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ff00ff';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-12, -6);
        ctx.lineTo(-12, 6);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      } else {
        // Enhanced regular bullet
        ctx.save();
        ctx.translate(this.x, this.y);

        // Bullet glow
        const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 8);
        glowGradient.addColorStop(0, 'rgba(255, 255, 100, 0.6)');
        glowGradient.addColorStop(1, 'rgba(255, 150, 0, 0)');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(-8, -8, 16, 16);

        // Bullet core
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(-2, -1, 4, 2);

        ctx.strokeStyle = '#ff8800';
        ctx.lineWidth = 1;
        ctx.strokeRect(-2, -1, 4, 2);

        ctx.restore();
      }
    }
  }

  // ========== MINION CLASS - SIMPLIFIED ==========
  class Minion {
  constructor(x, groundY, scoreMultiplier, playerDamage = 1.0) {
    this.x = x;
    this.y = groundY - Math.round(H * 0.075);
    this.w = Math.round(W * 0.035);
    this.h = Math.round(H * 0.075);
    this.groundY = groundY;
    this.isAlive = true;

    const healthMultiplier = Math.pow(1.12, scoreMultiplier);
    const damageScaling = Math.max(1, playerDamage * 0.5);
    this.health = 3 * healthMultiplier * damageScaling;
    this.maxHealth = this.health;
    this.damaged = false;
    this.damageFlash = 0;

    this.speed = -rand(W * 0.25, W * 0.35);
    
    // Physics
    this.vy = 0;
    this.vx = 0;
    this.onGround = true;
    this.bounce = 0.3;
    this.mass = 1;
    this.rotationAngle = 0;
    this.rotationSpeed = 0;

    // ✨ DEATH ANIMATION PROPERTIES
    this.deathAnimation = false;
    this.deathTimer = 0;
    this.deathDuration = 0.8; // durasi animasi dalam detik
    this.fade = 1;
    this.deathRotationSpeed = 0;
    this.deathVx = 0;
    this.deathVy = 0;
  }

  rect() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  centerX() {
    return this.x + this.w / 2;
  }

  centerY() {
    return this.y + this.h / 2;
  }

  takeDamage(amount = 1.0) {
    this.health -= amount;
    this.damaged = true;
    this.damageFlash = 0.18;
    
    this.vy = -Math.random() * 150 - 100;
    this.rotationSpeed = (Math.random() - 0.5) * 8;
    
    playSound(150, 0.08, 'sine', 0.22);
    spawnParticles(this.centerX(), this.centerY(), '#ffaa00', 8, 180);
  }

  // ✨ TRIGGER DEATH ANIMATION
  startDeathAnimation() {
    this.deathAnimation = true;
    this.deathTimer = 0;
    this.fade = 1;
    
    // Efek fisika kematian
    this.deathVy = -200 - Math.random() * 150; // lompat ke atas
    this.deathVx = (Math.random() - 0.5) * 300; // acak horizontal
    this.deathRotationSpeed = (Math.random() - 0.5) * 20; // putaran cepat
    
    // Partikel ledakan
    spawnParticles(this.centerX(), this.centerY(), '#ff6b4a', 20, 250, 'sparkle');
    spawnParticles(this.centerX(), this.centerY(), '#ffaa00', 12, 200, 'blood');
    
    // Sound effect
    playSound(200, 0.15, 'sine', 0.25);
    playSound(100, 0.2, 'sine', 0.2);
  }

  update(dt, freeze = false) {
    // ✨ DEATH ANIMATION UPDATE
    if (this.deathAnimation) {
      this.deathTimer += dt;
      const progress = this.deathTimer / this.deathDuration;
      
      // Fade out secara smooth
      this.fade = Math.max(0, 1 - progress);
      
      // Physics saat death
      this.deathVy += H * 2.8 * dt; // gravity
      this.y += this.deathVy * dt;
      this.x += this.deathVx * dt;
      
      // Rotasi saat jatuh
      this.rotationAngle += this.deathRotationSpeed * dt;
      this.deathRotationSpeed *= 0.98; // slow down rotation
      
      // Scale down sedikit
      this.deathScale = Math.max(0.3, 1 - progress * 0.3);
      
      // Jika sudah selesai animasi
      if (this.fade <= 0 || this.deathTimer >= this.deathDuration) {
        this.isAlive = false;
      }
      return; // stop normal update
    }

    // Normal update (saat hidup)
    if (this.damaged) {
      this.damageFlash -= dt;
      if (this.damageFlash <= 0) this.damaged = false;
    }

    if (!freeze) {
      this.x += this.speed * dt;
      
      if (!this.onGround) {
        this.vy += H * 2.8 * dt;
      }
      
      this.y += this.vy * dt;
      
      if (this.y + this.h >= this.groundY) {
        this.y = this.groundY - this.h;
        this.vy *= -this.bounce;
        
        if (Math.abs(this.vy) < 50) {
          this.vy = 0;
          this.onGround = true;
        }
      } else {
        this.onGround = false;
      }

      this.rotationAngle += this.rotationSpeed * dt;
      if (this.damaged) {
        this.rotationSpeed *= 0.95;
      }
    }
  }

  draw(ctx) {
    // ✨ APPLY DEATH ANIMATION
    ctx.save();
    ctx.globalAlpha = this.deathAnimation ? this.fade : 1;

    const pr = this.rect();
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(pr.x + pr.w / 2, pr.y + pr.h + 4, pr.w / 2 * (1 - Math.abs(this.vy) / 500), 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(pr.x + pr.w / 2, pr.y + pr.h / 2);
    
    // Scale saat death
    if (this.deathAnimation) {
      ctx.scale(this.deathScale, this.deathScale);
    }
    
    ctx.rotate(this.rotationAngle);
    ctx.translate(-(pr.w / 2), -(pr.h / 2));

    if (this.damaged) ctx.globalAlpha = Math.min(this.fade, 0.6);

    // Body dengan gradient
    const bodyGradient = ctx.createLinearGradient(0, 0, 0, pr.h);
    bodyGradient.addColorStop(0, '#ffe680');
    bodyGradient.addColorStop(0.5, '#ffd54a');
    bodyGradient.addColorStop(1, '#ffcc00');
    ctx.fillStyle = bodyGradient;
    ctx.fillRect(0, 0, pr.w, pr.h);

    // Pattern texture
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(0, pr.h * (i / 3));
      ctx.lineTo(pr.w, pr.h * (i / 3));
      ctx.stroke();
    }

    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(pr.w * 0.15, pr.h * 0.08, pr.w * 0.35, pr.h * 0.15);

    // Eyes
    ctx.fillStyle = '#000';
    const eyeW = pr.w * 0.15;
    const eyeH = pr.h * 0.2;
    ctx.fillRect(pr.w * 0.15, pr.h * 0.25, eyeW, eyeH);
    ctx.fillRect(pr.w * 0.55, pr.h * 0.25, eyeW, eyeH);

    // Eye shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(pr.w * 0.2, pr.h * 0.3, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(pr.w * 0.65, pr.h * 0.3, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Health bar
    const healthPercent = this.health / this.maxHealth;
    const healthBarW = pr.w * 0.8;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(pr.w * 0.1, -12, healthBarW, 6);

    const healthGradient = ctx.createLinearGradient(pr.w * 0.1, -12, pr.w * 0.1 + healthBarW, -12);
    if (healthPercent > 0.5) {
      healthGradient.addColorStop(0, '#44ff44');
      healthGradient.addColorStop(1, '#00dd00');
    } else if (healthPercent > 0.25) {
      healthGradient.addColorStop(0, '#ffff00');
      healthGradient.addColorStop(1, '#ffaa00');
    } else {
      healthGradient.addColorStop(0, '#ff4444');
      healthGradient.addColorStop(1, '#ff0000');
    }
    ctx.fillStyle = healthGradient;
    ctx.fillRect(pr.w * 0.1, -12, healthBarW * healthPercent, 6);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(pr.w * 0.1, -12, healthBarW, 6);

    if (this.damaged && !this.deathAnimation) {
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pr.w, pr.h);
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }
}

  // ========== BOSS MINION CLASS - SIMPLIFIED ==========
  class BossMinion {
    constructor(x, groundY, scoreMultiplier, playerDamage = 1.0) {
      this.x = x;
      this.y = groundY - Math.round(H * 0.14);
      this.w = Math.round(W * 0.08);
      this.h = Math.round(H * 0.14);
      this.groundY = groundY;
      this.isAlive = true;

      const healthMultiplier = Math.pow(1.12, scoreMultiplier);
      const damageScaling = Math.max(1, playerDamage * 0.5);
      this.health = 25 * healthMultiplier * damageScaling;
      this.maxHealth = this.health;
      this.damaged = false;
      this.damageFlash = 0;
      this.invulnTimer = 0;

      this.speed = -rand(W * 0.15, W * 0.25);
    }

    rect() {
      return { x: this.x, y: this.y, w: this.w, h: this.h };
    }

    centerX() {
      return this.x + this.w / 2;
    }

    centerY() {
      return this.y + this.h / 2;
    }

    takeDamage(amount = 1.0) {
      this.health -= amount;
      this.damaged = true;
      this.damageFlash = 0.2;
      this.invulnTimer = 0.1;
      playSound(100, 0.12, 'sine', 0.28);
      spawnParticles(this.centerX(), this.centerY(), '#ff6b4a', 10, 200);
    }

    update(dt, freeze = false) {
      if (this.damaged) {
        this.damageFlash -= dt;
        if (this.damageFlash <= 0) this.damaged = false;
      }
      if (this.invulnTimer > 0) this.invulnTimer -= dt;
      if (!freeze) this.x += this.speed * dt;
    }

    draw(ctx) {
  const pr = this.rect();
  
  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(pr.x + pr.w / 2, pr.y + pr.h + 6, pr.w / 2 + 5, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  if (this.damaged) ctx.globalAlpha = 0.6;

  // ========== MAIN BODY (Gradient seperti Minion) ==========
  const bodyGradient = ctx.createLinearGradient(pr.x, pr.y, pr.x, pr.y + pr.h);
  bodyGradient.addColorStop(0, '#ff8866');  // Lebih terang dari minion
  bodyGradient.addColorStop(0.5, '#ff6b4a');
  bodyGradient.addColorStop(1, '#ff4422');  // Lebih gelap untuk depth
  ctx.fillStyle = bodyGradient;
  ctx.fillRect(pr.x, pr.y, pr.w, pr.h);

  // ========== HIGHLIGHT (Minion style) ==========
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fillRect(pr.x + pr.w * 0.15, pr.y + pr.h * 0.08, pr.w * 0.35, pr.h * 0.15);

  // ========== ARMOR PLATES (Makes it look Boss-like) ==========
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(pr.x + pr.w * 0.1, pr.y + pr.h * 0.3, pr.w * 0.8, pr.h * 0.08);
  ctx.fillRect(pr.x + pr.w * 0.1, pr.y + pr.h * 0.5, pr.w * 0.8, pr.h * 0.08);
  ctx.fillRect(pr.x + pr.w * 0.1, pr.y + pr.h * 0.7, pr.w * 0.8, pr.h * 0.08);

  // ========== ARMOR EDGES ==========
  ctx.strokeStyle = 'rgba(255, 100, 50, 0.6)';
  ctx.lineWidth = 2;
  ctx.strokeRect(pr.x + pr.w * 0.1, pr.y + pr.h * 0.3, pr.w * 0.8, pr.h * 0.08);
  ctx.strokeRect(pr.x + pr.w * 0.1, pr.y + pr.h * 0.5, pr.w * 0.8, pr.h * 0.08);
  ctx.strokeRect(pr.x + pr.w * 0.1, pr.y + pr.h * 0.7, pr.w * 0.8, pr.h * 0.08);

  // ========== LEFT EYE (Besar & Menakutkan) ==========
  const eyeW = pr.w * 0.22;
  const eyeH = pr.h * 0.28;
  const eyeLeftX = pr.x + pr.w * 0.18;
  const eyeLeftY = pr.y + pr.h * 0.25;

  ctx.fillStyle = '#000';
  ctx.fillRect(eyeLeftX, eyeLeftY, eyeW, eyeH);

  // Eye glow (lebih menakutkan)
  ctx.shadowColor = '#ff0000';
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#ff0000';
  ctx.beginPath();
  ctx.arc(eyeLeftX + eyeW / 2, eyeLeftY + eyeH / 2, eyeW / 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Eye shine (tapi lebih sedikit, untuk horror effect)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.beginPath();
  ctx.arc(eyeLeftX + eyeW * 0.3, eyeLeftY + eyeH * 0.3, eyeW * 0.15, 0, Math.PI * 2);
  ctx.fill();

  // ========== RIGHT EYE ==========
  const eyeRightX = pr.x + pr.w * 0.6;

  ctx.fillStyle = '#000';
  ctx.fillRect(eyeRightX, eyeLeftY, eyeW, eyeH);

  ctx.shadowColor = '#ff0000';
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#ff0000';
  ctx.beginPath();
  ctx.arc(eyeRightX + eyeW / 2, eyeLeftY + eyeH / 2, eyeW / 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.beginPath();
  ctx.arc(eyeRightX + eyeW * 0.3, eyeLeftY + eyeH * 0.3, eyeW * 0.15, 0, Math.PI * 2);
  ctx.fill();

  // ========== ANGRY MOUTH (Minion-style tapi menakutkan) ==========
  ctx.strokeStyle = '#000';
  ctx.lineWidth = Math.round(pr.w * 0.06);
  ctx.beginPath();
  ctx.arc(pr.x + pr.w / 2, pr.y + pr.h * 0.8, pr.w * 0.25, Math.PI * 0.2, Math.PI * 0.8, false);
  ctx.stroke();

  // ========== BOSS CROWN (Membedakan dari minion biasa) ==========
  ctx.fillStyle = '#ffff00';
  const crownY = pr.y - pr.h * 0.15;
  const crownX = pr.x + pr.w / 2;
  const crownSize = pr.w * 0.15;

  // Crown spikes
  for (let i = 0; i < 3; i++) {
    const angle = (i - 1) * 0.5;
    const spikeX = crownX + Math.cos(angle) * crownSize * 0.8;
    const spikeY = crownY - crownSize;
    const baseX = crownX + Math.cos(angle) * crownSize;
    const baseY = crownY - crownSize * 0.3;

    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.lineTo(spikeX, spikeY);
    ctx.lineTo(baseX - crownSize * 0.25, baseY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffaa00';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Crown base
  ctx.fillStyle = '#ffff00';
  ctx.fillRect(crownX - crownSize * 0.8, crownY - crownSize * 0.3, crownSize * 1.6, crownSize * 0.4);
  ctx.strokeStyle = '#ffaa00';
  ctx.lineWidth = 2;
  ctx.strokeRect(crownX - crownSize * 0.8, crownY - crownSize * 0.3, crownSize * 1.6, crownSize * 0.4);

  // ========== HEALTH BAR IMPROVED ==========
  const healthPercent = Math.max(0, this.health / this.maxHealth);
  const barWidth = pr.w * 0.9;
  const barHeight = pr.h * 0.08;
  const barX = pr.x + pr.w * 0.05;
  const barY = pr.y - barHeight - 8;

  // Bar background
  ctx.fillStyle = '#222';
  ctx.fillRect(barX, barY, barWidth, barHeight);

  // Bar border
  ctx.strokeStyle = '#ff6b4a';
  ctx.lineWidth = 2;
  ctx.strokeRect(barX, barY, barWidth, barHeight);

  // Health bar dengan gradient
  const healthGradient = ctx.createLinearGradient(barX, barY, barX, barY + barHeight);
  if (healthPercent > 0.5) {
    healthGradient.addColorStop(0, '#ffff44');
    healthGradient.addColorStop(1, '#ffaa00');
  } else if (healthPercent > 0.25) {
    healthGradient.addColorStop(0, '#ff8844');
    healthGradient.addColorStop(1, '#ff5522');
  } else {
    healthGradient.addColorStop(0, '#ff3333');
    healthGradient.addColorStop(1, '#cc0000');
  }

  ctx.fillStyle = healthGradient;
  ctx.fillRect(barX + 2, barY + 2, (barWidth - 4) * healthPercent, barHeight - 4);

  // ========== DAMAGE FLASH EFFECT ==========
  if (this.damaged) {
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(pr.x, pr.y, pr.w, pr.h);
    ctx.globalAlpha = 1;
  }

  ctx.globalAlpha = 1.0;
  ctx.shadowColor = 'transparent';
}
  }

  // ========== COIN CLASS ==========
  class Coin {
    constructor(x, y, groundY, value = 20) {
      this.x = x;
      this.groundY = groundY;
      this.y = y;
      this.r = Math.max(10, Math.round(H * 0.022));
      this.floatTimer = 0;
      this.targetFloatHeight = rint(15, 40);
      this.hasAttraction = false;
      this.value = value;
      this.spawnTime = performance.now();
      this.lifespan = 8000;
    }

    isExpired() {
      return (performance.now() - this.spawnTime) > this.lifespan;
    }

    rect() {
      return { x: this.x - this.r, y: this.y - this.r, w: this.r * 2, h: this.r * 2 };
    }

    update(dt, px, py) {
      if (this.isExpired()) return;

      this.floatTimer += dt;
      const fw = Math.sin(this.floatTimer * 3) * this.targetFloatHeight;
      this.y = this.groundY - this.r - this.targetFloatHeight + fw;

      const dist = distance(this.x, this.y, px, py);
      if (dist < 80) {
        this.hasAttraction = true;
        const angle = Math.atan2(py - this.y, px - this.x);
        this.x += Math.cos(angle) * W * 0.3 * dt;
        this.y += Math.sin(angle) * W * 0.2 * dt;
      }
    }

    draw(ctx) {
      if (this.isExpired()) {
        ctx.globalAlpha = Math.max(0, 1 - ((performance.now() - this.spawnTime - this.lifespan + 2000) / 2000));
      }

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.floatTimer * 4);

      if (this.hasAttraction) {
        ctx.fillStyle = 'rgba(255, 255, 100, 0.5)';
        ctx.beginPath();
        ctx.arc(0, 0, this.r + 8, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#ffd54a';
      ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, this.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#f0b81f';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#333';
      ctx.font = `bold ${this.r}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', 0, 1);

      ctx.shadowColor = 'transparent';
      ctx.restore();
      ctx.globalAlpha = 1;
    }
  }

  // ========== HP RECOVERY ITEM CLASS ==========
  class HPRecoveryItem {
    constructor(x, y, groundY) {
      this.x = x;
      this.y = y;
      this.groundY = groundY;
      this.r = 20;
      this.floatTimer = 0;
      this.targetFloatHeight = 25;
      this.hasAttraction = false;
      this.spawnTime = performance.now();
      this.lifespan = 8000;
      this.recoveryAmount = 0.25;
    }

    isExpired() {
      return (performance.now() - this.spawnTime) > this.lifespan;
    }

    rect() {
      return { x: this.x - this.r, y: this.y - this.r, w: this.r * 2, h: this.r * 2 };
    }

    update(dt, playerX, playerY) {
      if (this.isExpired()) return;

      this.floatTimer += dt;
      const fw = Math.sin(this.floatTimer * 2.5) * this.targetFloatHeight;
      this.y = this.groundY - this.r - this.targetFloatHeight + fw;

      const dx = playerX - this.x;
      const dy = playerY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 120) {
        this.hasAttraction = true;
        const angle = Math.atan2(dy, dx);
        this.x += Math.cos(angle) * 250 * dt;
        this.y += Math.sin(angle) * 200 * dt;
      }
    }

    draw(ctx) {
      if (this.isExpired()) {
        ctx.globalAlpha = Math.max(0, 1 - ((performance.now() - this.spawnTime - this.lifespan + 2000) / 2000));
      }

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.floatTimer * 3);

      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 20;

      ctx.fillStyle = 'rgba(0, 255, 136, 0.3)';
      ctx.beginPath();
      ctx.arc(0, 0, this.r + 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#00ff88';
      ctx.beginPath();
      ctx.arc(0, 0, this.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = `bold ${this.r * 1.4}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('❤️', 0, 0);

      ctx.restore();
      ctx.globalAlpha = 1;
    }
  }

  // ========== POWERUP CLASS ==========
  class PowerUp {
    constructor(x, y, type, groundY) {
      this.x = x;
      this.groundY = groundY;
      this.y = y;
      this.r = Math.round(H * 0.025);
      this.type = type;
      this.config = POWERUPS[type];
      this.floatTimer = 0;
      this.blink = 0;
      this.targetFloatHeight = rint(20, 50);
      this.hasAttraction = false;
      this.spawnTime = performance.now();
      this.lifespan = 8000;
    }

    isExpired() {
      return (performance.now() - this.spawnTime) > this.lifespan;
    }

    rect() {
      return { x: this.x - this.r, y: this.y - this.r, w: this.r * 2, h: this.r * 2 };
    }

    update(dt, px, py) {
      if (this.isExpired()) return;

      this.floatTimer += dt;
      this.blink += dt;

      const fw = Math.sin(this.floatTimer * 2.5) * this.targetFloatHeight;
      this.y = this.groundY - this.r - this.targetFloatHeight + fw;

      const dist = distance(this.x, this.y, px, py);
      if (dist < 80) {
        this.hasAttraction = true;
        const angle = Math.atan2(py - this.y, px - this.x);
        this.x += Math.cos(angle) * W * 0.35 * dt;
        this.y += Math.sin(angle) * W * 0.2 * dt;
      }
    }

    draw(ctx) {
      if (this.isExpired()) {
        ctx.globalAlpha = Math.max(0, 1 - ((performance.now() - this.spawnTime - this.lifespan + 2000) / 2000));
      }

      if (Math.floor(this.blink * 3) % 2 === 0) ctx.globalAlpha = 0.6;

      ctx.save();
      ctx.translate(this.x, this.y);

      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, this.r);
      g.addColorStop(0, this.config.color);
      g.addColorStop(1, 'transparent');
      ctx.shadowColor = this.config.color;
      ctx.shadowBlur = 20;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, this.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = this.config.color;
      ctx.beginPath();
      ctx.arc(0, 0, this.r * 0.7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = `bold ${this.r * 1.4}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.config.icon, 0, 0);

      ctx.shadowColor = 'transparent';
      ctx.restore();
      ctx.globalAlpha = 1;
    }
  }

  // ========== SPAWN COINS FUNCTION ==========
  function spawnCoinsFromMinion(x, groundY) {
    const coinCount = rint(3, 4);
    
    for (let i = 0; i < coinCount; i++) {
      const offsetX = rand(-40, 40);
      const offsetY = rand(-10, 30);
      coins.push(new Coin(x + offsetX, groundY - 20 + offsetY, groundY, 20));
    }
  }

  // ========== GAME STATE ==========
    let lastTime = performance.now() / 1000;
    let running = false;
    let paused = false;
    let bossDefeatedUI = null;
    let playerDead = false;
    let deathAnimation = null;
    let gameOverShown = false;

    const textureGenerator = new TextureGenerator();
    let particles = [];


  // ========== SPAWN PARTICLES FUNCTION ==========
function spawnParticles(x, y, color, count, speed, type = 'normal') {
  for (let i = 0; i < count; i++) {
    const angle = (Math.random() * Math.PI * 2);
    const particleSpeed = speed + Math.random() * speed * 0.5;
    const vx = Math.cos(angle) * particleSpeed;
    const vy = Math.sin(angle) * particleSpeed - 100;
    const life = Math.random() * 0.8 + 0.4;
    const size = Math.random() * 6 + 2;
    
    particles.push(new Particle(x, y, vx, vy, color, life, size, type));
  }
}


  let currentStage = 1;
let spawnInterval = 3.0;
let timeSinceSpawn = 0;
let bossDefeatedTimer = 0;  // ← Countdown timer

let bullets = [];
let minions = [];
let bosses = [];
let coins = [];
let powerups = [];
let recoveryItems = [];
let mountains = [];
let player = null;
let score = 0;
let sessionCoins = 0;
let minionKills = 0;
let bossKills = 0;
let nextBossScore = 10000;
let highscore = parseInt(localStorage.getItem(HIGHKEY) || '0', 10);
let waveNumber = 0;

const scoreManager = new ScoreManager();
const bossStageManager = new BossStageManager();
const input = { left: false, right: false, shoot: false, jump: false };

  // ========== GENERATE MOUNTAINS ==========
  function generateMountains() {
    mountains = [];
    const colors = ['#8b6f47', '#a0845f', '#755a3f', '#9d7d5f', '#806b45'];
    let x = -100;
    while (x < W * 2.5) {
      const h = rint(150, 350);
      const w = rint(200, 400);
      const y = H - GROUND_H - h;
      const color = colors[rint(0, colors.length - 1)];
      mountains.push(new Mountain(x, y, w, h, color));
      x += w + rint(50, 150);
    }
  }

  // ========== START GAME ==========
  function startGame() {
    player = new Player(W / 2, H - GROUND_H);
    bullets = [];
    minions = [];
    bosses = [];
    coins = [];
    powerups = [];
    recoveryItems = [];
    particles = [];
    generateMountains();

    score = 0;
    scoreManager.baseScore = 0;
    sessionCoins = 0;
    minionKills = 0;
    bossKills = 0;

    waveNumber = 0;
    nextBossScore = 10000;
    spawnInterval = 3.0;
    timeSinceSpawn = 0;
    currentStage = 1;
    running = true;
    paused = false;

    bossStageManager.currentStage = 1;
    bossStageManager.bossDefeated = false;
    bossStageManager.nextBossScore = 10000;
    bossStageManager.bossSpawned = false;

    if (typeof bgmManager !== 'undefined') {
    bgmManager.play('gameplay', true); // Looping gameplay music
    }

    initGameAudio();
  }

  // ========== SPAWN WAVE MINIONS ==========
  function spawnWaveMinions() {
    let minionCount = 1;
    let spawnDelay = 0;

    if (waveNumber % 4 === 0) {
      minionCount = 1;
      spawnDelay = 0;
    } else if (waveNumber % 4 === 1) {
      minionCount = 2;
      spawnDelay = 0.9;
    } else if (waveNumber % 4 === 2) {
      minionCount = 2;
      spawnDelay = 0;
    } else {
      minionCount = 3;
      spawnDelay = 1.2;
    }

    for (let i = 0; i < minionCount; i++) {
      setTimeout(() => {
        if (running && bosses.length === 0) {
          const x = W + 50 + i * 150;
          const m = new Minion(x, H - GROUND_H, Math.floor(score / 1000), player.baseDamage);
          minions.push(m);
          playSound(500 + i * 80, 0.08, 'sine', 0.12);
        }
      }, spawnDelay * i * 1000);
    }
    waveNumber++;
  }

  // ========== SPAWN BOSS ==========
  function spawnBoss() {
    if (!bossStageManager.spawnBoss()) return;
    
    const boss = new BossMinion(W + 50, H - GROUND_H, bossKills, player.baseDamage);
    bosses.push(boss);
    bossStageManager.currentBoss = boss; // ← TRACKING
    
    playSound(200, 0.5, 'sine', 0.4);
    spawnParticles(W + 50, H / 2, '#ff6b4a', 20, 300);
  }

  // ========== UPDATE FUNCTION ==========
  function update(dt) {
    if (!running || paused) return;

    if (bossDefeatedTimer > 0) {
        bossDefeatedTimer -= dt;
        if (bossDefeatedTimer <= 0) {
            bossDefeatedTimer = 0;
            // Reset untuk stage baru
            spawnWaveMinions();
        }
    }
    

    scoreEl.textContent = score;
    sessionCoinsEl.textContent = sessionCoins;
    highEl.textContent = highscore;
    
    const stageEl = document.getElementById('stage');
    if (stageEl) {
      stageEl.textContent = bossStageManager.getStage();
    }

    bossStageManager.update(dt);

    // ✅ SPAWN BOSS JIKA KONDISI TERCAPAI
    if (bossStageManager.shouldSpawnBoss(score)) {
      spawnBoss();
    }

    if (bossStageManager.shouldSpawnBoss(score)) {
      spawnBoss();
    }

    timeSinceSpawn += dt;
    if (timeSinceSpawn >= spawnInterval && bosses.length === 0 && !bossStageManager.showingVictoryScreen) {
      spawnWaveMinions();
      timeSinceSpawn = 0;
    }

    // ========== HANDLE DEATH ANIMATION
  if (playerDead && deathAnimation) {
    const animationDone = deathAnimation.update(dt);

    if (animationDone && !gameOverShown) {
      gameOverShown = true;
      // ✅ Ubah delay dari 500ms menjadi 700ms
      setTimeout(() => {
        showGameOverModal(score, sessionCoins, minionKills, bossKills, highscore, bossStageManager.getStage());
      }, 1000); // 0.7 detik (ubah dari 500)
    }
    return;
}
function update(dt) {
  if (!running || paused) return;

  // ========== HANDLE DEATH ANIMATION DULU ==========
  if (playerDead && deathAnimation) {
    const animationDone = deathAnimation.update(dt);

    if (animationDone && !gameOverShown) {
      gameOverShown = true;
      setTimeout(() => {
        showGameOverModal(score, sessionCoins, minionKills, bossKills, highscore, bossStageManager.getStage());
      }, 1000);
    }
    return; // ✅ RETURN setelah handle death
  }


  // ========== REST OF NORMAL UPDATE LOGIC ==========
    scoreEl.textContent = score;
    sessionCoinsEl.textContent = sessionCoins;
    highEl.textContent = highscore;
    
    const stageEl = document.getElementById('stage');
    if (stageEl) {
      stageEl.textContent = bossStageManager.getStage();
    }


}
  


    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update(dt);
      if (particles[i].life <= 0) particles.splice(i, 1);
    }

    for (let i = bullets.length - 1; i >= 0; i--) {
      bullets[i].update(dt);
      if (bullets[i].x > W + 200) bullets.splice(i, 1);
    }

    // ========== MINION UPDATE & COLLISION ==========
    for (let i = minions.length - 1; i >= 0; i--) {
      const m = minions[i];
      m.update(dt, player.freezeActive);

      // Bullet collision
      for (let j = bullets.length - 1; j >= 0; j--) {
        const b = bullets[j];
        if (rectsOverlap(b.rect(), m.rect())) {
          m.takeDamage(b.damage);
          bullets.splice(j, 1);

          m.startDeathAnimation();{


            const groundY = H - GROUND_H;
            spawnCoinsFromMinion(m.x, groundY);

            if (Math.random() < 0.05) {  // ← Dikurangi dari 0.10 menjadi 0.05
              recoveryItems.push(new HPRecoveryItem(m.x + rand(-30, 30), groundY - 25, groundY));
            }

            if (Math.random() < 0.4) {
              const types = Object.keys(POWERUPS);
              const type = types[rint(0, types.length - 1)];
              powerups.push(new PowerUp(m.x, groundY - 25, type, groundY));
            }

            minionKills++;
            scoreManager.addScore(200, 'kill');
            score = scoreManager.getTotalScore();
            comboEl.textContent = `x${scoreManager.getComboMultiplier()} COMBO`;

            sessionCoinsEl.textContent = sessionCoins;
            playSound(800, 0.12, 'sine', 0.28);
            
            // ✅ LANGSUNG HAPUS dari array
            minions.splice(i, 1);
            break;
          }
          break;
        }
      }

      // Player collision
      if (i < minions.length && rectsOverlap(player.rect(), m.rect())) {
  const damageResult = player.takeDamage();
  
  if (damageResult === false) {
    playerDead = true;
    deathAnimation = new PlayerDeathAnimation(player);
    running = false;
    paused = false;
    
    minions = [];
    bullets = [];
    bosses = [];
    
    if (score > highscore) {
      highscore = score;
      localStorage.setItem(HIGHKEY, String(highscore));
    }
    
    // ✅ PAKAI DELAY 700ms
    if (!gameOverShown) {
      gameOverShown = true;
      setTimeout(() => {
        showGameOverModal(score, sessionCoins, minionKills, bossKills, highscore, bossStageManager.getStage());
      }, 1000);
    }
    return;
  }
  
  else if (damageResult === true) {
    // Damage diterima tapi masih hidup
    minions.splice(i, 1);
  }
}
    }

    // ========== BOSS UPDATE & COLLISION ==========
    for (let i = bosses.length - 1; i >= 0; i--) {
      const b = bosses[i];
      b.update(dt, player.freezeActive);

      // Bullet collision
      for (let j = bullets.length - 1; j >= 0; j--) {
        const bl = bullets[j];
        if (rectsOverlap(bl.rect(), b.rect())) {
          b.takeDamage(bl.damage);
          bullets.splice(j, 1);
          score += 50;

                // ✅ CHECK JIKA BOSS MATI
          if (b.health <= 0) {
            const groundY = H - GROUND_H;

            // Spawn drops
            for (let k = 0; k < 3; k++) {
              spawnCoinsFromMinion(b.x + rand(-60, 60), groundY);
            }

            for (let w = 0; w < 3; w++) {
              recoveryItems.push(new HPRecoveryItem(b.x + rand(-60, 60), groundY - 40, groundY));
            }

            const types = Object.keys(POWERUPS);
            const type = types[rint(0, types.length - 1)];
            powerups.push(new PowerUp(b.x, groundY - 25, type, groundY));

            bossKills++;
            score += 2000; // ← BONUS SCORE untuk boss kill
            sessionCoins += 500; // ← BONUS COINS

            // ✅ TRIGGER VICTORY
            bossStageManager.onBossDefeated();
            
            playSound(1200, 0.4, 'sine', 0.4);
            spawnParticles(b.centerX(), b.centerY(), '#ffff00', 40, 350, 'sparkle');

            // ✅ REMOVE BOSS DARI ARRAY
            bosses.splice(i, 1);
            break;
          }
          break;
        }
      }

  if (i < bosses.length && rectsOverlap(player.rect(), b.rect())) {
        const damageResult = player.takeDamage();
        if (damageResult === false) {
          // Player mati
          playerDead = true;
          deathAnimation = new PlayerDeathAnimation(player);
          running = false;
          paused = false;

          minions = [];
          bullets = [];
          bosses = [];
          
          if (score > highscore) {
            highscore = score;
            localStorage.setItem(HIGHKEY, String(highscore));
          }
          
          if (!gameOverShown) {
            gameOverShown = true;
            setTimeout(() => {
              showGameOverModal(score, sessionCoins, minionKills, bossKills, highscore, bossStageManager.getStage());
            }, 1000);
          }
          return;
        }
      }
  // Boss keluar dari screen (jangan hapus, boss harus tetap ada)
      if (i < bosses.length && b.x < -300) {
         b.x = W + 50;
      }
    }
    // Update coins
for (let i = coins.length - 1; i >= 0; i--) {
  const c = coins[i];
  c.update(dt, player.centerX(), player.centerY());

  if (rectsOverlap(player.rect(), c.rect())) {
    coins.splice(i, 1);
    sessionCoins += c.value;  // ✅ HANYA TAMBAH COINS, BUKAN SCORE
    playerStats.addCoins(c.value);
    // ❌ HAPUS: score += 50;  <- Baris ini dihapus agar score tidak bertambah
    playSound(600, 0.08, 'sine', 0.2);
    spawnParticles(player.centerX(), player.centerY(), '#ffd54a', 6, 120);
  } else if (c.isExpired()) {
    coins.splice(i, 1);
  }
}

    // Update recovery items
    for (let i = recoveryItems.length - 1; i >= 0; i--) {
      const item = recoveryItems[i];
      item.update(dt, player.centerX(), player.centerY());

      if (rectsOverlap(player.rect(), item.rect())) {
        player.heal(item.recoveryAmount);
        recoveryItems.splice(i, 1);
        score += 100;
        playSound(900, 0.15, 'sine', 0.3);
      } else if (item.isExpired()) {
        recoveryItems.splice(i, 1);
      }
    }

    // Update powerups
    for (let i = powerups.length - 1; i >= 0; i--) {
      const p = powerups[i];
      p.update(dt, player.centerX(), player.centerY());

      if (rectsOverlap(player.rect(), p.rect())) {
        const type = p.type;
        if (type === 'RAPID_FIRE') {
          player.rapidFireActive = true;
          player.rapidFireTimer = POWERUPS.RAPID_FIRE.duration;
          player.activatePowerup(type, POWERUPS.RAPID_FIRE, POWERUPS.RAPID_FIRE.duration);
        } else if (type === 'SHIELD') {
          player.shieldActive = true;
          player.shieldTimer = POWERUPS.SHIELD.duration;
          player.activatePowerup(type, POWERUPS.SHIELD, POWERUPS.SHIELD.duration);
        } else if (type === 'FREEZE') {
          player.freezeActive = true;
          player.freezeTimer = POWERUPS.FREEZE.duration;
          player.activatePowerup(type, POWERUPS.FREEZE, POWERUPS.FREEZE.duration);
        } else if (type === 'DAMAGE') {
          player.damageMultiplier += 0.5;
          player.activatePowerup(type, POWERUPS.DAMAGE, 10);
          spawnParticles(player.centerX(), player.centerY(), '#ff1111', 12, 220);
        } else if (type === 'FIRE_RATE') {
          player.fireRateBoostActive = true;
          player.fireRateBoostTimer = POWERUPS.FIRE_RATE.duration;
          player.activatePowerup(type, POWERUPS.FIRE_RATE, POWERUPS.FIRE_RATE.duration);
        } else if (type === 'BULLET_SPLIT') {
          player.bulletSplitActive = true;
          player.bulletSplitTimer = POWERUPS.BULLET_SPLIT.duration;
          player.activatePowerup(type, POWERUPS.BULLET_SPLIT, POWERUPS.BULLET_SPLIT.duration);
        } else if (type === 'MISSILE') {
          player.missileActive = true;
          player.missileTimer = POWERUPS.MISSILE.duration;
          player.activatePowerup(type, POWERUPS.MISSILE, POWERUPS.MISSILE.duration);
        }

        powerups.splice(i, 1);
        score += 150;
        playSound(1000, 0.15, 'sine', 0.3);
      } else if (p.isExpired()) {
        powerups.splice(i, 1);
      }
    }

    scoreManager.update(dt);
    bossStageManager.update(dt);
    player.update(dt, input);

    if (input.shoot && running && player.canShoot()) {
      const bulletY = player.y + player.h / 2;
      const damage = player.getDamage();

      if (player.missileActive) {
        bullets.push(new Bullet(player.x + player.w, bulletY, damage, 'missile'));
      } else if (player.bulletSplitActive) {
        bullets.push(new Bullet(player.x + player.w, bulletY - 20, damage, 'normal'));
        bullets.push(new Bullet(player.x + player.w, bulletY, damage, 'normal'));
        bullets.push(new Bullet(player.x + player.w, bulletY + 20, damage, 'normal'));
      } else {
        bullets.push(new Bullet(player.x + player.w, bulletY, damage, 'normal'));
      }

      player.shoot();
    }
  }

    // ========== SCREEN EFFECTS ========== ✅ TAMBAH DI SINI
  function drawScreenEffects() {
    // Add subtle vignette effect
    const vignetteGradient = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H));
    vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignetteGradient.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
    ctx.fillStyle = vignetteGradient;
    ctx.fillRect(0, 0, W, H);

    // Add light rays during intense moments
    if (score > 5000 && (Math.sin(performance.now() / 1000) > 0.9)) {
      ctx.fillStyle = 'rgba(255, 255, 200, 0.05)';
      for (let i = 0; i < 5; i++) {
        const startX = (i / 5) * W;
        const gradient = ctx.createLinearGradient(startX, 0, startX + 100, H);
        gradient.addColorStop(0, 'rgba(255, 255, 200, 0.05)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 200, 0.02)');
        gradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(startX, 0, 100, H);
      }
    }
  }
  
  if (bossDefeatedTimer > 0) {
  const remainingTime = Math.ceil(bossDefeatedTimer);
  
  // Semi-transparent overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, 0, W, H);
  
  // Pulsing background effect
  const pulse = Math.sin(performance.now() / 300) * 0.15 + 0.85;
  ctx.fillStyle = `rgba(0, 255, 136, ${pulse * 0.1})`;
  ctx.fillRect(0, 0, W, H);
  
  // ✅ STAGE UPGRADE DISPLAY
  ctx.font = 'bold 80px Arial';
  ctx.fillStyle = '#00ff88';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur = 40;
  ctx.fillText('VICTORY!', W / 2, H / 2 - 100);
  
  // Stage info
  ctx.font = 'bold 48px Arial';
  ctx.fillStyle = '#ffff00';
  ctx.shadowColor = '#ffff00';
  ctx.shadowBlur = 30;
  ctx.fillText(`STAGE ${currentStage}`, W / 2, H / 2 - 20);
  
  // Next stage preview
  ctx.font = 'bold 32px Arial';
  ctx.fillStyle = '#00ffff';
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 20;
  ctx.fillText(`GET READY FOR STAGE ${currentStage + 1}`, W / 2, H / 2 + 60);
  
  // Countdown timer
  ctx.font = 'bold 40px Arial';
  ctx.fillStyle = remainingTime <= 1 ? '#ff6b4a' : '#ffaa00';
  ctx.shadowColor = ctx.fillStyle;
  ctx.shadowBlur = 15;
  ctx.fillText(`${remainingTime}`, W / 2, H / 2 + 140);
  
  // Progress bar
  const barWidth = 300;
  const barHeight = 20;
  const progress = Math.max(0, 1 - (bossDefeatedTimer / 3.5));
  
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 3;
  ctx.strokeRect(W / 2 - barWidth / 2, H / 2 + 190, barWidth, barHeight);
  
  ctx.fillStyle = '#00ff88';
  ctx.fillRect(W / 2 - barWidth / 2 + 2, H / 2 + 192, (barWidth - 4) * progress, barHeight - 4);
  
  ctx.shadowColor = 'transparent';
}

  // ========== DRAW FUNCTION ==========
  function draw() {
    // Draw textured sky
    const skyPattern = ctx.createPattern(textureGenerator.skyTexture, 'repeat');
    ctx.fillStyle = skyPattern;
    ctx.fillRect(0, 0, W, H);

    // Add atmospheric gradient
    const atmosphereGradient = ctx.createLinearGradient(0, 0, 0, H);
    atmosphereGradient.addColorStop(0, 'rgba(255, 200, 100, 0)');
    atmosphereGradient.addColorStop(0.3, 'rgba(255, 200, 100, 0.02)');
    atmosphereGradient.addColorStop(1, 'rgba(100, 150, 200, 0.1)');
    ctx.fillStyle = atmosphereGradient;
    ctx.fillRect(0, 0, W, H);

    // Draw far mountains (parallax layer 1)
    ctx.globalAlpha = 0.5;
    for (const m of mountains) {
      if (m.x + m.w > -W && m.x < W * 2) {
        const offsetX = (m.x - W * 0.2) * 0.3;
        ctx.save();
        ctx.translate(offsetX, 0);
        m.draw(ctx);
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;

    // Draw near mountains
    for (const m of mountains) {
      if (m.x + m.w > -W && m.x < W * 2) {
        m.draw(ctx);
      }
    }

    // Draw textured ground
    const grassPattern = ctx.createPattern(textureGenerator.grassTexture, 'repeat');
    ctx.fillStyle = grassPattern;
    ctx.fillRect(0, H - GROUND_H, W, GROUND_H);

    // Ground edge highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, H - GROUND_H, W, 4);

    // Draw shadow under ground
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, H - GROUND_H + 4, W, 8);

    // Draw game objects with enhanced effects
      for (const m of minions) m.draw(ctx);
      for (const b of bosses) b.draw(ctx);
      for (const bl of bullets) bl.draw(ctx);
      for (const c of coins) c.draw(ctx);
      for (const item of recoveryItems) item.draw(ctx);
      for (const p of powerups) p.draw(ctx);
      for (const part of particles) part.draw(ctx);

    // Draw player
    player.draw(ctx);

    // Draw screen effects
    drawScreenEffects();

    // ✨ DRAW BOSS INTRO SCREEN
    bossStageManager.drawBossIntro(ctx);

    // ✨ DRAW VICTORY COUNTDOWN - TAMPIL SELAMA 5 DETIK
  bossStageManager.drawVictoryCountdown(ctx);

   // ✨ CEK DEATH ANIMATION
  if (playerDead && deathAnimation) {
      deathAnimation.draw(ctx);
    }

    // ========== DRAW STAGE CLEAR COUNTDOWN ==========
    if (bossDefeatedTimer > 0) {
      const remainingTime = Math.ceil(bossDefeatedTimer);
      
      // Semi-transparent overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, W, H);
      
      // Pulsing background effect
      const pulse = Math.sin(performance.now() / 300) * 0.15 + 0.85;
      ctx.fillStyle = `rgba(0, 255, 136, ${pulse * 0.1})`;
      ctx.fillRect(0, 0, W, H);
      
      // VICTORY text
      ctx.font = 'bold 80px Arial';
      ctx.fillStyle = '#00ff88';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 40;
      ctx.fillText('VICTORY!', W / 2, H / 2 - 100);
      
      // Stage info
      ctx.font = 'bold 48px Arial';
      ctx.fillStyle = '#ffff00';
      ctx.shadowColor = '#ffff00';
      ctx.shadowBlur = 30;
      ctx.fillText(`STAGE ${currentStage}`, W / 2, H / 2 - 20);
      
      // Next stage preview
      ctx.font = 'bold 32px Arial';
      ctx.fillStyle = '#00ffff';
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 20;
      ctx.fillText(`GET READY FOR STAGE ${currentStage + 1}`, W / 2, H / 2 + 60);
      
      // Countdown timer
      ctx.font = 'bold 40px Arial';
      ctx.fillStyle = remainingTime <= 1 ? '#ff6b4a' : '#ffaa00';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 15;
      ctx.fillText(`${remainingTime}`, W / 2, H / 2 + 140);
      
      // Progress bar
      const barWidth = 300;
      const barHeight = 20;
      const progress = Math.max(0, 1 - (bossDefeatedTimer / 3.5));
      
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 3;
      ctx.strokeRect(W / 2 - barWidth / 2, H / 2 + 190, barWidth, barHeight);
      
      ctx.fillStyle = '#00ff88';
      ctx.fillRect(W / 2 - barWidth / 2 + 2, H / 2 + 192, (barWidth - 4) * progress, barHeight - 4);
      
      ctx.shadowColor = 'transparent';
    }
  }

  // ========== MAIN LOOP ==========
  function gameLoop() {
    const now = performance.now() / 1000;
    const dt = Math.min(now - lastTime, 0.016);
    lastTime = now;
    

    if (!paused) {
      update(dt);
    }
    draw();

    requestAnimationFrame(gameLoop);
  }

  // ========== EVENT LISTENERS ==========
  document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') input.left = true;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') input.right = true;
    if (e.code === 'Space') {
      e.preventDefault();
      input.jump = true;
      player.jump();
    }
    if (e.code === 'KeyP') {
      e.preventDefault();
      paused = !paused;
      if (paused) {
        showPauseModal();
      } else {
        hidePauseModal();
      }
    }
  });

  document.addEventListener('keyup', (e) => {
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') input.left = false;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') input.right = false;
    if (e.code === 'Space') input.jump = false;
  });

  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
      input.shoot = true;
      if (!running) startGame();
    }
  });

  canvas.addEventListener('mouseup', (e) => {
    if (e.button === 0) input.shoot = false;
  });

  canvas.addEventListener('mouseleave', () => {
    input.shoot = false;
  });

  canvas.addEventListener('touchstart', (ev) => {
    input.shoot = true;
    if (!running) startGame();
  }, { passive: true });

  canvas.addEventListener('touchend', () => {
    input.shoot = false;
  }, { passive: true });

  pauseBtn.addEventListener('click', () => {
    paused = !paused;
    if (paused) {
      showPauseModal();
      pauseBtn.textContent = '▶ RESUME';
    } else {
      hidePauseModal();
      pauseBtn.textContent = '⏸ PAUSE';
    }
  });

   window.restartGameFromGameOver = function() {
    location.reload();
  };
  
  window.goToMenu = function() {
  if (score > highscore) {
    highscore = score;
    localStorage.setItem(HIGHKEY, String(highscore));
  }
  if (bgmAudio) {
    bgmAudio.pause();
  }
  // ✅ Gunakan loading screen
  sessionStorage.setItem('loadingTarget', 'menu.html');
  window.location.href = 'loading.html';
  };

  window.goToMenuFromGameOver = function() {
  if (score > highscore) {
    highscore = score;
    localStorage.setItem(HIGHKEY, String(highscore));
  }
  if (bgmAudio) {
    bgmAudio.pause();
  }

  sessionStorage.setItem('loadingTarget', 'menu.html');
  window.location.href = 'loading.html';
  };

  // ========== INITIALIZATION ==========
  initBGM();
  highEl.textContent = highscore;
  startGame();
  gameLoop();
})();
