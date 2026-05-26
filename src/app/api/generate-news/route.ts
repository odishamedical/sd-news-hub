import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { prompt, category, language, tone, includeThumbnail } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Using gemini-2.5-flash for speed and compatibility

    const systemInstruction = `You are an expert SEO Journalist for the SD News Hub, covering Odisha news.
You must return a single, valid JSON object containing an English and an Odia version of the news article.
Do NOT use markdown code blocks (\`\`\`json) in your response, just the raw JSON object.
Format:
{
  "title_en": "SEO Optimized English Headline",
  "title_or": "ଓଡ଼ିଆ ରେ ହେଡଲାଇନ୍",
  "summary_en": "Short English SEO description",
  "summary_or": "ଓଡ଼ିଆ ରେ ସାରାଂଶ",
  "content_en": "Full English news article (3-4 paragraphs)",
  "content_or": "ଓଡ଼ିଆ ରେ ସମ୍ପୂର୍ଣ୍ଣ ଖବର (୩-୪ ଅନୁଚ୍ଛେଦ)",
  "seo_keywords": "comma, separated, keywords",
  "hashtags": "#tags #odisha",
  "thumbnail_prompt": "A highly detailed, realistic prompt for an image generator (if requested) based on the news, in English."
}`;

    const fullPrompt = `${systemInstruction}
    
Please generate news for the following:
Prompt: ${prompt}
Category: ${category}
Language Priority: ${language}
Tone: ${tone}`;

    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();
    
    // Attempt to parse JSON safely (cleaning any accidental markdown blocks from Gemini)
    let cleanJsonStr = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const data = JSON.parse(cleanJsonStr);

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate news" }, { status: 500 });
  }
}
