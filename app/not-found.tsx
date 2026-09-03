import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
      <span className="text-sm text-foreground/50 mb-2">404</span>
      <h1 className="text-xl font-semibold mb-3">Halaman tidak ditemukan</h1>
      <p className="text-sm text-foreground/60 mb-6">
        Halaman yang Anda tuju tidak ditemukan atau URL mungkin salah ketik.
      </p>
      <Link href="/" className="text-sm text-primary hover:underline">
        &larr; Kembali ke beranda
      </Link>
    </div>
  );
}