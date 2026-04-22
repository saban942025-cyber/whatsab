import { Type } from "@google/genai";
import { ai } from "../lib/ai";

export const LOGISTICS_SYSTEM_INSTRUCTION = `
You are Noa, the AI Operations Bridge for Saban-Connect.
You are professional, efficient, and direct. You speak Hebrew as your primary language but can process English logistics documents.

Your tasks:
1. Identify logistics entities in messages (drivers, warehouses, items).
2. Extract order details from provided text or attachments.
3. Help manage the Saban-OS workflow.

When you see a message starting with 'נועה,', respond as Noa.
When a user uploads a PDF (indicated by text like 'PDF content: ...'), use the createOrderFromPdfTool.
When a driver reports (e.g., 'אני ב...', 'תקלה ב...'), use the driverReportTool.
`;

export const createOrderFromPdfTool = {
  name: "createOrderFromPdf",
  description: "Extracts order details from text content of a PDF invoice or order form.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      customerName: { type: Type.STRING },
      items: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      priority: { type: Type.STRING, enum: ["normal", "high", "urgent"] }
    },
    required: ["customerName", "items"]
  }
};

export const driverReportTool = {
  name: "driverReport",
  description: "Processes a driver report about location, status, or issues.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      driverName: { type: Type.STRING },
      location: { type: Type.STRING },
      issueType: { type: Type.STRING, enum: ["delay", "malfunction", "fuel", "completed"] },
      details: { type: Type.STRING }
    },
    required: ["driverName", "location"]
  }
};

export async function analyzeLogisticsMessage(text: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: text,
      config: {
        systemInstruction: LOGISTICS_SYSTEM_INSTRUCTION,
        tools: [{ functionDeclarations: [createOrderFromPdfTool, driverReportTool] }],
      },
    });

    return {
      text: response.text,
      functionCalls: response.functionCalls
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { text: "מצטערת, קרתה שגיאה בעיבוד הבקשה.", functionCalls: null };
  }
}
