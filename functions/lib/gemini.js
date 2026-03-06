"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeImageWithGemini = analyzeImageWithGemini;
const generative_ai_1 = require("@google/generative-ai");
// Initialize the Gemini API client
// Note: You must set the GEMINI_API_KEY environment variable in your functions config.
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
async function analyzeImageWithGemini(mimeType, imageBuffer) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    // Choose the model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
당신은 스크린 타임 분석 AI입니다. 사용자의 스마트폰 스크린 타임 캡처 화면을 보고 다음의 정보를 추출하여, 지정된 JSON 형식으로만 응답해 주세요. 그 외의 텍스트는 출력하지 마세요.
1. totalMinutes: 화면에 표시된 총 사용 시간(분 단위로 환산할 것. 예: 3시간 10분 -> 190)
2. apps: 화면에 나와 있는 자주 사용한 앱 통계 (상위 3개~5개까지만)
   - name: 앱 명칭 (예: Instagram, YouTube, Safari 등)
   - minutes: 해당 앱의 사용 시간(분 단위로 환산)
3. advice: 사용 기록을 바탕으로 한 짧고 친근한 디톡스 조언 (1문장, 50자 내외)

출력 예시 JSON 형태:
{
  "totalMinutes": 190,
  "apps": [
    { "name": "Instagram", "minutes": 110 },
    { "name": "YouTube", "minutes": 45 },
    { "name": "Safari", "minutes": 20 }
  ],
  "advice": "인스타그램 사용 시간이 길어요. 내일은 사용을 조금 더 줄여보는 건 어떨까요?"
}
`;
    const imageParts = [
        {
            inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType,
            },
        },
    ];
    try {
        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        const text = response.text();
        // Remove markdown formatting if the model wraps the JSON response in ```json ... ```
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
        const jsonString = jsonMatch ? jsonMatch[1] : text;
        return JSON.parse(jsonString.trim());
    }
    catch (error) {
        console.error("Error calling Gemini API:", error);
        throw error;
    }
}
//# sourceMappingURL=gemini.js.map