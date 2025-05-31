import React from 'react';
import { Circle, Square, Minus, Type } from 'lucide-react';

const AnnotationSidebar = ({
  selectedTool,
  setSelectedTool,
  canvasSize,
  isPlaying,
  currentTime,
  isDrawing,
  annotations,
  setAnnotations,
  formatTime
}) => ( 
        <div className="w-80 bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Drawing Tools</h3>
          
          <div className="grid grid-cols-2 gap-2 mb-6">
            {[
              { tool: 'circle', icon: Circle, label: 'Circle (C)' },
              { tool: 'rectangle', icon: Square, label: 'Rectangle (R)' },
              { tool: 'line', icon: Minus, label: 'Line (L)' },
              { tool: 'text', icon: Type, label: 'Text (T)' }
            ].map(({ tool, icon: Icon, label }) => (
              <button
                key={tool}
                onClick={() => setSelectedTool(tool)}
                className={`p-3 rounded flex flex-col items-center gap-1 text-xs ${
                  selectedTool === tool 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <Icon size={20} />
                {label}
              </button>
            ))}
          </div>
          
          <div className="bg-gray-700 p-3 rounded mb-4">
            <h4 className="font-medium mb-2">Instructions:</h4>
            <ul className="text-sm space-y-1">
              <li>• Pause video to draw annotations</li>
              <li>• Use keyboard shortcuts (C, R, L, T)</li>
              <li>• Spacebar: Play/Pause</li>
              <li>• Arrow keys: Frame navigation</li>
            </ul>
          </div>
          
          <div className="bg-gray-700 p-3 rounded mb-4 text-xs">
            <h4 className="font-medium mb-2">Debug Info:</h4>
            <div>Canvas: {canvasSize.width}x{canvasSize.height}</div>
            <div>Playing: {isPlaying ? 'Yes' : 'No'}</div>
            <div>Time: {formatTime(currentTime)}</div>
            <div>Drawing: {isDrawing ? 'Yes' : 'No'}</div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Annotations ({annotations.length})</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {annotations.map((ann) => (
                <div key={ann.id} className="bg-gray-700 p-2 rounded text-sm">
                  <div className="flex justify-between items-center">
                    <span>
                      {ann.tool === 'text' ? ann.text : ann.tool} - {formatTime(ann.timestamp)}
                    </span>
                    <button 
                      className="text-red-400 hover:text-red-300"
                      //onClick={() => setAnnotations(prev => prev.filter(a => a.id !== ann.id))}
                      onClick={() => setAnnotations(prev => prev.filter(a => (a.id ?? a._id) !== (ann.id ?? ann._id)))}
                    > 
                    x
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
);
export default AnnotationSidebar;