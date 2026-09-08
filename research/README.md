# 分析资料与验证记录

本目录保存游戏研究、规则转录、地图建模、文档生成和验证过程。当前游戏使用的数据位于根目录的 `data/`，这些研究记录用于追溯依据，不应直接视为当前程序运行结果。

## 内容索引

- `abilities_*.json`：用户提供的五色能力帮助卡转录。
- `combat_cards_verified.json`：战斗牌、特殊牌和神谕牌的数值、费用及来源证据。
- `gods_verified.json`：神祇数值、能力和公开版本的待核事项。
- `map_regions.json`、`asset_positions.json`：地图地区、连接关系、坐标变换和图片定位。
- `game_model_notes.md`：行动面板、回合状态机、规则实现检查项。
- `battle_scenarios.json`：战斗教学场景及预期结算。
- `manual_core.md`、`assemble_manual.py`：规则正文和文档组装脚本。
- `selfplay.cjs`：十二个固定种子的自动对局检查脚本。
- `rules.pdf`、`kemet_official_rules.pdf`、`rules.txt`：规则原文及文本提取。两份 PDF 字节相同，为保留历史引用保留两个文件名；Git 对相同内容使用同一个对象。
- `battle_rules-*.png`、`battle_photo_3cards.jpg`、`battle_special_3_3.jpg`、`di_base_verified.png`、`game_model_playerboard.png`：规则核对图片。
- `gods_campaign_photo.jpg`：公开神祇预览图。
- `assets/`：背景图和生成提示词。
- `game-ui-desktop.png`：当时的桌面端沙盘截图。
- `game-ui-check.png`：一次访问失败时的检查截图，不能当作成功验证。
- `aid.pdf`：下载失败后保存的 HTML 响应，不是有效 PDF，不能作为规则依据。
- `manifest.json`：纳入文件、哈希、路径规范化及排除项记录。

原始资料仍保留在原工作目录。此仓库副本将个人电脑上的绝对路径改为仓库相对路径；文档生成脚本也改为相对自身定位根目录。

## 生成规则文档

在仓库根目录执行，Python 脚本仅使用标准库：

```bash
python3 research/assemble_manual.py
```

结果写入根目录 `outputs/`，不覆盖已归档的 `docs/` 或网站中的 `public/rules.md`、`public/rules.html`。

## 运行自动对局检查

先按根 README 安装 Node.js 和项目依赖，然后在仓库根目录执行：

```bash
npx tsc lib/game.ts --outDir research/game-compiled --target ES2022 --module commonjs --esModuleInterop --resolveJsonModule --skipLibCheck
node -e "require('node:fs').writeFileSync('research/game-compiled/package.json', JSON.stringify({type:'commonjs'}))"
node research/selfplay.cjs
```

脚本将人类席位也自动化，检查十二个固定种子的对局是否结束，以及士兵、资源、卡牌等不变量。它不替代人类交互、3D 显示或全部特殊规则的验证。`game-compiled/` 是可重新生成的产物，不提交到仓库。

2026 年 9 月 8 日归档检查：文档生成成功；十二个固定种子的自动对局均通过，最大执行步数为 578。规则提取文本保留原有空白排版。

## 归档范围

依赖目录、npm／Swift 缓存、临时编译目录、Worker 运行状态和部署压缩包未归档。图片与规则文档的版权归相应权利人所有，仓库中的研究副本不代表获得了公开再分发许可。
