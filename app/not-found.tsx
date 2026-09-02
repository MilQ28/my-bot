import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center selection:bg-primary selection:text-foreground">
      <div className="max-w-md w-full border border-line bg-panel/30 p-8 sm:p-10 rounded-xl space-y-6 shadow-sm">
        <div className="space-y-2">
          <span className="font-mono text-xs font-bold text-primary tracking-widest uppercase block">
            Error 404
          </span>
          <h1 className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            PAGE NOT FOUND
          </h1>
        </div>

        <p className="font-sans text-xs sm:text-sm text-foreground/60 leading-relaxed">
          Halaman yang Anda tuju tidak ditemukan atau URL mungkin salah ketik.
        </p>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground text-background font-mono text-xs font-bold tracking-wide uppercase hover:opacity-90 transition duration-200 cursor-pointer"
          >
            <span>&larr; Kembali ke Beranda</span>
          </Link>
        </div>
      </div>

      <p className="mt-8 font-mono text-[11px] text-foreground/40">
        syamil atsani &mdash; student developer
      </p>
    </div>
  );
}
