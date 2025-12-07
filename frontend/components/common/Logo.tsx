interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  className?: string;
}

export default function Logo({ size = "md", showTagline = false, className = "" }: LogoProps) {
  const sizeClasses = {
    sm: { width: 80, height: 26 },
    md: { width: 110, height: 36 },
    lg: { width: 140, height: 46 },
    xl: { width: 180, height: 60 },
  };

  const taglineSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };

  const config = sizeClasses[size];

  return (
    <div className={`inline-flex flex-col items-center gap-2 ${className}`}>
      <div className="relative">
        <img
          src="/Logo.png"
          alt="Fypify Logo"
          width={config.width}
          height={config.height}
          className="object-contain"
        />
      </div>
      {showTagline && (
        <p className={`${taglineSizes[size]} text-neutral-600 font-medium tracking-wide`}>
          Project Management
        </p>
      )}
    </div>
  );
}
