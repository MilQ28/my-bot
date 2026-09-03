import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { saveCvUrl, getCvUrl } from "@/lib/dataStore";
import { verifySignedToken, ADMIN_COOKIE_NAME } from "@/lib/adminSession";

function isAuthorized(req: NextRequest): boolean {
  const cookieValue = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return !!verifySignedToken(cookieValue);
}

export async function GET() {
  const url = await getCvUrl();
  return NextResponse.json({
    url,
    isCustomBlob: url.startsWith("http"),
  });
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized: Akses ditolak" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "BLOB_READ_WRITE_TOKEN belum dikonfigurasi di environment variable. Silakan tambahkan Vercel Blob store di dashboard Vercel atau buat file .env.local untuk development.",
      },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      return NextResponse.json({ error: "Hanya file PDF yang diperbolehkan" }, { status: 400 });
    }

    const blob = await put("cv.pdf", file, {
      access: "public",
      addRandomSuffix: false, // URL tetap konsisten tiap upload ulang
    });

    await saveCvUrl(blob.url);

    return NextResponse.json({
      success: true,
      message: "CV PDF berhasil diunggah ke Vercel Blob",
      fileName: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      url: blob.url,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[CV_UPLOAD_ERROR]", error);
    return NextResponse.json(
      { error: error?.message || "Gagal mengunggah file CV ke Vercel Blob" },
      { status: 500 }
    );
  }
}

