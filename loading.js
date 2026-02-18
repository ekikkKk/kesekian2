// ========== LOADING SCREEN CONFIG ==========
const LOADING_TIPS = [
  '💡 Tip: Press SPACE to jump and avoid obstacles!',
  '💡 Tip: Collect coins to upgrade your stats in the shop!',
  '💡 Tip: Defeat bosses to progress to the next stage!',
  '💡 Tip: Use powerups strategically to maximize damage!',
  '💡 Tip: Keep moving to avoid enemy minions!',
  '💡 Tip: Shield powerup protects you once from damage!',
  '💡 Tip: Freeze powerup slows down all enemies!',
  '💡 Tip: Rapid Fire powerup increases fire rate 2.5x!',
  '💡 Tip: Bullet Split fires 3 bullets at once!',
  '💡 Tip: Build up combo multiplier for more points!'
];

const LOADING_MESSAGES = [
  'Initializing game engine...',
  'Loading character assets...',
  'Preparing terrain...',
  'Setting up audio system...',
  'Configuring controls...',
  'Loading player stats...',
  'Syncing game data...',
  'Finalizing resources...'
];

class LoadingScreen {
  constructor() {
    this.progress = 0;
    this.targetProgress = 0;
    this.messageIndex = 0;
    this.tipIndex = 0;
    this.startTime = Date.now();
    this.minLoadTime = 2000; // Minimum 2 seconds loading
    this.maxLoadTime = 4000; // Maximum 4 seconds loading
    
    this.init();
  }

  init() {
    this.progressBar = document.getElementById('progressBar');
    this.progressPercent = document.getElementById('progressPercent');
    this.tipsText = document.getElementById('tipsText');
    this.statusMessage = document.getElementById('statusMessage');

    // Simulate progress
    this.simulateProgress();

    // Rotate tips every 3 seconds
    setInterval(() => this.updateTip(), 3000);

    // Update status messages
    setInterval(() => this.updateStatus(), 1500);

    // Start smooth animation loop
    this.animationLoop();
  }

  simulateProgress() {
    // Generate random progress pattern
    const stages = [
      { progress: 15, delay: 300 },
      { progress: 30, delay: 600 },
      { progress: 50, delay: 900 },
      { progress: 70, delay: 1200 },
      { progress: 85, delay: 1500 },
      { progress: 95, delay: 1800 }
    ];

    stages.forEach(stage => {
      setTimeout(() => {
        this.targetProgress = stage.progress;
      }, stage.delay);
    });

    // Complete loading
    setTimeout(() => {
      this.targetProgress = 100;
    }, this.maxLoadTime - 500);
  }

  updateTip() {
    this.tipIndex = (this.tipIndex + 1) % LOADING_TIPS.length;
    this.tipsText.textContent = LOADING_TIPS[this.tipIndex];
  }

  updateStatus() {
    this.messageIndex = (this.messageIndex + 1) % LOADING_MESSAGES.length;
    this.statusMessage.textContent = LOADING_MESSAGES[this.messageIndex];
  }

  animationLoop() {
    // Smooth progress bar animation
    if (this.progress < this.targetProgress) {
      this.progress += (this.targetProgress - this.progress) * 0.05;
    }

    const progressValue = Math.round(this.progress);
    this.progressBar.style.width = progressValue + '%';
    this.progressPercent.textContent = progressValue + '%';

    // Check if loading complete
    if (progressValue >= 99) {
      const elapsedTime = Date.now() - this.startTime;
      if (elapsedTime >= this.minLoadTime) {
        this.complete();
        return;
      }
    }

    requestAnimationFrame(() => this.animationLoop());
  }

  complete() {
    // Final animation
    this.statusMessage.textContent = '✓ Ready to play!';
    this.progressBar.style.width = '100%';
    this.progressPercent.textContent = '100%';

    // Redirect after slight delay
    setTimeout(() => {
      const target = sessionStorage.getItem('loadingTarget') || 'menu.html';
      window.location.href = target;
    }, 500);
  }
}

// Initialize loading screen
window.addEventListener('DOMContentLoaded', () => {
  new LoadingScreen();
});