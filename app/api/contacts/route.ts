import { NextRequest, NextResponse } from 'next/server';
import { getContacts, addContact } from '@/lib/store';

export async function GET() {
  return NextResponse.json(getContacts());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, company, lastContactedDate, notes } = body;
    if (!name || !email) {
      return NextResponse.json({ error: 'name and email are required' }, { status: 400 });
    }
    const contact = addContact({ name, email, company: company || '', lastContactedDate: lastContactedDate || '', notes: notes || '' });
    return NextResponse.json(contact, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}