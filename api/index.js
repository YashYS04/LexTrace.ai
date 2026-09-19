const app = require('../backend/dist/index');

module.exports = app.default || app;
module.exports.default = app.default || app;
