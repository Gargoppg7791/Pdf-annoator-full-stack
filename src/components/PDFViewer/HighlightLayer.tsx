import React from 'react';
import { Highlight } from '../../types';
import { X } from 'lucide-react';

interface HighlightLayerProps {
  highlights: Highlight[];
  onDeleteHighlight: (id: string) => void;
  scale: number;
}

const HighlightLayer: React.FC<HighlightLayerProps> = ({
  highlights,
  onDeleteHighlight,
  scale
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {highlights.map((highlight) => (
        <div
          key={highlight.id}
          className="absolute pointer-events-auto group hover:opacity-80 transition-opacity"
          style={{
            left: highlight.position.x * scale,
            top: highlight.position.y * scale,
            width: highlight.position.width * scale,
            height: highlight.position.height * scale,
            backgroundColor: highlight.color,
            opacity: 0.3,
            cursor: 'pointer',
          }}
          title={highlight.text}
        >
          <button
            onClick={() => onDeleteHighlight(highlight.id)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-xs shadow-lg"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default HighlightLayer;