/**
 * ===================================================
 * 偶像模拟器 - 游戏配置文件
 * Idol Simulator - Game Configuration
 *
 * 所有游戏常量、活动定义、事件数据集中管理
 * 修改这里可以轻松调整游戏平衡性
 * ===================================================
 */

const CONFIG = {
  // ---- 基本设置 ----
  VERSION: '1.0.0',
  MAX_STAT: 100,
  MIN_STAT: 0,
  MAX_STRESS: 100,
  MAX_HEALTH: 100,
  ACTIVITIES_PER_DAY: 4,
  SAVE_KEY: 'idol_sim_save',    // localStorage 存储键名

  // ---- 初始属性 ----
  INITIAL_STATS: {
    singing: 20,
    dancing: 20,
    appearance: 20,
    entertainment: 20,
    stress: 0,
    health: 100,
    fans: 0,
    money: 1000
  },

  // ---- 初始天赋 (选一) ----
  TALENTS: [
    { id: 'sing',    name: '🎤 主唱',     desc: '天生好嗓音，声乐天赋异禀',  bonus: { singing: 15 } },
    { id: 'dance',   name: '💃 主舞',     desc: '舞感一流，身体协调性极佳',  bonus: { dancing: 15 } },
    { id: 'visual',  name: '✨ 门面',     desc: '精致外貌，镜头感十足',      bonus: { appearance: 15 } },
    { id: 'variety', name: '🎭 艺能',     desc: '幽默风趣，综艺感爆棚',      bonus: { entertainment: 15 } }
  ],

  // ---- 人设标签 (选2) ----
  TAGS: [
    { id: 'hardwork',    name: '努力型',  desc: '训练效果 +10%',   effectType: 'train_boost' },
    { id: 'talent_born', name: '天赋型',  desc: '全属性 +3',       effectType: 'stat_boost' },
    { id: 'cute',        name: '可爱风',  desc: '涨粉效果 +15%',   effectType: 'fan_boost' },
    { id: 'cool',        name: '酷飒风',  desc: '打工收入 +15%',   effectType: 'money_boost' },
    { id: 'healing',     name: '治愈系',  desc: '休息效果 +20%',   effectType: 'rest_boost' },
    { id: 'active',      name: '活力派',  desc: '压力增长 -15%',   effectType: 'stress_reduce' }
  ],

  // ---- 基础日程活动 ----
  ACTIVITIES: {
    train_sing:     { name: '🎵 声乐训练',  type: 'train',
                      effects: { singing: [3,7], stress: [5,8] },
                      desc: '练习发声技巧，提升唱功' },
    train_dance:    { name: '💃 舞蹈训练',  type: 'train',
                      effects: { dancing: [3,7], stress: [5,8] },
                      desc: '练习舞蹈动作，提升舞技' },
    train_visual:   { name: '💄 形体训练',  type: 'train',
                      effects: { appearance: [3,7], stress: [5,8] },
                      desc: '保持最佳体态，提升外貌' },
    train_variety:  { name: '🎬 艺能训练',  type: 'train',
                      effects: { entertainment: [3,7], stress: [5,8] },
                      desc: '学习综艺技巧，提升艺能' },
    rest:           { name: '😴 休息',      type: 'rest',
                      effects: { stress: [-12,-18], health: [5,10] },
                      desc: '放松身心，恢复体力' },
    hospital:       { name: '🏥 去医院',    type: 'rest',
                      effects: { health: [15,25], money: [-300,-500] },
                      desc: '专业医疗恢复健康' },
    work_parttime:  { name: '💼 便利店打工', type: 'work',
                      effects: { money: [300,500], stress: [5,10], health: [-3,-5] },
                      desc: '赚取生活费' },
    work_perform:   { name: '🎪 兼职演出',  type: 'work',
                      effects: { money: [500,800], entertainment: [1,3], stress: [8,12] },
                      desc: '小型商业演出，积累经验' },
    social_fanmeet: { name: '🤝 粉丝见面会', type: 'social',
                      effects: { fans: [20,50], stress: [5,8] },
                      desc: '与粉丝互动交流' },
    social_live:    { name: '📱 直播互动',  type: 'social',
                      effects: { fans: [30,80], money: [100,300], stress: [8,12] },
                      desc: '开直播和粉丝聊天' }
  },

  // ---- 高级活动 (阶段解锁) ----
  ADVANCED_ACTIVITIES: {
    studio:       { name: '🎙️ 录音室录制',  type: 'train',
                    effects: { singing: [5,10], money: [-300,-500], stress: [8,12] },
                    desc: '专业录音棚录制', unlockStage: 'debut' },
    rehearsal:    { name: '🏋️ 舞蹈排练室',  type: 'train',
                    effects: { dancing: [5,10], stress: [8,12] },
                    desc: '专业舞蹈排练', unlockStage: 'debut' },
    photoshoot:   { name: '📸 拍摄写真',    type: 'social',
                    effects: { appearance: [3,6], money: [500,1000], fans: [50,100], stress: [5,8] },
                    desc: '拍摄宣传写真', unlockStage: 'single' },
    variety_show: { name: '📺 综艺录制',    type: 'social',
                    effects: { entertainment: [5,8], money: [500,1000], fans: [100,300], stress: [8,12] },
                    desc: '参加综艺节目', unlockStage: 'single' },
    concert:      { name: '🎤 小型演唱会',  type: 'social',
                    effects: { fans: [200,500], money: [1000,3000], stress: [12,18], health: [-3,-6] },
                    desc: '举办小型演唱会', unlockStage: 'chart' }
  },

  // ---- 成长阶段 ----
  STAGES: [
    { id: 'trainee',   name: '⭐ 练习生',     desc: '刻苦训练的新人',
      statReq: 0,   fanReq: 0,    nextReq: null },
    { id: 'debut',     name: '🌈 小分队出道', desc: '以组合形式正式出道',
      statReq: 40,  fanReq: 0,    nextReq: { stage: 'trainee' } },
    { id: 'single',    name: '💿 发行单曲',   desc: '发布首支个人单曲',
      statReq: 55,  fanReq: 1000, nextReq: { stage: 'debut', fans: 1000 } },
    { id: 'chart',     name: '🏆 打歌冲榜',   desc: '冲击音乐排行榜',
      statReq: 65,  fanReq: 5000, nextReq: { stage: 'single', stats: 60 } },
    { id: 'celebrity', name: '👑 一线明星',   desc: '成为顶级偶像巨星！',
      statReq: 80,  fanReq: 20000, nextReq: { stage: 'chart', fans: 20000, stats: 75 } }
  ],

  // ---- 随机事件配置 ----
  EVENTS: {
    good: [
      { id: 'scout',    title: '🌟 街头星探',
        text: '你在街头被知名经纪公司星探发现！资源瞬间暴涨！',
        effects: { fans: [200, 500] } },
      { id: 'viral',    title: '📈 视频走红',
        text: '你的练习视频在社交媒体上意外走红，收获大量关注！',
        effects: { fans: [500, 1000] } },
      { id: 'mentor',   title: '🙏 前辈指导',
        text: '一位资深前辈对你进行了一对一指导，各能力大幅提升！',
        effects: { singing: [3,6], dancing: [3,6], appearance: [2,4], entertainment: [3,6] } },
      { id: 'endorse',  title: '💼 代言邀约',
        text: '你获得了品牌代言机会！不仅赚到钱还涨了知名度！',
        effects: { money: [2000, 5000], fans: [100, 300] } },
      { id: 'fansupport', title: '🎁 粉丝应援',
        text: '粉丝们为你组织了大型应援活动，让你感动又充满能量！',
        effects: { fans: [100, 300], health: [5, 10], stress: [-5, -10] } },
      { id: 'variety_invite', title: '📺 综艺邀请',
        text: '知名综艺节目向你发出录制邀请，这是展示自己的好机会！',
        effects: { entertainment: [3,6], money: [1000, 2000], fans: [200, 500] } }
    ],
    bad: [
      { id: 'blackfan', title: '💢 黑粉攻击',
        text: '遭遇黑粉恶意造谣，粉丝流失且压力巨大！',
        effects: { fans: [-100, -300], stress: [10, 15] } },
      { id: 'mistake',  title: '😰 舞台失误',
        text: '演出中出现严重失误，遭到观众和网友批评！',
        effects: { singing: [-2,-5], dancing: [-2,-5], stress: [15, 20] } },
      { id: 'injury',   title: '🏥 训练受伤',
        text: '高强度训练导致身体受伤，健康严重下降！',
        effects: { health: [-15, -25], stress: [10, 15] } },
      { id: 'overwork', title: '😵 过度疲劳',
        text: '行程太满身体亮红灯，健康受损！',
        effects: { health: [-8, -15], stress: [15, 20] } },
      { id: 'stolen',   title: '😤 资源被抢',
        text: '重要的资源被竞争对手抢走，非常沮丧！',
        effects: { stress: [15, 20] } },
      { id: 'scandal',  title: '📰 负面新闻',
        text: '被传出不实负面新闻，形象受损粉丝流失！',
        effects: { fans: [-200, -500], stress: [10, 15] } }
    ],
    neutral: [
      { id: 'fanletter', title: '💌 粉丝来信',
        text: '收到一封暖心的粉丝来信，心情好了很多！',
        effects: { stress: [-8, -12], health: [3, 6] } },
      { id: 'weather',   title: '🌧️ 天气影响',
        text: '恶劣天气打乱了你的计划，有些烦躁',
        effects: { stress: [5, 10] } },
      { id: 'gossip',    title: '🗣️ 后台八卦',
        text: '听到一些业内八卦，放松了一下心情',
        effects: { stress: [-5, -8], entertainment: [1, 2] } }
    ]
  },

  // ---- 事件概率 ----
  EVENT_CHANCE: 0.4,              // 每天触发概率 40%
  EVENT_GOOD_WEIGHT: 0.4,        // 好事概率
  EVENT_BAD_WEIGHT: 0.4,         // 坏事概率
  EVENT_NEUTRAL_WEIGHT: 0.2,     // 中性事件概率

  // ---- 各阶段解锁的活动 ID ----
  STAGE_UNLOCK_ACTIVITIES: {
    debut:     ['studio', 'rehearsal'],
    single:    ['photoshoot', 'variety_show'],
    chart:     ['concert']
  }
};
