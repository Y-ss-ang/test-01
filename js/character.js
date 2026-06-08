/**
 * ===================================================
 * 偶像模拟器 - 角色创建模块
 * Idol Simulator - Character Creation
 *
 * 处理开局角色定制的 UI 和逻辑
 * ===================================================
 */

const CharacterCreator = {
  /** 当前选中的标签 (最多2个) */
  selectedTags: [],

  /**
   * 渲染角色创建界面
   */
  render() {
    const container = document.getElementById('screen-create');
    container.innerHTML = `
      <div class="min-h-screen flex items-center justify-center p-4">
        <div class="glass-card w-full max-w-lg p-8" style="animation: fadeIn .5s ease-out;">

          <!-- 标题 -->
          <h2 class="text-2xl font-bold text-center mb-2">🌟 定制你的偶像</h2>
          <p class="text-center text-white/50 text-sm mb-8">打造属于你的专属偶像</p>

          <!-- 姓名 -->
          <div class="mb-5">
            <label class="block text-sm font-medium text-white/70 mb-2">🎭 艺名</label>
            <input id="input-name" type="text" maxlength="10" placeholder="输入你的偶像艺名..."
              class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white
                     placeholder-white/30 outline-none focus:border-purple-500/60 transition-colors">
          </div>

          <!-- 性别 -->
          <div class="mb-5">
            <label class="block text-sm font-medium text-white/70 mb-2">🚻 性别</label>
            <div class="flex gap-3">
              <label class="flex-1 cursor-pointer">
                <input type="radio" name="gender" value="男" checked class="hidden">
                <div class="gender-option text-center py-3 rounded-xl bg-white/5 border border-white/10
                            hover:border-pink-500/40 transition-all font-medium">
                  男
                </div>
              </label>
              <label class="flex-1 cursor-pointer">
                <input type="radio" name="gender" value="女" class="hidden">
                <div class="gender-option text-center py-3 rounded-xl bg-white/5 border border-white/10
                            hover:border-pink-500/40 transition-all font-medium">
                  女
                </div>
              </label>
            </div>
          </div>

          <!-- 初始天赋 -->
          <div class="mb-5">
            <label class="block text-sm font-medium text-white/70 mb-3">🎯 初始天赋（选一项）</label>
            <div class="grid grid-cols-2 gap-3" id="talent-grid">
              ${CONFIG.TALENTS.map(t => `
                <div class="talent-card" data-talent="${t.id}">
                  <div class="text-2xl mb-1">${t.name.split(' ')[0]}</div>
                  <div class="font-medium text-sm">${t.name}</div>
                  <div class="text-xs text-white/50 mt-1">${t.desc}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 人设标签 -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-white/70 mb-2">🏷️ 人设标签（选2项）</label>
            <div class="flex flex-wrap gap-2" id="tags-container">
              ${CONFIG.TAGS.map(t => `
                <button class="tag-btn" data-tag="${t.id}">${t.name}</button>
              `).join('')}
            </div>
            <p class="text-xs text-white/40 mt-2" id="tag-hint">选择 2 个标签来定义你的偶像人设</p>
          </div>

          <!-- 确认按钮 -->
          <button id="btn-create" class="btn-gradient w-full text-lg py-3">
            ✨ 开始偶像之旅
          </button>

        </div>
      </div>
    `;

    this.bindEvents();
  },

  /** 绑定交互事件 */
  bindEvents() {
    // 天赋选择 (单选)
    const talentCards = document.querySelectorAll('.talent-card');
    talentCards.forEach(card => {
      card.addEventListener('click', () => {
        talentCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      });
    });
    // 默认选中第一个
    if (talentCards.length > 0) talentCards[0].classList.add('selected');

    // 性别选择高亮
    document.querySelectorAll('.gender-option').forEach(el => {
      el.addEventListener('click', () => {
        document.querySelectorAll('.gender-option').forEach(e => e.classList.remove('selected'));
        el.classList.add('selected');
      });
    });
    document.querySelectorAll('.gender-option')[0]?.classList.add('selected');

    // 标签选择 (最多2个)
    this.selectedTags = [];
    const tagBtns = document.querySelectorAll('.tag-btn');
    tagBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tagId = btn.dataset.tag;
        if (btn.classList.contains('selected')) {
          btn.classList.remove('selected');
          this.selectedTags = this.selectedTags.filter(t => t !== tagId);
        } else {
          if (this.selectedTags.length >= 2) {
            UI.showToast('最多选择 2 个人设标签', 'warning');
            return;
          }
          btn.classList.add('selected');
          this.selectedTags.push(tagId);
        }
        // 更新提示
        document.getElementById('tag-hint').textContent =
          this.selectedTags.length === 0 ? '选择 2 个标签来定义你的偶像人设' :
          this.selectedTags.length === 1 ? '再选 1 个标签吧' :
          '已选 2 个标签 ✓';
      });
    });

    // 确认创建
    document.getElementById('btn-create').addEventListener('click', () => this.submit());
  },

  /** 提交角色创建 */
  submit() {
    const name = document.getElementById('input-name').value.trim();
    if (!name) {
      UI.showToast('请输入你的艺名 ✨', 'warning');
      return;
    }

    const gender = document.querySelector('input[name="gender"]:checked')?.value || '男';

    const selectedTalent = document.querySelector('.talent-card.selected');
    if (!selectedTalent) {
      UI.showToast('请选择一项初始天赋 🎯', 'warning');
      return;
    }
    const talent = selectedTalent.dataset.talent;

    if (this.selectedTags.length < 2) {
      UI.showToast('请选择 2 个人设标签 🏷️', 'warning');
      return;
    }

    // 创建新游戏
    GameState.createCharacter({
      name, gender, talent,
      tags: this.selectedTags
    });

    UI.showToast(`欢迎来到偶像世界，${name}！🌟`, 'success');
    App.switchScreen('game');
  }
};
