
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PryysmLogoProps {
  className?: string;
}

export function PryysmLogo({ className }: PryysmLogoProps) {
  return (
    <Image
      src="/pryysm-logo.svg"
      alt="Pryysm Logo"
      width={64}
      height={64}
      className={cn("h-12 w-12", className)}
      priority
    />
  );
}
