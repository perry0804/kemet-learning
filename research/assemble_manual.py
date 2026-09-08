from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
all_rows = []
for filename in ['abilities_red_blue.json', 'abilities_white_black.json', 'abilities_amber.json']:
    all_rows.extend(json.loads((ROOT / 'research' / filename).read_text()))

def tidy(text):
    text = text.replace('「？＋1」', 'X＋1').replace('「？」', 'X')
    text = text.replace('祈祷点数', '祈祷值').replace('一般移动', '普通移动')
    text = text.replace('军团部队数量', '军团中的士兵数').replace('军团部队上限', '军团士兵上限')
    text = re.sub(r'([0-9X]+)\s*支部队', r'\1 个士兵', text)
    text = re.sub(r'([0-9]+)\s*个部队', r'\1 个士兵', text)
    text = text.replace('任意数量的部队', '任意数量的士兵').replace('添加部队', '添加士兵')
    return text

def notes_for(row):
    text = tidy(row.get('notes', ''))
    sentences = re.split('(?<=。)', text)
    sentences = [s for s in sentences if not any(x in s for x in ['category', '按任务要求', '原图位于虚线框', '原图在虚线框'])]
    text = ''.join(sentences).strip()
    text = text.replace('问号为原图使用的变量符号，依原文保留，未替换成固定数字。', 'X 表示此次选择或结算的数量，必须符合手牌、资源和军团上限。')
    if row['name'] == '全力增援':
        text = '仍受供应区实际士兵数、军团上限和正常招募地点限制；并非获得无限模型或随意向野外补兵。'
    return text

parts = [(ROOT / 'research' / 'manual_core.md').read_text()]
parts.append('''<a id="powers"></a>
## 十五 五色能力完整索引

本章依据三张中文能力帮助卡转述。相同的重复实体板合并说明；黑色剑族佣兵、矛族佣兵因名称和图画不同分别保留。共有 **86 条说明：71 条常规能力说明对应 80 块常规实体板，另附 15 条三级替换候选**。替换模块换入候选时，会换出该颜色的“主宰”，不是把候选全部叠加进市场。

正常购买费用为该板等级对应的祈祷值，再应用允许的减费。下列“购买时”“金色行动”“战斗步骤”描述的是效果的触发时机；一个持续能力也仍需先合法购买。没有明确写“免费”的行动，不自行免去其费用。

说明中的 X 是原图问号表示的变量，按自己实际选择或效果要求的数量结算。普通伤害、防御、真实伤害、战力分别计算。“额外”是加到通常效果上。特殊战斗牌替换能力只列照片给出的替换程序，未展示的特殊牌数值要查对应实物牌。

一级某能力有两块实体，不表示同一玩家能买两份叠加。无其他能力明确允许时，仍遵守相同图画不能重复拥有的限制。

''')

colors = [('红','红宝石','red','用户图 2'),('蓝','蓝宝石','blue','用户图 2'),('白','钻石','white','用户图 1'),('黑','黑玛瑙','black','用户图 1'),('琥珀','琥珀','amber','用户图 3')]
for col,label,anchor,source in colors:
    rows = [r for r in all_rows if r['color'] == col]
    parts.append(f'<a id="powers-{anchor}"></a>\n### {label}能力\n\n依据：{source}。\n\n')
    for level, category in [(1,'常规'),(2,'常规'),(3,'常规'),(3,'三级替换候选'),(4,'常规')]:
        chosen = [r for r in rows if r['level'] == level and r['category'] == category]
        title = f'{level} 级' if category == '常规' else '3 级替换候选'
        parts.append(f'#### {title}\n\n')
        for row in chosen:
            count = f"；同款 {row['copies']} 块" if row['copies'] > 1 else ''
            parts.append(f"**{row['name']}**{count}\n\n")
            parts.append(f"- 时机：{tidy(row['phase'])}。\n")
            parts.append(f"- 效果：{tidy(row['effect'])}\n")
            note = notes_for(row)
            if note:
                parts.append(f'- 注意：{note}\n')
            for issue in row.get('uncertain', []):
                parts.append(f'- 待核对：{issue}\n')
            parts.append('\n')

parts.append('''<a id="sources"></a>
## 十六 来源和需要核对的项目

### 16.1 本文使用的资料

- **用户图 1**：白色钻石、黑玛瑙帮助卡，文件名 `e5113295976a8487f868d4bdf6d03a60.jpg`。
- **用户图 2**：红宝石、蓝宝石帮助卡，文件名 `fb86dafe0638f4309674b9bcce128177.jpg`。
- **用户图 3**：琥珀帮助卡，文件名 `dff0bef1adc70fdb589c6c40e920cae0.jpg`。
- **用户确认**：六名玩家，各自作战，启用神祇入场；使用上述五色。带局者强调本游戏鼓励进攻，受到攻击后可以重新组织反击。
- **R1 新版规则书公开稿**：[Kemet Rise of the Gods Rulebook](https://www.scribd.com/document/905391047/Kemet-Rise-of-the-Gods-Rule-Book)。重点为开局第 4–5 页、流程第 6–11 页、神祇第 18 页。文档可见版本标识为 `KBS-Base_EN_rev51_2024-06-12`，属于公开开发阶段资料，不能声称已核对本局所有实体勘误。
- **R2 本体规则书**：[Kemet Blood and Sand Rulebook](https://www.scribd.com/document/619064269/59-kemet-blood-and-sand-rulebook)。用于与公共流程、移动和战斗进行交叉核对；涉及六人和神祇时使用对应扩展规则。
- **R3 规则速查**：[The Esoteric Order of Gamers 规则摘要](https://www.orderofgamers.com/downloads/KemetBloodandSand_v1.pdf)。用于帮助核对基本动作、战斗和黑夜顺序，不把旧摘要中未含的扩展内容视为不存在。
- **R4 发行方辅助表**：[Matagot 发布的 WIP updated player aid](https://boardgamegeek.com/filepage/282440/wip-updated-player-aid)，文件名 `Kemet_player aid_2024_v50_EN.pdf`。[可检索的辅助表镜像](https://tesera.ru/images/items/2508538/%D0%9F%D0%B0%D0%BC%D1%8F%D1%82%D0%BA%D0%B0%20Kemet%20RoG.pdf)。神祇文字说明与图示交叉核对，未把文字抽取中的跨栏排列当作生命值的可靠顺序。
- **R5 发行方神祇预览**：[Matagot 神祇模式公告](https://gamefound.com/en/projects/matagot/kemet-rise-of-the-gods/updates/3)及其[六位神祇板图](https://imgcdn.gamefound.com/richtextimage/richtext/ffa84a08-0f81-4ca9-9f0e-2c1fb371f0e4.jpg)。神祇生命上限和对应图标经过图像核对，但这是公开预览，不是用户的实体神卡照片。

### 16.2 已明确保留的边界

1. **神祇卡实物未拍摄。** 第十一章列出的六神数值和技能来自公开资料；开局按实际神板核对，尤其索贝克额外伤害是否仅限进攻。
2. **三级替换结果未给出。** 索引包含全部照片候选，不保证候选实际在市场。
3. **琥珀一级移动仆从姓名有反光。** 效果能读，姓名没有猜写；查实物即可定位。
4. **赫卡伊布反复进出同一神庙的触发边界**，照片未完整解释。本文只使用取得控制时收取收入的清楚用途，不添加无限循环的解释。
5. **特殊战斗卡与全部神谕卡的牌面没有提供。** 本文说明用法、结算和照片明确给出的替换效果，未编造索贝克之怒、战车风暴、龟甲防御、黑玛瑙之盾的具体数值。
6. **规则冲突的处理**：先辨别本局实物和勘误版本，再按明确的特殊卡牌、能力和模块例外处理一般规则。公开稿中的排版遗漏、拼写错误或表述矛盾，不擅自变成一条新规则。暂时无法确定的细节，在行动前由带局者查证并统一解释。

### 16.3 本文用词

“远古圣象”采用用户图 2 的名称。正文的“圣所”对应 Sanctuary，也可能在中文能力上出现“诸神圣殿”等译法；它和提供占领临时分的神庙区分使用。

这份文档是一份针对本局配置整理的中文教学与查阅指南。建议第一次上桌先读第三、第五、第八、第十一和第十四章，再按自己选择的能力查第十五章。
''')

output = ROOT / 'outputs' / '圣域血与沙_六人完整规则与玩法建议.md'
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(''.join(parts), encoding='utf-8')
print(output)
print('characters', len(output.read_text()), 'bytes', output.stat().st_size)
print('ability_entries',len(all_rows),'regular_tiles',sum(r['copies'] for r in all_rows if r['category']=='常规'),'optional_tiles',sum(r['copies'] for r in all_rows if r['category']!='常规'))
