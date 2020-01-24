exports = function(id, whitelistingPolicy){
const collection = context.services.get("MasterAtlas").db("atlas").collection("clusters");
// console.log(arg);
  var result = collection.updateOne({"_id": id}, { $set : {"whitelistingPolicy":whitelistingPolicy}});
return result;
};