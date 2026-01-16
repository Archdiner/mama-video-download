const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const convertRoutes = require('./routes/convert');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Create downloads directory if it doesn't exist
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir);
}

// Routes
app.use('/api', convertRoutes);

// Serve static files from downloads directory
app.use('/download', express.static(downloadsDir, {
  setHeaders: (res, path) => {
    res.set('Content-Disposition', 'attachment');
  }
}));

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Downloads directory: ${downloadsDir}`);
});
