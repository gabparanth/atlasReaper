exports = function(){
  const mongodb = context.services.get("MasterAtlas");
  const clustersCollection = mongodb.db("atlas").collection("clusters");
   
   
   context.functions.execute('updateClustersCollection').then(() => {
     
     clustersCollection.find({whitelistingPolicy:{$ne:"paused"}, 'configuration.paused':true}, {'project.id': 1, name : 1}).toArray().then(doc => {
       for (var i in doc){
         
         context.functions.execute('resumeCluster', doc[i].project.id,  doc[i].name );
         
     }
   });
   });
   
   
   
 };