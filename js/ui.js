/**
 * ===================================================
 * 偶像模拟器 - UI 渲染与动画工具
 * Idol Simulator - UI Rendering & Animation Utilities
 *
 * 静态面板渲染、数据展示、动画效果
 * ===================================================
 */

const UI = {

  // ---- 全局 Toast 通知 ----
  showToast(msg, type = 'info') {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.className = `toast ${type}`;
    // 触发回流后显示
    void toast.offsetWidth;
    toast.classList.add('show');
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => toast.classList.remove('show'), 2500);
  },

  // ---- 浮动数字动画 ----
  showFloatNumber(statKey, value) {
    if (value === 0) return;
    const labels = {
      singing: '唱功', dancing: '舞蹈', appearance: '外貌', entertainment: '艺能',
      stress: '压力', health: '健康', fans: '粉丝', money: '金钱'
    };
    const label = labels[statKey] || statKey;
    const sign = value > 0 ? '+' : '';
    const el = document.createElement('div');
    el.className = `float-number ${value > 0 ? 'positive' : 'negative'}`;
    el.textContent = `${label} ${sign}${value}`;

    // 随机位置
    el.style.left = (20 + Math.random() * 60) + '%';
    el.style.top = (30 + Math.random() * 40) + '%';
    document.body.appendChild(el);

    setTimeout(() => el.remove(), 1000);
  },

  // ---- 渲染主界面各个面板 ----

  /** 顶部角色信息栏 */
  renderHeader() {
    const chara = GameState.data.character;
    const stage = CONFIG.STAGES.find(s => s.id === chara.stage);
    const container = document.getElementById('header-info');

    // 压力/健康状态标签
    const stressTag = chara.stress < 40 ? 'green' : chara.stress < 70 ? 'yellow' : 'red';
    const healthTag = chara.health > 70 ? 'green' : chara.health > 40 ? 'yellow' : 'red';

    container.innerHTML = `
      <div class="flex flex-wrap items-center gap-x-5 gap-y-2">
        <div class="flex items-center gap-2">
          <span class="text-xl">${chara.gender === '男' ? '👤' : '👩'}</span>
          <span class="font-bold text-lg">${chara.name}</span>
        </div>
        <span class="text-sm text-white/60">${stage ? stage.name : '练习生'}</span>
        <span class="text-sm text-white/40">📅 Day ${chara.day}</span>
        <div class="flex gap-2">
          <span class="status-tag ${stressTag}">💢 ${chara.stress}</span>
          <span class="status-tag ${healthTag}">❤️ ${chara.health}</span>
        </div>
      </div>
    `;
  },

  /** 四维 + 数值属性面板 */
  renderStats() {
    const chara = GameState.data.character;
    const container = document.getElementById('stats-panel');
    if (!container) return;

    const stats = [
      { key: 'singing',       label: '🎤 唱功',    color: '#4ade80' },
      { key: 'dancing',       label: '💃 舞蹈',    color: '#60a5fa' },
      { key: 'appearance',    label: '✨ 外貌',    color: '#f472b6' },
      { key: 'entertainment', label: '🎭 艺能',    color: '#fbbf24' }
    ];

    const values = [
      { key: 'fans',   label: '👥 粉丝',  value: chara.fans,    format: v => UI.formatNum(v) },
      { key: 'money',  label: '💰 金钱',  value: chara.money,   format: v => UI.formatNum(v) }
    ];

    container.innerHTML = `
      <!-- 四维属性条 -->
      <div class="glass-card p-4 mb-3">
        <h4 class="text-sm font-medium text-white/60 mb-3">📊 能力属性</h4>
        <div class="space-y-3">
          ${stats.map(s => `
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span>${s.label}</span>
                <span class="font-bold" id="stat-val-${s.key}">${chara.stats[s.key]}</span>
              </div>
              <div class="stat-bar-bg">
                <div class="stat-bar-fill" id="stat-bar-${s.key}"
                     style="width:${chara.stats[s.key]}%; background:${s.color};"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 数值属性 -->
      <div class="glass-card p-4 mb-3">
        <h4 class="text-sm font-medium text-white/60 mb-3">📈 经营状况</h4>
        <div class="grid grid-cols-2 gap-3">
          ${values.map(v => `
            <div class="bg-white/5 rounded-xl p-3 text-center">
              <div class="text-xs text-white/40">${v.label}</div>
              <div class="text-xl font-bold mt-1" id="stat-val-${v.key}">${v.format(v.value)}</div>
            </div>
          `).join('')}
          <!-- 压力和健康也在数值面板展示 -->
          <div class="bg-white/5 rounded-xl p-3 text-center">
            <div class="text-xs text-white/40">💢 压力</div>
            <div class="text-xl font-bold mt-1" id="stat-val-stress"
                 style="color:${chara.stress < 40 ? '#4ade80' : chara.stress < 70 ? '#facc15' : '#f87171'}">
              ${chara.stress}
            </div>
          </div>
          <div class="bg-white/5 rounded-xl p-3 text-center">
            <div class="text-xs text-white/40">❤️ 健康</div>
            <div class="text-xl font-bold mt-1" id="stat-val-health"
                 style="color:${chara.health > 70 ? '#4ade80' : chara.health > 40 ? '#facc15' : '#f87171'}">
              ${chara.health}
            </div>
          </div>
        </div>
      </div>

      <!-- 当前阶段 -->
      <div class="glass-card p-4">
        <h4 class="text-sm font-medium text-white/60 mb-2">🏆 成长阶段</h4>
        <div class="flex items-center gap-2">
          ${CONFIG.STAGES.map((s, i) => {
            const currentIdx = CONFIG.STAGES.findIndex(st => st.id === chara.stage);
            const isUnlocked = i <= currentIdx;
            const isCurrent = i === currentIdx;
            return `<span class="text-sm ${isCurrent ? 'text-yellow-400 font-bold' : isUnlocked ? 'text-white/60' : 'text-white/20'}">
              ${isUnlocked ? (isCurrent ? `👉 ${s.name}` : s.name.split(' ')[1] || s.name) : '🔒'}
              ${i < CONFIG.STAGES.length - 1 ? ' → ' : ''}
            </span>`;
          }).join('')}
        </div>
        <!-- 晋升进度提示 -->
        ${(() => {
          const currentIdx = CONFIG.STAGES.findIndex(st => st.id === chara.stage);
          if (currentIdx < CONFIG.STAGES.length - 1) {
            const next = CONFIG.STAGES[currentIdx + 1];
            const minStat = Math.min(chara.stats.singing, chara.stats.dancing, chara.stats.appearance, chara.stats.entertainment);
            return `<div class="text-xs text-white/40 mt-2">
              下一阶段：${next.name} · 需要四维≥${next.statReq} · 粉丝≥${UI.formatNum(next.fanReq)}
              <span class="text-white/60">(当前最低四维: ${minStat} · 粉丝: ${UI.formatNum(chara.fans)})</span>
            </div>`;
          }
          return '<div class="text-xs text-green-400 mt-2">🎉 已达最高阶段！你是顶级偶像！</div>';
        })()}
      </div>
    `;
  },

  /** 事件日志面板 */
  renderLog() {
    const chara = GameState.data.character;
    const container = document.getElementById('log-panel');
    if (!container) return;

    // 取最近10条
    const recent = chara.log.slice(-10).reverse();

    container.innerHTML = `
      <div class="glass-card p-4" style="max-height: 280px; overflow-y: auto;">
        <h4 class="text-sm font-medium text-white/60 mb-3">📋 事件日志</h4>
        ${recent.length === 0
          ? '<p class="text-xs text-white/30 text-center py-4">还没有事件记录，开始你的日程吧！</p>'
          : `<div class="space-y-2">
              ${recent.map(entry => `
                <div class="text-xs bg-white/5 rounded-lg p-2.5" style="animation: fadeIn .3s ease-out;">
                  <span class="text-white/40">Day ${entry.day}</span>
                  ${entry.event ? `<span class="text-purple-400 font-medium">${entry.event}</span>` : ''}
                  <span class="text-white/60">${entry.summary}</span>
                </div>
              `).join('')}
            </div>`
        }
      </div>
    `;
  },

  /** 格式化大数字 */
  formatNum(n) {
    if (n >= 10000) return (n / 10000).toFixed(1) + '万';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return n.toString();
  }
};
