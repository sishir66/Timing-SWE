import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contactName, relationshipContext, lastConversation } = body;

    if (!contactName) {
      return NextResponse.json({ error: 'contactName is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });      const prompt = `Write a short, warm, personalized professional outreach message to ${contactName}. Relationship: ${relationshipContext || 'professional contact'}. Last conversation: ${lastConversation || 'we have not spoken recently'}. Keep it 2-3 sentences, human and friendly, not corporate.`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return NextResponse.json({ message: text });
    }

    // Simulated fallback
    const rel = relationshipContext && relationshipContext !== 'professional contact' ? relationshipContext : null;
    const firstName = contactName.split(' ')[0];
    const message = rel 
        ? `Hey ${firstName} — it's been a while and I wanted to reach out! As my ${rel}, your perspective always means a lot to me. Would love to find time to catch up soon.`
        : `Hey ${firstName} — it's been a while and I wanted to reach out! Would love to find time to catch up soon.`;
    return NextResponse.json({ message });

  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to generate message' }, { status: 500 });
  }
}