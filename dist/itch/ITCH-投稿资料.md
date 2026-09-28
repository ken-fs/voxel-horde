# Voxel Survivors — itch.io 投稿资料

> 全部内容可直接复制粘贴到 itch.io 的表单里。
> 素材文件在同目录：`cover-630x500.png`（封面）+ `screenshot-1..5.png`（截图）。
> 游戏包：`voxel-survivors-itch.zip`（上传时勾选 "This file will be played in the browser"）。

---

## 页面标题

```
Voxel Survivors
```

## 一句话简介（Tagline / Short description）

```
Cut through a 300-strong voxel horde. Free, plays in your browser.
```

## 完整描述（Description）

```
A survivors-like with 300 soldiers on screen, monster lairs you walk into, and three ultimates you switch between.

The horde chases you. The lairs don't — they sit there and wait, and they're full of monsters.
Walk in when you're ready, clear them out for a guaranteed weapon, and get out before the soldiers box you in.

Two pressures, two answers. That's the whole game.

▸ 300 soldiers swarming you at once
▸ 6 monster lairs that never chase you — you decide when to fight
▸ 4 monster types: hounds, spitters, bombers, and shamans that heal the others
▸ Bosses every 3 waves, each one teaching a new mechanic: charge, slam, summon
▸ 8 weapons, one per pickup — you'll see all of them in a good run
▸ Rocks and trees block everyone. Break them for potions.
▸ Three ultimates on one key: fire lance, thunderfall, deep freeze
▸ Your basic attack only covers the arc in front of you. Face what you want to kill.

Controls
  WASD    move
  Q       whirlwind (hits all around — your escape button)
  E       dash (brief invincibility)
  R       ultimate
  F       switch ultimate element
  Mouse   left = whirlwind, right = dash, wheel = switch element
  Mobile  drag on the left half to move, tap the skill cards
```

## 分类与标签

```
Genre         Action
Tags          survivors-like, voxel, roguelite, horde, 3d, browser,
              singleplayer, arcade, difficult, wave-based
Made with     three.js
Languages     English
Inputs        Keyboard, Mouse, Touch (mobile playable)
Average play  3-6 minutes per run
Price         No payment (free) — 或勾 "No payment required"
```

## 上传设置

| 字段 | 填什么 |
|---|---|
| Kind of project | **HTML** |
| "This file will be played in the browser" | ✅ **勾上** |
| Embed options → Viewport | 建议 `1280 × 720` |
| "Mobile friendly" | ✅ 勾上（触屏已支持）|
| Orientation | Landscape（横屏体验更好，但竖屏也能玩）|
| Cover image | `cover-630x500.png`（630×500）|
| Screenshots | `screenshot-1..5.png` |
| Visibility | 建议先 **Restricted / Draft**，自己跑一遍再公开 |

---

## 投稿后要做的事

1. **自己先玩一遍**（用 itch 的页面玩，不是本地）—— 确认在 itch 的 iframe 里也正常
   - ⚠️ iframe 里的键盘事件：如果失去焦点，按 WASD 会没反应。
     已经加了 `addEventListener('mousedown', ...)` 里的 `audioReady()`，
     但**点击画布一次**才能确保拿到焦点 —— 如果玩家反馈"按键没反应"，就是这个原因。
2. **看 24 小时数据**：itch 会显示 views / plays。**plays 才是真信号**，views 只是路过。
3. **重点看**：有没有人玩超过 3 分钟（itch 有 "Average session" 数据）。
   这个数字比总播放量重要得多 —— 它回答的是"陌生人会不会玩第二局"。
4. 如果 24 小时后 plays < 50，说明 itch 的自然流量不够，该走 CrazyGames / GameDistribution
   （那些平台自带更大的流量池，但有审核门槛）。

---

## 备用渠道（同一份 zip）

| 平台 | 门槛 | 说明 |
|---|---|---|
| **itch.io** | 无 | 现在投这个 |
| **GameMonetize / GameDistribution** | 开放注册 | 他们托管 + 挂广告 + 分成，最容易真正开始收钱 |
| **CrazyGames** | 有审核 | 流量最大，奖励视频 RPM 最高 |
| **Poki** | 邀请制 | 先不用考虑 |
