 
exports = function(project_id, cluster_name) 
{
    var url = "https://cloud.mongodb.com/api/atlas/v1.0/groups/"+ project_id +"/clusters/" + cluster_name;

    return context.functions.execute("atlas_api_get", url, "atlas_api_get_cluster_details");
};