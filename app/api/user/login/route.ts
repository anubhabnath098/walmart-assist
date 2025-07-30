// pages/api/user/login.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../../lib/db';
import type { RowDataPacket } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';

type User = {
  userId: number;
  userEmail: string;
  name: string;
};

export async function POST(
  req: NextRequest,
) {
  
  const { userEmail, password } = await req.json() as {
    userEmail?: string;
    password?: string;
  };

  console.log('Received login request:', { userEmail, password });
  if (!userEmail || !password) {
    return NextResponse.json({ error: 'Email and password required' }, {status: 400});
  }

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT userId, userEmail, name
       FROM user_table
       WHERE userEmail = ? AND password = ?`,
      [userEmail, password]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' },{status : 401});
    }

    const user = rows[0] as User;

    return NextResponse.json(user);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Database error' },{status : 500});
  }
}
