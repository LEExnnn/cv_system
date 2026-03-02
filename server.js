import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// TODO: Import your favorite LLM SDK here (e.g., openai, @google/genai, etc.)

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Endpoint for AI suggestions
app.post('/api/suggest', async (req, res) => {
    try {
        const { jd, currentHtml, userPrompt } = req.body;
        
        // TODO: Construct the prompt for the LLM
        // Role: Top-tier resume modification expert and career planning expert.
        // Task: Analyze the JD/userPrompt against the currentHtml.
        // Provide constructive, optimal advice for improvement. Include specific changes.
        
        // Mock Response for now
        const mockResponse = {
            suggestion: "【专家建议】根据您提供的JD，您的简历中缺乏对项目数据指标的量化描述。建议在“工作经历”部分增加具体的数据支撑，如“提升了XX%的效率”。同时补充您在分布式系统方面的经验。",
            changes: [
                {
                    description: "在项目A中增加效率提升的数据。",
                    // In a real scenario, this might return JSON patches or the completely rewritten HTML part.
                    codeSnippet: "<li>主导重构核心交易链路，降低延迟 30%，提升吞吐量 50%。</li>" 
                }
            ]
        };

        res.json(mockResponse);

    } catch (error) {
        console.error("Error generating suggestions:", error);
        res.status(500).json({ error: "Failed to generate suggestions" });
    }
});

// API Endpoint for AI generating the final modified HTML
app.post('/api/modify', async (req, res) => {
    try {
        const { currentHtml, acceptedChanges } = req.body;

         // TODO: Construct the prompt for the LLM
        // Ask it to apply the acceptedChanges to the currentHtml and return the FULL new HTML string.
        
        // Mock Response for now (just returning the current HTML with a tiny modification comment)
        const newHtml = `<!-- AI Modified Version at ${new Date().toISOString()} -->\n${currentHtml}`;

        res.json({ newHtml });
    } catch (error) {
        console.error("Error applying modifications:", error);
        res.status(500).json({ error: "Failed to modify HTML" });
    }
});


app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});
