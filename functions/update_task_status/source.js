// type : error or success

exports = function(task_id, last_ts, current_status, new_status)
{
  const mongodb = context.services.get("MasterAtlas");
  const tasksCollection = mongodb.db("atlas").collection("tasks");
  
  var ts = new Date(Date.now());
  
  return tasksCollection.updateOne( {'_id' : task_id} , 
                          { '$set' : 
                              { 'status' : new_status,
                                'last_updated' : ts }, 
                            '$push' : 
                              { 'history' : 
                                {
                                  'ts' : last_ts,
                                  'status' : current_status
                                }
                              } 
                          });
};