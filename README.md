# Annotations_Video
# Annotix - Video Annotation Tool

A powerful web-based video annotation tool that allows users to create, edit, and manage annotations on videos in real-time. Built with React for the frontend and Node.js/Express/MongoDB for the backend.

## Features

- **Real-time Video Annotation:** Draw shapes, add text, and create annotations while watching videos
- **Multiple Annotation Tools:**
  - Rectangle
  - Circle
  - Line
  - Text annotations
- **Advanced Controls:**
  - Play/Pause
  - Frame-by-frame navigation
  - Playback speed control
  - Video progress bar with annotation markers
- **Annotation Management:**
  - Edit existing annotations
  - Move annotations
  - Delete annotations
  - Color and size customization
- **History Management:**
  - Undo/Redo functionality
  - Persistent storage
- **Responsive Design:**
  - Works on desktop and mobile devices
  - Adjustable layout
- **Keyboard Shortcuts:**
  - Space: Play/Pause
  - Arrow keys: Frame navigation
  - R: Rectangle tool
  - C: Circle tool
  - L: Line tool
  - T: Text tool

## Tech Stack

### Frontend
- React (Vite)
- Lucide React (Icons)
- TailwindCSS
- Custom CSS

### Backend
- Node.js
- Express
- MongoDB
- Mongoose

## Project Structure

```
project/
├── video-annotation-tool/    # Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── api/
│   │   ├── App.jsx
│   │   └── App.css
│   └── package.json
│
└── Backend/                  # Backend
    ├── config/
    ├── controllers/
    ├── models/
    ├── routes/
    ├── server.js
    └── package.json
```

## Setup & Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Git

### Backend Setup
1. Navigate to the backend directory:
```bash
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a MongoDB database and update connection string in `config/db.js`

4. Start the server:
```bash
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup
1. Navigate to the frontend directory:
```bash
cd video-annotation-tool
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## How It Works

### Frontend Architecture

1. **State Management:**
   - Uses React's useState for local state management
   - Manages video state (playback, time, duration)
   - Handles annotation state (current tool, drawing state)
   - Maintains undo/redo history in localStorage with a 50-step limit

2. **Annotation Toggle Mode:**
   - Split-screen view toggle for annotation workspace
   - Left side: Video player with annotation canvas
   - Right side: Annotation tools and timeline
   - Responsive design adapts to screen size
   - Toggle button with animated light bulb effect

3. **Canvas Drawing System:**
   - HTML5 Canvas overlay synchronized with video
   - Real-time drawing with mouse/touch events
   - Shape preview while drawing
   - Automatic scaling with video dimensions
   - Handles both aspect ratios and letterboxing

4. **Video Integration:**
   - Custom video controls with frame-by-frame navigation
   - Timestamp-based annotation rendering
   - Progress bar with annotation markers
   - Speed control (0.5x to 2x playback)
   - Keyboard shortcuts for enhanced control

### Backend Architecture & Data Persistence

1. **MongoDB Integration:**
   ```
   video-annotation/
   └── annotations/
       ├── videoId
       ├── timestamp
       ├── tool
       ├── coordinates
       ├── style
       └── metadata
   ```

2. **Real-time Data Flow:**
   - Annotations saved automatically on creation/edit
   - Batch updates for performance optimization
   - Error handling with automatic retries
   - Websocket support for future collaborative features

3. **Local Storage Management:**
   - Undo/Redo history limited to 50 steps
   - Circular buffer implementation
   - Automatic cleanup of old history
   - Storage size monitoring and optimization

4. **Data Persistence Strategy:**
   - MongoDB: Long-term annotation storage
   - LocalStorage: Temporary undo/redo history
   - Session Storage: Current session state
   - Automatic sync between storage layers

### Key Features Deep Dive

1. **Annotation System:**
   - Shape Tools:
     * Rectangle: Bounded box annotations
     * Circle: Radius-based circular markers
     * Line: Point-to-point measurements
     * Text: Custom text overlays
   - Each annotation stores:
     * Tool type
     * Coordinates
     * Timestamp
     * Style properties
     * Metadata

2. **History Management:**
   - Circular buffer for last 50 states
   - Memory-efficient storage
   - Automatic cleanup
   - Example state structure:
     ```javascript
     {
       annotations: [...],
       timestamp: Date.now(),
       type: 'create|update|delete'
     }
     ```

3. **Performance Optimizations:**
   - Canvas rendering optimization
   - Batch database operations
   - Throttled save operations
   - Efficient memory management
   - Browser storage limits handling

4. **Responsive Design:**
   - Fluid layouts
   - Touch-friendly controls
   - Adaptive UI elements
   - Mobile-first approach
   - Screen size breakpoints:
     * Desktop: Full features
     * Tablet: Optimized layout
     * Mobile: Essential features

### Error Handling & Recovery

1. **Network Issues:**
   - Offline capability
   - Auto-retry mechanism
   - Data synchronization
   - Conflict resolution

2. **Storage Limits:**
   - Automatic cleanup
   - Priority-based retention
   - User notifications
   - Graceful degradation

3. **Browser Compatibility:**
   - Feature detection
   - Fallback implementations
   - Cross-browser testing
   - Mobile browser support

### Future Roadmap

1. **Planned Features:**
   - Collaborative annotation
   - Custom tool shapes
   - Advanced filtering
   - Export capabilities
   - Timeline visualization

2. **Technical Improvements:**
   - WebSocket integration
   - Performance optimization
   - Storage efficiency
   - Mobile enhancements

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built using React and Node.js
- Icons from Lucide React
- Video playback handling inspired by HTML5 video specifications

## Author

Zainab Raza
- GitHub: [@Zainy324](https://github.com/Zainy324)
- Email: zainabraza2004@gmail.com