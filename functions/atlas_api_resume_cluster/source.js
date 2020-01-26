
exports = function(projectId, clusterName) 
{
    url = "https://cloud.mongodb.com/api/atlas/v1.0/groups/"+projectId+"/clusters/" + clusterName;
    
    body = { 'paused' : false };
    return context.functions.execute("atlas_api_patch", url, body, "atlas_api_resume_cluster");
};