import React from 'react';
import { Palette, MousePointer } from 'lucide-react';

interface Color {
  name: string;
  value: string;
}

interface ViewerControlsProps {
  colors: Color[];
  selectedColor: string;
  onColorChange: (color: string) => void;
  onToggleSelection: () => void;
  isSelecting: boolean;
}

const ViewerControls: React.FC<ViewerControlsProps> = ({
  colors,
  selectedColor,
  onColorChange,
  onToggleSelection,
  isSelecting
}) => {
  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <Palette className="w-4 h-4 text-gray-600" />
        <span className="text-sm text-gray-700">Highlight Color:</span>
        <div className="flex space-x-1">
          {colors.map((color) => (
            <button
              key={color.value}
              onClick={() => onColorChange(color.value)}
              className={`w-6 h-6 rounded-full border-2 transition-all ${
                selectedColor === color.value
                  ? 'border-gray-800 scale-110'
                  : 'border-gray-300 hover:border-gray-500'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      <button
        onClick={onToggleSelection}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isSelecting
            ? 'bg-blue-100 text-blue-700 border border-blue-300'
            : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
        }`}
      >
        <MousePointer className="w-4 h-4" />
        <span>{isSelecting ? 'Stop Selecting' : 'Start Selecting'}</span>
      </button>
    </div>
  );
};

export default ViewerControls;