import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const prompt_refiner = async (prompt) => {
    const reasoning_step = z.object({
        explanation: z.string(),
        output: z.string(),
    })
    const result_structure = z.object({
        steps: z.array(reasoning_step),
        final_result: z.string(),
    });
    const openai = new OpenAI({ apiKey: "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" });
    const completion = await openai.beta.chat.completions.parse({
        model: "gpt-4o-mini",
        messages: [
            {
                "role": "system", "content":`You are an AI assistant specialized in generating prompts for Stable Diffusion, an AI image generation model. Your task is to create effective prompts based on user inputs, focusing on photorealistic results suitable for marketing purposes.

                Instructions:
                1. Analyze the user's input and generate a prompt for Stable Diffusion that will produce a high-quality, photorealistic image suitable for marketing purposes.
                2. The prompt should be in English and consist of simple, common, and very descriptive keywords.
                3. Separate the keywords with commas and do not use periods.
                4. The final prompt must not exceed 20 words.
                5. Focus on elements that enhance photorealism and marketing appeal, such as lighting, composition, and image quality.
                
                Before providing the final prompt, develop your ideas inside <prompt_development> tags. Consider the following aspects:
                - List key visual elements from the user's input
                - For each element, brainstorm photorealistic qualities (e.g., lighting, textures, details)
                - Suggest marketing-friendly aesthetics (e.g., composition, color scheme, mood)
                - Add technical image quality terms (e.g., high resolution, HDR)
                
                After your thought process, provide the final prompt in <final_prompt> tags. Then, count the words in your final prompt to ensure it doesn't exceed 20 words. If it does, revise it to meet the word limit.
                `}
            ,
            {
                "role": "user",
                "content":prompt
            }
        ],
        response_format: zodResponseFormat(result_structure, "result"),

    });
    const result = completion.choices[0].message.parsed;
    console.log(result);
    return result.final_result;
}


const prompt ="Black wood modern Room"


let response = await prompt_refiner(prompt);
console.log(response);