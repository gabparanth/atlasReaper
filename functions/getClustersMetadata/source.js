 
exports = function(id) {
    const http = context.services.get('http');
    
    var url = "https://cloud.mongodb.com/api/atlas/v1.0/groups/"+ id +"/clusters";
    
    const mongodb = context.services.get("MasterAtlas");
    const clustersCollection = mongodb.db("atlas").collection("clusters");
    
    
    return http
      .get({ url: url})
      .then(resp => {
        const username = context.values.get('AtlasPublicKey');
        const apiKey = context.values.get('AtlasPrivateKey');
        const authHeader = resp.headers['Www-Authenticate'].toString();
        const realm = authHeader.match(/realm="(.*?)"/)[1];
        const nonce = authHeader.match(/nonce="(.*?)"/)[1];
        const qop = authHeader.match(/qop="(.*?)"/)[1];

        const ha1 = utils.crypto.hash('md5', `${username}:${realm}:${apiKey}`).toHex();

        const path = url.match(/:\/\/.*?(\/.*)/)[1];

        const ha2 = utils.crypto.hash('md5', `GET:${path}`).toHex();
        const cnonce = Math.random().toString().substr(2, 14);
        const nc = '00000001';
    
        const response = utils.crypto.hash('md5', `${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`).toHex();

        const digestHeader = `Digest username="${username}", realm="${realm}", nonce="${nonce}", uri="${path}", qop=${qop}, nc=${nc}, cnonce="${cnonce}", response="${response}", algorithm=MD5`;

        return http.get({ url: url, headers: { 'Authorization': [ digestHeader ], "Content-Type": [ "application/json" ] } })
              .then(({ body }) => {

                  return JSON.parse(body.text()).results;
            
                });
      });
};