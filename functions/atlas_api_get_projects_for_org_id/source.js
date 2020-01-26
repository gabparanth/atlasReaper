 
exports = function(org_id) 
{
    var url = "https://cloud.mongodb.com/api/atlas/v1.0/orgs/"+ org_id +"/groups";

    return context.functions.execute("atlas_api_get", url, "atlas_api_get_projects_for_org_id");
};