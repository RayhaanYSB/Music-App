// ============================================
// MUSIC APP - MAIN SERVER FILE
// ============================================

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================

// Parse JSON request bodies
app.use(express.json());

// Enable CORS (allows frontend to communicate with backend)
app.use(cors({
    origin: 'http://localhost:5173', // Vite dev server
    credentials: true
}));

// Log all requests (helpful for debugging)
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// ============================================
// TEST ROUTE
// ============================================

app.get('/', (req, res) => {
    res.json({ 
        message: '🎵 Music App API is running!',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            auth: '/api/auth',
            albums: '/api/albums',
            reviews: '/api/reviews'
        }
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString()
    });
});

// ============================================
// IMPORT ROUTES
// ============================================

const authRoutes = require('./routes/auth');
const albumRoutes = require('./routes/albums');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
// const reviewRoutes = require('./routes/reviews');
// const userRoutes = require('./routes/users');
// const reviewRoutes = require('./routes/reviews');

app.use('/api/auth', authRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
// app.use('/api/reviews', reviewRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/reviews', reviewRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler - route not found
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Route not found',
        path: req.path 
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(err.status || 500).json({ 
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════════╗
    ║   🎵 Music App Server is running!      ║
    ║   Port: ${PORT}                           ║
    ║   Environment: ${process.env.NODE_ENV}             ║
    ║   URL: http://localhost:${PORT}           ║
    ╚════════════════════════════════════════╝
    `);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});