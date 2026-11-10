export const APP_VERSION = '0.1.0'

export interface ChangelogEntry {
  version: string
  date: string
  items: string[]
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '0.1.0',
    date: '2026-11-10',
    items: [
      '新增「关于」页面：版本号、更新日志、开源鸣谢与安全说明。',
      '设置页新增清除缓存：可清理回放解析缓存与临时文件，保留录像和设置。',
      '战斗节点支持德鲁伊熊灵独立展示：可用选项卡切换本体/熊灵，也可同时显示；伤害、技能、物品与时间线分开，总量仍计入德鲁伊。',
      '修正回放伤害导出：补齐熊灵作为攻击方/受击方的伤害，修复「承受伤害」与 HP 变化对不上的问题。',
      '官网恢复：修复 index.html 编码损坏导致整页无法渲染的问题。'
    ]
  },
  {
    version: '0.1.0',
    date: '2026-11-09',
    items: [
      '战斗节点面板可读性提升：放大文字，加入英雄头像、技能与道具图标。',
      '比赛查询新增 STRATZ 备用源：OpenDota 不可用时自动回退（需配置 STRATZ Token）。',
      '比赛查询增加 12 秒超时与明确错误提示，避免加载动画一直转圈。',
      '历史记录高级分析可直接打开时间轴；历史页分析结果增加时间轴入口。'
    ]
  },
  {
    version: '0.1.0',
    date: '2026-11-04',
    items: [
      '高级分析新增德鲁伊双背包：本体与小熊 6+1+3 格独立显示，出装路线合并。',
      '邪影芳灵「作祟 / 恐吓」按共用加点合并显示。',
      '修复战斗节点击杀者被重复计入助攻的问题。',
      '时间轴弹窗：吸顶时间滑条、亚克力质感、圆点层级修正。'
    ]
  },
  {
    version: '0.1.0',
    date: '2026-11-03',
    items: [
      '时间轴弹窗重构：走势图换成 Chart.js，出装轨只显示分析对象。',
      '背包按真实格位还原：合成配件、卷轴、消耗品不再误显示。',
      '新增德鲁伊小熊背包数据、名称库与图标体系。'
    ]
  }
]

export interface Acknowledgment {
  name: string
  url: string
  note: string
}

export const ACKNOWLEDGMENTS: Acknowledgment[] = [
  { name: 'OpenDota', url: 'https://www.opendota.com/', note: '比赛数据与公开 API' },
  { name: 'STRATZ', url: 'https://stratz.com/', note: '备用比赛数据与分路/位置信息' },
  { name: 'Clarity', url: 'https://github.com/skadistats/clarity', note: 'Dota 2 回放解析' },
  { name: 'Vue.js', url: 'https://vuejs.org/', note: '前端框架' },
  { name: 'Vite', url: 'https://vite.dev/', note: '前端构建工具' },
  { name: 'Chart.js', url: 'https://www.chartjs.org/', note: '时间轴走势图' },
  { name: 'Electron', url: 'https://www.electronjs.org/', note: '桌面客户端容器' },
  { name: 'TypeScript', url: 'https://www.typescriptlang.org/', note: '类型系统' },
  { name: 'fastutil', url: 'https://fastutil.di.unimi.it/', note: 'Clarity 依赖的集合库' },
  { name: 'snappy-java', url: 'https://github.com/xerial/snappy-java', note: '回放压缩流解压' }
]

export const SECURITY_NOTES: Array<{ title: string; body: string }> = [
  {
    title: 'API Key 只保存在本机',
    body:
      'AI Key、STRATZ Token、自定义接口 Key 都保存在浏览器 localStorage 的 truesight.config.v1 中，不会写入日志、代码仓库或安装包，也不会随分析结果上传到第三方。'
  },
  {
    title: '请求经过本地代理',
    body:
      '前端只访问本机服务。AI 请求由本地 Python 服务转发到所选模型提供商；STRATZ 请求由本地代理携带 Token 调用 api.stratz.com。第三方只能看到完成请求所必需的内容。'
  },
  {
    title: '数据留在本地',
    body:
      '回放、解析结果、历史分析记录都保存在本机。应用没有遥测、统计上报或云端账号系统；删除缓存或卸载应用即可清理本地数据。'
  },
  {
    title: '清除缓存不会泄露密钥',
    body:
      '设置页的「清除缓存」只删除回放解析 JSON 与临时文件，不会动 API Key、STRATZ Token、设置或历史分析记录。'
  }
]
