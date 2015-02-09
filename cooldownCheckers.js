exports.forSession = function(cooldown, actionName){
  return function(req, res, next){
    if(typeof req.session.lastAccess == 'undefined')
      req.session.lastAccess = {}
    var now = Date.now();
    var last = req.session.lastAccess[actionName];
    var timeout =  !last ? 0 : cooldown - now + last;
    if(timeout > 0){
      res.status(429).json({'err': 'cooldown', 'timeout': timeout});
    }else{
      req.session.lastAccess[actionName] = now;
      next();
    }
  }
}

exports.forIP = function(sessionLimit, cooldown){
  var iptable = {};
  return function(req, res, next){
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if(typeof iptable[ip] == 'undefined'){
      iptable[ip] = {};
      iptable[ip].sessions = {};
      iptable[ip].count = 0;
      iptable[ip].lastAccess = 0;
    }
    if(!iptable[ip].sessions[req.sessionID]){
      iptable[ip].sessions[req.sessionID] = true;
      iptable[ip].count += 1;
    }
    var now = Date.now();
    var last = iptable[ip].lastAccess;
    var timeout = !last ? 0 : cooldown - now + last;
    if(timeout <= 0){
      iptable[ip].lastAccess = now;
    }else if(iptable[ip].count > sessionLimit){
      res.status(429).json({'err': 'cooldown', 'timeout': timeout});
      return;
    }
    next();
  }
}
