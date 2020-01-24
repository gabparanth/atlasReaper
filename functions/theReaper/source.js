// The reaper will filter cluster not M0,whitelistingPolicy:{$ne:"anytime"} , and configuration.paused : false 

exports = function(){
 const mongodb = context.services.get("MasterAtlas");
  const clustersCollection = mongodb.db("atlas").collection("clusters");
  
  // update cluster collection
  context.functions.execute('updateClustersCollection').then(() => {
    
    // disable BI Connector 
    clustersCollection.find({"configuration.biConnector.enabled":true}, {'project.id': 1, name : 1}).toArray().then(docs => {
      for (var i in docs){
        context.functions.execute('pauseBiConnector', doc[i].project.id, doc[i].name);
      }
    }).then(() => {
    
    // Pause Clusters
    clustersCollection.find({whitelistingPolicy:{$ne:"anytime"}, 'configuration.paused':false, "configuration.providerSettings.instanceSizeName" : { $ne : "M0" }}, {'project.id': 1, name : 1}).toArray().then(doc => {
      for (var i in doc){
          console.log(JSON.stringify(doc[i]._id));
          context.functions.execute('pauseCluster', doc[i].project.id,  doc[i].name );
      }
    });
    });
  });
};