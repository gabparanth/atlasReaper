exports = async function() 
{
  const snapshot_id = await context.functions.execute('create_snapshot_neur');
  return context.functions.execute('process_snapshot', snapshot_id);
};
