'use strict'

//import Constants from '../constants'
var appConstants=require('../constants');
const credentials = {
  credentials: 'same-origin'
}

async function checkStatus(response) {

  let dataResponce;
  if (response.status >= 200 && response.status < 300) {

    dataResponce = await response;
  } else {

    let error = new Error(response.statusText);
    error.response = await response.json();
    dataResponce = Promise.reject(error);
  }
  return dataResponce;
}

function getJwtToken() {
  //return appController.jwtToken
}

function getHeaders(url) {
  
  return url.includes('login') ? {
    
    Accept: 'application/json',
    'Content-Type': 'application/json',
   
    // 'Access-Control-Allow-Origin': 'origin',
    // 'Access-Control-Allow-Origin': "*",
    // 'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
    // 'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  } :
    {
      // Accept: 'application/json',
      // 'Content-Type': 'application/json',
      
      //  'client_id':'d507b538-8dfc-4165-8a94-b3d6c70f9cef',
      //  'client_secret':'656d5309-17d4-4391-bd96-fe8b2b8b9874',
      'client_id':global.gConfig.client_id,
      'client_secret':global.gConfig.client_secret,
     
      'Access-Control-Allow-Origin': 'origin',
      'Access-Control-Allow-Origin': "*",
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
       'Access-Control-Allow-Headers': 'client_id,client_secret,Origin, X-Requested-With, Content-Type, Accept, Authorization'
    }
}

function getUrl(url) {
  let muleEndPoint = global.gConfig.MULE_DATA_API;
  
  const timestamp = new Date().getTime()
  let separator = url.includes('?') ? '&' : ''
  separator = separator.replace(/&([^&]*)$/, '$1');
  //noinspection JSUnresolvedVariable
  // console.log( 'url2 : '+encodeURIComponent(url));
  // console.log("mule from config",muleEndPoint);
  return `${(url)}${separator}`


}

/**
 * Base functionality for the server request communications (GET, POST, ...).
 * @type {{get: (function()), postPutDelete: (function()), post: (function()), put: (function()), delete: (function())}}
 */
const serviceBase = {
 // MULE_DATA_API=global.gConfig.MULE_DATA_API,
  get: async url => {
    credentials.headers = getHeaders(url)
  //   var myheaders =new Headers( {
  //   'Content-Type': 'application/json',
  //   //'Access-Control-Allow-Methods':'test'
  //  //  'client_id':'yu',
  //   // 'client_secret':'shh'
  //   });
  
    // var request=new Request(
    //   getUrl(url),myheaders
    // );

   // var requestParameters={ method : 'GET', headers: myheaders}
    var request= new Request(getUrl(url),credentials)
     console.log("printing URL",url)
    let response = await fetch(request).then(function (response) {
     
      return response;
    }).catch(function () {
      return null;
    })
    response = response ? response : null;
    if (response === null) {
      return null;
    }

   if (response.status >= 200 && response.status < 300) {
     response = await checkStatus(response)

     return response.json()
   } else {
     return null;
   }

  },

  postPutDelete: async (url, method, request) => {

    const options = {
      headers: getHeaders(url),
      method: method,
      body: JSON.stringify(request)
    }
    console.log(options.body);
    let response = await fetch(getUrl(url), Object.assign(options, credentials)).then(function (response) {
      return response;
    }).catch(function () {
      return null;
    })
    response = response ? response : null;
    if (response === null) {
      return null;
    }
    if (response.status >= 200 && response.status < 300) {
      response = await checkStatus(response)

      return response.json()
    } else {
      return null;
    }
  },

  post: (url, request) => serviceBase.postPutDelete(url, 'POST', request),

  put: async (url, request) => serviceBase.postPutDelete(url, 'PUT', request),

  delete: (url, request) => serviceBase.postPutDelete(url, 'DELETE', request)
}

export default serviceBase
