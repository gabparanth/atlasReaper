// type : error or success

exports = function(level, logger, message, tag)
{
  const mongodb = context.services.get("MasterAtlas");
  const logCollection = mongodb.db("atlas").collection("log");
  
  var date = new Date(Date.now());
  
  var logObject = { "level" : level,
                    "date": date, 
                    "logger" : logger,
                    "message": message,
                    "tag" : tag };
  return logCollection.insertOne(logObject);
};