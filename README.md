# Voxel Survivors — 浏览器体素幸存者游戏 + 4 个可复用子系统

一个**能玩的**浏览器 3D 幸存者类游戏（Vampire Survivors 式），以及它底层的 4 个可复用子系统。
纯 ES modules + Three.js，**无构建步骤**，**零外部美术资产**（模型/贴图/音频全部代码生成）。

> **来源与许可**：4 个子系统抽自 **[voxel-musou](https://github.com/mike007jd/voxel-musou)**
> （MIT，© 2026 BubuAi）—— 一个 Three.js 写的浏览器体素动作游戏。
> 抽取原则：只抽「依赖干净 + 职责单一 + 不被游戏循环驱动」的模块；
> 深度耦合的（vfx 7 个依赖 / audio 3 个）不抽 —— 抽的成本 ≈ 重写。
> 本仓库的游戏层（玩法/技能/掉落/Boss/据点）为新增，**主题已换皮**（军旗改原创骷髅徽记，无既有作品 IP）。

**约 3,000 行 · 8 个模块 + 游戏 · 零外部资产**。

---

## 项目状态（2026-09-27）

**可玩原型已完成，未部署、未做分发。** 功能层面完整（移动/技能/升级/掉落/据点/野怪/Boss 全套），
缺的是**分发和验证** —— 下一步应该是「投哪个平台让人玩到」，而不是「再加什么功能」。

已知缺口：**只有键鼠，手机不能玩**（幸存者类的主场在移动端）· 无存档/最高分 · vendor 2.1MB 首屏偏慢。

---

## 一、跑起来

```bash
cd game-starter
python3 -m http.server 8891
# 先玩 http://localhost:8891/demos/play/     ← 可玩版（WASD 移动，攻击自动）
# 或看 http://localhost:8891/demos/horde/    ← 组合 demo（纯展示，不可操作）
```

`vendor/three` 是指向原仓库 vendored Three.js 的软链。**单独拿走时换成你自己的 three**
（注意版本：原作者用的是 r186 前后的 vendored 版；`post.js` 依赖 `UnrealBloomPass` + `Pass` 两个 addon）。

## 二、6 个 demo

| demo | 路径 | 证明什么 | 实测 |
|---|---|---|---|
| ⭐ **可玩版** | `/demos/play/` | **starter → 能上线的小游戏**（幸存者类）<br>移动 + 自动攻击 + 升级三选一 + 波次 + 结算 + 最佳记录 | 快进 60s = 704 击杀 / 15 级 / 第 3 波；死亡→存档→重开全通 · 控制台干净 |
| **组合切片** | `/demos/horde/` | 4 个子系统拼起来能跑 | 304 兵围殴 + 体素环境 + 火把 bloom · HP 掉到 97.6（受击链路通）|
| 体素网格 | `/demos/voxel/` | 盒子列表 → 带 AO 的网格 | `sculpt()` 51,584 tris vs 纯盒子 144 |
| 骨架 IK | `/demos/rig/` | 2-bone IK 真的把手贴到武器上 | `handR_on_shaft_offset: -0.08` · 21 关节 |
| 后处理链 | `/demos/post/` | 同一场景的观感差全来自这条链 | 左原生 / 右后处理 对照 |
| 群体系统 | `/demos/crowd/` | 300 单位独立驱动 | 304 单位 / 交战 76 / 攻击令牌生效 |

全部 demo 控制台干净 ✅

## 三、4 个子系统（`lib/`）

| 模块 | 行数 | 做什么 | 换项目要改 |
|---|---|---|---|
| `voxel.js` + `rng.js` | 171 | 盒子列表 → 体素网格（只出面 + 顶点 AO + 逐体素色抖动）；确定性随机 | 无（拿盒子数据喂就行）|
| `rig.js` | 364 | 人形骨架 + 姿势格式 + 关键帧插值 + **2-bone IK** + 脚部着地 | `DIM` 骨长表 + `STANCE` |
| `post.js` | 256 | 大气透视 → 单pass景深 → Bloom → Lottes 调色 → 抖动/量化 | `SUN_DIR` + 顶部 `P` 参数对象 |
| `crowd.js` + `view.js` + `hitfx.js` + `events.js` | 1,181 | 群体行为状态机 + 小队编队 + 攻击令牌 + InstancedMesh 渲染 + 姿态混合 + 受击闪光 | `CROWD` 配置 + `bodyParts()` 外观 |

## 四、最小驱动接口（组合 demo 里已验证）

```js
// crowd 只需要 6 个字段的 game 存根
const game = {
  frame: 0, freeze: 0,
  hero: { x: 0, y: 0, z: 0, hp: 100 },
  cam: { yaw: 0 },
  combat: { enemyStrike(i) { /* 玩家受伤逻辑 */ } },
  crowd: null,
};
game.crowd = createCrowd(game, 300);              // 300 兵 + 4 军官
const crowdView = createCrowdView(scene, game);
game.crowd.spawnArmy();

// post.js 自建 renderer：建好 canvas 传进去
const post = createPost({ canvas, width, height });
post.render(scene, camera, time, focus, flash);

// 固定 60Hz：sim 只在 step() 里推进，渲染只读状态
while (acc >= 1 / 60) { game.frame++; game.crowd.step(); acc -= 1 / 60; }
crowdView.update(dt);
```

## 五、`/demos/play/` 已实现的部分（原计划的 550 行）

| 计划项 | 状态 |
|---|---|
| 玩家操作（键盘 + 自动攻击）| ✅ 已实现 |
| 升级三选一（6 项强化）| ✅ 已实现 |
| 波次调度 + 难度曲线 | ✅ 已实现（每 30 秒一波）|
| 存档 + 结算 + 「再来一次」| ✅ 已实现（localStorage 最佳记录）|

**还差的**：移动端虚拟摇杆（~80 行，你的流量大头是手机）、音效、真人试玩调平衡。
详见 `demos/play/README.md`。

## 六、许可与红线

- 代码 MIT ✓ 可商用，**保留 `LICENSE`（© 2026 BubuAi）**
- 字体 `brush.woff2`（未包含在本 starter）是 SIL OFL 1.1
- ❌ **原作主题/IP 不能一起搬**：赵云 / 无双 / 蜀魏 / 长坂是光荣特库摩的商标与角色。
- ✅ **本 starter 已做最小换皮**：`lib/view.js` 的 `flagTexture()` 里，军旗从原作的「魏」字
  改成了原创骷髅徽记（同一套画法、金边红底燕尾旗，但不指涉任何既有作品）。
  角色、配色、文案均为 starter 自带 —— 现在这套主题可以商用。
