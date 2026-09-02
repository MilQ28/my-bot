import { NextRequest, NextResponse } from 'next/server';
import { getPortfolioData, savePortfolioData, PortfolioData } from '@/lib/dataStore';
import { verifySignedToken, ADMIN_COOKIE_NAME } from '@/lib/adminSession';

function isAuthorized(req: NextRequest): boolean {
  const cookieValue = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return !!verifySignedToken(cookieValue);
}

// GET: Baca data portfolio (Publik & Admin)
export async function GET() {
  const data = getPortfolioData();
  return NextResponse.json(data);
}

// POST: Update data portfolio (Hanya Admin terverifikasi)
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized: Akses ditolak' }, { status: 401 });
  }

  try {
    const updatedData: PortfolioData = await req.json();

    if (!updatedData.profile || !Array.isArray(updatedData.projects)) {
      return NextResponse.json({ error: 'Format data tidak valid' }, { status: 400 });
    }

    const saved = savePortfolioData(updatedData);
    if (!saved) {
      return NextResponse.json({ error: 'Gagal menyimpan data ke file' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Data berhasil diperbarui', data: updatedData });
  } catch (error) {
    console.error('[ADMIN_DATA_UPDATE_ERROR]', error);
    return NextResponse.json({ error: 'Terjadi kesalahan saat memproses data' }, { status: 500 });
  }
}
