 
exports = function(project_id) 
{
    var url = "https://cloud.mongodb.com/api/atlas/v1.0/groups/"+ project_id +"/clusters";

    return context.functions.execute("atlas_api_get", url)    
};