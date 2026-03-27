type BrandMarkProps = {
  size?: "sm" | "md" | "lg";
};

function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function BrandMark({ size = "md" }: BrandMarkProps) {
  return (
    <div
      className={joinClasses(
        "flex items-center justify-center rounded-[1.4rem] border border-[#D4AF37]/25 bg-[#0F0F0F] shadow-[0_18px_45px_rgba(212,175,55,0.12)]",
        size === "sm" && "h-12 w-12 rounded-[1rem]",
        size === "md" && "h-14 w-14",
        size === "lg" && "h-16 w-16 rounded-[1.6rem]",
      )}
      aria-hidden="true"
    >
      <span className="brand-gradient-text text-lg font-black leading-none">ع</span>
    </div>
  );
}
