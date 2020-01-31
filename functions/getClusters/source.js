exports = function(arg){
  const collection = context.services.get("MasterAtlas").db("atlas").collection("active_clusters");
  
  var emailAddress = context.user.data.email.split("@");
  
  
  var emailAddressMongo = emailAddress[0] + "@mongodb.com";
  
  console.log(emailAddressMongo);
  
  var result = collection.find({"users.emailAddress" : emailAddressMongo}).sort({"project_name":1}).toArray();
  
  
return result;
};