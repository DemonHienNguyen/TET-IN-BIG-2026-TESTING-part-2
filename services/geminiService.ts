import { GoogleGenAI, Type } from "@google/genai";
import { FortuneResult } from "../types";

// Fix: Always use process.env.API_KEY and create fresh instances per call to handle key selection updates correctly
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFortune = async (userBirthYear: string, userQuestion: string): Promise<FortuneResult> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Tôi sinh năm ${userBirthYear}. Hãy gieo cho tôi một quẻ đầu năm Bính Ngọ 2026 về: ${userQuestion}. Hãy trả lời bằng tiếng Việt một cách trang trọng, đậm chất văn hóa Việt Nam.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING },
          luckLevel: { 
            type: Type.STRING,
            enum: ['Đại Cát', 'Trung Cát', 'Tiểu Cát', 'Bình An']
          }
        },
        required: ["title", "content", "luckLevel"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateTetGreetingCard = async (description: string): Promise<string | null> => {
  const ai = getAI();
  const prompt = `A beautiful Vietnamese Lunar New Year (Tet) digital painting for 2026 (Year of the Horse - Bính Ngọ). High quality, festive, red and gold themes. Including: ${description}, blooming cherry blossoms (Hoa Đào), yellow apricot blossoms (Hoa Mai), stylized energetic horse motifs, traditional patterns.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const generateTetWish = async (recipient: string, style: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Viết một lời chúc Tết Bính Ngọ 2026 ngắn gọn, ý nghĩa dành cho ${recipient} theo phong cách ${style}. Trả lời chỉ chứa nội dung lời chúc.`
  });
  return response.text || "Chúc mừng năm mới Bính Ngọ!";
};

export const generateTetPoetry = async (theme: string, type: 'couplet' | 'poem'): Promise<string> => {
  const ai = getAI();
  const prompt = type === 'couplet' 
    ? `Viết một cặp câu đối Tết Bính Ngọ 2026 ý nghĩa về chủ đề: ${theme}. Trình bày theo dạng 2 dòng đối nhau.`
    : `Viết một bài thơ lục bát ngắn (4-6 câu) chúc Tết 2026 về chủ đề: ${theme}.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt
  });
  return response.text || "Vạn sự như ý - An khang thịnh vượng";
};

export const analyzeTetFood = async (base64Image: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: "Đây là món ăn gì trong ngày Tết Việt Nam? Hãy giải thích ý nghĩa của nó và cách làm sơ lược bằng tiếng Việt." }
      ]
    }
  });
  return response.text || "Không thể nhận diện món ăn này.";
};

export const findFlowerMarkets = async (lat: number, lng: number) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Hãy tìm các địa điểm chợ hoa xuân, lễ hội xuân hoặc các vườn hoa đẹp đang diễn ra gần tọa độ này để đi chơi Tết.",
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: {
            latitude: lat,
            longitude: lng
          }
        }
      }
    },
  });
  return {
    text: response.text,
    grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const getZodiacCompatibility = async (birthYear: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Chủ nhà sinh năm ${birthYear}. Năm nay là năm Bính Ngọ 2026 (năm con Ngựa). Hãy phân tích xem những tuổi nào (theo 12 con giáp) là 'Tam Hợp' (Dần - Ngọ - Tuất) hoặc 'Nhị Hợp' tốt nhất để xông đất cho gia chủ này. Trả lời ngắn gọn, có lời khuyên cụ thể.`
  });
  return response.text || "Chưa có thông tin phân tích.";
};