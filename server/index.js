const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const convertRoutes = require('./routes/convert');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// Middleware
app.use(cors()); // Allow all origins by default for now
// To restrict to frontend: app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

// Create downloads directory if it doesn't exist
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir);
}

// Cleanup old files (older than 1 hour) every 1 hour
setInterval(() => {
  fs.readdir(downloadsDir, (err, files) => {
    if (err) return console.error('Cleanup error:', err);

    files.forEach(file => {
      const filePath = path.join(downloadsDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;

        const now = Date.now();
        const endTime = new Date(stats.ctime).getTime() + 3600000; // 1 hour
        if (now > endTime) {
          fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting file:', filePath);
          });
        }
      });
    });
  });
}, 3600000); // Run every hour

// Health check endpoint (useful for cold start warmup)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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
