import React, { useState } from 'react';

const AnnotationEditMenu = ({
  ann,
  menuX,
  menuY,
  movingAnnotationId,
  setMovingAnnotationId,
  setIsDragging,
  setAnnotations,
  setSelectedAnnotationId,
  showEditOptions,
  setShowEditOptions,
  colorOptions,
  sizeOptions,
  updateAnnotation
}) => (
  <div
    className="annotation-edit-menu"
    style={{
      position: 'absolute',
      left: `${menuX}px`,
      top: `${menuY}px`,
      transform: 'translateX(-50%)',
      zIndex: 20,
      background: 'rgba(30, 30, 30, 0.97)',
      padding: '4px 8px',
      borderRadius: 4,
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      minWidth: 80,
      maxWidth: '90vw',
      boxSizing: 'border-box',
      pointerEvents: 'auto'
    }}
  >
    <button
      className="annotation-edit-btn delete"
      onClick={() => {
        //setAnnotations(prev => prev.filter(a => a.id !== ann.id));
        setAnnotations(prev => prev.filter(a => (a.id ?? a._id) !== (ann.id ?? ann._id)));
        setSelectedAnnotationId(null);
      }}
      title="Delete"
    >
      ✕
    </button>

    {/* Drag handle: only show when in move mode */}
    {movingAnnotationId === ann.id && (
      <span
        style={{
          display: 'inline-block',
          width: 18,
          height: 18,
          margin: '0 6px',
          cursor: 'grab',
          userSelect: 'none'
        }}
        title="Drag to move"
        onMouseDown={e => {
          e.stopPropagation(); // Prevents triggering parent handlers
          setIsDragging(true);
        }}
      >
        ⠿
      </span>
    )}

    {movingAnnotationId === ann.id ? (
      <button
        className="annotation-edit-btn move"
        onClick={() => {
          setMovingAnnotationId(null);
          setSelectedAnnotationId(null); // Deselect after finishing move
        }}
        title="Stop Moving"
      >
        ✔
      </button>
    ) : (
      <button
        className="annotation-edit-btn move"
        onClick={() => setMovingAnnotationId(ann.id)}
        title="Move"
      >
        M
      </button>
    )}

    {/* Show input if it's a text annotation and not moving */}
    {ann.tool === 'text' && movingAnnotationId !== ann.id && (
      <input
        type="text"
        value={ann.text}
        onChange={async e => {
          const newText = e.target.value;
          // setAnnotations(prev =>
          //   prev.map(a =>
          //     a.id === ann.id ? { ...a, text: newText } : a
          //   )
          // );
          setAnnotations(prev =>
  prev.map(a =>
    (a.id ?? a._id) === (ann.id ?? ann._id) ? { ...a, text: newText } : a
  )
);
          // Save to backend
          try {
            await updateAnnotation(ann._id || ann.id, { text: newText });
          } catch (error) {
            console.error("Failed to update annotation text:", error);
          }
        }}
        onMouseDown={e => e.stopPropagation()}
        onKeyDown={e => {
          // Prevent global shortcuts (like spacebar play/pause) while editing text
          e.stopPropagation();
          // Do NOT call e.preventDefault() for space, so it inserts a space
        }}
        className="ml-2 px-1 py-0.5 rounded bg-gray-800 text-white border border-gray-600"
        style={{ minWidth: 80 }}
      />
    )}

    {/* Three Dots Button */}
    <button
      className="annotation-edit-btn"
      onClick={() => setShowEditOptions((v) => !v)}
      title="More options"
      style={{ marginLeft: 8 }}
    >
      ⋯
    </button>

    {/* Show color/size options if toggled */}
    {showEditOptions && (
      <div
        className="absolute z-50 bg-gray-800 p-3 rounded shadow-lg flex flex-col gap-2"
        style={{ left: '110%', top: 0, minWidth: 120 }}
        onMouseLeave={() => setShowEditOptions(false)}
      >
        {/* Color Picker (for all) */}
        <div>
          <div className="text-xs mb-1">Color:</div>
          <div className="flex gap-2">
            {colorOptions.map(color => (
              <button
                key={color}
                onClick={async () => {
                  // setAnnotations(prev =>
                  //   prev.map(a =>
                  //     a.id === ann.id ? { ...a, color } : a
                  //   )
                  // );
                  setAnnotations(prev =>
  prev.map(a =>
    (a.id ?? a._id) === (ann.id ?? ann._id) ? { ...a, color } : a
  )
);
                  setShowEditOptions(false);
                  try {
                    await updateAnnotation(ann._id || ann.id, { color });
                  } catch (error) {
                    console.error("Failed to update annotation color:", error);
                  }
                }}
                style={{
                  background: color,
                  border: ann.color === color ? '2px solid #fff' : '2px solid transparent',
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  cursor: 'pointer'
                }}
                aria-label={`Color ${color}`}
              />
            ))}
          </div>
        </div>
        {/* Size/Thickness Picker (for all) */}
        <div>
          <div className="text-xs mb-1">
            {ann.tool === 'text' ? 'Font Size:' : 'Thickness:'}
          </div>
          <div className="flex gap-2">
            {sizeOptions.map(opt => (
              <button
                key={opt.value}
                onClick={async () => {
                  // setAnnotations(prev =>
                  //   prev.map(a =>
                  //     a.id === ann.id ? { ...a, size: opt.value } : a
                  //   )
                  // );
                  setAnnotations(prev =>
  prev.map(a =>
    (a.id ?? a._id) === (ann.id ?? ann._id) ? { ...a, size: opt.value } : a
  )
);
                  setShowEditOptions(false);
                  try {
                    await updateAnnotation(ann._id || ann.id, { size: opt.value });
                  } catch (error) {
                    console.error("Failed to update annotation size:", error);
                  }
                }}
                style={{
                  background: ann.size === opt.value ? '#fff' : '#444',
                  border: 'none',
                  borderRadius: 4,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                aria-label={opt.label}
              >
                <div style={{
                  background: '#222',
                  height: ann.tool === 'text' ? opt.value / 2 : opt.value,
                  width: 20,
                  borderRadius: 2
                }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    )}
  </div>
);

export default AnnotationEditMenu;