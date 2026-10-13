import { useState } from 'react';
import { Button } from '@/components/ui/button';

// Hover-follow magnifier with two selectable zoom levels (2x / 4x) — tap the active
// level again to turn zoom off. Mirrors the product-page zoom UX.
const ZOOM_LEVELS = [2, 4];

interface ZoomableImageProps {
  src: string;
  alt: string;
  /** classes for the <img> itself */
  className?: string;
  /** classes for the relative overflow-hidden wrapper */
  wrapperClassName?: string;
  loading?: 'lazy' | 'eager';
}

export const ZoomableImage = ({ src, alt, className, wrapperClassName, loading }: ZoomableImageProps) => {
  const [zoom, setZoom] = useState(0); // 0 = zoom off
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);

  const active = zoom > 0 && isHovering;

  return (
    <div
      className={`relative overflow-hidden ${wrapperClassName || ''} ${zoom ? 'cursor-crosshair' : ''}`}
      onMouseMove={(e) => {
        if (!zoom) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setPosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <img
        src={src}
        alt={alt}
        loading={loading}
        className={className}
        style={{
          transform: active ? `scale(${zoom})` : 'scale(1)',
          transformOrigin: `${position.x}% ${position.y}%`,
          transition: active ? 'none' : 'transform 0.3s ease-out',
        }}
      />
      <div className="absolute top-3 right-3 z-20 flex gap-1.5">
        {ZOOM_LEVELS.map((level) => (
          <Button
            key={level}
            type="button"
            size="sm"
            variant="secondary"
            className={`h-8 px-2.5 shadow-lg border-0 ${
              zoom === level
                ? 'bg-black text-white hover:bg-black'
                : 'bg-white/90 text-black hover:bg-white'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setZoom(zoom === level ? 0 : level);
            }}
            aria-label={zoom === level ? `Disable ${level}x zoom` : `Enable ${level}x zoom`}
            title={zoom === level ? 'Turn zoom off' : `Zoom ${level}x`}
          >
            {level}×
          </Button>
        ))}
      </div>
    </div>
  );
};
