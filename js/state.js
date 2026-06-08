/**
 * ===================================================
 * 偶像模拟器 - 游戏状态管理
 * Idol Simulator - Game State Management
 *
 * 负责游戏数据的创建、保存、读取、重置
 * 使用 localStorage 实现本地存档
 * ===================================================
 */

const GameState = {
  /** 当前游戏数据 */
  data: null,

  /**
   * 创建新游戏角色
   * @param {Object} info - 角色信息 { name, gender, talent, tags }
   */
  createCharacter(info) {
    // 基础属性
    const stats = { ...CONFIG.INITIAL_STATS };

    // 1) 应用天赋加成
    const talent = CONFIG.TALENTS.find(t => t.id === info.talent);
    if (talent) {
      Object.entries(talent.bonus).forEach(([key, val]) => {
        stats[key] = Math.min(CONFIG.MAX_STAT, stats[key] + val);
      });
    }

    // 2) 应用标签加成
    const selectedTags = CONFIG.TAGS.filter(t => info.tags.includes(t.id));
    selectedTags.forEach(tag => {
      switch (tag.effectType) {
        case 'stat_boost':
          // 天赋型：全属性+3
          ['singing','dancing','appearance','entertainment'].forEach(k => {
            stats[k] = Math.min(CONFIG.MAX_STAT, stats[k] + 3);
          });
          break;
        // 其他标签效果在日程执行时动态计算 (schedule.js)
      }
    });

    // 3) 构建完整游戏数据
    this.data = {
      character: {
        name: info.name,
        gender: info.gender,
        talent: info.talent,
        tags: info.tags,
        stats,
        stress: 0,
        health: 100,
        fans: 0,
        money: 1000,
        stage: 'trainee',
        day: 1,
        log: []               // 历史日志
      }
    };

    this.save(); // 创建后自动存档
    return this.data;
  },

  /**
   * 保存到 localStorage
   * @returns {boolean} 是否成功
   */
  save() {
    if (!this.data) return false;
    try {
      localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(this.data));
      return true;
    } catch (e) {
      console.warn('存档失败:', e);
      UI.showToast('存档失败！请检查浏览器存储空间', 'error');
      return false;
    }
  },

  /**
   * 从 localStorage 读取存档
   * @returns {boolean} 是否有存档
   */
  load() {
    try {
      const saved = localStorage.getItem(CONFIG.SAVE_KEY);
      if (saved) {
        this.data = JSON.parse(saved);
        return true;
      }
    } catch (e) {
      console.warn('读档失败:', e);
    }
    return false;
  },

  /** 检查是否存在存档 */
  hasSave() {
    return localStorage.getItem(CONFIG.SAVE_KEY) !== null;
  },

  /** 删除存档 */
  reset() {
    localStorage.removeItem(CONFIG.SAVE_KEY);
    this.data = null;
  },

  /**
   * 获取当前阶段配置
   * @returns {Object} 阶段对象
   */
  getCurrentStage() {
    if (!this.data) return CONFIG.STAGES[0];
    const stage = CONFIG.STAGES.find(s => s.id === this.data.character.stage);
    return stage || CONFIG.STAGES[0];
  },

  /**
   * 获取当前阶段可用的所有活动
   * @returns {Array} 活动对象数组 [{ id, name, ... }]
   */
  getAvailableActivities() {
    const stage = this.data.character.stage;
    const stageIdx = CONFIG.STAGES.findIndex(s => s.id === stage);

    // 基础活动始终可用
    const activities = Object.entries(CONFIG.ACTIVITIES).map(([id, a]) => ({
      id, ...a
    }));

    // 遍历高级活动，检查是否已解锁
    Object.entries(CONFIG.ADVANCED_ACTIVITIES).forEach(([id, a]) => {
      const unlockStageIdx = CONFIG.STAGES.findIndex(s => s.id === a.unlockStage);
      if (stageIdx >= unlockStageIdx) {
        activities.push({ id, ...a });
      }
    });

    return activities;
  }
};
