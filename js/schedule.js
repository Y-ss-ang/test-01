/**
 * ===================================================
 * 偶像模拟器 - 日程系统
 * Idol Simulator - Daily Schedule System
 *
 * 每日活动选择、执行、属性变化计算
 * ===================================================
 */

const Schedule = {
  /** 当前选中的活动ID (4个时段) */
  selections: [null, null, null, null],

  /** 时段名称 */
  slots: ['🌅 上午', '☀️ 下午', '🌆 晚上', '🌙 深夜'],

  /** 是否正在执行日程（防止重复点击） */
  isExecuting: false,

  /**
   * 渲染日程面板
   */
  render() {
    const activities = GameState.getAvailableActivities();
    const chara = GameState.data.character;
    const container = document.getElementById('schedule-panel');

    // 生成下拉选项
    const optionsHtml = activities.map(a =>
      `<option value="${a.id}">${a.name} — ${a.desc}</option>`
    ).join('');

    container.innerHTML = `
      <div class="glass-card p-5">
        <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
          📅 第 ${chara.day} 天 · 今日日程
        </h3>

        <div class="space-y-3" id="schedule-slots">
          ${this.slots.map((slotName, i) => `
            <div>
              <label class="text-xs text-white/50 font-medium block mb-1">${slotName}</label>
              <select class="schedule-select" data-slot="${i}">
                <option value="">— 选择活动 —</option>
                ${optionsHtml}
              </select>
            </div>
          `).join('')}
        </div>

        <button id="btn-execute" class="btn-gradient w-full mt-4 py-3 text-base">
          ⚡ 执行日程
        </button>
      </div>

      <!-- 执行记录区域 -->
      <div class="glass-card p-4 mt-3" id="execution-log" style="display:none;">
        <h4 class="text-sm font-medium text-white/60 mb-2">📋 执行记录</h4>
        <div class="space-y-2 text-sm" id="log-entries"></div>
      </div>
    `;

    this.bindEvents();

    // 如果已经有存档的选择，恢复
    if (this.selections.some(s => s !== null)) {
      this.restoreSelections();
    }
  },

  /** 绑定日程事件 */
  bindEvents() {
    // 下拉选择
    document.querySelectorAll('.schedule-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const slot = parseInt(e.target.dataset.slot);
        this.selections[slot] = e.target.value || null;
      });
    });

    // 执行按钮
    document.getElementById('btn-execute').addEventListener('click', () => this.execute());
  },

  /** 恢复之前的选择 */
  restoreSelections() {
    document.querySelectorAll('.schedule-select').forEach(sel => {
      const slot = parseInt(sel.dataset.slot);
      if (this.selections[slot]) {
        sel.value = this.selections[slot];
      }
    });
  },

  /**
   * 执行日程
   * 遍历4个时段，依次应用活动效果
   */
  async execute() {
    if (this.isExecuting) return;
    const chara = GameState.data.character;

    // 验证选择
    const selected = this.selections.map((s, i) => ({ id: s, slot: i }));
    const empty = selected.filter(s => !s.id);
    if (empty.length > 0) {
      UI.showToast(`还有 ${empty.length} 个时段未选择活动`, 'warning');
      return;
    }

    this.isExecuting = true;
    document.getElementById('btn-execute').disabled = true;

    // 显示执行记录面板
    const logPanel = document.getElementById('execution-log');
    logPanel.style.display = 'block';
    const logEntries = document.getElementById('log-entries');
    logEntries.innerHTML = '';

    // 获取所有活动数据
    const allActivities = GameState.getAvailableActivities();
    const findActivity = (id) => allActivities.find(a => a.id === id);

    // 获取角色标签效果倍率
    const tags = CONFIG.TAGS.filter(t => chara.tags.includes(t.id));

    // 依次执行每个活动
    for (const sel of selected) {
      const act = findActivity(sel.id);
      if (!act) continue;

      // 创建日志条目
      const entry = document.createElement('div');
      entry.className = 'glass-card p-3 flex items-center gap-3';
      entry.style.animation = 'fadeIn 0.3s ease-out';
      entry.innerHTML = `
        <span class="text-lg">${act.name.split(' ')[0]}</span>
        <div class="flex-1">
          <div class="font-medium text-sm">${act.name}</div>
          <div class="text-xs text-white/40">${act.desc}</div>
        </div>
        <div class="text-right text-xs" id="effect-${sel.slot}">执行中...</div>
      `;
      logEntries.appendChild(entry);

      // 应用效果
      const effects = {};
      if (act.effects) {
        Object.entries(act.effects).forEach(([key, range]) => {
          let val = range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));

          // 应用标签加成
          tags.forEach(tag => {
            switch (tag.effectType) {
              case 'train_boost':
                if (act.type === 'train' && (key === 'singing' || key === 'dancing' || key === 'appearance' || key === 'entertainment')) {
                  val = Math.round(val * 1.1);
                }
                break;
              case 'fan_boost':
                if (key === 'fans' && val > 0) val = Math.round(val * 1.15);
                break;
              case 'money_boost':
                if (key === 'money' && val > 0) val = Math.round(val * 1.15);
                break;
              case 'rest_boost':
                if (act.type === 'rest' && val < 0) val = Math.round(val * 1.2);
                break;
              case 'stress_reduce':
                if (key === 'stress' && val > 0) val = Math.round(val * 0.85);
                break;
            }
          });

          // 对 stress 特殊处理：休息时减压力反向计算
          if (key === 'stress' && val < 0) {
            // 压力减少
            chara.stress = Math.max(0, chara.stress + val);  // val 是负数
          } else if (key === 'stress') {
            chara.stress = Math.min(CONFIG.MAX_STRESS, chara.stress + val);
          } else if (key === 'health') {
            chara.health = Math.min(CONFIG.MAX_HEALTH, Math.max(0, chara.health + val));
          } else if (key === 'fans') {
            chara.fans = Math.max(0, chara.fans + val);
          } else if (key === 'money') {
            chara.money = Math.max(0, chara.money + val);
          } else {
            // 四维属性
            chara.stats[key] = Math.min(CONFIG.MAX_STAT, Math.max(CONFIG.MIN_STAT, chara.stats[key] + val));
          }

          effects[key] = val;
        });
      }

      // 更新UI显示效果
      const effectEl = document.getElementById(`effect-${sel.slot}`);
      if (effectEl) {
        const parts = Object.entries(effects).map(([key, val]) => {
          const label = {
            singing: '唱功', dancing: '舞蹈', appearance: '外貌', entertainment: '艺能',
            stress: '压力', health: '健康', fans: '粉丝', money: '金钱'
          }[key] || key;
          const sign = val > 0 ? '+' : '';
          const color = val > 0 ? (key === 'stress' ? 'text-red-400' : 'text-green-400') :
                        val < 0 ? (key === 'stress' ? 'text-green-400' : 'text-red-400') : '';
          return `<span class="${color}">${label} ${sign}${val}</span>`;
        });
        effectEl.innerHTML = parts.join(' &bull; ');
      }

      // 显示浮动数字动画
      Object.entries(effects).forEach(([key, val]) => {
        UI.showFloatNumber(key, val);
      });

      // 刷新属性面板
      UI.renderStats();

      // 等待动画完成
      await new Promise(r => setTimeout(r, 700));
    }

    // 增加天数
    chara.day++;

    // 日程日志
    chara.log.push({
      day: chara.day - 1,
      activities: selected.map(s => findActivity(s.id)?.name || ''),
      summary: '完成日程'
    });

    // 保存游戏
    GameState.save();

    // 清除选择，准备下一天
    this.selections = [null, null, null, null];

    // 检查随机事件
    await new Promise(r => setTimeout(r, 400));
    const eventTriggered = await EventSystem.checkRandomEvent();

    // 检查成长阶段
    await new Promise(r => setTimeout(r, 300));
    const stageUp = GrowthSystem.checkStage();

    // 游戏结束检查
    if (chara.health <= 0) {
      UI.showToast('💔 因健康问题不得不退出演艺圈...', 'error');
      setTimeout(() => App.showGameOver('因过度劳累导致健康崩溃'), 1000);
      this.isExecuting = false;
      document.getElementById('btn-execute').disabled = false;
      return;
    }
    if (chara.stress >= 100) {
      UI.showToast('😰 压力过大精神崩溃...', 'error');
      setTimeout(() => App.showGameOver('因压力过大无法继续演艺事业'), 1000);
      this.isExecuting = false;
      document.getElementById('btn-execute').disabled = false;
      return;
    }

    // 更新 UI
    this.render();
    UI.renderStats();
    UI.renderLog();

    this.isExecuting = false;
    document.getElementById('btn-execute').disabled = false;

    // 更新日程标题
    const title = document.querySelector('#schedule-panel h3');
    if (title) {
      title.innerHTML = `📅 第 ${chara.day} 天 · 今日日程`;
    }

    // 如果没有触发事件且没有升级，显示完成提示
    if (!eventTriggered && !stageUp) {
      UI.showToast(`第 ${chara.day - 1} 天结束 🌟`, 'info');
    }
  }
};
