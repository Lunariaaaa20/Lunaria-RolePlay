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
      className={`group inline-flex items-center ${className}`}
      aria-label="Lunaria Roleplay Guild"
    >
      {compact ? (
        <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-amber-300/20 bg-[#060816] shadow-[0_0_24px_rgba(245,199,90,0.16)]">
          <Image
            src="/icons/lunaria-icon-192.png"
            alt="Lunaria"
            fill
            sizes="44px"
            className="object-cover"
            priority
          />
        </div>
      ) : (
        <div className="relative h-[56px] w-[250px]">
          <Image
            src="/images/brand/lunaria-logo-horizontal.png"
            alt="Lunaria Roleplay Guild"
            fill
            sizes="250px"
            className="object-contain drop-shadow-[0_0_18px_rgba(245,199,90,0.18)]"
            priority
          />
        </div>
      )}
    </Link>
  );
}
