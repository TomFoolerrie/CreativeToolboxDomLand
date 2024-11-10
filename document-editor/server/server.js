const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Path to our local JSON database
const DB_PATH = path.join(__dirname, 'data', 'documents.json');

// Initialize database if it doesn't exist
async function initializeDB() {
  try {
    await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
    try {
      await fs.access(DB_PATH);
    } catch {
      await fs.writeFile(DB_PATH, JSON.stringify({ documents: [] }));
      console.log('Created new documents database file');
    }
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

// Initialize database on server start
initializeDB();

// Routes
app.use('/api/documents', require('./routes/documents'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database location: ${DB_PATH}`);
});