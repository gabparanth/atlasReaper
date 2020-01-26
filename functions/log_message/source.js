// type : error or success

exports = function(level, logger, func_name, message, tag)
{
  const mongodb = context.services.get("MasterAtlas");
  const logCollection = mongodb.db("atlas").collection("log");
  
  var ts = new Date(Date.now());
  
  var logObject = { "level" : level,
                    "ts": ts, 
                    "logger" : logger,
                    "func_name" : func_name,
                    "message": message };
                    
  if (tag !== null)
  {
    logObject.tag = tag;
  }
                    
  return logCollection.insertOne(logObject);
};