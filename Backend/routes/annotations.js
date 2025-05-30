const express = require('express');
const router = express.Router();
const annotationsController = require('../controllers/annotations');

router.get('/:videoId', annotationsController.getAnnotations);
router.post('/', annotationsController.createAnnotation);
router.put('/:id', annotationsController.updateAnnotation);
router.delete('/:id', annotationsController.deleteAnnotation);

module.exports = router;