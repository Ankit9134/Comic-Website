const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const constants = require('./config/constants');
const config = require('./config/index');
const { logger } = require('./lib/logger');

const app = express();

// Middleware
app.use(cors());
app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Web Toons Wala API Documentation"
}));

// Serve Swagger JSON
app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Routes
app.use('/', routes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    logger.warn(constants.LOGGER_TYPE_APP, __file, '404', '', '', `Route not found: ${req.originalUrl}`);
    res.status(404).json({
        status: false,
        message: 'Route not found',
        error: {
            code: 'NOT_FOUND',
            message: `Route ${req.originalUrl} not found`,
            timestamp: new Date().toISOString()
        }
    });
});

// Start server
const port = config.API_PORT || 3000;
app.listen(port, () => {
    logger.info(constants.LOGGER_TYPE_APP, __file, 'start', '', '', `Server is running on port ${port}`);
});

module.exports = app;
