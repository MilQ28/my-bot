import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifySignedToken, ADMIN_COOKIE_NAME } from '@/lib/adminSession';

function isAuthorized(req: NextRequest): boolean {
  const cookieValue = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return !!verifySignedToken(cookieValue);
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized: Akses ditolak' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Hanya file PDF yang diperbolehkan' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const targetPath = path.join(process.cwd(), 'public', 'cv.pdf');
    fs.writeFileSync(targetPath, buffer);

    return NextResponse.json({
      success: true,
      message: 'CV PDF berhasil diperbarui',
      fileName: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('[CV_UPLOAD_ERROR]', error);
    return NextResponse.json({ error: 'Gagal mengunggah file CV' }, { status: 500 });
  }
}
