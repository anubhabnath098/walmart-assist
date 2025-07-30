// pages/api/manager/quiettime.ts
import pool from '../../../../lib/db';
import { NextRequest, NextResponse } from 'next/server';

export type ManagerQuietTime = {
  id: string;
  userId: string;
  userName: string;
  storeLocation: string;
  date: string;
  timeWindow: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
};

export async function GET(
  req: NextRequest,
) {
  if (req.method === 'GET') {
    const {searchParams} = new URL(req.url);
    const storeId = Array.isArray(searchParams.get('storeId'))
     ? Number(searchParams.get('storeId'))
      : Number(searchParams.get('storeId'));
    console.log('storeId:', storeId);
    if (!storeId) {
      return NextResponse.json({ error: 'storeId query param required' },{status:400});
    }

    try {
      const [rows] = await pool.execute<any[]>(
        `SELECT 
           q.id,
           q.userId,
           u.name AS userName,
           s.storeLocation,
           DATE_FORMAT(q.date, '%Y-%m-%d') AS date,
           q.timewindow AS timeWindow,
           q.reason,
           q.status
         FROM quiettime q
         JOIN user_table u ON q.userId = u.userId
         JOIN store s ON q.storeId = s.storeId
         WHERE q.storeId = ?`,
        [storeId]
      );

      const formatted: ManagerQuietTime[] = rows.map(r => ({
        id: r.id,
        userId: r.userId,
        userName: r.userName,
        storeLocation: r.storeLocation,
        date: r.date,
        timeWindow: r.timeWindow,
        reason: r.reason,
        status: r.status,
      }));

      return NextResponse.json(formatted,{status:200});
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: 'DB error' },{status:500});
    }
  }

  

}

export async function PUT(req: NextRequest){
  if (req.method === 'PUT') {
    const { id, status } = await req.json() as {
      id?: number;
      status?: string;
    };
    if (typeof id !== 'number' || !['approved', 'rejected'].includes(status || '')) {
      return NextResponse.json({ error: 'id (number) and valid status required' },{status : 400});
    }

    try {
      const [result] = await pool.execute<any>(
        `UPDATE quiettime
         SET status = ?
         WHERE id = ?`,
        [status, id]
      );

      if (result.affectedRows === 0) {
        return NextResponse.json({ error: 'Not found' },{status : 404});
      }

      return NextResponse.json({ message: 'Updated' },{status : 200});
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: 'DB error' },{status : 500});
    }
  }
}
