function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
} 

exports = function(url, body, func_name) 
{
  tag = uuidv4(); 
  context.functions.execute('log_message', 'INFO', 'atlas_api', func_name, url, tag);

  const http = context.services.get('http');
  
  return http
    .patch({ url: url})
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

      return http.patch({ url: url, body: body, encodeBodyAsJSON : true, headers: { 'Authorization': [ digestHeader ], "Content-Type": [ "application/json" ] } })
            .then( http_response => {
              
                ret = EJSON.parse(http_response.body.text());
                if ('error' in ret)
                {
                  context.functions.execute('log_message', 'ERROR', 'atlas_api', func_name, ret, tag);
                }
                else
                {
                  context.functions.execute('log_message', 'INFO', 'atlas_api', func_name, ret, tag);
                }
                return ret;
              })
            .catch( error => {
                context.functions.execute('log_message', 'ERROR', 'atlas_api', func_name, error, tag);
            });
    });
};