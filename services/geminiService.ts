import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

const getAIClient = (): GoogleGenAI => {
  if (!ai) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY environment variable is missing.");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

export const generateSqlFromText = async (userQuestion: string, schemaString: string): Promise<string> => {
  try {
    const client = getAIClient();
    
    // We use gemini-3-pro-preview for better coding/logic capabilities
    const modelId = "gemini-3-pro-preview";

    let systemPrompt = '';

    if (schemaString) {
      systemPrompt = `
You are an expert SQL query generator.
Your task is to convert the user's natural language question into a valid SQL query based on the provided database schema.

Rules:
- Output ONLY the raw SQL query. Do not wrap it in markdown code blocks (e.g., no \`\`\`sql).
- Do not include any explanation or commentary.
- Use SQLite dialect.
- Use only the tables and columns defined in the schema.
- If the question cannot be answered with the given schema, return "SELECT 'Error: Cannot answer question with available schema';"

Database Schema:
${schemaString}
`;
    } else {
      systemPrompt = `
You are an expert SQL query generator.
Your task is to convert the user's natural language question into a valid SQL query.

Rules:
- Output ONLY the raw SQL query. Do not wrap it in markdown code blocks (e.g., no \`\`\`sql).
- Do not include any explanation or commentary.
- Use SQLite dialect.
- Since no specific schema is provided, generate the most plausible SQL based on standard conventions or the specific instructions in the prompt.
`;
    }

    const response = await client.models.generateContent({
      model: modelId,
      contents: userQuestion,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.1, // Low temperature for deterministic code generation
      }
    });

    let sql = response.text || "";
    
    // Cleanup if model accidentally adds markdown
    sql = sql.replace(/```sql/g, '').replace(/```/g, '').trim();
    
    return sql;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};