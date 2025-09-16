import React from 'react';
import { Palette, MousePointer, Sparkles } from 'lucide-react';

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
    <div className="flex items-center space-x-6">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <Palette className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Highlight:</span>
        </div>
        <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
          {colors.map((color) => (
            <button
              key={color.value}
              onClick={() => onColorChange(color.value)}
              className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                selectedColor === color.value
                  ? 'border-gray-800 scale-110 shadow-lg'
                  : 'border-gray-300 hover:border-gray-500'
              }`}
              style={{ backgroundColor: color.value }}
              title={`${color.name} highlight`}
            />
          ))}
        </div>
      </div>

      <div className="h-6 w-px bg-gray-300"></div>

      <button
        onClick={onToggleSelection}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          isSelecting
            ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-700'
            : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 hover:border-gray-400'
        }`}
      >
        {isSelecting ? (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Stop Highlighting</span>
          </>
        ) : (
          <>
            <MousePointer className="w-4 h-4" />
            <span>Start Highlighting</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ViewerControls;