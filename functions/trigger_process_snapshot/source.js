
exports = async function(changeEvent) 
{
    const mongodb = context.services.get("MasterAtlas");
    const active_clusters = mongodb.db("atlas").collection("active_clusters");

    const snapshot = changeEvent.fullDocument;

    var snapshotClusterIds = [];
    var insertedClusters = 0;

    // Go through all clusters in the snapshot and compare with the master list
    for ( var i = 0; i < snapshot.clusters.length; i++)
    {
        var snapshot_cluster = snapshot.clusters[i];
        snapshot_cluster.lastSnapshot = snapshot['_id'];
        snapshotClusterIds.push(snapshot_cluster.details.cluster_id);
        
        active_cluster = await active_clusters.findOne({'details.cluster_id' : snapshot_cluster.details.cluster_id})
        if ( active_cluster )
        {
            snapshot_cluster.whitelistingPolicy = active_cluster.whitelistingPolicy;
            await active_clusters.updateOne({'details.cluster_id' : snapshot_cluster.details.cluster_id}, snapshot_cluster);
        }
        else
        {
            snapshot_cluster.whitelistingPolicy = 'ANYTIME';
            await active_clusters.insertOne(snapshot_cluster);
            insertedClusters = insertedClusters + 1;
        }
    }

    // Delete any that have gone
    var filter = {};
    filter['details.cluster_id'] = { '$nin' : snapshotClusterIds }
    var result = await active_clusters.deleteMany(filter);
    var msg = `Inserted {insertedClusters} clusters, deleted {result.deletedCount}`;
    return context.functions.execute('log_message', 'INFO', 'trigger', 'trigger_process_snapshot', msg, snapshot.snapshot_id);
};