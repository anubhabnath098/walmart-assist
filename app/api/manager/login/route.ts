// pages/api/manager/login.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../../lib/db';
import type { RowDataPacket } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';

type Store = {
  storeId: number;
  managerEmail: string;
  storeLocation: string;
  managerPassword: string;
};

export async function POST(
  req: NextRequest,
) {

  const { managerEmail, managerPassword } = await req.json() as {
    managerEmail?: string;
    managerPassword?: string;
  };
  if (!managerEmail || !managerPassword) {
    return NextResponse.json({ error: 'Email and password required' },{status: 400});
  }

  try {
    // 1) Tell TS you'll get back an array of RowDataPackets
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT storeId, managerEmail, storeLocation, managerPassword
       FROM store
       WHERE managerEmail = ? AND managerPassword = ?`,
      [managerEmail, managerPassword]
    );

    // 2) Cast it into your Store[] interface
    const stores = rows as Store[];

    if (stores.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' },{status : 401});
    }

    return NextResponse.json(stores[0],{status : 200});
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Database error' },{status : 500});
  }
}
