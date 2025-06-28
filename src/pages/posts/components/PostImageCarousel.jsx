import React, { useState, useRef, useEffect } from 'react';

// Enhanced modal with pinch-to-zoom functionality
function ImageModal({ src, alt, open, onClose }) {
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  const [lastTouchCenter, setLastTouchCenter] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Reset zoom when modal opens/closes
  useEffect(() => {
    if (open) {
      setScale(1);
      setTranslateX(0);
      setTranslateY(0);
    }
  }, [open]);

  // Calculate distance between two touch points
  const getTouchDistance = (touches) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Calculate center point between two touches
  const getTouchCenter = (touches) => {
    if (touches.length < 2) return { x: 0, y: 0 };
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2
    };
  };

  // Handle touch start
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      // Pinch gesture
      setLastTouchDistance(getTouchDistance(e.touches));
      setLastTouchCenter(getTouchCenter(e.touches));
    } else if (e.touches.length === 1 && scale > 1) {
      // Single touch drag when zoomed
      setIsDragging(true);
    }
  };

  // Handle touch move
  const handleTouchMove = (e) => {
    e.preventDefault();
    
    if (e.touches.length === 2) {
      // Pinch to zoom
      const currentDistance = getTouchDistance(e.touches);
      const currentCenter = getTouchCenter(e.touches);
      
      if (lastTouchDistance > 0) {
        const newScale = Math.max(0.5, Math.min(3, scale * (currentDistance / lastTouchDistance)));
        setScale(newScale);
        
        // Adjust position to zoom towards touch center
        if (newScale !== scale) {
          const scaleChange = newScale / scale;
          const centerX = currentCenter.x - containerRef.current.offsetLeft;
          const centerY = currentCenter.y - containerRef.current.offsetTop;
          
          setTranslateX(prev => centerX - (centerX - prev) * scaleChange);
          setTranslateY(prev => centerY - (centerY - prev) * scaleChange);
        }
      }
      
      setLastTouchDistance(currentDistance);
      setLastTouchCenter(currentCenter);
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      // Drag when zoomed
      const touch = e.touches[0];
      const rect = containerRef.current.getBoundingClientRect();
      const imageRect = imageRef.current.getBoundingClientRect();
      
      const maxTranslateX = (imageRect.width * scale - rect.width) / 2;
      const maxTranslateY = (imageRect.height * scale - rect.height) / 2;
      
      setTranslateX(prev => {
        const newX = prev + (touch.clientX - lastTouchCenter.x);
        return Math.max(-maxTranslateX, Math.min(maxTranslateX, newX));
      });
      
      setTranslateY(prev => {
        const newY = prev + (touch.clientY - lastTouchCenter.y);
        return Math.max(-maxTranslateY, Math.min(maxTranslateY, newY));
      });
      
      setLastTouchCenter({ x: touch.clientX, y: touch.clientY });
    }
  };

  // Handle touch end
  const handleTouchEnd = () => {
    setIsDragging(false);
    setLastTouchDistance(0);
  };

  // Handle double tap to reset zoom
  const handleDoubleClick = () => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" 
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className="max-h-[90vh] max-w-[95vw] object-contain rounded-lg shadow-lg transition-transform duration-200"
        style={{
          transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
          transformOrigin: 'center',
          touchAction: 'none'
        }}
        onClick={e => e.stopPropagation()}
        onDoubleClick={handleDoubleClick}
        draggable={false}
      />
      
      {/* Zoom indicator */}
      {scale > 1 && (
        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {Math.round(scale * 100)}%
        </div>
      )}
      
      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
}

export default function PostImageCarousel({ images = [] }) {
  const [current, setCurrent] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  if (!images.length) return null;

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  const handleNext = (e) => {
    e.stopPropagation();
    setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full aspect-[4/5] bg-muted rounded-xl overflow-hidden group max-h-[400px]">
      {/* Carousel */}
      <div className="w-full h-full flex items-center justify-center overflow-hidden">
        <img
          src={images[current]}
          alt={`Post image ${current + 1}`}
          className="w-full h-full object-cover cursor-zoom-in transition duration-200 max-h-[400px]"
          onClick={(e) => {
            e.stopPropagation();
            setZoomed(true);
          }}
          draggable={false}
          style={{ scrollbarWidth: 'none' }}
        />
      </div>
      {/* Carousel controls */}
      {images.length > 1 && (
        <>
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
            onClick={handlePrev}
            aria-label="Previous image"
            type="button"
          >
            &#8592;
          </button>
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
            onClick={handleNext}
            aria-label="Next image"
            type="button"
          >
            &#8594;
          </button>
        </>
      )}
      {/* Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {images.map((_, idx) => (
            <span
              key={idx}
              className={`block h-2 w-2 rounded-full ${idx === current ? 'bg-white' : 'bg-white/40'}`}
            />
          ))}
        </div>
      )}
      {/* Enhanced Zoom modal with pinch-to-zoom */}
      <ImageModal
        src={images[current]}
        alt={`Post image ${current + 1}`}
        open={zoomed}
        onClose={() => setZoomed(false)}
      />
    </div>
  );
} 