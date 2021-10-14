const request = require("request");
const iconv = require("iconv-lite");
const AWS = require("aws-sdk");
const s3 = new AWS.S3();
var returnData;
var statusCode;
 const Bucket = "s3cachehtml"

  async function getData(event) {
    return new Promise(function(resolve, reject) {
      request(
        {
          url: event.url,
          method: "GET",
          encoding: null,
        },
        (error, response, body) => {
        
            if (error) {
              reject(error);
            }else{
              resolve(body);
            }
            statusCode = response.statusCode;                
          
        });

    });  
    
  }
  
  async function getMoreData(event ,body) {
    const params = {
     // ACL: "public-read",
      Body: body,
      ContentType: "text/html",
      Bucket: Bucket,
      Key: event.cacheName
    };
    
    return await new Promise((resolve, reject) => {
      s3.putObject(params, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }
  
  async function getAll(event) {
    const data = await getData(event).then(function(results){
       return results;
    }).catch(function(err) {
      statusCode = 500;
       console.error(err); // Error 출력
    });
    const moreData = await getMoreData(event,data).then(function(results){
      return results;
   }).catch(function(err) {
     statusCode = 500;
     console.error(err); // Error 출력
   });
    
    const response = await {
        statusCode: statusCode,
        urlOK : JSON.stringify(data),
        s3upload: JSON.stringify(moreData),
        eventUrl : event.url,
        eventCache : event.cacheName
    };
    return response;
  }
  
exports.handler = async (event) => {
    return getAll(event);
};
const event = {
    url : "www.naver.com",
    cacheName : "default.html"
}
getAll(event)