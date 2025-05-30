import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Maximize, Circle, Square, Minus, Type } from 'lucide-react';

const VideoAnnotationTool = () => {
  // Video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  // Annotation state
  const [annotations, setAnnotations] = useState([]);
  const [selectedTool, setSelectedTool] = useState('circle');
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState(null);
  
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Video event handlers
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleFrameNavigation = (direction) => {
    if (videoRef.current) {
      // Assuming 30fps, each frame is ~0.033 seconds
      const frameTime = 1/30;
      const newTime = direction === 'next' 
        ? Math.min(currentTime + frameTime, duration)
        : Math.max(currentTime - frameTime, 0);
      
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Canvas drawing handlers
  const handleCanvasMouseDown = (e) => {
    if (isPlaying) return; // Can only annotate when paused
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    
    const newAnnotation = {
      id: Date.now(),
      tool: selectedTool,
      startX: x,
      startY: y,
      endX: x,
      endY: y,
      timestamp: currentTime,
      text: selectedTool === 'text' ? 'Sample Text' : '',
      color: '#ff0000',
      visible: true
    };
    
    setCurrentAnnotation(newAnnotation);
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDrawing || !currentAnnotation) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCurrentAnnotation(prev => ({
      ...prev,
      endX: x,
      endY: y
    }));
  };

  const handleCanvasMouseUp = () => {
    if (currentAnnotation && isDrawing) {
      setAnnotations(prev => [...prev, currentAnnotation]);
      setCurrentAnnotation(null);
    }
    setIsDrawing(false);
  };

  // Draw annotations on canvas
  const drawAnnotations = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw all annotations that should be visible at current time
    const visibleAnnotations = annotations.filter(ann => 
      currentTime >= ann.timestamp && currentTime <= ann.timestamp + 3
    );
    
    // Include current drawing annotation
    const allAnnotations = currentAnnotation 
      ? [...visibleAnnotations, currentAnnotation]
      : visibleAnnotations;
    
    allAnnotations.forEach(annotation => {
      ctx.strokeStyle = annotation.color;
      ctx.lineWidth = 2;
      ctx.fillStyle = annotation.color + '40'; // Semi-transparent
      
      const { startX, startY, endX, endY, tool } = annotation;
      
      switch (tool) {
        case 'circle':
          const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
          ctx.beginPath();
          ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
          ctx.stroke();
          ctx.fill();
          break;
          
        case 'rectangle':
          const width = endX - startX;
          const height = endY - startY;
          ctx.strokeRect(startX, startY, width, height);
          ctx.fillRect(startX, startY, width, height);
          break;
          
        case 'line':
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
          break;
          
        case 'text':
          ctx.font = '16px Arial';
          ctx.fillStyle = annotation.color;
          ctx.fillText(annotation.text, startX, startY);
          break;
      }
    });
  };

  // Update canvas when annotations or time changes
  useEffect(() => {
    drawAnnotations();
  }, [annotations, currentAnnotation, currentTime]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleFrameNavigation('prev');
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleFrameNavigation('next');
          break;
        case 'KeyC':
          setSelectedTool('circle');
          break;
        case 'KeyR':
          setSelectedTool('rectangle');
          break;
        case 'KeyL':
          setSelectedTool('line');
          break;
        case 'KeyT':
          setSelectedTool('text');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, currentTime, duration]);

  // Format time display
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Video Annotation Tool</h1>
      
      <div className="flex gap-6">
        {/* Main Video Area */}
        <div className="flex-1">
          <div 
            ref={containerRef}
            className="relative bg-black rounded-lg overflow-hidden"
            style={{ aspectRatio: '16/9' }}
          >
            {/* Video Element */}
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Annotation Canvas Overlay */}
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full cursor-crosshair"
              width={800}
              height={450}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              style={{ display: isPlaying ? 'none' : 'block' }}
            />
          </div>
          
          {/* Video Controls */}
          <div className="bg-gray-800 p-4 rounded-b-lg">
            {/* Progress Bar */}
            <div 
              className="w-full h-2 bg-gray-600 rounded cursor-pointer mb-4"
              onClick={handleSeek}
            >
              <div 
                className="h-full bg-red-500 rounded"
                style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
              />
              {/* Progress bar markers for annotations */}
              {annotations.map(ann => (
                <div
                  key={ann.id}
                  className="absolute w-1 h-2 bg-yellow-400 rounded"
                  style={{ 
                    left: `${(ann.timestamp / duration) * 100}%`,
                    marginTop: '-8px'
                  }}
                />
              ))}
            </div>
            
            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePlayPause}
                  className="p-2 bg-red-600 hover:bg-red-700 rounded"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                
                <button
                  onClick={() => handleFrameNavigation('prev')}
                  className="p-2 bg-gray-600 hover:bg-gray-700 rounded"
                >
                  <RotateCcw size={20} />
                </button>
                
                <button
                  onClick={() => handleFrameNavigation('next')}
                  className="p-2 bg-gray-600 hover:bg-gray-700 rounded"
                >
                  <RotateCw size={20} />
                </button>
                
                <span className="text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Speed Control */}
                <select
                  value={playbackRate}
                  onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                  className="bg-gray-700 text-white px-2 py-1 rounded"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>
                
                <button className="p-2 bg-gray-600 hover:bg-gray-700 rounded">
                  <Maximize size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Annotation Tools Sidebar */}
        <div className="w-80 bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Drawing Tools</h3>
          
          {/* Tool Selection */}
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
          
          {/* Instructions */}
          <div className="bg-gray-700 p-3 rounded mb-4">
            <h4 className="font-medium mb-2">Instructions:</h4>
            <ul className="text-sm space-y-1">
              <li>• Pause video to draw annotations</li>
              <li>• Use keyboard shortcuts (C, R, L, T)</li>
              <li>• Spacebar: Play/Pause</li>
              <li>• Arrow keys: Frame navigation</li>
            </ul>
          </div>
          
          {/* Annotations List */}
          <div>
            <h4 className="font-medium mb-2">Annotations ({annotations.length})</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {annotations.map((ann, index) => (
                <div key={ann.id} className="bg-gray-700 p-2 rounded text-sm">
                  <div className="flex justify-between items-center">
                    <span>{ann.tool} - {formatTime(ann.timestamp)}</span>
                    <button 
                      className="text-red-400 hover:text-red-300"
                      onClick={() => setAnnotations(prev => prev.filter(a => a.id !== ann.id))}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoAnnotationTool;