import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCw, RefreshCw, X, Check, Maximize2, Minimize2 } from 'lucide-react';

const PhotoEditorModal = ({ isOpen, imageSrc, initialSettings = {}, onClose, onApply }) => {
  if (!isOpen || !imageSrc) return null;

  const [zoom, setZoom] = useState(initialSettings.zoom || 1);
  const [rotation, setRotation] = useState(initialSettings.rotation || 0);
  const [position, setPosition] = useState(initialSettings.crop || { x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);
  const imgRef = useRef(null);

  // Auto-scale to cover frame on initial load if no explicit zoom is saved
  const handleImageLoad = () => {
    if (imgRef.current && (!initialSettings.zoom || initialSettings.zoom === 1)) {
      const img = imgRef.current;
      const scaleCover = Math.max(300 / img.naturalWidth, 400 / img.naturalHeight);
      setZoom(Math.round(scaleCover * 100) / 100);
      setPosition({ x: 0, y: 0 });
    }
  };

  // Cover Frame (fill 3:4 passport frame completely without gaps)
  const handleCoverFrame = () => {
    if (!imgRef.current) return;
    const img = imgRef.current;
    const scaleCover = Math.max(300 / img.naturalWidth, 400 / img.naturalHeight);
    setZoom(Math.round(scaleCover * 100) / 100);
    setPosition({ x: 0, y: 0 });
  };

  // Fit Image (fit full photo inside 3:4 passport frame)
  const handleFitImage = () => {
    if (!imgRef.current) return;
    const img = imgRef.current;
    const scaleFit = Math.min(300 / img.naturalWidth, 400 / img.naturalHeight);
    setZoom(Math.round(scaleFit * 100) / 100);
    setPosition({ x: 0, y: 0 });
  };

  // Reset to default
  const handleReset = () => {
    if (imgRef.current) {
      handleCoverFrame();
    } else {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
    setRotation(0);
  };

  // Mouse / Touch Drag Handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    setPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Generate cropped image DataURL on Apply
  const handleApply = () => {
    const canvas = document.createElement('canvas');
    const FRAME_WIDTH = 300;
    const FRAME_HEIGHT = 400; // 3:4 aspect ratio passport frame
    canvas.width = FRAME_WIDTH;
    canvas.height = FRAME_HEIGHT;

    const ctx = canvas.getContext('2d');
    if (!ctx || !imgRef.current) return;

    ctx.save();
    // Move to canvas center
    ctx.translate(FRAME_WIDTH / 2 + position.x, FRAME_HEIGHT / 2 + position.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    const img = imgRef.current;
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();

    const croppedDataUrl = canvas.toDataURL('image/png');

    onApply({
      dataUrl: croppedDataUrl,
      zoom,
      rotation,
      crop: position
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <span>Crop & Adjust Photo</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport & Fixed Frame */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <p className="text-[11px] text-slate-400">
            Drag image to reposition inside the passport frame
          </p>

          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
            className="relative w-[210px] h-[280px] bg-slate-950 rounded-lg overflow-hidden border-2 border-orange-500/80 shadow-inner cursor-grab active:cursor-grabbing select-none flex items-center justify-center"
          >
            {/* Guide overlay */}
            <div className="absolute inset-0 border border-white/20 pointer-events-none z-10 grid grid-cols-3 grid-rows-3">
              <div className="border-r border-b border-white/10" />
              <div className="border-r border-b border-white/10" />
              <div className="border-b border-white/10" />
              <div className="border-r border-b border-white/10" />
              <div className="border-r border-b border-white/10" />
              <div className="border-b border-white/10" />
              <div className="border-r border-white/10" />
              <div className="border-r border-white/10" />
              <div />
            </div>

            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop target"
              onLoad={handleImageLoad}
              draggable={false}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                maxWidth: 'none'
              }}
              className="pointer-events-none max-w-none"
            />
          </div>
        </div>

        {/* Quick Fit / Cover Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleCoverFrame}
            title="Auto scale photo to fill 3:4 passport frame completely"
            className="bg-slate-800 hover:bg-slate-700 text-orange-400 border border-orange-500/30 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center justify-center space-x-1.5 transition"
          >
            <Maximize2 className="w-3.5 h-3.5 text-orange-400" />
            <span>Cover Frame</span>
          </button>

          <button
            type="button"
            onClick={handleFitImage}
            title="Auto scale photo so full image fits inside frame"
            className="bg-slate-800 hover:bg-slate-700 text-blue-400 border border-blue-500/30 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center justify-center space-x-1.5 transition"
          >
            <Minimize2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Fit Image</span>
          </button>
        </div>

        {/* Control Sliders & Actions */}
        <div className="space-y-3 pt-1">
          {/* Zoom Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-300 font-medium">
              <span className="flex items-center space-x-1">
                <ZoomIn className="w-3.5 h-3.5 text-orange-400" />
                <span>Zoom ({Math.round(zoom * 100)}%)</span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setZoom(prev => Math.max(0.05, Math.round((prev - 0.05) * 100) / 100))}
                className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <input
                type="range"
                min="0.05"
                max="3.0"
                step="0.01"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-orange-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setZoom(prev => Math.min(3.0, Math.round((prev + 0.05) * 100) / 100))}
                className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Rotate Slider & Buttons */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-300 font-medium">
              <span className="flex items-center space-x-1">
                <RotateCw className="w-3.5 h-3.5 text-orange-400" />
                <span>Rotate ({rotation}°)</span>
              </span>
              <div className="flex space-x-1">
                <button
                  type="button"
                  onClick={() => setRotation(prev => (prev - 90) % 360)}
                  className="px-2 py-0.5 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                  title="Rotate -90°"
                >
                  -90°
                </button>
                <button
                  type="button"
                  onClick={() => setRotation(prev => (prev + 90) % 360)}
                  className="px-2 py-0.5 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                  title="Rotate +90°"
                >
                  +90°
                </button>
              </div>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              step="1"
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value))}
              className="w-full accent-orange-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Action Buttons: Reset, Cancel, Apply */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center space-x-1 text-xs font-semibold text-slate-400 hover:text-amber-400 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApply}
              className="flex items-center space-x-1 px-4 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 rounded-lg shadow-md transition"
            >
              <Check className="w-4 h-4" />
              <span>Apply</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoEditorModal;
