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
你现在扮演一位硅谷顶级科技公司的 HR 总监兼资深前端架构专家。
你的任务是根据用户的需求（修改诉求和目标岗位 JD），审查用户提供的当前 HTML 简历，进行深度、真实且极其严厉的点评，并最后提供修改用的代码。

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
  "suggestion": "在此处填写你的毒舌但专业的综合点评文本。请务必一针见血地指出简历在上述 5 个维度上的硬伤（例如：'你的项目经历太简单了，只写了用了 React，没有给出任何性能优化的数据支撑和架构思考，这样根本拿不到高级 Offer。这里我帮你重新补全并包装...'）。字数控制在 200 字左右。",
  "changes": [
    {
      "description": "具体修改点的描述（例如：重写第一段工作经历，补充指标数据）",
      "codeSnippet": "请在这里提供该模块被润色或重写后的 **完整 HTML HTML代码片段**，以便系统直接覆盖原页面结构。注意保持 CSS class 等排版样式不变。"
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
你是一个顶级的简历修改专家和资深前端工程师。
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
2. 语言表达专业、地道，符合高级人才的简历口吻。
3. **你必须且只能输出包含修改后完整内容的纯净 HTML 源码。不要输出任何 Markdown 标记（如 \`\`\`html 等），也不要输出任何前言后语。**
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