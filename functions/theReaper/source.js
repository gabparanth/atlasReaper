exports = async function()
{
  const mongodb = context.services.get("MasterAtlas");
  const clustersCollection = mongodb.db("atlas").collection("active_clusters");
  const tasksCollection = mongodb.db("atlas").collection("tasks");

  // Get all non paused, non M0 clusters that are set to be reaped
  var filter = {
    'paused': false, 
    'instanceSizeName': { '$ne': 'M0' },
     'whitelistingPolicy' : { '$in' : [ 'ANYTIME', 'PAUSED', 'OFFICE_HOURS' ] }
  };

  var clusters = await clustersCollection.find(filter).toArray(); 

  for ( var i = 0; i < clusters.length; i++ )
  {
    const cluster = clusters[i];

    // Pause BI Connector if necessary
    if ( cluster.whitelistingPolicy == 'ANYTIME' && cluster.biConnector.enabled )
    {
      const task = { 'snapshot_id' : cluster.lastSnapshot, 
              'project_name' : cluster.project_name,
              'cluster_name' : cluster.cluster_name,
              'details' : cluster.details,
              'type' : 'PAUSE_BI_CONNECTOR',
              'status' : 'PENDING' 
              };
        await tasksCollection.insertOne(task);
    }

    // Pause Cluster
    if ( cluster.whitelistingPolicy == 'PAUSED' )
    {
      const task = { 'snapshot_id' : cluster.lastSnapshot, 
              'project_name' : cluster.project_name,
              'cluster_name' : cluster.cluster_name,
              'details' : cluster.details,
              'type' : 'PAUSE_CLUSTER',
              'status' : 'PENDING' 
              };
        await tasksCollection.insertOne(task);
    }
  }
};