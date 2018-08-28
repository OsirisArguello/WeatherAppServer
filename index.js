// Import the library
const server = require('server');
const { get } = server.router;

// Load the logic from 'todo.js'
const citiesResource = require('./controllers/citiesController');
const weatherResource = require('./controllers/weatherController');

// Add some API endpoints
const api = [
    get('/cities', citiesResource.read),
    get('/weather/:city', weatherResource.read)
];

// Launch the server with those
module.exports = server(api);
