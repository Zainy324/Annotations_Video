const Annotation = require('../models/Annotation');

// Get all annotations for a video
exports.getAnnotations = async (req, res) => {
  try {
    const annotations = await Annotation.find({ videoId: req.params.videoId });
    res.json(annotations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create new annotation
exports.createAnnotation = async (req, res) => {
  const annotation = new Annotation({
    videoId: req.body.videoId,
    tool: req.body.tool,
    startX: req.body.startX,
    startY: req.body.startY,
    endX: req.body.endX,
    endY: req.body.endY,
    timestamp: req.body.timestamp,
    text: req.body.text,
    color: req.body.color
  });

  try {
    const newAnnotation = await annotation.save();
    res.status(201).json(newAnnotation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update annotation
exports.updateAnnotation = async (req, res) => {
  try {
    const updatedAnnotation = await Annotation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedAnnotation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete annotation
exports.deleteAnnotation = async (req, res) => {
  try {
    await Annotation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Annotation deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};