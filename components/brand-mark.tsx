import Image from "next/image";

type BrandMarkProps = {
  size?: "sm" | "md" | "lg";
};

function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

const sizeClasses: Record<NonNullable<BrandMarkProps["size"]>, string> = {
  sm: "h-12 w-12 rounded-[1rem] p-1.5",
  md: "h-14 w-14 rounded-[1.4rem] p-1.5",
  lg: "h-20 w-20 rounded-[1.8rem] p-2",
};

const imageSizes: Record<NonNullable<BrandMarkProps["size"]>, number> = {
  sm: 40,
  md: 48,
  lg: 72,
};

export function BrandMark({ size = "md" }: BrandMarkProps) {
  const imageSize = imageSizes[size];

  return (
    <div
      className={joinClasses(
        "relative flex items-center justify-center overflow-hidden border border-[#D4AF37]/22 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.18),rgba(12,12,12,0.96)_58%)] shadow-[0_18px_45px_rgba(212,175,55,0.14)]",
        sizeClasses[size],
      )}
    >
      <Image
        src="/brand/logo.png"
        alt="شعار المعضّل"
        width={imageSize}
        height={imageSize}
        className="h-auto w-auto object-contain drop-shadow-[0_12px_22px_rgba(212,175,55,0.16)]"
        priority={size !== "lg"}
      />
    </div>
  );
}
