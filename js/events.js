/**
 * ===================================================
 * 偶像模拟器 - 随机事件系统
 * Idol Simulator - Random Events System
 *
 * 每天日程执行后可能触发随机事件
 * 包括好事、坏事、中性事件
 * ===================================================
 */

const EventSystem = {
  /** 当前显示的事件队列 */
  queue: [],

  /**
   * 检查并触发随机事件
   * @returns {Promise<boolean>} 是否触发了事件
   */
  async checkRandomEvent() {
    // 概率判定
    if (Math.random() > CONFIG.EVENT_CHANCE) return false;

    // 加权随机选择事件类别
    const roll = Math.random();
    let pool;
    if (roll < CONFIG.EVENT_GOOD_WEIGHT) {
      pool = CONFIG.EVENTS.good;
    } else if (roll < CONFIG.EVENT_GOOD_WEIGHT + CONFIG.EVENT_BAD_WEIGHT) {
      pool = CONFIG.EVENTS.bad;
    } else {
      pool = CONFIG.EVENTS.neutral;
    }

    // 随机选一个事件
    const event = pool[Math.floor(Math.random() * pool.length)];
    if (!event) return false;

    // 应用事件效果
    this.applyEvent(event);

    // 存档
    GameState.save();

    // 显示事件弹窗
    await this.showEventModal(event);

    return true;
  },

  /**
   * 将事件效果应用到角色
   */
  applyEvent(event) {
    const chara = GameState.data.character;
    if (!event.effects) return;

    Object.entries(event.effects).forEach(([key, range]) => {
      const val = range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));

      if (key === 'stress') {
        chara.stress = Math.min(CONFIG.MAX_STRESS, Math.max(0, chara.stress + val));
      } else if (key === 'health') {
        chara.health = Math.min(CONFIG.MAX_HEALTH, Math.max(0, chara.health + val));
      } else if (key === 'fans') {
        chara.fans = Math.max(0, chara.fans + val);
      } else if (key === 'money') {
        chara.money = Math.max(0, chara.money + val);
      } else {
        // 四维属性
        if (chara.stats[key] !== undefined) {
          chara.stats[key] = Math.min(CONFIG.MAX_STAT, Math.max(CONFIG.MIN_STAT, chara.stats[key] + val));
        }
      }

      // 浮动数字动画
      UI.showFloatNumber(key, val);
    });

    // 添加日志
    chara.log.push({
      day: chara.day,
      event: event.title,
      summary: event.text
    });

    // 刷新UI
    UI.renderStats();
    UI.renderLog();
  },

  /**
   * 显示事件弹窗
   * @returns {Promise} 用户点击确认后resolve
   */
  showEventModal(event) {
    return new Promise(resolve => {
      const overlay = document.getElementById('event-modal-overlay');
      const titleEl = document.getElementById('event-modal-title');
      const iconEl = document.getElementById('event-modal-icon');
      const textEl = document.getElementById('event-modal-text');
      const effectsEl = document.getElementById('event-modal-effects');
      const btn = document.getElementById('event-modal-btn');

      // 设置内容
      iconEl.textContent = event.title.charAt(0);
      titleEl.textContent = event.title;
      textEl.textContent = event.text;

      // 效果文字
      if (event.effects) {
        const parts = Object.entries(event.effects).map(([key, range]) => {
          const labels = {
            singing: '唱功', dancing: '舞蹈', appearance: '外貌', entertainment: '艺能',
            stress: '压力', health: '健康', fans: '粉丝数', money: '金钱'
          };
          const label = labels[key] || key;
          const min = range[0], max = range[1];
          const sign = min >= 0 ? '+' : '';
          return `${label} ${sign}${min}~${max}`;
        });
        effectsEl.textContent = `效果：${parts.join(' · ')}`;
      } else {
        effectsEl.textContent = '';
      }

      // 移除旧事件监听
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);

      // 确认按钮
      newBtn.addEventListener('click', () => {
        overlay.classList.remove('show');
        resolve();
      });

      overlay.classList.add('show');
    });
  }
};
