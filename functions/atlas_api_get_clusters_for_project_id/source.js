 
exports = function(project_id) 
{
    var url = "https://cloud.mongodb.com/api/atlas/v1.0/groups/"+ project_id +"/clusters";

    return context.functions.execute("atlas_api_get", url, "atlas_api_get_clusters_for_project_id");
};