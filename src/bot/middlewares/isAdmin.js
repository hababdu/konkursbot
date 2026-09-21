const config = require('../../config/config');

function isAdmin(ctx) {
  return config.adminIds.includes(ctx.from.id);
}

module.exports = isAdmin;
