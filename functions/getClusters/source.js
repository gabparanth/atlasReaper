exports = function(arg){
  const collection = context.services.get("MasterAtlas").db("atlas").collection("clusters");
  
  var emailAddress = context.user.data.email.split("@");
  
  var emailAddressMongo = emailAddress[0] + "@mongodb.com";
  
  console.log(emailAddressMongo);
  
  var result = collection.find({"users.emailAddress" : emailAddressMongo}).sort({"project.name":1}).toArray();
  
  
return result;
};