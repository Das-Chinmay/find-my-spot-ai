
import { GoogleGenAI, Type, GenerateContentResponse, GroundingChunk } from "@google/genai";
import { AnalysisResult } from '../types';

// This function converts a File object to a base64 string
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        resolve('');
      }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const analyzeImage = async (imageFile: File): Promise<AnalysisResult> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const imagePart = await fileToGenerativePart(imageFile);

    const prompt = `
        You are the intelligence layer for an app called "Find My Spot." Your goal is to identify the location of an uploaded image by simulating a match against a satellite imagery database.

        1.  **Analyze the Image:** Examine the provided image for key geographical and man-made features (e.g., mountains, coastlines, forests, cities, deserts, unique landmarks, architectural styles, vegetation types).
        2.  **Infer Context:** Based on your analysis, infer the likely climate, biome, and potential regions on Earth.
        3.  **Simulate Database Match:** Act as if you have queried a massive FAISS database of satellite image embeddings and found the top 5 closest matches.
        4.  **Generate Results:** Return a JSON object that strictly follows the provided schema.
            - "summary": A friendly, confident, one-paragraph summary of your top finding. For example: "This looks like Banff National Park, Canada! The satellite imagery shows a near-identical mountain-lake alignment."
            - "matches": An array of 5 plausible match objects. These should be geographically diverse but consistent with the image's features. The first match should be the most likely one. Each object in the array must conform to the provided schema. For the similarity_score, generate a realistic float value between 0.85 and 0.99, with the highest score for the first match.

        Do not mention that you are simulating. Act as the real service. Provide a direct, clean JSON output without any markdown formatting.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    summary: { type: Type.STRING },
                    matches: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                region_name: { type: Type.STRING },
                                country: { type: Type.STRING },
                                latitude: { type: Type.NUMBER },
                                longitude: { type: Type.NUMBER },
                                description: { type: Type.STRING },
                                similarity_score: { type: Type.NUMBER },
                            },
                            required: ["region_name", "country", "latitude", "longitude", "description", "similarity_score"],
                        },
                    },
                },
                required: ["summary", "matches"],
            },
        },
    });
    
    const text = response.text.trim();
    const result = JSON.parse(text);

    // Add placeholder satellite images
    result.matches.forEach((match: any, index: number) => {
      match.satellite_image_url = `https://picsum.photos/seed/${match.latitude}${match.longitude}/600/400`;
    });

    return result as AnalysisResult;
};

export const getMoreInfo = async (locationName: string): Promise<{ text: string, sources: GroundingChunk[] }> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `Provide a brief, engaging summary of ${locationName}. Include interesting facts about its geography, history, or what it's known for.`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    const text = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { text, sources };
};
