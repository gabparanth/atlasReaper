
exports = function(projectId, clusterName) {
    const http = context.services.get('http');
    url = "https://cloud.mongodb.com/api/atlas/v1.0/groups/"+projectId+"/clusters/" + clusterName;
    
    return http
      .patch({ url: url, body: {"paused":false}, encodeBodyAsJSON:true })
      .then(resp => {
        const username = context.values.get('AtlasPublicKey');
        const apiKey = context.values.get('AtlasPrivateKey');
        const authHeader = resp.headers['Www-Authenticate'].toString();

        const realm = authHeader.match(/realm="(.*?)"/)[1];
        const nonce = authHeader.match(/nonce="(.*?)"/)[1];
        const qop = authHeader.match(/qop="(.*?)"/)[1];

        const ha1 = utils.crypto.hash('md5', `${username}:${realm}:${apiKey}`).toHex();

        const path = url.match(/:\/\/.*?(\/.*)/)[1];

        const ha2 = utils.crypto.hash('md5', `PATCH:${path}`).toHex();
        const cnonce = Math.random().toString().substr(2, 14);
        const nc = '00000001';
    
        const response = utils.crypto.hash('md5', `${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`).toHex();

        const digestHeader = `Digest username="${username}", realm="${realm}", nonce="${nonce}", uri="${path}", qop=${qop}, nc=${nc}, cnonce="${cnonce}", response="${response}", algorithm=MD5`;

        return http.patch({ url: url,  body: {"paused":false}, encodeBodyAsJSON:true, headers: { 'Authorization': [ digestHeader ], "Content-Type": [ "application/json" ] } })
          .then(({ body }) => body.text ? JSON.parse(body.text()) : { links: [], results: [] });
      });
};