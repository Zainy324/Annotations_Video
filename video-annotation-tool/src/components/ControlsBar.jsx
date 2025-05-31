import React, { useState } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Maximize } from 'lucide-react';

const ControlsBar = ({
  isPlaying,
  handlePlayPause,
  handleFrameNavigation,
  currentTime,
  duration,
  formatTime,
  handleSeek,
  handleSeekMouseDown,
  handleSeekMouseUp,
  handleSeekHover,
  setIsSeeking,
  setSeekHoverTime,
  seekHoverTime,
  getAnnotationSegments,
  playbackRate,
  handleSpeedChange,
  handleFullscreen,
  handleUndo,
  handleRedo,
  history,
  redoStack,
  setShowAnnotationsPanel,
  showAnnotationsPanel
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className="controls-overlay absolute left-0 bottom-0 w-full z-30"
      style={{
        pointerEvents: 'auto',
        background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))'
      }}
    >
      {/* Progress Bar */}
      <div className="w-full px-4 pt-2">
        <div 
          className="progress-container"
          onClick={handleSeek}
          onMouseDown={handleSeekMouseDown}
          onMouseUp={handleSeekMouseUp}
          onMouseMove={handleSeekHover}
          onMouseLeave={() => {
            setIsSeeking(false);
            setSeekHoverTime(null);
          }}
        >
          <div className="progress-background"></div>
          {getAnnotationSegments().map((segment, i) => (
            <div 
              key={i}
              className="progress-annotations"
              style={{
                left: `${(segment.start / duration) * 100}%`,
                width: `${((segment.end - segment.start) / duration) * 100}%`
              }}
            />
          ))}
          <div 
            className="progress-played"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          {seekHoverTime !== null && (
            <div 
              className="progress-hover"
              style={{ width: `${(seekHoverTime / duration) * 100}%` }}
            />
          )}
          <div 
            className="progress-thumb"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Controls Row - Single Line */}
      <div
        className="flex flex-nowrap items-center gap-2 px-4 pb-2 pt-1 bg-black/70 rounded-b overflow-x-auto whitespace-nowrap min-w-0"
        style={{ minWidth: 0 }}
      >
        {/* LEFT CONTROLS */}
        <button 
          onClick={handlePlayPause}
          className="p-1.5 rounded flex-shrink-0 text-white bg-transparent hover:bg-white/10 transition"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button 
          onClick={() => handleFrameNavigation('prev')} 
          className="p-1.5 bg-gray-600 hover:bg-gray-700 rounded flex-shrink-0"
        >
          <RotateCcw size={16} />
        </button>
        <button 
          onClick={() => handleFrameNavigation('next')} 
          className="p-1.5 bg-gray-600 hover:bg-gray-700 rounded flex-shrink-0"
        >
          <RotateCw size={16} />
        </button>

        {/* TIME DISPLAY */}
        <span className="text-xs text-center flex-shrink-0 min-w-0 whitespace-nowrap mx-2 ml-auto">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        {/* RIGHT CONTROLS */}
        {/* <button 
          onClick={handleUndo} 
          disabled={history.length <= 1} 
          className="px-2 py-1 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs flex-shrink-0"
        >
          Undo
        </button>
        <button 
          onClick={handleRedo} 
          disabled={redoStack.length === 0} 
          className="px-2 py-1 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs flex-shrink-0"
        >
          Redo
        </button> */}
        <button
          className="p-1.5 bg-gray-600 hover:bg-gray-700 rounded flex-shrink-0"
          onClick={handleFullscreen}
          title="Fullscreen"
        >
          <Maximize size={16} />
        </button>
        <div className="relative group flex-shrink min-w-0">
          <button
            className="p-1.5 text-white bg-transparent hover:bg-white/10 transition"
            onClick={() => setShowMenu((v) => !v)}
            aria-label="More"
            type="button"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor"><circle cx="4" cy="10" r="1.5"/><circle cx="10" cy="10" r="1.5"/><circle cx="16" cy="10" r="1.5"/></svg>
          </button>
          {showMenu && (
            <div className="absolute right-0 bottom-full mb-2 bg-black text-white shadow-lg border border-gray-700" style={{minWidth: 120}}>
              <div className="px-4 py-2 hover:bg-white/10 cursor-pointer">
                <label>
                  Speed
                  <select
                    value={playbackRate}
                    onChange={e => {
                      handleSpeedChange(parseFloat(e.target.value));
                      setShowMenu(false);
                    }}
                    className="ml-2 bg-transparent text-white border border-white"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={1}>1x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>
                </label>
              </div>

              {/* <div
                className={`px-4 py-2 cursor-pointer flex items-center gap-3 rounded transition
                  ${showAnnotationsPanel ? 'bg-blue-600 text-white' : 'hover:bg-white/10 text-gray-200'}
                `}
                onMouseDown={e => {
                  e.preventDefault();
                  setShowAnnotationsPanel(v => !v);
                  setShowMenu(false);
                }}
              > */}
                {/* Toggle Switch */}
                {/* <span className={`toggle-switch ${showAnnotationsPanel ? 'on' : ''}`}>
                  <span className="toggle-knob" />
                </span>
                <span>
                  {showAnnotationsPanel ? "Hide Annotations" : "Annotations"}
                </span>
              </div> */}
<div className="flex items-center gap-3 px-2 py-2">
  <button
  className={`annotation-toggle-btn ${showAnnotationsPanel ? 'on' : ''}`}
  aria-pressed={showAnnotationsPanel}
  onClick={() => {
    setShowAnnotationsPanel(v => !v);
    setShowMenu(false);
  }}
  style={{
    width: 40,
    height: 22,
    borderRadius: 12,
    background: showAnnotationsPanel ? '#2563eb' : '#39315a',
    border: 'none',
    position: 'relative',
    transition: 'background 0.2s',
    outline: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: 0,
  }}
  title="Toggle Annotations Panel"
>
  <span
    style={{
      display: 'block',
      width: 18,
      height: 18,
      borderRadius: '50%',
      background: showAnnotationsPanel ? '#facc15' : '#fff', // <-- FIXED!
      boxShadow: '0 1px 4px #0002',
      position: 'absolute',
      left: showAnnotationsPanel ? 20 : 2,
      top: 2,
      transition: 'left 0.2s, background 0.2s',
    }}
  />
</button>
<span className="font-semibold">
  {showAnnotationsPanel ? "Hide Annotations" : "Annotations"}
</span>
  <span className="font-semibold">
    {showAnnotationsPanel ? "Hide Annotations" : "Annotations"}
  </span>
</div>
              
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ControlsBar;