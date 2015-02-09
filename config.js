var config = {}
var ONE_MINUTE = 60000;

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


config.cooldown = {};
config.cooldown.quotePosting = {};
config.cooldown.quotePosting.sessionTimeout = ONE_MINUTE * 5;
config.cooldown.quotePosting.ipTimeout = ONE_MINUTE * 5;
config.cooldown.quotePosting.sessionLimit = 10;

config.cooldown.commentPosting = {};
config.cooldown.commentPosting.sessionTimeout = ONE_MINUTE * 5;
config.cooldown.commentPosting.ipTimeout = ONE_MINUTE * 5;
config.cooldown.commentPosting.sessionLimit = 10;

config.cooldown.quoteVoting = {};
config.cooldown.quoteVoting.ipTimeout = ONE_MINUTE * 5;
config.cooldown.quoteVoting.sessionLimit = 10;


module.exports = config;
