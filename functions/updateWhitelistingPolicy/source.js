exports = function(id, whitelistingPolicy){
const collection = context.services.get("MasterAtlas").db("atlas").collection("active_clusters");

console.log(id);

  var result = collection.updateOne({"_id": BSON.ObjectId(id)}, { $set : {"whitelistingPolicy":whitelistingPolicy}});
return result;
};