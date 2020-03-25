
exports = async function() 
{
    const mongodb = context.services.get("MasterAtlas");
    // Get all tasks in progress
    const tasksCollection = mongodb.db("atlas").collection("tasks");

    // Get all in progress tasks
    var filter = {
      'status': 'IN_PROGRESS'
    };
   
    var tasks = await tasksCollection.find(filter).toArray(); 

    for ( var i = 0; i < tasks.length; i++ )
    {
        const task = tasks[i];
        try
        {
            var status = await context.functions.execute("atlas_api_get_cluster_details", task.details.project_id, task.cluster_name);
            if ( status )
            {
                if ( task.type == 'PAUSE_CLUSTER')
                {
                    if ( status.paused )
                    {
                        await context.functions.execute('update_task_status', task['_id'], task.last_updated, task.status, 'DONE');
                    }
                    else
                    {
                        // TODO: Warn if it's been a while?
                    }
                }
                else if ( task.type == 'PAUSE_BI_CONNECTOR')
                {
                    if ( !status.biConnector.enabled )
                    {
                        await context.functions.execute('update_task_status', task['_id'], task.last_updated, task.status, 'DONE');
                    }
                    else
                    {
                        // TODO: Warn if it's been a while?
                    }
                }
            }
            else
            {
                // Cluster has gone, mark task completed
                const updated_ts = new Date(Date.now());
                await tasksCollection.updateOne( {'_id' : task['_id']} , { '$set' : { 'status' : 'DONE', 'last_updated' : updated_ts }});
            }
        }
        catch (ex)
        {
            context.functions.execute('log_message', 'ERROR', 'atlas_api', 'trigger_check_task_status', ex);
            const updated_ts = new Date(Date.now());
            await tasksCollection.updateOne( {'_id' : task['_id']} , { '$set' : { 'status' : 'ERROR', 'last_updated' : updated_ts }});
        }
    }
};