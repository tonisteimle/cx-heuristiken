const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

// Create Express app
const app = express();

// Set port
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '..')));

// API endpoints
// Get heuristics data
app.get('/api/heuristics', (req, res) => {
  try {
    const data = fs.readFileSync(path.join(__dirname, '../data/heuristics.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading heuristics data:', error);
    res.status(500).json({ error: 'Failed to load heuristics data' });
  }
});

// Save heuristics data
app.post('/api/heuristics', (req, res) => {
  try {
    const data = JSON.stringify(req.body, null, 2);
    fs.writeFileSync(path.join(__dirname, '../data/heuristics.json'), data);
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving heuristics data:', error);
    res.status(500).json({ error: 'Failed to save heuristics data' });
  }
});

// Fallback route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
