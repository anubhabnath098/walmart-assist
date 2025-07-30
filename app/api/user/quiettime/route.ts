// pages/api/user/quiettime.ts
import pool from '../../../../lib/db';
import { NextRequest, NextResponse } from 'next/server';

export type UserQuietTime = {
  id: number;
  storeId: number;
  storeLocation: string;
  date: string;
  timeWindow: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
};

export async function POST(
  req: NextRequest,
) {
  if (req.method === 'POST') {
    const { userId, storeId, date, timeWindow, reason } = await req.json() as {
      userId?: number;
      storeId?: number;
      date?: string;
      timeWindow?: string;
      reason?: string;
    };
    if (
      typeof userId !== 'number' ||
      typeof storeId !== 'number' ||
      !date ||
      !timeWindow
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, {status: 400});
    }

    try {
      const [result] = await pool.execute<any>(
        `INSERT INTO quiettime
         (userId, storeId, date, timewindow, reason)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, storeId, date, timeWindow, reason || null]
      );
      return NextResponse.json({ insertedId: result.insertId },{status: 201});
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: 'DB error' },{status: 500});
    }
  }

  
}

export async function GET(req : NextRequest){
  if (req.method === 'GET') {
    const {searchParams} = new URL(req.url);
    const userId = Array.isArray(searchParams.get('userId'))
      ? Number(searchParams.get('userId'))
      : Number(searchParams.get('userId'));

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'userId query param required' },{status: 400});
    }

    try {
      const [rows] = await pool.execute<any[]>(
        `SELECT
           q.id,
           q.storeId,
           s.storeLocation,
           DATE_FORMAT(q.date, '%Y-%m-%d') AS date,
           q.timewindow AS timeWindow,
           q.reason,
           q.status
         FROM quiettime q
         JOIN store s ON q.storeId = s.storeId
         WHERE q.userId = ?`,
        [userId]
      );

      const formatted: UserQuietTime[] = rows.map(r => ({
        id: r.id,
        storeId: r.storeId,
        storeLocation: r.storeLocation,
        date: r.date,
        timeWindow: r.timeWindow,
        reason: r.reason,
        status: r.status,
      }));

      return NextResponse.json(formatted,{status: 200});
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: 'DB error' },{status : 500});
    }
  }
}
