function get_agg_pipeline(snapshot_id)
{
  var pipeline = [
    {
      '$match' : {
        'snapshot_id' : snapshot_id
      }
    }, {
      '$group': {
        '_id': '$snapshot_id', 
        'clusters': {
          '$push': {
            'cluster_name': '$configuration.name', 
            'project_name': '$project.name', 
            'summary': {
              '$concat': [
                {
                  '$toString': '$configuration.numShards'
                }, 'x', '$configuration.providerSettings.instanceSizeName', ' - ', '$configuration.providerSettings.providerName'
              ]
            }, 
            'details': {
              'cluster_id': '$cluster_id', 
              'project_id': '$project.id'
            }, 
            'users': '$users'
          }
        }
      }
    }, {
      '$merge': {
        'into': 'cluster_snapshot', 
        'whenMatched': 'replace'
      }
    }
  ];

  return pipeline;
}

exports = function(org_id) 
{
    const mongodb = context.services.get("MasterAtlas");
    const clusterSnapshots = mongodb.db("atlas").collection("cluster_snapshot");
    const clusterSnapshotsDetails = mongodb.db("atlas").collection("cluster_snapshot_details");

    const snapshot_ts = new Date(Date.now());
    const snapshot_id = snapshot_ts.toISOString();

    return context.functions.execute("atlas_api_get_projects_for_org_id", org_id).then(resp => {
        var projects = resp.results;
        projects.forEach(project => { 
          context.functions.execute("atlas_api_get_clusters_for_project_id", project.id).then(resp => {
            var clusters = resp.results;
            clusters.forEach(cluster => {
              
              var clusterDoc = {
                          "snapshot_id" : snapshot_id,
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
                    
                    clusterSnapshotsDetails.updateMany({"snapshot_id" : snapshot_id, "project.id": project.id}, { $addToSet : {"users": userDoc}});
                  }
                });
              });
            });
          });
        });

        const pipeline = get_agg_pipeline(snapshot_id);
        return clusterSnapshotsDetails.aggregate(pipeline).then(doc => {
          context.functions.execute('log_message', 'INFO', 'atlas_api', 'atlas_api_snapshot_projects_for_org_id', 'Created Snapshot', snapshot_id);
          return snapshot_id;
        }).catch( err => {
          context.functions.execute('log_message', 'ERROR', 'atlas_api', 'atlas_api_snapshot_projects_for_org_id', err, snapshot_id);
          return null;
        })
    });
}
