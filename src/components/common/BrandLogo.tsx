import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  compact?: boolean;
  className?: string;
};

export default function BrandLogo({
  href = "/",
  compact = false,
  className = "",
}: BrandLogoProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-3 ${className}`}
      aria-label="Lunaria"
    >
      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-300/15 bg-[radial-gradient(circle_at_top,#18284d_0%,#0b1020_45%,#060816_100%)] shadow-[0_0_30px_rgba(245,190,75,0.12)]">
        <div className="absolute h-6 w-6 rounded-full bg-gradient-to-b from-[#f7d77f] to-[#d6a947]" />
        <div className="absolute h-5 w-5 translate-x-[5px] -translate-y-[1px] rounded-full bg-[#0b1020]" />
        <span className="absolute left-[12px] top-[8px] text-[12px] font-bold text-cyan-100">
          ✦
        </span>
      </div>

      {!compact && (
        <div className="flex flex-col leading-none">
          <span className="text-[1.65rem] font-black uppercase tracking-[0.22em] text-[#f5c75a]">
            Lunaria
          </span>
          <span className="mt-1 text-[0.65rem] font-medium uppercase tracking-[0.32em] text-slate-400">
            Roleplay Guild
          </span>
        </div>
      )}
    </Link>
  );
}
