import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut } from 'lucide-react';

// Hover-follow 2x magnifier behind a single zoom-lens toggle — same UX as the
// product page's image zoom.
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
  const [isZoomEnabled, setIsZoomEnabled] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);

  const active = isZoomEnabled && isHovering;

  return (
    <div
      className={`relative overflow-hidden ${wrapperClassName || ''} ${isZoomEnabled ? 'cursor-crosshair' : ''}`}
      onMouseMove={(e) => {
        if (!isZoomEnabled) return;
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
          transform: active ? 'scale(2)' : 'scale(1)',
          transformOrigin: `${position.x}% ${position.y}%`,
          transition: active ? 'none' : 'transform 0.3s ease-out',
        }}
      />
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="absolute top-3 right-3 z-20 bg-black hover:bg-gray-900 shadow-lg border-0"
        onClick={(e) => {
          e.stopPropagation();
          setIsZoomEnabled(!isZoomEnabled);
        }}
        aria-label={isZoomEnabled ? 'Disable zoom' : 'Enable zoom'}
        title={isZoomEnabled ? 'Disable zoom' : 'Enable zoom'}
      >
        {isZoomEnabled ? <ZoomOut className="h-5 w-5 text-white" /> : <ZoomIn className="h-5 w-5 text-white" />}
      </Button>
    </div>
  );
};
