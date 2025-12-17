import { GoogleGenAI } from "@google/genai";
import { PageContent, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const performSmartSearch = async (query: string): Promise<Omit<PageContent, 'timestamp' | 'type'>> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are Brow, a smart browser engine. The user is searching for: "${query}". 
      Provide a comprehensive, well-structured, and formatted Markdown summary of the information found. 
      Use headings, bullet points, and code blocks where necessary to make it look like a beautiful web article.
      Do not start with "Here is the information", just dive into the content.
      
      At the very end of your response, strictly following this format, list 3 related follow-up questions separated by a pipe character like this:
      ||| RELATED: Question 1 | Question 2 | Question 3`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are a helpful, accurate, and visually structured web assistant."
      },
    });

    let summary = response.text || "No content generated.";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Extract related topics
    let relatedTopics: string[] = [];
    if (summary.includes('||| RELATED:')) {
        const parts = summary.split('||| RELATED:');
        summary = parts[0];
        const topicsStr = parts[1];
        relatedTopics = topicsStr.split('|').map(t => t.trim()).filter(t => t.length > 0);
    }

    return {
      summary,
      groundingLinks: groundingChunks,
      relatedTopics
    };
  } catch (error: any) {
    console.error("Search Error:", error);
    return {
      summary: "",
      error: error.message || "Failed to load results.",
    };
  }
};

export const performDeepResearch = async (query: string): Promise<Omit<PageContent, 'timestamp' | 'type'>> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are Brow Deep Research. The user wants an in-depth report on: "${query}". 
      
      Conduct a deep analysis. Your response should be significantly longer and more detailed than a standard search.
      Structure:
      1. **Executive Summary**: Brief overview.
      2. **Key Findings**: Detailed points with data where available.
      3. **Context & History**: Background information.
      4. **Different Perspectives**: Pros/Cons or Debates.
      5. **Conclusion**.
      
      Format in rich Markdown.`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are an advanced research analyst. Be thorough, objective, and detailed."
      },
    });

    const summary = response.text || "No content generated.";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return {
      summary,
      groundingLinks: groundingChunks,
      relatedTopics: [] // Deep dive usually doesn't need immediate follow ups, or we can add them later
    };
  } catch (error: any) {
    return {
      summary: "",
      error: error.message || "Failed to perform deep research.",
    };
  }
};

export const suggestTopics = async (context: string): Promise<string[]> => {
  try {
      // Lightweight call for suggestions based on current context
      const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `Given the context: "${context}", suggest 3 short follow-up search queries. Return ONLY the queries separated by newlines.`,
          config: {
              thinkingConfig: { thinkingBudget: 0 } // Fast response
          }
      });
      return (response.text || "").split('\n').filter(s => s.trim().length > 0).slice(0, 3);
  } catch (e) {
      return [];
  }
}

export const summarizeContent = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Summarize the following text into 3 concise, high-impact bullet points. Return ONLY the bullet points.
      
      Text: "${text.substring(0, 5000)}..."`, // Truncate to avoid massive context
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text || "Could not generate summary.";
  } catch (e) {
    return "Failed to generate summary.";
  }
};

export const getCopilotResponse = async (history: ChatMessage[], pageContext: string): Promise<string> => {
  try {
    // Construct a simple history string for context (optimizing tokens)
    const conversationHistory = history.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.text}`).join('\n');
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are Brow Copilot, a helpful AI sidekick in a web browser.
      
      Current Page Content:
      "${pageContext.substring(0, 3000)}..."
      
      Conversation History:
      ${conversationHistory}
      
      Answer the last user query based on the current page content or general knowledge. Keep it concise and helpful.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text || "I'm having trouble thinking right now.";
  } catch (e) {
    return "Sorry, I encountered an error.";
  }
};