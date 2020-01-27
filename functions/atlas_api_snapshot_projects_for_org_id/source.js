
exports = function(org_id) 
{
    const mongodb = context.services.get("MasterAtlas");
    const clusterSnapshots = mongodb.db("atlas").collection("cluster_snapshot");
    const clusterSnapshotsDetails = mongodb.db("atlas").collection("cluster_snapshot_details");

    var snapshot = {};
    snapshot.ts = new Date(Date.now());
    snapshot.snapshot_id = snapshot.ts.toISOString();

    return clusterSnapshots.insertOne(snapshot).then(result => {

      context.functions.execute("atlas_api_get_projects_for_org_id", org_id).then(resp => {
        var projects = resp.results;
        projects.forEach(project => { 
          context.functions.execute("atlas_api_get_clusters_for_project_id", project.id).then(resp => {
            var clusters = resp.results;
            clusters.forEach(cluster => {
              
              var clusterDoc = {
                          "snapshot_id" : snapshot.snapshot_id,
                          "cluster_id": cluster.id,
                          "name" : cluster.name,
                          "project":
                          { 
                            "id": project.id,
                            "name": project.name 
                          },
                          "configuration" : cluster};

                clusterSnapshotsDetails.insertOne(clusterDoc).then(result => {
                const { matchedCount, modifiedCount } = result;
                if( matchedCount && modifiedCount ) {
                  context.functions.execute('log_message', 'INFO', 'atlas_api', 'atlas_api_snapshot_projects_for_org_id', cluster.name, snapshot_id);
                }}).catch(err => {
                  context.functions.execute('log_message', 'ERROR', 'atlas_api', 'atlas_api_snapshot_projects_for_org_id', err, snapshot_id);
                })
            });

            context.functions.execute("atlas_api_get_users_for_project_id", project.id).then(resp => {
              users = resp.results;
              users.forEach(user => {
                
                user.roles.forEach(role => {
                  
                  if ((role.groupId == project.id) && (role.roleName == "GROUP_OWNER") ) {
            
                    var userDoc = {"userId":user.id, "firstName": user.firstName, "lastName" : user.lastName, "emailAddress" : user.emailAddress };
                    
                    clusterSnapshotsDetails.updateMany({"snapshot_id" : snapshot.snapshot_id, "project.id": project.id}, { $addToSet : {"users": userDoc}});
                    // console.log(project.id+ "  " + userDoc );
                  }
                });
              });
            });
          });
        });
      });
      return snapshot.snapshot_id;
    });
}
