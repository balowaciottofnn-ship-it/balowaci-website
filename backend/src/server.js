require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const initializeDatabase = require('./db/init');

const app = express();
const PORT = process.env.PORT || 5000;
const projectRoot = path.join(__dirname, '..', '..');

function requireAdmin(req, res, next) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    next();
    return;
  }

  const auth = req.headers.authorization || '';
  const [scheme, encoded] = auth.split(' ');
  if (scheme === 'Basic' && encoded) {
    const [, password] = Buffer.from(encoded, 'base64').toString('utf8').split(':');
    if (password === adminPassword) {
      next();
      return;
    }
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="BaloWaci Admin"');
  res.status(401).send('Authentication required');
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/assets', express.static(path.join(projectRoot, 'assets')));
app.use('/interfaces', express.static(path.join(projectRoot, 'interfaces')));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes
const timeRoutes = require('./routes/time');
const feedbackRoutes = require('./routes/feedback');
const healthRoutes = require('./routes/health');

app.use('/api/time', timeRoutes);
app.use('/api/feedback/all', requireAdmin);
app.use('/api/feedback/stats', requireAdmin);
app.use('/api/feedback/export.csv', requireAdmin);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/health', healthRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(projectRoot, 'index.html'));
});

app.get('/admin', requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'admin.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

async function startServer() {
  try {
    await initializeDatabase();
    console.log('Database schema is ready');
  } catch (error) {
    console.error('Database initialization failed:', error.message);
  }

  app.listen(PORT, () => {
    console.log(`BaloWaci Backend running on http://localhost:${PORT}`);
    console.log(`Admin dashboard available at http://localhost:${PORT}/admin`);
  });
}

startServer();
