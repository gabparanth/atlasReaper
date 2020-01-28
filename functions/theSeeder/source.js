exports = async function()
{
  const mongodb = context.services.get("MasterAtlas");
  const clustersCollection = mongodb.db("atlas").collection("active_clusters");
  const tasksCollection = mongodb.db("atlas").collection("tasks");

  // Get all paused, non M0 clusters that are set to be resumed
  var filter = {
    'paused': true, 
    'instanceSizeName': { '$ne': 'M0' },
     'whitelistingPolicy' : 'OFFICE_HOURS'
  };

  var clusters = await clustersCollection.find(filter).toArray(); 

  for ( var i = 0; i < clusters.length; i++ )
  {
    const cluster = clusters[i];

    // Resume Cluster
    const task = { 'snapshot_id' : cluster.lastSnapshot, 
            'project_name' : cluster.project_name,
            'cluster_name' : cluster.cluster_name,
            'details' : cluster.details,
            'type' : 'RESUME_CLUSTER',
            'status' : 'PENDING' 
            };
      await tasksCollection.insertOne(task);
  }
};