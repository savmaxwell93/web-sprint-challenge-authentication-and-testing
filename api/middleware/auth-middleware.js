const User = require('../users/users-model');

async function checkUsernameFree(req, res, next) {
    next()
}

async function checkUsernameExists(req, res, next) {
    next()
}

module.exports = {
    checkUsernameFree,
    checkUsernameExists
}
