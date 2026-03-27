import { SITE_NAME_AR, SITE_NAME_LATIN } from "@/lib/site";

type BrandNameProps = {
  className?: string;
};

export function BrandName({ className }: BrandNameProps) {
  return (
    <span className={className}>
      <span>{SITE_NAME_AR}</span>
      <span className="mx-1.5">-</span>
      <bdi dir="ltr" className="inline-block">
        {SITE_NAME_LATIN}
      </bdi>
    </span>
  );
}
