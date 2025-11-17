const path = require('path');

// Import the main server app
const app = require(path.join(__dirname, '..', 'server.js'));

// Serverless handler - simply export the Express app
module.exports = app;
