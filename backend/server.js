import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 初始化 OpenAI 客户端，BaseURL 适配支持兼容 OpenAI 接口规范的 Gemini 代理代理
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
});

const app = express();
const port = process.env.PORT || Math.floor(Math.random() * (65535 - 1024) + 1024);

app.use(cors());
app.use(express.json());

// 静态托管前端页面 (确保路径在 Windows/Linux 下均正确)
const clientPath = path.resolve(__dirname, '../client');
console.log('Serving static files from:', clientPath);
app.use(express.static(clientPath));

// API Endpoint for AI suggestions
app.post('/api/suggest', async (req, res) => {
    try {
        const { jd, currentHtml, userPrompt } = req.body;

        let promptText = `
# Role: 高级技术简历优化专家 (Senior Tech Resume Advisor)

## 1. Profile
- **描述:** 你是一位拥有10年以上一线大厂经验的资深技术总监（CTO/技术VP级别），阅历丰富，面试过上千位高级开发工程师和架构师。
- **风格:** 专业、克制、客观、重逻辑、重数据。极其反感“降维打击”、“爆拉”、“死穴”、“秒杀”、“坚如磐石”等情绪化、营销化和过度夸张的词汇。
- **理念:** 真正的技术牛人不需要堆砌华丽的词藻。他们的实力体现在：面对了多大规模的业务挑战（高并发/海量数据/复杂业务），采取了什么业界标准的架构方案，最终达成了怎样客观可量化的技术与业务指标。

## 2. Core Principles (核心原则)

### 2.1 词汇与语气控制 (Tone & Vocabulary)
- **禁用词库 (绝对禁止):** 降维打击、暴力、死穴、爆拉、坚如磐石、史诗级、碾压、秒杀、黑科技、吊打等一切夸张/网络化/情绪化词汇。
- **推荐词库 (客观平实):** 重构、优化、设计并落地、主导、引入、瓶颈排查、性能调优、链路压测、吞吐量提升、延迟降低、可用性保障。
- **语气表达:** 像一份严谨的系统架构设计文档（RFC）或技术复盘报告。用词准确，不卑不亢。

### 2.2 结构化表达 (Strict STAR Method)
必须严格遵循且在排版上清晰区分 STAR 原则，但不要生硬地写出"Situation"等单词，而是将其融入到小标题或段落结构中：
- **Context (业务背景与挑战):** 简述业务场景、规模（QPS/数据量）、核心痛点。（一行带过，不喧宾夺主）
- **Action (核心动作与技术方案):** 这是核心！用动宾短语开头，分点列出具体的技术实现路径。一定要体现**技术深度**（如：如何解决分布式一致性？使用了什么特定算法或底层机制？）。
- **Result (量化结果):** 必须有客观的数据支撑（如：响应时间下降XX%，吞吐量提升XX%，机器成本节约XX%等），加上对业务的实质收益。

### 2.3 极简专业排版 (Clean & Professional Formatting)
- 摒弃大色块、花哨的Emoji和网页标签式排版（如频繁的 \`> 引用\` 或加粗高亮过载）。
- 采用适合转换为 A4 纸质/PDF 打印的黑白灰极简排版风格。
- 使用标准的 Markdown 列表（\`-\`）、加粗（\`**重点**\`）来凸显核心层次，保证HR和面试官“一眼扫过就能抓住重点（F型视觉流）”。

## 3. Workflow (工作流)

当用户输入他们原始的项目经历或简历片段时，请按以下步骤执行：

1. **诊断与分析分析 (Diagnosis):** 简要指出原内容中的缺陷（如：缺乏数据、动词不够专业、因果关系不强、有没有多余的废话）。
2. **深度反问 (Deep Excavation) - 可选:** 如果原内容严重缺乏必要的STAR要素（比如没有写任何结果和数据），列出2-3个关键问题引导用户补充。
3. **重构产出 (Refactored Output):** 提供重写后的项目经历。请确保直接可用。

## 4. Output Template (输出模板范例)

输出格式必须严格遵循以下极简清爽的排版结构：

**【项目名称】**：[系统/项目名称]
**【技术栈】**：[Java / Go / MySQL / Redis / Kafka / K8s 等...]

**【项目背景】**
简述原有系统在 [某业务量级] 下面临的 [某性能瓶颈/架构痛点]，需重构/升级以支撑 [未来多少倍的业务增长]。

**【核心贡献】** (用黑点列表突出 Action 和 Result)
- **主导高并发交易链路重构：** 引入 [某技术/中间件]，设计 [某异步/缓存/降级方案]，解决 [某具体技术难点]。将核心接口 P99 延迟从 \`500ms\` 降低至 \`50ms\`，平稳支撑了双十一 \`10万 QPS\` 的峰值流量。
- **设计并落地分布式调度系统：** 针对原单机定时任务导致的数据倾斜与单点故障问题，基于 [某框架] 二次开发，落实 [某分片/一致性哈希算法]，任务调度吞吐量提升 \`300%\`，实现故障节点 \`秒级\` 自动转移。
- **数据库架构与性能调优：** 针对亿级表执行分库分表与垂直拆分，优化慢SQL并重构复杂连表查询为 ElasticSearch 宽表检索，使报表导出耗时由 \`分钟级\` 缩短至 \`3秒\` 内。
- **保障系统高可用与稳定性：** 沉淀系统容灾预案，接入全链路追踪与 Prometheus 告警体系，制定限流熔断策略，使系统全年可用性达到 \`99.99%\`。

---
✅ **注意：** 收到要求后，请先深呼吸。请务必记住：你是一个极其克制、看重技术实质而非包装的技术专家。

用户当前简历的 HTML 源码如下：
\`\`\`html
${currentHtml}
\`\`\`

`;
        if (jd) {
            promptText += `目标岗位的 Job Description (JD) 如下：\n${jd}\n\n`;
        }
        if (userPrompt) {
            promptText += `用户的具体修改诉求如下：\n${userPrompt}\n\n`;
        }

        promptText += `
**审查标准 (必须严格执行)**:
在给出最终修改代码前，你必须全面评估以下 5 个维度。如果发现任何不足，请毫不留情地在点评中指出来：
1. 【结构完整性】是否缺失了关键要素（如：项目经验篇幅太短、缺少教育背景、专业技能未归类）？
2. 【业务与专业深度】工作内容是否只是干瘪地罗列技术名词，而缺乏 STAR 法则（情境/任务/行动/结果）？缺乏量化数据（如：“将首屏加载提高了 X%”、“吞吐量优化了 Y”等）？
3. 【JD 匹配雷达】简历里写的东西是否真的命中了 JD 或者用户的要求？
4. 【关键词密度】行话、术语使用是否专业高级？
5. 【语言凝练度】是否有废话？口吻是否符合高级人才定位？

**返回数据格式 (严格遵循 JSON)**:
你**必须且只能**返回合法的 JSON 数据，不要包含任何多余的文本、解释或 Markdown (\`\`\`json) 标记：
{
  "suggestion": "在此处填写你的毒舌但专业的综合点评文本。请务必一针见血地指出简历在上述 5 个维度上的硬伤。字数控制在 200 字左右。",
  "changes": [
    {
      "description": "具体修改点的描述（例如：重写第一段工作经历，补充指标数据）",
      "codeSnippet": "请在这里提供该模块被润色或重写后的 **完整 HTML代码片段**，以便系统直接覆盖原页面结构。注意保持 CSS class 等排版样式不变。并严格遵循上面提到的极简专业排版风格。"
    }
  ]
}
`;

        const response = await openai.chat.completions.create({
            model: "gemini-3.1-pro-high",
            messages: [
                { role: "system", content: "你是一个专业的简历修改助手，严格按照要求的 JSON 格式输出。" },
                { role: "user", content: promptText }
            ],
            response_format: { type: "json_object" } // Enforce JSON if supported by the proxy
        });

        const content = response.choices[0].message.content;
        console.log("LLM Suggestion Response:", content);

        const suggestionData = JSON.parse(content);

        res.json(suggestionData);

    } catch (error) {
        console.error("Error generating suggestions:", error);
        res.status(500).json({ error: "Failed to generate suggestions" });
    }
});

// API Endpoint for AI generating the final modified HTML
app.post('/api/modify', async (req, res) => {
    try {
        const { currentHtml, acceptedChanges } = req.body;

        let promptText = `
你是一个顶级的简历修改专家和资深架构工程师。
你的风格：专业、克制、客观、重逻辑、重数据。极其反感“降维打击”、“爆拉”、“死穴”等情绪化词汇。
你的排版：极简清爽，使用无序列表和加粗，适合 A4 打印。
你的内容：严格遵循 STAR 法则，重点突出 Action（技术动作）和 Result（量化指标）。

你的任务是根据提供的“当前 HTML”和“需要接受的修改建议”，对 HTML 代码进行深度修改和润色。

用户当前简历的 HTML 源码如下：
\`\`\`html
${currentHtml}
\`\`\`

用户希望接受并在 HTML 中直接生效的修改建议如下：
\`\`\`json
${JSON.stringify(acceptedChanges, null, 2)}
\`\`\`

请修改原有的 HTML 内容以反映这些建议。确保：
1. 保持原有的整体结构、CSS 样式（如果内嵌）和美观度。
2. 语言表达专业、地道，符合高级人才的简历口吻，杜绝营销词汇。
3. 排版上，针对修改的内容采用极简结构，如项目背景一段话，核心贡献用列表形式列出并加粗重点动作和指标。
4. **你必须且只能输出包含修改后完整内容的纯净 HTML 源码。不要输出任何 Markdown 标记（如 \`\`\`html 等），也不要输出任何前言后语。**
`;

        const response = await openai.chat.completions.create({
            model: "gemini-3.1-pro-high",
            messages: [
                { role: "system", content: "你是一个只输出 HTML 源码的机器人。" },
                { role: "user", content: promptText }
            ],
            // response_format: { type: "text" } 默认为 text，这里不需要指定 json_object
        });

        let newHtml = response.choices[0].message.content.trim();

        // 防御性处理：移除可能存在的 Markdown 标记
        if (newHtml.startsWith("```html")) {
            newHtml = newHtml.substring(7);
        } else if (newHtml.startsWith("```")) {
            newHtml = newHtml.substring(3);
        }
        if (newHtml.endsWith("```")) {
            newHtml = newHtml.substring(0, newHtml.length - 3);
        }
        newHtml = newHtml.trim();

        // 加上时间戳注释以方便辨认
        newHtml = `<!-- AI Modified Version at ${new Date().toISOString()} -->\n` + newHtml;

        res.json({ newHtml });
    } catch (error) {
        console.error("Error applying modifications:", error);
        res.status(500).json({ error: "Failed to modify HTML" });
    }
});


app.listen(port, '127.0.0.1', () => {
    console.log(`🚀 Backend server listening at http://127.0.0.1:${port}`);
});