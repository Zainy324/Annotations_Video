import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Maximize, Circle, Square, Minus, Type, Pencil } from 'lucide-react';
import './App.css';
import AnnotixLogo from "./components/AnnotixLogo";
import VideoPlayer from './components/VideoPlayer.jsx';
import ControlsBar from './components/ControlsBar.jsx';
import AnnotationSidebar from './components/AnnotationSidebar.jsx';
import AnnotationEditMenu from './components/AnnotationEditMenu.jsx';
import { fetchAnnotations, createAnnotation, updateAnnotation, deleteAnnotation } from './api/annotations';

// export default function App() {
//   return <div style={{ color: 'red', fontSize: 40 }}>HELLO TEST</div>;}
// const VideoAnnotationTool = () => {
//   return (
//     <div>
//       <h2>Hello World</h2>
//     </div>
//   );


const VideoAnnotationTool = () => {
  // Video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
const videoName = videoUrl.split('/').pop().replace(/\.[^/.]+$/, '').replace(/([A-Z])/g, ' $1').trim();
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
  const [flashAnnotationId, setFlashAnnotationId] = useState(null);
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
  const [showAnnotationsPanel, setShowAnnotationsPanel] = useState(false);
  const colorOptions = ['#ff0000', '#00bcd4', '#4caf50', 
    '#ffcc00', '#7c3aed'];
const shapeSizeOptions = [
  { label: 'Thin', value: 2 },
  { label: 'Normal', value: 4 },
  { label: 'Medium', value: 6 },
  { label: 'Thick', value: 10 },
  { label: 'Extra', value: 16 }
];
const textSizeOptions = [
  { label: 'Small', value: 12 },
  { label: 'Normal', value: 16 },
  { label: 'Medium', value: 20 },
  { label: 'Large', value: 28 },
  { label: 'Huge', value: 36 }
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

  const skipRedoClearRef = useRef(false);

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



useEffect(() => {
    setHistory(prev => {
      if (JSON.stringify(prev[prev.length - 1]) === JSON.stringify(annotations)) return prev;
      const newHistory = [...prev, annotations];
      if (newHistory.length > 50) newHistory.shift();
      setRedoStack([]); // Only clear redo when a new action is made
      return newHistory;
    });

    if (skipRedoClearRef.current) {
      skipRedoClearRef.current = false;
      return;
    }
  }, [annotations]);
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
useEffect(() => {
  setShowEditOptions(false);
}, [selectedAnnotationId]);

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

    let rebuiltHistory = [[]];
    loaded.forEach(ann => {
      rebuiltHistory.push([...rebuiltHistory[rebuiltHistory.length - 1], ann]);
    });

    const storedHistory = localStorage.getItem('annotationHistory');
    const storedRedo = localStorage.getItem('annotationRedo');
    setHistory(storedHistory ? JSON.parse(storedHistory) : rebuiltHistory);
    setRedoStack(storedRedo ? JSON.parse(storedRedo) : []);
    setAnnotations(loaded);
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
  skipRedoClearRef.current = true;
  setHistory(prev => {
    if (prev.length <= 1) return prev;
    const newHistory = prev.slice(0, -1);
    setRedoStack(r => [annotations, ...r]);
    setAnnotations(newHistory[newHistory.length - 1]);
     if (newHistory.length > 50) newHistory.shift();
    return newHistory;
  });
};

// const handleRedo = () => {
//   skipRedoClearRef.current = true;
//   setRedoStack(prev => {
//     if (prev.length === 0) return prev;
//     const [next, ...rest] = prev;
//     setHistory(h => [...h, next]);
//     setAnnotations(next);
//     return rest;
//   });
// };
const handleRedo = () => {
  skipRedoClearRef.current = true;
  setRedoStack(prev => {
    if (prev.length === 0) return prev;
    const [next, ...rest] = prev;
    setHistory(h => {
      const newHistory = [...h, next];
      if (newHistory.length > 50) newHistory.shift();
      return newHistory;
    });
    setAnnotations(next);
    return rest;
  });
};

// 1. Sync to localStorage
useEffect(() => {
  localStorage.setItem('annotationRedo', JSON.stringify(redoStack));
}, [redoStack]);

useEffect(() => {
  localStorage.setItem('annotationHistory', JSON.stringify(history));
}, [history]);

  useEffect(() => {
    setHistory(prev => {
      if (JSON.stringify(prev[prev.length - 1]) === JSON.stringify(annotations)) return prev;
      const newHistory = [...prev, annotations];
      if (newHistory.length > 50) newHistory.shift();
      setRedoStack([]); // Only clear redo when a new action is made
      return newHistory;
    });

    if (skipRedoClearRef.current) {
      skipRedoClearRef.current = false;
      return;
    }
  }, [annotations]);

return (
  // <div className="w-full min-h-screen flex flex-col bg-gray-900 text-white">
<div className={`w-full min-h-screen flex flex-col text-white ${showAnnotationsPanel ? 'split-bg' : 'landing-bg'}`}>    {/* HEADER */}
    {/* <header className="app-header">
      <h1>Video Annotation Tool</h1>
    </header> */}

    <header className="app-header" style={{ display: "flex", alignItems: "center", gap: 16 }}>
  <AnnotixLogo />
  {/* Optionally, remove the old <h1> */}
  {/* <h1>Video Annotation Tool</h1> */}
</header>
    
    <main className="flex-1 flex flex-col">
      {/* Video Container - Always rendered with different layout classes */}
      <div className={showAnnotationsPanel ? "split-screen-container" : "flex flex-col items-center justify-center"}>
        {/* Video Section */}
        <div className={showAnnotationsPanel ? "video-section" : ""}>
          <div className="video-player-stack">
            <div
              ref={containerRef}
              className="relative bg-black rounded-lg overflow-hidden video-container"
              style={{
                aspectRatio: '16/9',
                width: showAnnotationsPanel ? '100%' : 720,
                maxWidth: showAnnotationsPanel ? 720 : '70vw'
              }}
            >
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
                setIsPlaying={setIsPlaying}
                selectedTool={selectedTool}
                videoUrl={videoUrl}

              />
              <div className="video-title-youtube">{videoName}</div>
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
                showAnnotationsPanel={showAnnotationsPanel}
                setShowAnnotationsPanel={setShowAnnotationsPanel}
                containerRef={containerRef}

              />
            </div>
            <div className="video-title-below">{videoName}</div>
          </div>
        </div>
        
        {/* Annotation Sidebar - Only rendered when showAnnotationsPanel is true */}
        {showAnnotationsPanel && (
          <div className="annotation-sidebar sidebar-container-with-tools">
            {/* Undo/Redo */}
            <div className="flex gap-2 mb-4 undo-redo-row">
              <button
                onClick={handleUndo}
                disabled={history.length <= 1}
                className="icon-button px-3 py-1 bg-gray-700 text-white disabled:opacity-50 rounded"
                title="Undo"
              >
                <RotateCcw className="icon-responsive" />
              </button>
              <button
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                className="icon-button px-3 py-1 bg-gray-700 text-white disabled:opacity-50 rounded"
                title="Redo"
              >
                <RotateCw className="icon-responsive" />
              </button>
            </div>
            
            {/* Shape tools */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => setSelectedTool('rectangle')}
                className={`icon-button p-2 rounded ${selectedTool === 'rectangle' ? 'bg-blue-600' : 'bg-gray-700'} text-white hover:bg-opacity-80 transition-colors`}
                title="Rectangle"
              >
                <Square className="icon-responsive" />
              </button>
              <button
                onClick={() => setSelectedTool('line')}
                className={`icon-button p-2 rounded ${selectedTool === 'line' ? 'bg-blue-600' : 'bg-gray-700'} text-white hover:bg-opacity-80 transition-colors`}
                title="Line"
              >
                <Minus className="icon-responsive" />
              </button>
              <button
                onClick={() => setSelectedTool('text')}
                className={`icon-button p-2 rounded ${selectedTool === 'text' ? 'bg-blue-600' : 'bg-gray-700'} text-white hover:bg-opacity-80 transition-colors`}
                title="Text"
              >
                <Type className="icon-responsive" />
              </button>
              <button
                onClick={() => setSelectedTool('circle')}
                className={`icon-button p-2 rounded ${selectedTool === 'circle' ? 'bg-blue-600' : 'bg-gray-700'} text-white hover:bg-opacity-80 transition-colors`}
                title="Circle"
              >
                <Circle className="icon-responsive" />
              </button>
            </div>
            
            {/* Annotation list */}
            <div className="flex-1 overflow-y-auto">
              <h4 className="annotation-header-text">Annotations ({annotations.length})</h4>
              {/* <div className="space-y-2"> */}
              <div
className="space-y-2"
  style={{
    maxHeight: '180px',
    overflowY: 'auto',
    paddingRight: 4,
  }}
>
                {[...annotations]
    .slice()
    .reverse()
    .map((ann) => (
      <div
        key={ann.id ?? ann._id}
        className={`annotation-row 
          ${selectedAnnotationId === (ann.id ?? ann._id) ? 'annotation-row-active' : ''}
          ${flashAnnotationId === (ann.id ?? ann._id) ? 'flash' : ''}
          `}
        style={{ cursor: 'pointer' }}
        onClick={() => {
          // Seek video and highlight annotation
          if (videoRef.current) {
            videoRef.current.currentTime = ann.timestamp;
            setCurrentTime(ann.timestamp);
          }
          setSelectedAnnotationId(ann.id ?? ann._id);

          // Flash highlight
          setFlashAnnotationId(ann.id ?? ann._id);
          setTimeout(() => setFlashAnnotationId(null), 1200); // 1.2s highlight
        }}
      >
        <span className="annotation-text">
          {ann.tool === 'text' ? ann.text : ann.tool} - {formatTime(ann.timestamp)}
        </span>
        <button
          className="annotation-delete"
          onClick={e => {
            e.stopPropagation();
            setAnnotations(prev => prev.filter(a => (a.id ?? a._id) !== (ann.id ?? ann._id)));
          }}
          aria-label="Delete annotation"
        >
          ×
        </button>
      </div>
    ))}

            </div>
          </div>
        </div>
        )}
      </div>
{/* <div className="video-title-below">
  {videoName}
</div> */}
    {selectedAnnotationId && (() => {
  const ann = annotations.find(a => a.id === selectedAnnotationId);
  if (!ann) return null;

  // Get DOM nodes
  const container = containerRef.current;
  const canvas = canvasRef.current;
  if (!container || !canvas) return null;

  // Get bounding rects
  const containerRect = container.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();

  // Calculate annotation center (for shapes) or start (for text) in canvas coordinates
  let annX, annY;
  if (ann.tool === 'text') {
    annX = ann.startX;
    annY = ann.startY;
  } else {
    const minX = Math.min(ann.startX, ann.endX ?? ann.startX);
    const maxX = Math.max(ann.startX, ann.endX ?? ann.startX);
    const minY = Math.min(ann.startY, ann.endY ?? ann.startY);
    annX = (minX + maxX) / 2;
    annY = minY;
  }

  // Convert canvas coordinates to container (video) pixel coordinates
  const scaleX = canvasRect.width / canvas.width;
  const scaleY = canvasRect.height / canvas.height;
  let menuX = annX * scaleX;
  let menuY = annY * scaleY;

  // Offset menu 45px above the annotation
  menuY = menuY - 45;

  // Clamp menuX/menuY to stay inside container
  const menuWidth = 160; // Approximate width of your menu in px
  const menuHeight = 40; // Height above annotation
  menuX = Math.max(menuWidth / 2, Math.min(menuX, containerRect.width - menuWidth / 2));
  menuY = Math.max(0, Math.min(menuY, containerRect.height - menuHeight));

  return (
    <AnnotationEditMenu
      ann={ann}
      menuX={menuX}
      menuY={menuY}
      movingAnnotationId={movingAnnotationId}
      setMovingAnnotationId={setMovingAnnotationId}
      setIsDragging={setIsDragging}
      setAnnotations={setAnnotations}
      setSelectedAnnotationId={setSelectedAnnotationId}
      showEditOptions={showEditOptions}
      setShowEditOptions={setShowEditOptions}
      colorOptions={colorOptions}
      shapeSizeOptions={shapeSizeOptions}
      textSizeOptions={textSizeOptions}
      updateAnnotation={updateAnnotation}
      sizeOptions={ann.tool === 'text' ? textSizeOptions : shapeSizeOptions}
    />
  );
})()}
</main>

    {/* FOOTER
    <footer className="app-footer mt-4">
      © {new Date().getFullYear()} Annotateway. All rights reserved.
    </footer> */}
    <footer className="app-footer mt-4">
  <div className="footer-content">
    <div>© {new Date().getFullYear()} Annotix. All rights reserved.</div>
    <div className="footer-links">
      <a 
        href="https://github.com/Zainy324"
        target="_blank" 
        rel="noopener noreferrer"
        className="footer-link"
      >
        GitHub: github.com/Zainy324
      </a>
      <span className="footer-separator">|</span>
      <a 
        href="mailto:zainabraza2004@gmail.com"
        className="footer-link"
      >
        zainabraza2004@gmail.com
      </a>
    </div>
  </div>
</footer>
  </div>
);
};

export default VideoAnnotationTool;