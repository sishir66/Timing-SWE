import { NextRequest, NextResponse } from 'next/server';
import { updateContact, deleteContact } from '@/lib/store';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = updateContact(id, body);
    if (!updated) return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const success = deleteContact(id);
  if (!success) return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}