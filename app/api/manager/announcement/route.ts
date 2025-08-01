import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const { title, descrip, storeId } = await req.json() as {
    title?: string;
    descrip?: string;
    storeId?: number;
  };

  if (!title || typeof storeId !== 'number') {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const [result] = await pool.execute<any>(
      `INSERT INTO announcement (title, descrip, storeId) VALUES (?, ?, ?)`,
      [title, descrip || null, storeId]
    );

    return NextResponse.json(
      {
        message: 'Announcement added successfully',
        insertedId: result.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('DB Error (POST):', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (req.method !== 'GET') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const [rows] = await pool.query<any[]>(
      `SELECT id, title, descrip, storeId, created_at FROM announcement ORDER BY created_at DESC`
    );

    const announcements = rows.map(row => ({
      id: row.id,
      title: row.title,
      descrip: row.descrip ?? undefined,
      storeId: row.storeId,
      createdAt: row.created_at.toISOString(),
    }));

    return NextResponse.json({ announcements}, { status: 200 });
  } catch (error) {
    console.error('DB Error (GET):', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
