
exports = async function(changeEvent) 
{
    const mongodb = context.services.get("MasterAtlas");
    const task = changeEvent.fullDocument;
    const task_type = task.type;
    if ( task_type == 'PAUSE_CLUSTER' )
    {
        await context.functions.execute('atlas_api_pause_cluster', task.details.project_id, task.cluster_name);
        // Update task
        const tasks = mongodb.db('atlas').collection('tasks');
        await tasks.updateOne( {'_id' : task['_id']} , { 'status' : { '$set' : 'IN_PROGRESS' }});
        context.functions.execute('log_message', 'INFO', 'trigger', 'trigger_execute_task', `Paused cluster ${task.projectName}:${task.clusterName}`, task.snapshot_id);
    }
    else
    {
        context.functions.execute('log_message', 'ERROR', 'trigger', 'trigger_execute_task', `Unknown task ${task_type}`, task.snapshot_id);
    }
};