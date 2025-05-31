import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Maximize, Circle, Square, Minus, Type } from 'lucide-react';
import './App.css';
import VideoPlayer from './components/VideoPlayer';
import ControlsBar from './components/ControlsBar';
import AnnotationSidebar from './components/AnnotationSidebar';
import AnnotationEditMenu from './components/AnnotationEditMenu';
import { fetchAnnotations, createAnnotation, updateAnnotation, deleteAnnotation } from './api/annotations';


const VideoAnnotationTool = () => {
  // Video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  // Annotation state
  const [annotations, setAnnotations] = useState([]);
  const [selectedTool, setSelectedTool] = useState('circle');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState(null);
  const [seekHoverTime, setSeekHoverTime] = useState(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [movingAnnotationId, setMovingAnnotationId] = useState(null);
  
  const VIDEO_ID = 'big_buck_bunny'; // Or use your video's unique identifier
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [showToolsSidebar, setShowToolsSidebar] = useState(true);
  const [showAnnotationsSidebar, setShowAnnotationsSidebar] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Edit colors and text state
  const [showEditOptions, setShowEditOptions] = useState(false);
  const colorOptions = ['#ff0000', '#00bcd4', '#4caf50', '#ffcc00', '#7c3aed'];
const sizeOptions = [
  { label: 'Thin', value: 12 },
  { label: 'Normal', value: 16 },
  { label: 'Medium', value: 20 },
  { label: 'Thick', value: 28 },
  { label: 'Extra', value: 36 }
];
  // History and Redo stack
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('annotationHistory');
    return saved ? JSON.parse(saved) : [[]];
  });
  const [redoStack, setRedoStack] = useState(() => {
    const saved = localStorage.getItem('annotationRedo');
    return saved ? JSON.parse(saved) : [];
  });

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
      updateCanvasSize();
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

  const handleSeekMouseDown = () => {
    setIsSeeking(true);
  };

  const handleSeekMouseUp = (e) => {
    if (isSeeking) {
      handleSeek(e);
      setIsSeeking(false);
    }
  };

  const handleSeekHover = (e) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newHoverTime = (clickX / rect.width) * duration;
    
    setSeekHoverTime(newHoverTime);
  };

  
  const getAnnotationSegments = () => {
  if (annotations.length === 0 || duration <= 0) return [];
  
  // Sort annotations by timestamp
  const sorted = [...annotations].sort((a, b) => a.timestamp - b.timestamp);
  const segments = [];
  let currentSegment = null;
  
  // Define annotation duration (3 seconds)
  const annotationDuration = 3;
  
  sorted.forEach(ann => {
    const start = Math.max(0, ann.timestamp);
    const end = Math.min(duration, ann.timestamp + annotationDuration);
    
    if (!currentSegment) {
      currentSegment = { start, end };
    } else if (start <= currentSegment.end) {
      // Merge overlapping segments
      currentSegment.end = Math.max(currentSegment.end, end);
    } else {
      segments.push(currentSegment);
      currentSegment = { start, end };
    }
  });
  
  if (currentSegment) {
    segments.push(currentSegment);
  }
  
  return segments;
};

  const handleSpeedChange = (speed) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleFrameNavigation = (direction) => {
    if (videoRef.current) {
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
    if (isPlaying) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // If in move mode, only allow moving the selected annotation
    if (movingAnnotationId) {
      const ann = annotations.find(a => a.id === movingAnnotationId);
      if (ann) {
        setSelectedAnnotationId(ann.id);
        setDragOffset({ x: x - ann.startX, y: y - ann.startY });
        setIsDragging(true);
      }
      // Block all other actions
      return;
    }

    // If not drawing, check for annotation selection
    if (!isDrawing) {
      const ann = getAnnotationAtPosition(x, y);
      if (ann) {
        setSelectedAnnotationId(ann.id);
        setDragOffset({ x: x - ann.startX, y: y - ann.startY });
        // Only allow dragging if in move mode (handled above)
        return;
      } else {
        setSelectedAnnotationId(null);
      }
    }

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
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Only allow dragging if in move mode
    if (isDragging && selectedAnnotationId && movingAnnotationId === selectedAnnotationId) {
      setAnnotations(prev =>
        prev.map(ann =>
          ann.id === selectedAnnotationId
            ? {
                ...ann,
                endX: ann.endX + (x - ann.startX - dragOffset.x),
                endY: ann.endY + (y - ann.startY - dragOffset.y),
                startX: x - dragOffset.x,
                startY: y - dragOffset.y
              }
            : ann
        )
      );
      return;
    }

    if (!isDrawing || !currentAnnotation) return;

    setCurrentAnnotation(prev => ({
      ...prev,
      endX: x,
      endY: y
    }));
  };

  const handleCanvasMouseUp = async () => {
    if (isDragging) {
      setIsDragging(false);
      return;
    }
    if (currentAnnotation && isDrawing) {
      // 1. Optimistically add annotation with a temporary id
      const tempId = Date.now();
      const optimisticAnnotation = { ...currentAnnotation, id: tempId, videoId: VIDEO_ID };
      setAnnotations(prev => [...prev, optimisticAnnotation]);
      setCurrentAnnotation(null);

      try {
        // 2. Save to backend
        const savedAnnotation = await createAnnotation(optimisticAnnotation);

        // 3. Map _id to id for frontend consistency
        const annotationWithId = { ...savedAnnotation, id: savedAnnotation._id || savedAnnotation.id };

        // 4. Replace the optimistic annotation with the backend one
        setAnnotations(prev =>
          prev.map(a =>
            a.id === tempId ? annotationWithId : a
          )
        );
      } catch (error) {
        console.error("Failed to save annotation:", error);
        // Optionally keep the optimistic annotation or show an error
      }
    }
    setIsDrawing(false);
  };

  // Draw annotations on canvas
  const drawAnnotations = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const visibleAnnotations = annotations.filter(ann => 
      currentTime >= ann.timestamp && currentTime <= ann.timestamp + 3
    );
    
    const allAnnotations = currentAnnotation 
      ? [...visibleAnnotations, currentAnnotation]
      : visibleAnnotations;
    
    allAnnotations.forEach(annotation => {
      ctx.strokeStyle = annotation.color;
      ctx.lineWidth = annotation.size || 2; // Use annotation size for thickness
      ctx.fillStyle = annotation.color + '40';

      const { startX, startY, endX, endY, tool } = annotation;

      switch (tool) {
        case 'circle': {
          const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
          ctx.beginPath();
          ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
          ctx.stroke();
          ctx.fill();
          break;
        }
        case 'rectangle': {
          const width = endX - startX;
          const height = endY - startY;
          ctx.strokeRect(startX, startY, width, height);
          ctx.fillRect(startX, startY, width, height);
          break;
        }
        case 'line': {
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
          break;
        }
        case 'text': {
          ctx.font = `${annotation.size || 16}px Arial`; // Use annotation size for font
          ctx.fillStyle = annotation.color;
          ctx.fillText(annotation.text, startX, startY);
          break;
        }
      }

      if (annotation.id === selectedAnnotationId) {
        ctx.save();
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 4]);
        
        // Draw highlight shape (same as annotation)
        switch (annotation.tool) {
          case 'circle': {
            const radius = Math.sqrt(Math.pow(annotation.endX - annotation.startX, 2) + Math.pow(annotation.endY - annotation.startY, 2));
            ctx.beginPath();
            ctx.arc(annotation.startX, annotation.startY, radius, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.fill();
            break;
          }
          
          case 'rectangle': {
            const width = annotation.endX - annotation.startX;
            const height = annotation.endY - annotation.startY;
            ctx.strokeRect(annotation.startX, annotation.startY, width, height);
            ctx.fillRect(annotation.startX, annotation.startY, width, height);
            ctx.stroke();
            break;
          }
          
          case 'line': {
            ctx.beginPath();
            ctx.moveTo(annotation.startX, annotation.startY);
            ctx.lineTo(annotation.endX, annotation.endY);
            ctx.stroke();
            break;
          }
          
          case 'text': {
            ctx.font = '16px Arial';
            ctx.fillStyle = '#00ffff';
            ctx.fillText(annotation.text, annotation.startX, annotation.startY);
            break;
          }
        }
        
        ctx.restore();
      }
    });
  };

  // Update canvas size to match video
  const updateCanvasSize = () => {
    const container = containerRef.current;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (container && video && canvas) {
      const videoRect = video.getBoundingClientRect();
      const newSize = {
        width: videoRect.width,
        height: videoRect.height
      };
      
      setCanvasSize(newSize);
      canvas.width = newSize.width;
      canvas.height = newSize.height;
    }
  };

  // Effects
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    
    if (!video || !container) return;

    const handleResize = () => {
      updateCanvasSize();
    };

    // Initialize
    const initTimeout = setTimeout(() => {
      updateCanvasSize();
    }, 100);

    // Event listeners
    window.addEventListener('resize', handleResize);
    video.addEventListener('loadedmetadata', handleResize);

    // ResizeObserver
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    resizeObserver.observe(video);

    return () => {
      clearTimeout(initTimeout);
      window.removeEventListener('resize', handleResize);
      video.removeEventListener('loadedmetadata', handleResize);
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    drawAnnotations();
  }, [annotations, currentAnnotation, currentTime]);

  // Add this effect just below the drawAnnotations effect
  useEffect(() => {
    const loadData = async () => {
      try {
        await loadAnnotations();
      } catch (error) {
        console.error("Failed to load annotations:", error);
      }
    };
    loadData();
  }, []); // Runs once on mount

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

  function getAnnotationAtPosition(x, y) {
  // Only check visible annotations
  const visibleAnnotations = annotations.filter(ann =>
    currentTime >= ann.timestamp && currentTime <= ann.timestamp + 3
  );
  for (let i = visibleAnnotations.length - 1; i >= 0; i--) {
    const ann = visibleAnnotations[i];
    switch (ann.tool) {
      case 'circle': {
        const r = Math.sqrt(Math.pow(ann.endX - ann.startX, 2) + Math.pow(ann.endY - ann.startY, 2));
        const dist = Math.sqrt(Math.pow(x - ann.startX, 2) + Math.pow(y - ann.startY, 2));
        if (dist <= r) return ann;
        break;
      }
      case 'rectangle': {
        const minX = Math.min(ann.startX, ann.endX);
        const maxX = Math.max(ann.startX, ann.endX);
        const minY = Math.min(ann.startY, ann.endY);
        const maxY = Math.max(ann.startY, ann.endY);
        if (x >= minX && x <= maxX && y >= minY && y <= maxY) return ann;
        break;
      }
      case 'line': {
        // Simple hit test for line
        const dist = Math.abs(
          (ann.endY - ann.startY) * x -
          (ann.endX - ann.startX) * y +
          ann.endX * ann.startY -
          ann.endY * ann.startX
        ) / Math.sqrt(Math.pow(ann.endY - ann.startY, 2) + Math.pow(ann.endX - ann.startX, 2));
        if (dist < 8) return ann; // 8px tolerance
        break;
      }
      case 'text': {
        // Hit test for text (approximate as a rectangle)
        if (
          x >= ann.startX &&
          x <= ann.startX + 80 &&
          y >= ann.startY - 16 &&
          y <= ann.startY + 4
        )
          return ann;
        break;
      }
    }
  }
  return null;
}

// const loadAnnotations = async () => {
//   try {
//     const annotations = await fetchAnnotations(VIDEO_ID);
//     setAnnotations(annotations);
//   } catch (error) {
//     console.error("Failed to load annotations:", error);
//     // Fallback to localStorage if API fails
//     const localAnnotations = localStorage.getItem('annotations');
//     if (localAnnotations) {
//       setAnnotations(JSON.parse(localAnnotations));
//     }
//   }
// };

const loadAnnotations = async () => {
  try {
    const loaded = await fetchAnnotations(VIDEO_ID);

    // --- Rebuild history as step-by-step states ---
    let rebuiltHistory = [[]];
    loaded.forEach(ann => {
      rebuiltHistory.push([...rebuiltHistory[rebuiltHistory.length - 1], ann]);
    });

    setHistory(rebuiltHistory);
    setAnnotations(loaded);
    localStorage.setItem('annotationHistory', JSON.stringify(rebuiltHistory));
    setRedoStack([]);
    localStorage.setItem('annotationRedo', JSON.stringify([]));
  } catch (error) {
    console.error("Failed to load annotations:", error);
    // Fallback to localStorage if API fails
    const localAnnotations = localStorage.getItem('annotations');
    if (localAnnotations) {
      const loaded = JSON.parse(localAnnotations);

      let rebuiltHistory = [[]];
      loaded.forEach(ann => {
        rebuiltHistory.push([...rebuiltHistory[rebuiltHistory.length - 1], ann]);
      });

      setHistory(rebuiltHistory);
      setAnnotations(loaded);
      localStorage.setItem('annotationHistory', JSON.stringify(rebuiltHistory));
      setRedoStack([]);
      localStorage.setItem('annotationRedo', JSON.stringify([]));
    }
  }
};

const handleFullscreen = () => {
  const container = containerRef.current;
  if (container) {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  }
};

// Detect fullscreen change
useEffect(() => {
  const handleFsChange = () => {
    setIsFullscreen(!!document.fullscreenElement);
    updateCanvasSize(); // <-- Add this line
  };
  document.addEventListener('fullscreenchange', handleFsChange);
  return () => document.removeEventListener('fullscreenchange', handleFsChange);
}, []);

const handleUndo = () => {
  setHistory(prev => {
    if (prev.length <= 1) return prev;
    const newHistory = prev.slice(0, -1);
    const lastState = prev[prev.length - 1];
    setRedoStack(r => {
      const newRedo = [annotations, ...r];
      localStorage.setItem('annotationRedo', JSON.stringify(newRedo));
      return newRedo;
    });
    setAnnotations(newHistory[newHistory.length - 1]);
    localStorage.setItem('annotationHistory', JSON.stringify(newHistory));
    return newHistory;
  });
};

const handleRedo = () => {
  setRedoStack(prev => {
    if (prev.length === 0) return prev;
    const [next, ...rest] = prev;
    setHistory(h => {
      const newHistory = [...h, next];
      localStorage.setItem('annotationHistory', JSON.stringify(newHistory));
      return newHistory;
    });
    setAnnotations(next);
    localStorage.setItem('annotationRedo', JSON.stringify(rest));
    return rest;
  });
};

  useEffect(() => {
    // Don't push to history if the last history entry is the same as current annotations
    setHistory(prev => {
      if (JSON.stringify(prev[prev.length - 1]) === JSON.stringify(annotations)) return prev;
      const newHistory = [...prev, annotations];
      localStorage.setItem('annotationHistory', JSON.stringify(newHistory));
      // Clear redo stack on new action
      setRedoStack([]);
      localStorage.setItem('annotationRedo', JSON.stringify([]));
      return newHistory;
    });
  }, [annotations]);

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Video Annotation Tool</h1>
      
      <div className="flex gap-6">
        
        {/* Main Video Area */}
        <div className="flex-1">
            <VideoPlayer
  videoRef={videoRef}
  canvasRef={canvasRef}
  containerRef={containerRef}
  canvasSize={canvasSize}
  handleTimeUpdate={handleTimeUpdate}
  handleLoadedMetadata={handleLoadedMetadata}
  handleCanvasMouseDown={handleCanvasMouseDown}
  handleCanvasMouseMove={handleCanvasMouseMove}
  handleCanvasMouseUp={handleCanvasMouseUp}
  isPlaying={isPlaying}
  selectedTool={selectedTool}
/>
 {/* AnnotationEditMenu */}
{selectedAnnotationId && (() => {
  const ann = annotations.find(a => a.id === selectedAnnotationId);
  if (!ann) return null;
  const left = (ann.startX / canvasSize.width) * 100;
  const top = (ann.startY / canvasSize.height) * 100;
  return (
    <AnnotationEditMenu
      ann={ann}
      left={left}
      top={top}
      movingAnnotationId={movingAnnotationId}
      setMovingAnnotationId={setMovingAnnotationId}
      setIsDragging={setIsDragging}
      setAnnotations={setAnnotations}
      setSelectedAnnotationId={setSelectedAnnotationId}
      showEditOptions={showEditOptions}
      setShowEditOptions={setShowEditOptions}
      colorOptions={colorOptions}
      sizeOptions={sizeOptions}
      updateAnnotation={updateAnnotation}
    />
  );
})()}

<ControlsBar
  isPlaying={isPlaying}
  handlePlayPause={handlePlayPause}
  handleFrameNavigation={handleFrameNavigation}
  currentTime={currentTime}
  duration={duration}
  formatTime={formatTime}
  handleSeek={handleSeek}
  handleSeekMouseDown={handleSeekMouseDown}
  handleSeekMouseUp={handleSeekMouseUp}
  handleSeekHover={handleSeekHover}
  setIsSeeking={setIsSeeking}
  setSeekHoverTime={setSeekHoverTime}
  seekHoverTime={seekHoverTime}
  getAnnotationSegments={getAnnotationSegments}
  playbackRate={playbackRate}
  handleSpeedChange={handleSpeedChange}
  handleFullscreen={handleFullscreen}
  handleUndo={handleUndo}
  handleRedo={handleRedo}
  history={history}
  redoStack={redoStack}
/>
<AnnotationSidebar
  selectedTool={selectedTool}
  setSelectedTool={setSelectedTool}
  canvasSize={canvasSize}
  isPlaying={isPlaying}
  currentTime={currentTime}
  isDrawing={isDrawing}
  annotations={annotations}
  setAnnotations={setAnnotations}
  formatTime={formatTime}
/>

            

  
    
          
        </div>
        
       
      </div>

      {isFullscreen && (
        <>
          <button
            className="fixed top-1/2 right-4 z-50 bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
            style={{ transform: 'translateY(-120%)' }}
            onClick={() => setShowToolsSidebar((v) => !v)}
            title="Show/Hide Drawing Tools"
          >
            D
          </button>
          <button
            className="fixed top-1/2 right-4 z-50 bg-yellow-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
            style={{ transform: 'translateY(20%)' }}
            onClick={() => setShowAnnotationsSidebar((v) => !v)}
            title="Show/Hide Saved Annotations"
          >
            S
          </button>
        </>
      )}
    </div>
  );
};

export default VideoAnnotationTool;