'use strict'

import serviceBase from './serviceBase'
import Constants from '../constants'

const agnService = {

  //agnCategory: (data) => { console.log('agnCategory',data); return serviceBase.get(`${Constants.AGN_CONSTANTS.MULE_DATA_API}${Constants.AGN_CONSTANTS.PROXY_URL}${Constants.AGN_CONSTANTS.AGN_XSJS}?ACTION=GET_CATEGORIES`, {})},
  agnCategory: (data) => { console.log('reading global.gConfig.MULE_DATA_API',global.gConfig.MULE_DATA_API); return serviceBase.get(`${global.gConfig.MULE_DATA_API}${Constants.AGN_CONSTANTS.PROXY_URL}${Constants.AGN_CONSTANTS.AGN_XSJS}?ACTION=GET_CATEGORIES`, {})},
  assignmentListGet: (data) => { console.log('assignListGet',data); return serviceBase.get(`${global.gConfig.MULE_DATA_API}${Constants.AGN_CONSTANTS.PROXY_URL}${Constants.AGN_CONSTANTS.AGN_ASSIGN_XSJS}?AGN_TYPE=${data.agnType}${data.getString}`, {})},
 // getAGN: (data) =>  { console.log('getAGN',data);return serviceBase.get(`${Constants.AGN_CONSTANTS.MULE_DATA_API}${Constants.AGN_CONSTANTS.PROXY_URL}${Constants.AGN_CONSTANTS.AGN_XSJS}?AGN_TYPE=${data.agnType}${data.parameters}`, {})},
  getAGN: (data) =>  { console.log('reading global.gConfig.MULE_DATA_API',global.gConfig.MULE_DATA_API);return serviceBase.get(`${global.gConfig.MULE_DATA_API}${Constants.AGN_CONSTANTS.PROXY_URL}${Constants.AGN_CONSTANTS.AGN_XSJS}?AGN_TYPE=${data.agnType}${data.parameters}`, {})},
  assignmentListPost: (data) => serviceBase.post(`${global.gConfig.MULE_DATA_API}${Constants.AGN_CONSTANTS.PROXY_URL}${Constants.AGN_CONSTANTS.AGN_ASSIGN_XSJS}`, data),
  autosuggestData: (data) => serviceBase.get(`${Constants.AGN_CONSTANTS.MULE_API}/getCustomers?${data.getString}`, {}),
  autosuggestAgnData: (data) => serviceBase.get(`${Constants.AGN_CONSTANTS.MULE_API}/getAGN?${data.getString}`, {}),

  createAGN: (data) => serviceBase.post(`${global.gConfig.MULE_DATA_API}${Constants.AGN_CONSTANTS.PROXY_URL}${Constants.AGN_CONSTANTS.AGN_XSJS}`, data),

  getEmployeeId: (data) => serviceBase.post(`${global.gConfig.MULE_API_EID}`, data),


  deleteAGNCheck: (data) => serviceBase.get(`${global.gConfig.MULE_DATA_API}${Constants.AGN_CONSTANTS.PROXY_URL}${Constants.AGN_CONSTANTS.AGN_XSJS}?ACTION=DELETE&${data.parameters}`, {}),

  AccountAutoComplete: (data) => serviceBase.get(`${global.gConfig.MULE_DATA_API}${Constants.AGN_CONSTANTS.CUSTOMER}?${data.getString}`, {}),
  ChainAutoComplete: (data) => serviceBase.get(`${global.gConfig.MULE_DATA_API}${Constants.AGN_CONSTANTS.CHAIN}?${data.getString}`, {}),
  NGAutoComplete: (data) => serviceBase.get(`${global.gConfig.MULE_DATA_API}${Constants.AGN_CONSTANTS.GROUP}?${data.getString}`, {}),

  //azurelogin service call
  Azurelogin: (data) => serviceBase.get(`/AzureloginDetails`, {}),
 
}
export default agnService
