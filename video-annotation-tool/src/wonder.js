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