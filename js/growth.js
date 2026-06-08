/**
 * ===================================================
 * 偶像模拟器 - 成长系统
 * Idol Simulator - Growth/Progression System
 *
 * 检测成长阶段晋升条件，触发阶段进阶
 * ===================================================
 */

const GrowthSystem = {
  /**
   * 检查是否符合晋升条件
   * @returns {boolean} 是否晋升
   */
  checkStage() {
    const chara = GameState.data.character;
    const currentIdx = CONFIG.STAGES.findIndex(s => s.id === chara.stage);
    if (currentIdx < 0 || currentIdx >= CONFIG.STAGES.length - 1) return false;

    const nextStage = CONFIG.STAGES[currentIdx + 1];
    if (!nextStage) return false;

    // 这里做了简化计算：取四维最低值作为评判标准
    const minStat = Math.min(
      chara.stats.singing,
      chara.stats.dancing,
      chara.stats.appearance,
      chara.stats.entertainment
    );

    // 判断条件
    let canAdvance = true;
    if (nextStage.nextReq) {
      // 检查前置阶段
      if (nextStage.nextReq.stage && chara.stage !== nextStage.nextReq.stage) {
        // 如果 nextReq 中指定了前置 stage，检查是否满足
        const reqStageIdx = CONFIG.STAGES.findIndex(s => s.id === nextStage.nextReq.stage);
        if (currentIdx < reqStageIdx) canAdvance = false;
      }
      // 检查粉丝数要求
      if (nextStage.nextReq.fans && chara.fans < nextStage.nextReq.fans) canAdvance = false;
    }
    // 四维要求
    if (minStat < nextStage.statReq) canAdvance = false;
    // 粉丝要求
    if (chara.fans < nextStage.fanReq) canAdvance = false;

    if (!canAdvance) return false;

    // 晋升!
    const oldStage = chara.stage;
    chara.stage = nextStage.id;

    // 晋升奖励
    const rewards = {
      debut:      { money: 5000,  fans: 200,  stress: -10 },
      single:     { money: 10000, fans: 500,  stress: -10 },
      chart:      { money: 20000, fans: 1000, stress: -15 },
      celebrity:  { money: 50000, fans: 5000, stress: -20 }
    };

    const reward = rewards[nextStage.id];
    if (reward) {
      if (reward.money)  chara.money  = Math.max(0, chara.money + reward.money);
      if (reward.fans)   chara.fans   = Math.max(0, chara.fans + reward.fans);
      if (reward.stress) chara.stress = Math.max(0, chara.stress + reward.stress);
    }

    // 日志
    chara.log.push({
      day: chara.day,
      event: `🎉 晋升：${nextStage.name}`,
      summary: `从 ${CONFIG.STAGES[currentIdx].name} 晋升至 ${nextStage.name}！`
    });

    // 存档
    GameState.save();

    // 显示晋升弹窗
    this.showStageModal(nextStage, reward);

    // 刷新UI
    UI.renderStats();
    UI.renderLog();
    UI.renderHeader();

    return true;
  },

  /**
   * 显示晋升弹窗
   */
  showStageModal(stage, reward) {
    const overlay = document.getElementById('event-modal-overlay');
    document.getElementById('event-modal-icon').textContent = '🎉';
    document.getElementById('event-modal-title').textContent = `晋升！${stage.name}`;
    document.getElementById('event-modal-text').textContent = stage.desc;

    let effectsHtml = '';
    if (reward) {
      const parts = [];
      if (reward.money)  parts.push(`💰 +${reward.money} 金钱`);
      if (reward.fans)   parts.push(`👥 +${reward.fans} 粉丝`);
      if (reward.stress) parts.push(`💢 -${Math.abs(reward.stress)} 压力`);
      effectsHtml = `<p class="text-sm text-green-400 mt-2">晋升奖励：${parts.join(' · ')}</p>`;
    }

    document.getElementById('event-modal-effects').innerHTML = `
      <p class="text-sm text-white/60 mt-2">解锁新活动和新机遇！继续努力成为顶级偶像吧！</p>
      ${effectsHtml}
    `;

    const btn = document.getElementById('event-modal-btn');
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.textContent = '🚀 继续前进';

    newBtn.addEventListener('click', () => {
      overlay.classList.remove('show');
    });

    overlay.classList.add('show');
  }
};
