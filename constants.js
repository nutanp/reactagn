var moment = require('moment');
var COMPASS = "COMP";
var FLU = "FLU";
var COMP = "COMP";


const constants = {
    MULE_API: 'http://localhost:9999',
    // MULE_DATA_API: 'https://eais-qdp01.oc.mck.com:443/MckWebServices/1.0.1/ibp/process/',
   // MULE_DATA_API: 'http://esswsddp02.mck.com:8243/1.0.1/ibp/process/', // http://esswsddp02.mck.com:8243/1.0.1/ibp/process/   http://localhost:9999/1.0.0/ism/process
   //MULE_DATA_API: 'https://ws-qa-internal.mck.com/MckWebServices/qa/1.0.1/ibp/process/',//QA env
   // MULE_DATA_API:'http://eais-qapi01.oc.mck.com:8084/1.0.1/ibp/process/',// direct mule api without proxy
   // MULE_API_EID: 'http://esswsqdp03.mck.com:8978/sap-hana/1.0.0/retrieve/eid', //http://esswsqdp03.mck.com:8978/sap-hana/1.0.0/
    
   MULE_API_EID: 'https://ws-qa-internal.mck.com/MckWebServices/sap-hana/retrieve-eid/1.0.0/retrieveEid',
   
    PROXY_URL: 'proxy/agn/PK_IBP/AGN/AGN_API/',
    AGN_XSJS: 'AGN.xsjs',
    AGN_ASSIGN_XSJS: 'AGN_ASSIGN.xsjs',
    CUSTOMER: 'customer',
    CHAIN: 'chain',
    GROUP: 'group',
    MAX_ROW_CREATION_LIMIT: 5,
    RECORDS_PER_PAGE: [5, 10, 15, 20, 25],

    //ERROR Messages
    ERROR_MESSAGE_NO_DATA_FOUND: 'Oops No Data Found !!',
    ERROR_MESSAGE_SERVICE_DOWN: 'Oops something went wrong !! Please try after some time.',
    ERROR_MESSAGE_DISCARD_CHANGE: "Do you want to discard changes?",
    ERROR_MESSAGE_FOR_VALIDAION: "Please select / Enter the valid fields!",
    ERROR_MESSAGE_FOR_UNAUTHORIZED_USER: "You don't have access to AGN application , Please contact Admin !!",
    ERROR_MESSAGE_FOR_PERMISSION_DENIED: "You don't have permission to Update/Delete/Save. Please contact Admin.",
    ERROR_MESSAGE_FOR_DELETE: "Are you sure you want to delete?",
    ERROR_MESSAGE_FOR_CANCEL: "Are you sure you want to cancel?",
    ERROR_MESSAGE_AGN_ALREADY_EXISTS: "AGN value(s) already exists.",

    // AZURE Active Directory Details
   AZURE_TENANT_ID: 'da67ef1b-ca59-4db2-9a8c-aa8d94617a16',  //da67ef1b-ca59-4db2-9a8c-aa8d94617a16    
  
   AZURE_CLIENT_ID: '55d0caf2-a6de-4e3d-a33a-59ba03921013', //AGN-Dev2 application ID       
  //AZURE_CLIENT_ID: '1f0d0d43-5ff8-4f72-9f07-de1053555707', //Agn-dev for localhost
   AZURE_CLIENT_SECRET: 'zZokWCn+PGTeW0fNPa3mo5x0pnoBMKyZuG6gM8oY8bA=',     //AGN-dev 2 secret    
   // AZURE_CLIENT_SECRET: '6U2UGhFVrxCuofbfivgGZYICxdgTen9v5fKr18PJXJk=',   // Agn-dev for localhost
  
    AZURE_AD_COMPASS_GROUP_ID: 'fd6fcb9b-ab4f-41d5-83d6-d762324976f9',      // fd6fcb9b-ab4f-41d5-83d6-d762324976f9         
    AZURE_AD_FLU_GROUP_ID: '671c614b-cd8a-4d47-a2d8-07b8cdfd1563',  // 671c614b-cd8a-4d47-a2d8-07b8cdfd1563  
    AZURE_AD_COMPASS_GROUP_ID_PROD:'cfd49ee9-786a-42e9-ba6b-4a3f6a27bc64',   
    AZURE_AD_FLU_GROUP_ID_PROD:'6986075f-1c48-4f01-80c8-9ace220d9724',
  // AZURE_LOGOUT_URL: 'http://localhost:8083/logout',
   //AZURE_LOGOUT_URL: 'https://agn-ui.app.dev-west.paas.mck.com/logout',
   AZURE_LOGOUT_URL: 'https://agn-qa.app.dev-west.paas.mck.com/logout',
  // AZURE_REDIRECT_URL: 'http://localhost:8083/auth/openid/return',  //change only base url (http://localhost:8083) if needed
 //  AZURE_REDIRECT_URL: 'https://agn-ui.app.dev-west.paas.mck.com/auth/openid/return',
 AZURE_REDIRECT_URL: 'https://agn-qa.app.dev-west.paas.mck.com/auth/openid/return',
//    AZURE_CLIENT_ID:'',
//    AZURE_REDIRECT_URL:'',
//    AZURE_CLIENT_SECRET:'',
//    AZURE_LOGOUT_URL:'',

//    'client_id':'',
//    'client_secret':'',
   
  
 
  
    SESSION_TIME_OUT: 300,

    agnObject: {
        "AGN_TYPE": "",
        "AGN": "",
        "DESCRIPTION": "",
        "OWN_PO": "",
        "PO_TEXT": "",
        "CREATEDON": moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
        "CREATEDBY": "",
        "CHANGEDON": "",
        "CHANGEDBY": "",
        "DELETED": false
    },
    createAssignmentObject: {
        "AGN_DESCRIPTION": "",
        "AGN_KEY": "",
        "AGN": "",
        "CATEGORY": "",
        "CUSTOMER": "",
        "CHAIN": "",
        "NATIONAL_GROUP": "",
        "NATIONAL_SUB_GROUP": "",
        "REGION": "",
        "VALID_FROM":  moment().format('YYYY-MM-DD'),
        "VALID_TO": moment('9999-12-31').format('YYYY-MM-DD'),
        "DELETED": false,
        "CREATEDON": moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
        "CREATEDBY": "",
        "AGN_TYPE": ""
    },
    excludeObject: {
        "CATEGORY": "",
        "CUSTOMER": "",
        "CHAIN": "",
        "NATIONAL_GROUP": "",
        "NATIONAL_SUB_GROUP": "",
        "REGION": "",
        "VALID_FROM": moment().format('YYYY-MM-DD'),
        "VALID_TO": moment('9999-12-31').format('YYYY-MM-DD'),
        "DELETED": false,
        "CREATEDON": moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
        "CREATEDBY": "",
        "CHANGEDON": "",
        "CHANGEDBY": "",
        "AGN_TYPE": "",
    },

}



module.exports = { AGN_CONSTANTS: constants, AGN_COMPASS: COMPASS, AGN_FLU: FLU }
