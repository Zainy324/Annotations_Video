import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Play, Pause, RotateCcw, RotateCw, Maximize } from 'lucide-react';

// Modular utility for responsive offset
function getMenuOffset() {
  if (window.innerWidth < 600) return 24; // mobile
  if (window.innerWidth < 900) return 32; // tablet
  return 40; // desktop
}

const ControlsBar = (props) => {
  const {
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
  } = props;

  const [showMenu, setShowMenu] = useState(false);
  const menuBtnRef = useRef(null);
  const menuDialogRef = useRef(null);
  const [menuPos, setMenuPos] = useState({ left: 0, top: 0, width: 0 });

  // Update menu position on button click
  useEffect(() => {
    if (showMenu && menuBtnRef.current && props.containerRef?.current) {
      const btnRect = menuBtnRef.current.getBoundingClientRect();
      const containerRect = props.containerRef.current.getBoundingClientRect();
      const offset = getMenuOffset();
      setMenuPos({
        left: btnRect.left - containerRect.left + btnRect.width / 2,
        top: btnRect.top - containerRect.top - offset,
        width: btnRect.width,
      });
    }
  }, [showMenu, props.containerRef]);

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    const handler = (e) => {
      if (
        menuBtnRef.current &&
        !menuBtnRef.current.contains(e.target) &&
        menuDialogRef.current &&
        !menuDialogRef.current.contains(e.target)
      ) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

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
        className="controls-row flex items-center px-4 pb-2 pt-1 bg-black/70 rounded-b min-w-0 w-full"
        style={{ minWidth: 0 }}
      >
        {/* LEFT CONTROLS */}
        <button
          onClick={handlePlayPause}
          className="p-1.5 rounded flex-shrink-0 text-white bg-transparent hover:bg-white/10 transition"
        >
          {isPlaying ? <Pause className="icon-responsive" /> : <Play className="icon-responsive" />}
        </button>
        <button
          onClick={() => handleFrameNavigation('prev')}
          className="p-1.5 bg-gray-600 hover:bg-gray-700 rounded flex-shrink-0"
        >
          <RotateCcw className="icon-responsive" />
        </button>
        <button
          onClick={() => handleFrameNavigation('next')}
          className="p-1.5 bg-gray-600 hover:bg-gray-700 rounded flex-shrink-0"
        >
          <RotateCw className="icon-responsive" />
        </button>

        {/* TIME DISPLAY */}
        <span className="text-xs text-center flex-shrink-0 min-w-0 whitespace-nowrap mx-2 ml-auto">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        {/* RIGHT CONTROLS */}
        <div className="flex-1" /> {/* This pushes the next buttons to the right */}

        <div className="relative group flex-shrink-0 min-w-0">
          <button
            ref={menuBtnRef}
            className="p-1.5 text-white bg-transparent hover:bg-white/10 transition"
            onClick={() => setShowMenu((v) => !v)}
            aria-label="More"
            type="button"
          >
            <svg className="icon-responsive" width="20" height="20" fill="none" stroke="currentColor"><circle cx="4" cy="10" r="1.5"/><circle cx="10" cy="10" r="1.5"/><circle cx="16" cy="10" r="1.5"/></svg>
          </button>
        </div>
        <button
          className="p-1.5 bg-gray-600 hover:bg-gray-700 rounded flex-shrink-0 ml-2"
          onClick={handleFullscreen}
          title="Fullscreen"
        >
          <Maximize className="icon-responsive" />
        </button>
      </div>
      {/* Portal menu */}
      {showMenu && props.containerRef?.current && createPortal(
        <div
          ref={menuDialogRef}
          className="controls-menu-dialog"
          style={{
            position: 'absolute',
            left: menuPos.left,
            top: menuPos.top,
            transform: 'translate(-50%, -100%)',
            background: 'rgba(24, 24, 32, 0.98)',
            color: '#fff',
            borderRadius: 8,
            boxShadow: '0 8px 32px #000a',
            padding: '1rem',
            minWidth: 180,
            zIndex: 1000,
            pointerEvents: 'auto',
          }}
        >
          {/* Arrow and menu content
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: -10,
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '10px solid rgba(24, 24, 32, 0.98)',
              zIndex: 1001,
            }}
          /> */}
          {/* ...menu content... */}
          <div className="mb-3">
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
          <div>
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
                  background: showAnnotationsPanel ? '#facc15' : '#fff',
                  boxShadow: '0 1px 4px #0002',
                  position: 'absolute',
                  left: showAnnotationsPanel ? 20 : 2,
                  top: 2,
                  transition: 'left 0.2s, background 0.2s',
                }}
              />
            </button>
            <span className="font-semibold ml-2">
              {showAnnotationsPanel ? "Hide Annotations" : "Annotations"}
            </span>
          </div>
        </div>,
        props.containerRef.current
      )}
    </div>
  );
};

export default ControlsBar;