
exports = function(org_id) 
{
    const mongodb = context.services.get("MasterAtlas");
    const clusterSnapshotsCollection = mongodb.db("atlas").collection("cluster_snapshot");

    var snapshot = {};
    snapshot.ts = new Date(Date.now());

    clusterSnapshotsCollection.insertOne(snapshot).then(result => {

      const snapshot_id = result.insertedId;
      context.functions.execute("atlas_api_get_projects_for_org_id", org_id).then(projects => {

      projects.forEach(project => { 
        context.functions.execute("atlas_api_get_clusters_for_project_id", project.id).then(clusters => {
          clusters.forEach(cluster => {
            
            var clusterDoc = {
                        "cluster_id": cluster.id,
                        "name" : cluster.name,
                        "project":{ "id": project.id,
                        "name": project.name },
                        "configuration" : cluster};

            clusterSnapshotsCollection.updateOne({"_id": snapshot_id}, { $push : { 'clusters' : clusterDoc } }).then(result => {
              const { matchedCount, modifiedCount } = result;
              if( matchedCount && modifiedCount ) {
                context.functions.execute('log_message', 'INFO', 'atlas_api', 'atlas_api_snapshot_projects_for_org_id', cluster.name, snapshot_id);
              }}).catch(err => {
                context.functions.execute('log_message', 'ERROR', 'atlas_api', 'atlas_api_snapshot_projects_for_org_id', err, snapshot_id);
              })
            });
          });
        });
      });
    });
}
      
      
//       .then(() => {
        
//         context.functions.execute("getUsers", project.id).then(users => {
//           users.forEach(user => {
            
//             user.roles.forEach(role => {
              
//               if ((role.groupId == project.id) && (role.roleName == "GROUP_OWNER") ) {
        
//                 var userDoc = {"userId":user.id, "firstName": user.firstName, "lastName" : user.lastName, "emailAddress" : user.emailAddress };
                
//                 clustersCollection.updateMany({"project.id": project.id}, { $addToSet : {"users": userDoc}});
//                 // console.log(project.id+ "  " + userDoc );
//               }
//             });
//           });
//         });
//       });
//     });
//   }).then(() => {
//       clustersCollection.find({"updated":{"$exists": false}}, {_id: 1}).toArray().then(ids =>{
//         ids.forEach(id => {
//           try {
//           clustersCollection.deleteOne(id);
//           } catch (e){
//             console.log(e);
//           }
//         });
//       })
//       .then(() =>{
//         clustersCollection.updateMany({},{$unset : { updated :  1 }});  
//       });
//     });
// };