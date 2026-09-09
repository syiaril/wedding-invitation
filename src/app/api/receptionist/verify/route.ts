import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pin } = body;

    const correctPin = process.env.RECEPTIONIST_PIN || '1818';

    if (typeof pin === 'string' && pin.trim() === correctPin.trim()) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, message: 'PIN tidak valid' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: 'Permintaan tidak valid' },
      { status: 400 }
    );
  }
}
