import { NextRequest, NextResponse } from "next/server";
import { getCvUrl } from "@/lib/dataStore";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const cvUrl = await getCvUrl();

    if (cvUrl && cvUrl.startsWith("http")) {
      return NextResponse.redirect(cvUrl, { status: 307 });
    }

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const localPdfUrl = `${protocol}://${host}/cv.pdf`;

    return NextResponse.redirect(localPdfUrl, { status: 307 });
  } catch (error) {
    console.error("[CV_REDIRECT_ERROR]", error);
    return NextResponse.redirect(new URL("/cv.pdf", req.url), { status: 307 });
  }
}
