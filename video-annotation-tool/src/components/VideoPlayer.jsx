import React from 'react';

const VideoPlayer = ({
  videoRef,
  canvasRef,
  containerRef,
  canvasSize,
  handleTimeUpdate,
  handleLoadedMetadata,
  handleCanvasMouseDown,
  handleCanvasMouseMove,
  handleCanvasMouseUp,
  isPlaying,
  setIsPlaying,
  selectedTool,
  videoUrl
}) => ( <>
{/* <div 
            ref={containerRef}
            className="relative bg-black rounded-lg overflow-hidden video-container"
            style={{ aspectRatio: '16/9' }}
          > */}
            <video
              ref={videoRef}
              className="w-full h-full"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              crossOrigin="anonymous"
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 pointer-events-auto"
              width={canvasSize.width}
              height={canvasSize.height}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              style={{ 
                display: !isPlaying ? 'block' : 'none',
                width: '100%',
                height: '100%',
                zIndex: 10,
                cursor: selectedTool === 'text' ? 'text' : 'crosshair'
              }}
            />
            </>
);

export default VideoPlayer;