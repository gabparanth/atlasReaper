// type : error or success

exports = function(level, context, message, tag)
{
  const mongodb = context.services.get("MasterAtlas");
  const logCollection = mongodb.db("atlas_reaper").collection("log");
  
  var date = new Date(Date.now());
  
  var logObject = { "level" : level,
                    "date": date, 
                    "context" : context,
                    "message": message,
                    "tag" : tag };
  return logCollection.insertOne(logObject);
};