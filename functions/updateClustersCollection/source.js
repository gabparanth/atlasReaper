
exports = function() {
    
    const mongodb = context.services.get("MasterAtlas");
    const clustersCollection = mongodb.db("atlas").collection("clusters");

   
  return context.functions.execute("getProjectsMetadata").then(projects => {
    projects.forEach(project => { 
      
      context.functions.execute("getClustersMetadata", project.id).then(clusters => {
        clusters.forEach(cluster => {
          
          var clusterDoc = {"_id": cluster.id,
                     "name" : cluster.name,
                     "project":{ "id": project.id,
                     "name": project.name },
                     "configuration" : cluster,
                     "updated" : true};
                     
          
          
          
          
          
          clustersCollection.updateOne({"_id": cluster.id}, {$set: clusterDoc, $setOnInsert : {"whitelistingPolicy":"paused"}}, {upsert:true}, function(err, res) {
            
            if (err) { context.functions.execute("addLog", "error", err ); }
          else if (res) { context.functions.execute("addLog", "success", res ); } 
            
            
          });
          // console.log(cluster.id+ "  " + clusterDoc );
        });
      }).then(() => {
        
        context.functions.execute("getUsers", project.id).then(users => {
          users.forEach(user => {
            
            user.roles.forEach(role => {
              
              if ((role.groupId == project.id) && (role.roleName == "GROUP_OWNER") ) {
        
                var userDoc = {"userId":user.id, "firstName": user.firstName, "lastName" : user.lastName, "emailAddress" : user.emailAddress };
                
                clustersCollection.updateMany({"project.id": project.id}, { $addToSet : {"users": userDoc}});
                // console.log(project.id+ "  " + userDoc );
              }
            });
          });
        });
      });
    });
  }).then(() => {
      clustersCollection.find({"updated":{"$exists": false}}, {_id: 1}).toArray().then(ids =>{
        ids.forEach(id => {
          try {
          clustersCollection.deleteOne(id);
          } catch (e){
            console.log(e);
          }
        });
      })
      .then(() =>{
        clustersCollection.updateMany({},{$unset : { updated :  1 }});  
      });
    });
};