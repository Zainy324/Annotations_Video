<div className="flex gap-2 mb-2">
  <button onClick={handleUndo} disabled={history.length <= 1}>Undo</button>
  <button onClick={handleRedo} disabled={redoStack.length === 0}>Redo</button>
</div>
          
          <div className="bg-gray-800 p-4 rounded-b-lg">
            {/* Time Display */}
            <div className="time-display">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Progress Bar */}
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
              {/* Background */}
              <div className="progress-background"></div>
              
              {/* Annotation Segments */}
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
              
              {/* Played Progress */}
              <div 
                className="progress-played"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
              
              {/* Hover Preview */}
              {seekHoverTime !== null && (
                <div 
                  className="progress-hover"
                  style={{ width: `${(seekHoverTime / duration) * 100}%` }}
                />
              )}
              
              {/* Thumb */}
              <div 
                className="progress-thumb"
                style={{ left: `${(currentTime / duration) * 100}%` }}
              />
            </div>

            
            {/* Control Buttons */}
            <div className="flex items-center justify-between mt-3">
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
                
                <button
                  className="p-2 bg-gray-600 hover:bg-gray-700 rounded"
                  onClick={handleFullscreen}
                  title="Fullscreen"
                >
                  <Maximize size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>