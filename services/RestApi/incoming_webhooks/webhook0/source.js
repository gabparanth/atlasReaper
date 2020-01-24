// This function is the webhook's request handler.
exports = function(payload, response) {
  
    console.log(JSON.stringify(payload.query));
    console.log(typeof(payload.query));
  
    const mongodb = context.services.get('MasterAtlas');
    const mycollection = mongodb.db('atlas').collection('clusters');
    return mycollection.find(payload.query);
    
};