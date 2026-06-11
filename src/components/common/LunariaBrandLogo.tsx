 import Image from "next/image";
import Link from "next/link";

type LunariaBrandLogoProps = {
  href?: string;
  compact?: boolean;
  className?: string;
};

export default function LunariaBrandLogo({
  href = "/",
  compact = false,
  className = "",
}: LunariaBrandLogoProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center ${className}`}
      aria-label="Lunaria Roleplay Guild"
    >
      {compact ? (
        <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-amber-300/20 bg-[#060816] shadow-[0_0_30px_rgba(245,199,90,0.18)]">
          <Image
            src="/icons/lunaria-icon-192.png"
            alt="Lunaria"
            fill
            sizes="48px"
            className="object-cover"
            priority
          />
        </div>
      ) : (
        <div className="relative h-[92px] w-[340px] max-w-full overflow-hidden rounded-3xl">
          <Image
            src="/images/brand/lunaria-logo-horizontal.png"
            alt="Lunaria Roleplay Guild"
            fill
            sizes="340px"
            className="object-cover object-center drop-shadow-[0_0_24px_rgba(245,199,90,0.22)]"
            priority
          />
        </div>
      )}
    </Link>
  );
}
