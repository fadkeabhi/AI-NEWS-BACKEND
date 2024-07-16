const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
    GoogleGenerativeAIResponseError
} = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);


let generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

const safetySetting = [
    {
        category: HarmCategory.HARM_CATEGORY_UNSPECIFIED,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DEROGATORY,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_TOXICITY,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_VIOLENCE,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUAL,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_MEDICAL,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
];


async function getGeminiResponse(systemInstruction, prompt, generationConfig = generationConfig) {

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: systemInstruction,
        });

        const chatSession = model.startChat({
            generationConfig,
            safetySetting,
            history: [
            ],
        });


        const result = await chatSession.sendMessage(prompt);
        // console.log(result.response.text());
        return result.response.text();
    } catch (error) {
        if (error instanceof GoogleGenerativeAIResponseError && error.message.includes('Candidate was blocked due to SAFETY')) {
            console.error('Generated content was blocked due to safety concerns.');
            return JSON.stringify({ error: "safety" });
        } else {
            // Handle other errors
            console.error('Error:', error);
            return JSON.stringify({ error: "unknown" });
        }
    }
}



async function AIGetNewsFromRaw(data) {
    const systemInstruction = process.env.SystemInstructionAIGetNewsFromRaw;
    generationConfig.responseMimeType = "text/plain";
    const result = await getGeminiResponse(systemInstruction, data)
    return result;
}

async function AIGetNewsSummeryAndQuestionsWithTags(data) {
    const systemInstruction = process.env.SystemInstructionAIGetNewsSummeryAndQuestionsWithTags;
    generationConfig.responseMimeType = "application/json";
    const result = await getGeminiResponse(systemInstruction, data, generationConfig);
    try{
        return JSON.parse(result);
    } catch(err){
        console.error("invalid json");
    }
}



module.exports = { AIGetNewsFromRaw, AIGetNewsSummeryAndQuestionsWithTags }