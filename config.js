var config = {}

config.server = {}
config.server.host = process.env.SERVER_HOST || 'localhost';
config.server.port = process.env.SERVER_PORT ||  8080;

config.redis = {}
config.redis.host =  process.env.REDIS_HOST  || 'localhost';
config.redis.port =  process.env.REDIS_PORT  ||  6379;
config.redis.options = {
  auth_pass: process.env.REDIS_PASSWORD || null
}

config.session = {}
config.session.secret = 'lol'; // ATTENTION! 

module.exports = config
