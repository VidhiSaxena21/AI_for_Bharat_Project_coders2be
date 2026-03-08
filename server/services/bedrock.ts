import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

console.log(`DEBUG: AWS_ACCESS_KEY_ID length: ${process.env.AWS_ACCESS_KEY_ID?.length}`);
console.log(`DEBUG: AWS_SECRET_ACCESS_KEY length: ${process.env.AWS_SECRET_ACCESS_KEY?.length}`);

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: (process.env.AWS_ACCESS_KEY_ID || "").trim(),
    secretAccessKey: (process.env.AWS_SECRET_ACCESS_KEY || "").trim(),
  },
});

const SYSTEM_PROMPT = `You are a safe medical allergy assistant.
Provide precautionary guidance about allergies, medicines, and food.
Do not give unsafe medical advice.
Recommend consulting a doctor for severe symptoms.`;

export async function chatWithAllergyAssistant(message: string): Promise<string> {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error("AWS credentials are not configured");
  }

  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 1000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: message,
          },
        ],
      },
    ],
  };

  try {
    const command = new InvokeModelCommand({
      modelId: "anthropic.claude-3-haiku-20240307-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: new TextEncoder().encode(JSON.stringify(payload)),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    console.log("Bedrock response body:", JSON.stringify(responseBody, null, 2));

    if (responseBody.content && responseBody.content.length > 0) {
      return responseBody.content[0].text;
    }
  } catch (error: any) {
    console.error("BEDROCK FULL ERROR:", error);
    
    // Fallback response for AI unavailability
    const fallbackResponses = [
      "I'm sorry, I'm having trouble connecting to my brain right now! Please check your dietary labels carefully. Common allergens include milk, eggs, peanuts, tree nuts, fish, shellfish, soy, and wheat.",
      "My AI service is currently experiencing heavy traffic. Remember to always consult a medical professional for serious allergy concerns.",
      "I'm feeling a bit throttled at the moment! While I'm offline, keep in mind that 'may contain' labels should be treated with caution if you have severe allergies."
    ];
    const fallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

    // Always return fallback on error for better UX, but log it for developers
    return `(Note: AI service is currently unavailable. General advice follows) ${fallback}`;
  }

  throw new Error("Failed to generate response from Bedrock: Empty response body");
}
