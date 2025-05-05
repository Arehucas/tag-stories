import Image from 'next/image';

interface ProviderHeaderProps {
  logoUrl?: string;
  instagramHandle?: string;
}

export default function ProviderHeader({ logoUrl, instagramHandle }: ProviderHeaderProps) {
  return (
    <div className="w-full h-10 flex items-center justify-center" style={{ background: '#14141e' }}>
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
          <Image src={logoUrl || "/default-logo.png"} alt="Logo" width={24} height={24} className="object-cover w-full h-full" />
        </div>
        <span className="text-white/50 text-base font-medium">@{instagramHandle || ''}</span>
      </div>
    </div>
  );
} 