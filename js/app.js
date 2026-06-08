/**
 * ===================================================
 * 偶像模拟器 - 主控制器
 * Idol Simulator - Main Application Controller
 *
 * 负责屏幕切换、游戏流程控制、全局初始化
 * ===================================================
 */

const App = {
  /** 当前屏幕 ID */
  currentScreen: null,

  /**
   * 应用初始化 — 页面加载时调用
   */
  init() {
    this.checkSaveExists();
  },

  /**
   * 切换屏幕
   * @param {string} screenId - 'title' | 'create' | 'game' | 'gameover'
   */
  switchScreen(screenId) {
    // 隐藏所有屏幕
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

    // 显示目标屏幕
    const target = document.getElementById(`screen-${screenId}`);
    if (target) {
      target.classList.add('active');
      this.currentScreen = screenId;
    }

    // 如果是游戏主界面，渲染所有面板
    if (screenId === 'game') {
      this.renderGame();
    }
  },

  /**
   * 渲染游戏主界面所有面板
   */
  renderGame() {
    UI.renderHeader();
    UI.renderStats();
    Schedule.render();
    UI.renderLog();

    // 检查是否应该触发游戏结束（极端情况）
    const chara = GameState.data.character;
    if (chara.health <= 0) {
      this.showGameOver('因健康问题退出演艺圈');
    } else if (chara.stress >= 100) {
      this.showGameOver('因压力过大无法继续');
    }
  },

  /**
   * 开始新游戏 → 角色创建
   */
  startNewGame() {
    // 如果有存档，先询问是否覆盖
    if (GameState.hasSave()) {
      if (!confirm('当前有存档，开始新游戏将覆盖原有存档，确定吗？')) return;
    }
    GameState.reset();
    CharacterCreator.render();
    this.switchScreen('create');
  },

  /**
   * 继续游戏 — 读取存档
   */
  continueGame() {
    if (!GameState.hasSave()) {
      UI.showToast('没有找到存档，请开始新游戏', 'warning');
      return;
    }
    if (GameState.load()) {
      this.switchScreen('game');
      UI.showToast('读档成功！🌟', 'success');
    } else {
      UI.showToast('读档失败，存档可能已损坏', 'error');
    }
  },

  /**
   * 重置游戏 — 清除所有数据
   */
  resetGame() {
    if (!GameState.hasSave()) {
      UI.showToast('没有存档需要重置', 'info');
      return;
    }
    if (confirm('确定要重置游戏吗？所有进度将丢失！')) {
      GameState.reset();
      UI.showToast('游戏已重置', 'info');
      // 刷新标题界面
      this.checkSaveExists();
      document.querySelector('#screen-title .continue-btn')?.classList.add('hidden');
    }
  },

  /**
   * 存档
   */
  saveGame() {
    if (GameState.save()) {
      UI.showToast('存档成功 💾', 'success');
    }
  },

  /**
   * 读档 (游戏内)
   */
  loadGame() {
    if (GameState.load()) {
      this.renderGame();
      UI.showToast('读档成功 📂', 'success');
    } else {
      UI.showToast('没有找到存档', 'warning');
    }
  },

  /**
   * 显示游戏结束画面
   */
  showGameOver(reason) {
    const chara = GameState.data.character;
    const stage = CONFIG.STAGES.find(s => s.id === chara.stage);
    const container = document.getElementById('screen-gameover');
    const content = container.querySelector('.gameover-content');

    // 计算评分 (简单版)
    const totalFans = chara.fans;
    const highestStage = stage ? stage.name : '练习生';
    const score = totalFans + (CONFIG.STAGES.findIndex(s => s.id === chara.stage) * 10000);

    content.innerHTML = `
      <div class="glass-card p-8 text-center" style="animation: fadeIn .5s ease-out;">
        <div class="text-5xl mb-4">🎬</div>
        <h2 class="text-2xl font-bold mb-2">演艺生涯结束</h2>
        <p class="text-white/60 mb-6">${reason}</p>

        <div class="grid grid-cols-2 gap-4 mb-6 text-left">
          <div class="bg-white/5 rounded-xl p-4">
            <div class="text-xs text-white/40">角色</div>
            <div class="font-bold">${chara.name}</div>
          </div>
          <div class="bg-white/5 rounded-xl p-4">
            <div class="text-xs text-white/40">最高阶段</div>
            <div class="font-bold">${highestStage}</div>
          </div>
          <div class="bg-white/5 rounded-xl p-4">
            <div class="text-xs text-white/40">累计粉丝</div>
            <div class="font-bold text-purple-400">${UI.formatNum(totalFans)}</div>
          </div>
          <div class="bg-white/5 rounded-xl p-4">
            <div class="text-xs text-white/40">存活天数</div>
            <div class="font-bold">${chara.day} 天</div>
          </div>
        </div>

        <div class="glass-card p-4 mb-6">
          <div class="text-sm text-white/60 mb-1">最终评分</div>
          <div class="text-3xl font-bold gradient-text">${score.toLocaleString()}</div>
        </div>

        <button onclick="App.backToTitle()" class="btn-gradient w-full py-3">
          🏠 回到标题
        </button>
      </div>
    `;

    this.switchScreen('gameover');
  },

  /** 回到标题 */
  backToTitle() {
    this.checkSaveExists();
    this.switchScreen('title');
  },

  /** 检查存档是否存在，更新标题界面 */
  checkSaveExists() {
    const hasSave = GameState.hasSave();
    const continueBtn = document.querySelector('#screen-title .continue-btn');
    if (continueBtn) {
      continueBtn.classList.toggle('hidden', !hasSave);
    }
  }
};

// ========== 页面加载完成后初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
