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
            'instanceSizeName' : '$configuration.providerSettings.instanceSizeName',
            'numShards' : '$configuration.numShards',
            'replicationFactor' : '$configuration.replicationFactor',
            'paused' : '$configuration.paused',
            'biConnector' : '$configuration.biConnector',
            'summary': {
              '$concat': [
                { '$toString': '$configuration.numShards' }, 
                'x', 
                { '$toString': '$configuration.replicationFactor' }, 
                'x', 
                '$configuration.providerSettings.instanceSizeName', 
                ' - ', 
                '$configuration.providerSettings.providerName'
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

async function insert_project_details(snapshot_id, snapshot_ts, project, clusterSnapshotsDetails)
{
    const resp = await context.functions.execute("atlas_api_get_clusters_for_project_id", project.id);
    for ( var i = 0; i < resp.results.length; i++ )
    {
      const cluster = resp.results[i];
      var clusterDoc = {
                  "snapshot_id" : snapshot_id,,
                  "ts" : snapshot_ts,
                  "cluster_id": cluster.id,
                  "name" : cluster.name,
                  "project":
                  { 
                    "id": project.id,
                    "name": project.name 
                  },
                  "configuration" : cluster};

        await clusterSnapshotsDetails.insertOne(clusterDoc);
    };
}

async function insert_project_users(snapshot_id, project, clusterSnapshotsDetails)
{
  const resp = await context.functions.execute("atlas_api_get_users_for_project_id", project.id);
  for ( var i = 0; i < resp.results.length; i++ )
  {
    const user = resp.results[i];
    for ( var j = 0; j < user.roles.length; j++ )
    {
      const role = user.roles[j];
      if ((role.groupId == project.id) && (role.roleName == "GROUP_OWNER") ) 
      {
        var userDoc = { "userId" : user.id, "firstName" : user.firstName, "lastName" : user.lastName, "emailAddress" : user.emailAddress };
        await clusterSnapshotsDetails.updateMany({"snapshot_id" : snapshot_id, "project.id": project.id}, { $addToSet : {"users": userDoc}});
      }
    }
  }
}

exports = async function(org_id) 
{
    const mongodb = context.services.get("MasterAtlas");
    const clusterSnapshotsDetails = mongodb.db("atlas").collection("cluster_snapshot_details");

    const snapshot_ts = new Date(Date.now());
    const snapshot_id = snapshot_ts.toISOString();

    const resp = await context.functions.execute("atlas_api_get_projects_for_org_id", org_id);
    for ( var i = 0; i < resp.results.length; i++ )
    { 
      const project = resp.results[i];
      await insert_project_details(snapshot_id, snapshot_ts, project, clusterSnapshotsDetails);
      await insert_project_users(snapshot_id, project, clusterSnapshotsDetails);
    }

    const pipeline = get_agg_pipeline(snapshot_id);
    await clusterSnapshotsDetails.aggregate(pipeline).toArray();
    return snapshot_id;
}
