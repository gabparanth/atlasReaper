// type : error or success

exports = function(type, message){

  const mongodb = context.services.get("MasterAtlas");
  const logCollection = mongodb.db("atlas").collection("log");
  
  var date = new Date(Date.now());
  
  var logObject = {"date": date, "type":type, "message": message};
  
  
  return logCollection.insertOne(logObject);
};