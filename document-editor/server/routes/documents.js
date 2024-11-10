const router = require('express').Router();
const fs = require('fs').promises;
const path = require('path');
const Document = require('../models/Document');

const DB_PATH = path.join(__dirname, '..', 'data', 'documents.json');

// Get all documents
router.get('/', async (req, res) => {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    const { documents } = JSON.parse(data);
    res.json(documents.sort((a, b) => b.updatedAt - a.updatedAt));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single document by ID
router.get('/:id', async (req, res) => {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    const { documents } = JSON.parse(data);
    
    const document = documents.find(doc => doc._id === req.params.id);
    
    if (document) {
      res.json(document);
    } else {
      res.status(404).json({ message: 'Document not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new document
router.post('/', async (req, res) => {
  try {
    const validation = Document.validate(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }

    const data = await fs.readFile(DB_PATH, 'utf8');
    const { documents } = JSON.parse(data);
    
    const newDocument = Document.create(req.body);
    documents.push(newDocument);
    await fs.writeFile(DB_PATH, JSON.stringify({ documents }, null, 2));
    
    res.status(201).json(newDocument);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update document
router.put('/:id', async (req, res) => {
  try {
    // Only validate fields that are being updated
    if (Object.keys(req.body).length > 0) {
      const validation = Document.validate({
        ...{ title: '', content: '' }, // Default values for optional fields
        ...req.body
      });
      if (!validation.isValid) {
        return res.status(400).json({ errors: validation.errors });
      }
    }

    const data = await fs.readFile(DB_PATH, 'utf8');
    const { documents } = JSON.parse(data);
    
    const documentIndex = documents.findIndex(doc => doc._id === req.params.id);
    
    if (documentIndex !== -1) {
      documents[documentIndex] = {
        ...documents[documentIndex],
        title: req.body.title || documents[documentIndex].title,
        content: req.body.content || documents[documentIndex].content,
        updatedAt: Date.now()
      };
      
      await fs.writeFile(DB_PATH, JSON.stringify({ documents }, null, 2));
      res.json(documents[documentIndex]);
    } else {
      res.status(404).json({ message: 'Document not found' });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete document
router.delete('/:id', async (req, res) => {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    const { documents } = JSON.parse(data);
    
    const documentIndex = documents.findIndex(doc => doc._id === req.params.id);
    
    if (documentIndex !== -1) {
      const deletedDocument = documents.splice(documentIndex, 1)[0];
      await fs.writeFile(DB_PATH, JSON.stringify({ documents }, null, 2));
      res.json({ message: 'Document deleted', document: deletedDocument });
    } else {
      res.status(404).json({ message: 'Document not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;