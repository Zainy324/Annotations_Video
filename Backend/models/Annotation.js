const mongoose = require('mongoose');

const AnnotationSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true
  },
  tool: {
    type: String,
    required: true
  },
  startX: Number,
  startY: Number,
  endX: Number,
  endY: Number,
  timestamp: {
    type: Number,
    required: true
  },
  text: String,
  color: {
    type: String,
    default: '#ff0000'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Annotation', AnnotationSchema);