import { NextResponse } from 'next/server';
import { getContacts } from '@/lib/store';
import { getRecommendations } from '@/lib/recommendations';

export async function GET() {
  const contacts = getContacts();
  if (!contacts.length) return NextResponse.json([]);
  return NextResponse.json(getRecommendations(contacts));
}