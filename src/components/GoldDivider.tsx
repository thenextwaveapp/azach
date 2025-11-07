export const GoldDivider = () => {
  return (
    <div className="relative h-16 overflow-hidden bg-black">
      {/* Animated gradient waves */}
      <div className="absolute inset-0">
        {/* First wave - Gold */}
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background: 'linear-gradient(90deg, transparent, #d4af37, #f4e5b8, #d4af37, transparent)',
            backgroundSize: '200% 100%',
            animation: 'wave 8s ease-in-out infinite',
          }}
        />

        {/* Second wave - Darker gold */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background: 'linear-gradient(90deg, transparent, #b8941e, #d4af37, #b8941e, transparent)',
            backgroundSize: '200% 100%',
            animation: 'wave 6s ease-in-out infinite reverse',
            animationDelay: '-2s',
          }}
        />

        {/* Third wave - Light gold shimmer */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'linear-gradient(90deg, transparent, #f4e5b8, #fffaeb, #f4e5b8, transparent)',
            backgroundSize: '150% 100%',
            animation: 'wave 10s ease-in-out infinite',
            animationDelay: '-4s',
          }}
        />
      </div>

      {/* Subtle scanline effect */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
        }}
      />

      {/* Top gradient fade */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-muted to-transparent" />

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black to-transparent" />

      <style>{`
        @keyframes wave {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </div>
  );
};
