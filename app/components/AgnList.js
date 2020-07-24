import React from 'react';
import _ from 'lodash';
import Loadjs from 'loadjs';
import Header from './common/Header';
import Footer from './common/Footer';
import { Link,Redirect  } from 'react-router-dom';
import $ from "jquery";
import Loader from 'react-loader-advanced';
import AgnService from '../../services/agnService'
import NoDataFound from './common/NoDataFound'
import ServiceDown from './common/ServiceDown'
import { confirmAlert } from 'react-confirm-alert';
import Autosuggest from 'react-autosuggest';
import Pagination from "react-js-pagination";

import moment from 'moment'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table'
import update from 'react-addons-update';
import AppController from '../controllers/appController';
import Constants from '../../constants';
import { NotificationContainer, NotificationManager } from 'react-notifications';

let obj = [];
let rowIndexCheck = [];

class AgnList extends React.Component { 
  constructor(props) {
    super(props)

    this.state = {
      category: [],
      data: [],
      OriginalData: [],
      filterObj: {},
      filterError: "",
      isSearch: false,
      errorMessage: "",
      desc: '',
      agnKey: '',
      agn: '',
      suggestions: [],
      modelType: -1,
      agnObj: {},
      errorVal: 0,
      validTo: "",
      serviceDown: false,
      startDate: moment(),
      update: false,
      message: "",
      AgnKeyLabel: "AGN",
      GridAgnKeyLabel: "AGN",
      EditObject: [],
      userType: localStorage.getItem("agnType"),
      currentPage: 1,
      activePage: 1,
      pageCount: null,
      pageSize: 5,
      dataSlice: [],
      clikedRecord:[],
      sliceIndex: 0,
      loaderStatus:true,
      sleepMode:true,
      editedObject:{},
      editedIndex:0

    }

    this.catgoryChange = this.catgoryChange.bind(this);
    this.descriptionChange = this.descriptionChange.bind(this);
    this.agnKeyChange = this.agnKeyChange.bind(this);
    this.agnChange = this.agnChange.bind(this);
    this.validToChange = this.validToChange.bind(this);
    this.SearchFilter = this.SearchFilter.bind(this);
    this.convertDate = this.convertDate.bind(this);
    //this.onChangeHandler = this.onChangeHandler.bind(this);

    //this.onSave = this.onSave.bind(this);
    this.textEnabled = this.textEnabled.bind(this);
    this.getCategoryName = this.getCategoryName.bind(this);
    this.agnPaginationUpdateConfirmAlert = this.agnPaginationUpdateConfirmAlert.bind(this);
    this.setCurrentPage = this.setCurrentPage.bind(this);
    this.clearFilter = this.clearFilter.bind(this);

  }
  async componentWillMount() {


    await AppController.selectpickerUpdate("")

    AppController.datePicker(this, '', 'search');

    //localStorage.setItem("agnType", this.state.userType);
    if (localStorage.getItem("createAGN") == "true") {

      await AppController.createNotification('success', localStorage.getItem("createAgnMessage"));
      this.setState({ update: false, message: "", modelType: -1 })
      localStorage.setItem("createAGN", false);
      localStorage.setItem("createAgnMessage", "");
     
    }


   // const CallingMuleAPIVar1 = await AgnService.CallingMuleAPIVar();
   // console.log("my calling api",CallingMuleAPIVar1);
    localStorage.setItem("category", []);
    const AgnCategories = await AgnService.agnCategory();
    if (AgnCategories === null) {
      localStorage.setItem("category", []);
    } else {
      localStorage.setItem("category", JSON.stringify(AgnCategories.category));
    }



    await this.setState(() => ({ category: localStorage.getItem("category") !== "" ? JSON.parse(localStorage.getItem("category")) : [] }));
    if(this.state.sleepMode === true){
      setTimeout(function () {
        this.setState({ sleepMode: false});
      }.bind(this), 1000);
    }
    this.getAGNData();
  }
async getAGNData(){

  await this.setState({ data: [], dataSlice:[], loaderStatus:true })
  let agnData = await AgnService.getAGN({ "parameters": "", agnType: this.state.userType });
  if (agnData === null) {
    await this.setState({ serviceDown: true, loaderStatus:false })
  } else {
    let agnDataResult = agnData.agns;
    await this.setState({ serviceDown: false })
    await this.setState({ data: _.filter(agnDataResult, (obj) => !obj.deletedFlag) });
    await this.setState({ OriginalData: _.filter(agnDataResult, (obj) => !obj.deletedFlag) });
    localStorage.setItem("agnOriginalData", JSON.stringify(this.state.OriginalData));
    this.setState({loaderStatus:false })
    this.pagingNumCount();
    this.createPaginatedData();
  }
  if(this.state.clikedRecord!=null){
    this.state.clikedRecord=[];
    obj=[];
  }
  await AppController.selectpickerUpdate("");
}
  async changePageSize(e) {
    await this.setState({ pageSize: e.target.value })
    this.pagingNumCount();
    this.createPaginatedData();
  }
  async pagingNumCount() {

    const startingPage = 1;
    const data = this.state.data;
    const pageSize = this.state.pageSize;
    let pageCount = parseInt(data.length / pageSize);
    if (data.length % pageSize > 0) {
      pageCount++;
    }
    this.setState({
      currentPage: startingPage,
      pageCount: pageCount
    });
    this.createPaginatedData();
  }
  async setCurrentPage(num, discardStatus = 'No') {
    if (discardStatus === 'Yes') {
      obj = [];
    }
    await this.setState({ currentPage: num });
    await this.createPaginatedData();

  }
 
  agnChangeConfirmAlert() {
    if (Object.keys(obj).length > 0) {
      confirmAlert({
        title: '',
        message: Constants.AGN_CONSTANTS.ERROR_MESSAGE_DISCARD_CHANGE,
        buttons: [
          {
            label: 'Yes',
            onClick: this.getAGNData.bind(this)
          },
          {
            label: 'No',
            onClick: () => ""
          }
        ]
      })
    } 
  }


  agnPaginationUpdateConfirmAlert(num) {
    if (Object.keys(obj).length > 0) {
      confirmAlert({
        title: '',
        message: Constants.AGN_CONSTANTS.ERROR_MESSAGE_DISCARD_CHANGE,
        buttons: [
          {
            label: 'Yes',
            onClick: this.setCurrentPage.bind(this, num, 'Yes')
          },
          {
            label: 'No',
            onClick: () => ""
          }
        ]
      })
    } else {
      this.setCurrentPage(num, 'No');
    }
  }



async  createPaginatedData() {
    const data = this.state.data;
    const pageSize = this.state.pageSize;
    const currentPage = this.state.currentPage;
    const upperLimit = currentPage * pageSize;
    const dataSlice = data.slice((upperLimit - pageSize), upperLimit);

    await this.setState({ dataSlice: dataSlice, sliceIndex: (upperLimit - pageSize) })
  }


  async catgoryChange(e) {

    let filterObj = Object.assign({}, this.state.filterObj);
    if (e.target.value === "0") {
      delete filterObj.category;
      await this.setState({ filterObj, AgnKeyLabel: "AGN" });
    } else {
      const labelkey = _.filter(this.state.category, { 'category': e.target.value });
      filterObj.category = e.target.value.trim();
      await this.setState({ filterObj, AgnKeyLabel: labelkey[0].description });
    }

  }

  /*auto suggestion*/
  async descriptionChange(e) {
    let filterObj = Object.assign({}, this.state.filterObj);
    if (e.target.value === "") {
      delete filterObj.desc;
      await this.setState({ filterObj, desc: e.target.value });
    } else {
      filterObj.desc = e.target.value.trim();

      await this.setState({ filterObj, desc: e.target.value });
    }
  }

  async agnKeyChange(e) {
    let filterObj = Object.assign({}, this.state.filterObj);
    if (e.target.value === "") {
      delete filterObj.agnKey;
      await this.setState({ filterObj, agnKey: e.target.value });
    } else {
      filterObj.agnKey = e.target.value.trim();
      await this.setState({ filterObj, agnKey: e.target.value });
    }
  }

 ClearEditedUnsavedObj()
 {
   
 }

  async agnChange(e) {
   console.log("after agn change",e.target.value);
 
   if (this.state.clikedRecord!="")
   {
     const clickcell=localStorage.getItem("clikedCell")
     if(clickcell.length ==1 ){
      $("#pid" + clickcell).addClass("collapse");
      $("#Parentpid" + clickcell).show();
      $("#Parentpid"+ clickcell + "delete").css('visibility', 'visible');
     
     }
     else if(clickcell.length >1 && clickcell.includes(",")){
      let indexArray = clickcell.split(",");
        indexArray.forEach(editedrow => {
        $("#pid" + editedrow).addClass("collapse");
        $("#Parentpid" + editedrow).show();
        $("#Parentpid"+ editedrow + "delete").css('visibility', 'visible');
       
        
      })
     }
   
     if (Object.keys(obj).length > 0)
     { localStorage.setItem("clikedCell","");
       this.state.clikedRecord=[];
       let arrayfromlocalstorage=JSON.parse(localStorage.getItem('agnOriginalData'));
       let found=arrayfromlocalstorage.filter(element=>{
        
        
         if(element.AGN===this.state.editedObject.AGN)
         {
          
          console.log("element found from local",element)
          return element;
         }
       })
       console.log("obj in before clear",JSON.stringify(obj))
       let indexToBeReplaced = arrayfromlocalstorage.findIndex(e => e.AGN  === found[0].AGN)
       let deletedElement = this.state.OriginalData.splice(indexToBeReplaced,1,found[0]);
       obj=[];
     
     }
     console.log("obj in agn change",JSON.stringify(obj))
        
   }
  
  
    let filterObj = Object.assign({}, this.state.filterObj);
    if (e.target.value === "") {
      delete filterObj.agn;
      //delete filterObj.desc;
      await this.setState({ filterObj, agn: e.target.value });
    } else {

      filterObj.agn = e.target.value.trim();
      //filterObj.desc = e.target.value.trim();
      await this.setState({ filterObj, agn: e.target.value });
    }

    let getString = "";
    $.each(this.state.filterObj, function (key, value) {
      let eachKey = "&" + key + "=" + value;
      getString = getString + eachKey;
    });
    console.log("getString",this.getString);
    // if (Object.keys(obj).length > 0)
    // { 
    //   await this.setState({ data: [] });
    // }
    // if (Object.keys(obj).length > 0)
    // {
    //   console.log("objchange",obj);
    //   //await this.setState({ data: this.state.OriginalData });
    // }
    // else 
    if (this.state.filterObj.agn!=undefined && this.state.filterObj.agn.length >= 1) {
    // console.log("length",(this.state.filterObj.agn).length);
      const dataResult = this.state.OriginalData.filter(
        data =>
          (this.state.filterObj.agn ? data.AGN.toLowerCase().includes(this.state.filterObj.agn.toLowerCase()) : true) ||
          (this.state.filterObj.agn ? data.DESCRIPTION.toLowerCase().includes(this.state.filterObj.agn.toLowerCase()) : true)
      );

      await this.setState({ data: dataResult });

    } else {
      await this.setState({ data: this.state.OriginalData });
    }

    this.pagingNumCount();
    this.createPaginatedData();



  }

  convertDate(dateString) {
    let p = dateString.split(/\D/g)
    return [p[0], p[1], p[2]].join("-")
  }

  async validToChange(value, date) {

    let filterObj = Object.assign({}, this.state.filterObj);
    if (value === null) {
      delete filterObj.validTo;
      await this.setState({ filterObj, validTo: value });
    } else {
      filterObj.validTo = value;
      await this.setState({ filterObj, validTo: value, startDate: date });
    }

  }
  getCategoryName(value) {
    const labelkey = _.filter(this.state.category, { 'category': value });
    return labelkey[0].description;
  }
  async SearchFilter() {
    
    await this.setState({ GridAgnKeyLabel: this.state.AgnKeyLabel });
    let getString = "";
    $.each(this.state.filterObj, function (key, value) {
      let eachKey = "&" + key + "=" + value;
      getString = getString + eachKey;
    });
    console.log("we r in search",getString);
    if (Object.keys(this.state.filterObj).length > 0) {


      const dataResult = this.state.OriginalData.filter(
        data =>
          (this.state.filterObj.agn ? data.AGN.toLowerCase().includes(this.state.filterObj.agn.toLowerCase()) : true) ||
          (this.state.filterObj.agn ? data.DESCRIPTION.toLowerCase().includes(this.state.filterObj.agn.toLowerCase()) : true)
      );

      await this.setState({ data: dataResult });
    
      

    } else {

      await this.setState({ data: this.state.OriginalData });
    }
    this.pagingNumCount();
    this.createPaginatedData();
    await AppController.datePicker(this, '');
  }

  async componentDidMount() {

  }
  async clearFilter() {
    if(this.state.clikedRecord!="" )
    {
      const clickcell=localStorage.getItem("clikedCell")
      if(clickcell.length ==1 ){
       $("#pid" + clickcell).addClass("collapse");
       $("#Parentpid" + clickcell).show();
       $("#Parentpid"+ clickcell + "delete").css('visibility', 'visible');
      
      }
      else if(clickcell.length >1 && clickcell.includes(",")){
       let indexArray = clickcell.split(",");
         indexArray.forEach(editedrow => {
         $("#pid" + editedrow).addClass("collapse");
         $("#Parentpid" + editedrow).show();
         $("#Parentpid"+ editedrow + "delete").css('visibility', 'visible');
        
         
       })
      }
    
      if (Object.keys(obj).length > 0)
      {  localStorage.setItem("clikedCell","");
         this.state.clikedRecord=[];
        let arrayfromlocalstorage=JSON.parse(localStorage.getItem('agnOriginalData'));
        let found=arrayfromlocalstorage.filter(element=>{
         
         
          if(element.AGN===this.state.editedObject.AGN)
          {
           
           console.log("element found from local",element)
           return element;
          }
        })
        console.log("obj in before clear",JSON.stringify(obj))
        let indexToBeReplaced = arrayfromlocalstorage.findIndex(e => e.AGN  === found[0].AGN)
        let deletedElement = this.state.OriginalData.splice(indexToBeReplaced,1,found[0]);
        console.log("deleted element",JSON.stringify(deletedElement))
        obj=[];
      
      }
      console.log("obj in agn change",JSON.stringify(obj))
      await this.setState({ data: this.state.OriginalData });
    }
   
   
    this.setState({ data: [], filterObj: {}, isSearch: false, description: "", agnKey: "", agn: "", validTo: "" })
    AppController.selectpickerUpdate("val")
    await this.setState({ data: this.state.OriginalData });
    this.pagingNumCount();
    this.createPaginatedData();

  }

  async confirmationAlert(row, rowIndex, index) {

    //console.log("row",row +"rowIndex, index printing", rowIndex, index, obj[index]);
     console.log("parameters:'AGN='", + row.AGN + 'AGN_TYPE='+row.AGN_TYPE +'OWN_PO='+row.OWN_PO)
    let aletMsg = Constants.AGN_CONSTANTS.ERROR_MESSAGE_FOR_DELETE;
    let saveFromDelete = 0;
    if(obj[index] !== undefined) {
      if(obj[index].DELETED === true){
        aletMsg = Constants.AGN_CONSTANTS.ERROR_MESSAGE_FOR_CANCEL;
        saveFromDelete = 1;
      }
    }

    let eid = localStorage.getItem('eid') ? localStorage.getItem('eid') : "";
    if (eid === "") {
      AppController.permissionDenied();
    } else {
      const deleteConfirmation = await AgnService.deleteAGNCheck({ parameters: row.compositekey});
      //console.log(deleteConfirmation);

      if (deleteConfirmation.status === true) {
        confirmAlert({
          title: '',
          message: aletMsg,
          buttons: [
            {
              label: 'Yes',
              onClick: this.deleteAgn.bind(this, row, rowIndex, index, saveFromDelete)
            },
            {
              label: 'No',
              onClick: () => ""
            }
          ]
        })
      }
      else {
        this.deleteErrorMessage(deleteConfirmation.status, deleteConfirmation.message);
      }
    }
  }

  deleteErrorMessage(status, message) {

    confirmAlert({
      title: '',
      message: "ERROR : Can't delete " + message,
      buttons: [
        {
          label: 'Cancel',
          onClick: () => ""
        }
      ]
    })
  }
  async deleteAgn(row, rowIndex, index, saveFromDelete) {


  if(saveFromDelete === 1){
      delete obj[index];
      $("#Parent" + rowIndex).removeClass("greyagnDeleted");
      $("#pid"+ index + "delete").removeClass("mdi-close-box").addClass("mdi-delete");
      $("#Parentpid"+ index + "delete").removeClass("mdi-close-box").addClass("mdi-delete");
      $("#pid"+ index + "edit").css('visibility', 'visible');
      $("#Parentpid"+ index + "edit").css('visibility', 'visible');

  } else {

    $("#pid"+ index + "delete").removeClass("mdi-delete").addClass("mdi-close-box");
    $("#Parentpid"+ index + "delete").removeClass("mdi-delete").addClass("mdi-close-box");
    $("#pid"+ index + "edit").css('visibility', 'hidden');
    $("#Parentpid"+ index + "edit").css('visibility', 'hidden');

    // row.CHANGEDON = moment().format("YYYY-MM-DD")
    row.DELETED = true

    $("#Parent" + rowIndex).addClass("greyagnDeleted");

    if (typeof obj[index] === "undefined") {
      // row.CHANGEDON = moment().format('YYYY-MM-DD');
      row.CHANGEDBY = localStorage.getItem('eid') ? localStorage.getItem('eid') : null;
      obj[index] = row;
    }
}

    if (Object.keys(obj).length > 0) {
      $("#SaveButton").show();
    }else{
      $("#SaveButton").hide();
    }




  }

  updateModelType(modelType, agnObj) {

    this.setState({ modelType, agnObj });
    AppController.selectpickerUpdate("")
  }
  renderShowsTotal(start, to, total) {
    return (
      <p>
        Showing {start} to {to} of {total} entries
    </p>
    );
  }
  linkFormatter(cell, row) {

    return <a data-toggle="modal" data-target="#EditAGNGroup" className="agn-link" onClick={this.updateModelType.bind(this, 1, row)}>{row.agn} </a>
  }
  poboxFormat(cell, row) {
    return <input id="checkBox" type="checkbox" checked={row.OWN_PO} disabled />
  }
  anctionFormat(cell, row, rowIndex, index) {

    return <div><a data-toggle="modal" data-target="#EditAGNGroup" onClick={this.updateModelType.bind(this, 1, row)}><i className="mdi mdi-pencil-box" data-toggle="tooltip" data-placement="top" title="" data-original-title="Edit"></i></a> <a onClick={this.confirmationAlert.bind(this, row, index)} data-toggle="tooltip" data-placement="top" title="" data-original-title="Delete"><i className="mdi mdi-delete"></i></a></div>
  }
  dateFormat(cell, row) {
    return <div>{this.convertDate(row.validTo)}</div>
  }

  updateValue(object) {
    let agnObj = update(this.state.agnObj, { [object.name]: { $set: object.value } });
    if (object.name == "OWN_PO" && !object.value) {
      agnObj = update(agnObj, { PO_TEXT: { $set: "" } });
    }
    this.setState({ agnObj });
  }


  async componentDidUpdate() {
    if (Object.keys(obj).length > 0) {
      $("#SaveButton").show();
    } else {
      $("#SaveButton").hide();
    }

  }
  async textEnabled(id, currentObject) {

    if (currentObject.target.checked) {

      $('#' + id).attr('disabled', false);

    } else {
      $('#' + id).attr('disabled', true);
      $('#' + id).removeClass('errorClass')
      $('#' + id).val("");
    }
  }
  async hideshow(cell, index) {
    let eid = localStorage.getItem('eid') ? localStorage.getItem('eid') : "";
    if (eid === "") {
      AppController.permissionDenied();
    } else {
      let length = this.state.clikedRecord.push(index);
      console.log('this.state.clikedRecord length : ' + length)
      localStorage.setItem("clikedCell", this.state.clikedRecord);
      
      $("#" + cell).removeClass("collapse");
      $("#Parent" + cell).hide();
    }
    $("#pid"+ index + "delete").removeClass("mdi-close-box").addClass("mdi-delete");
    $("#Parentpid"+ index + "delete").removeClass("mdi-close-box").addClass("mdi-delete");
    $("#Parentpid"+ index + "delete").css('visibility', 'hidden');
    $("#pid"+ index + "delete").css('visibility', 'hidden');
    if (Object.keys(this.state.filterObj).length > 0) {
      const dataResult = this.state.OriginalData.filter(
        data =>
          (this.state.filterObj.agn ? data.AGN.toLowerCase().includes(this.state.filterObj.agn.toLowerCase()) : true) ||
          (this.state.filterObj.agn ? data.DESCRIPTION.toLowerCase().includes(this.state.filterObj.agn.toLowerCase()) : true)
      );
      $("#PO_TEXT" + index).val(dataResult[index].PO_TEXT);
      $("#OWN_PO" + index).prop("checked", dataResult[index].OWN_PO);
      $("#DESCRIPTION" + index).val(dataResult[index].DESCRIPTION);
      $("#AGN" + dataResult[index].ID).val(dataResult[index].ID);
    }

  }
  async Showhide(cell, index, id) {
    let orignalD = JSON.parse(localStorage.getItem('agnOriginalData'));
    let agnData = orignalD[index];
    delete obj[index];
    $("#Parent" + cell).removeClass("greyagnDeleted");
    $("#pid"+ index + "delete").removeClass("mdi-close-box").addClass("mdi-delete");
    $("#Parentpid"+ index + "delete").removeClass("mdi-close-box").addClass("mdi-delete");
    $("#Parentpid"+ index + "delete").css('visibility', 'visible');
    $("#pid"+ index + "delete").css('visibility', 'visible');
    if (Object.keys(obj).length > 0) {
      $("#SaveButton").show();
    } else {

      $("#SaveButton").hide();
    }
    $("#PO_TEXT" + id).val(agnData.PO_TEXT);
    $("#OWN_PO" + id).prop("checked", agnData.OWN_PO);
    $("#DESCRIPTION" + id).val(agnData.DESCRIPTION);
    $("#" + cell).addClass("collapse");
    $("#Parent" + cell).show();
  }
  async onChangeHandler(type, index, totalObject, thisObject) {
    console.log("on change handler",index+"type"+type+"totalobject : "+JSON.stringify(totalObject)+"this object"+thisObject);
    if (typeof obj[index] === "undefined") {
      // totalObject.CHANGEDON = moment().format('YYYY-MM-DD');
      totalObject.CHANGEDBY = localStorage.getItem('eid') ? localStorage.getItem('eid') : null;
      obj[index] = totalObject;
     
      this.state.editedObject = totalObject;
      this.state.editedIndex = index
    
    }
    //if (thisObject.target.value !== "") {
    //obj[index]['action'] = "update";
    if (type == "OWN_PO") {

      obj[index][type] = thisObject.target.checked ? true : false;
      if (thisObject.target.checked === false) {
        obj[index]["PO_TEXT"] = "";
      }
    } else {
      obj[index][type] = (thisObject.target.value);
    }

    thisObject.target.value = (thisObject.target.value);
    //}
  
    if (Object.keys(obj).length > 0) {
      $("#SaveButton").show();
    }
    //this.setState({EditObject:obj});

  }
  async onSave() {


    let agnType = localStorage.getItem('agnType')
    let errorVal = 0

    _.forEach(obj, function (obj, index) {
      _.forEach(obj, function (value, key) {
        console.log("agnType",agnType);
        if ((key === "OWN_PO" && (value === "" || value === false)) || key === "CREATEDBY" || key === "AGN_TYPE" || key === "CHANGEDON" || key === "CHANGEDBY" || key === "DELETED") {
        }
        else if (key === "PO_TEXT" && agnType !== "FLU") {
        
          if (obj['OWN_PO'] === true && value.trim() === "") {
           
            $('.' + key + index).addClass('errorClass')
            errorVal++
            
          }else{
            $('.' + key + index).removeClass('errorClass');
          }
        } else if (key === "PO_TEXT" && obj['OWN_PO'] === false) {
          $('.' + key + index).removeClass('errorClass')
        }
        else if (value === "" && key === "AGN") {

          $('.' + key + index).addClass('errorClass')
          errorVal++
        } else {
          $('.' + key + index).removeClass('errorClass')
        }
      });

    });

    if (errorVal == 0) {
      $("tr").removeClass("greyagnDeleted");
      await this.onSaveData();
    } else {
      await AppController.createNotification('error', Constants.AGN_CONSTANTS.ERROR_MESSAGE_FOR_VALIDAION);
    }

  }
  async onSaveData(e) {

    let finalArray = [];
    obj.forEach(function (item) {
      item.CHANGEDBY = localStorage.getItem('eid') ? localStorage.getItem('eid') : null;
      // item.CHANGEDON = moment().format('YYYY-MM-DD');
      finalArray.push(item);
    });

    const updateResult = await AgnService.createAGN({ agns: finalArray });
    if(updateResult === null) {
      await AppController.createNotification('error', Constants.AGN_CONSTANTS.ERROR_MESSAGE_SERVICE_DOWN);
    } else if (updateResult.status === true) {
      obj = [];

      this.getAGNData();
      await AppController.createNotification('success', 'AGN updated successfully');
      {/*await this.setState({ update: true, message: "AGN updated successfully" })
      setTimeout(function () {
        this.setState({ update: false, message: "", modelType: -1 })
      }.bind(this), 5500); */}

    } else {
      this.getAGNData();
      await AppController.createNotification('error', updateResult.message);
    {/*  await this.setState({ errorVal: 1, errorMessage: updateResult.message, AGNCreateObject: [] })
      setTimeout(function () {
        this.setState({ errorVal: 0, errorMessage: "" })
      }.bind(this), 5500);*/}
    }



  }
  async checkToggle(div, e) {
    $("#" + div).toggleClass("open");
  }
  closeDangerAlert() {
    $('.alert.alert-danger').hide()
  }
  isLoggedIn () {
		if (localStorage.getItem("AzureUserName") != null) {
			return true;
  }
}

  render() {

    const spinner = <span><img src="/images/ajax-loader.gif"/><div>Loading...</div></span>;
  //isloggedin
  if (localStorage.getItem("AzureUserName") === null) {
    return <Redirect to="/login" />;
  }
    return (
      <div>
      <Loader show={this.state.loaderStatus} message={spinner}>
      <Header data={this.props} />
        <div className="wrapper">
          <div className="container-fluid">
            <div className="col-md-10 mar-lr-auto">
              <div className="row">
                <div className="col-md-12">
                  <div className="card-box m-t-10">
                    <div className="row">
                      <div className="col-sm-12 col-md-6 col-lg-3">
                        <div className="form-group">
                          <label >AGN</label>
                          <input type="text" value={this.state.agn} className="form-control" placeholder="AGN" onChange={this.agnChange.bind(this)} />
                        </div>
                      </div>


                      <div className="col-sm-12 col-md-6 col-lg-2">
                        <div className="m-t-30 searchBtn-wrap">
                          <button type="button" className="btn btn-primary waves-light waves-effect" data-toggle="tooltip" data-placement="top" title="Search" onClick={this.SearchFilter.bind(this)}><i className="mdi mdi-magnify"></i></button>
                          <button type="button" className="btn btn-warning waves-light waves-effect m-l-5" data-toggle="tooltip" data-placement="top" title="Clear" onClick={this.clearFilter.bind(this)}><i className="mdi mdi-close"></i></button>

                        </div>
                      </div>
                      <div className="col-sm-12 col-md-6 col-lg-7">
                        <div className="m-t-30 searchBtn-wrap pull-right">
                          <Link to="/create-agn" className="btn btn-primary waves-light waves-effect"><i className="mdi mdi-plus"></i> Create Agn</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>


              </div>

              <div className="row">
                <div className="col-md-12">
                  <div className="card-box">
                    <div className="m-b-10 d-flex justify-content-between">
                      {/*<div className="card-fl-item">
                          <h4 className="header-title">AGN Groups</h4>
                        </div>
                       <div className="card-fl-item">
                          <Link to="/add-agn" className="btn btn-primary waves-light waves-effect"><i className="mdi mdi-plus"></i> Create Agn</Link>
                        </div>*/}
                    </div>

                    {(this.state.dataSlice.length == 0) ? (this.state.serviceDown === true ? <ServiceDown /> : <NoDataFound sleepMode={this.state.sleepMode}/>) : ""}
                    {this.state.dataSlice.length > 0 ?

                      <table className="table fold-table">
                        <thead>
                          <tr>

                            <th className="Agnwidth">AGN</th>

                            <th className="AgnDwidth">AGN Description</th>
                            <th className="OwnPowidth text-center">Own PO</th>
                            <th className="PoTextwidth">PO Text</th>
                            <th className="action-space">Action</th>
                          </tr>
                        </thead>
                        {this.state.dataSlice.map((agn, index) => {
                          agn.compositekey='AGN=' + agn.AGN + '&AGN_TYPE='+agn.AGN_TYPE +'&OWN_PO='+agn.OWN_PO
                           return <tbody key={(index + this.state.sliceIndex)}>
                            <tr id={"Parentpid" + (index + this.state.sliceIndex)}>
                              <td>{agn.AGN}</td>
                              <td>{agn.DESCRIPTION}</td>
                              <td className="text-center"><input id="checkBox" type="checkbox" checked={agn.OWN_PO} disabled /></td>
                              <td>{agn.PO_TEXT}</td>

                              <td className="action-link">
                                <a onClick={this.hideshow.bind(this, "pid" + (index + this.state.sliceIndex), (index + this.state.sliceIndex))}><i className="mdi mdi-pencil-box" aria-hidden="true" id={"Parentpid" + (index + this.state.sliceIndex) +"edit"}></i></a>
                                <a onClick={this.confirmationAlert.bind(this, agn, "pid" + (index + this.state.sliceIndex), (index + this.state.sliceIndex))}> <i className="mdi mdi-delete" id={"Parentpid" + (index + this.state.sliceIndex) +"delete"} aria-hidden="true"></i></a>
                              </td>

                            </tr>

                            <tr className="collapse" id={"pid" + (index + this.state.sliceIndex)}>
                              <td className="">
                                 {agn.AGN}
                                {/* <input disabled className={"form-control AGN" + (index + this.state.sliceIndex)} id={"AGN" + agn.ID} name="agn" placeholder="Enter AGN" type="text" defaultValue={agn.AGN}  /> */}
                                {/* <input disabled id={"AGN" + agn.AGN} defaultValue={agn.AGN}  /> */}
                              </td>
                              <td className="cur">
                                <input className={"form-control DESCRIPTION" + (index + this.state.sliceIndex)} id={"DESCRIPTION" + (index + this.state.sliceIndex)} placeholder="Enter Description" type="text" defaultValue={agn.DESCRIPTION} maxLength="40" onChange={this.onChangeHandler.bind(this, 'DESCRIPTION', (index + this.state.sliceIndex), agn)} />
                              </td>
                              <td>

                                <div className="checkbox checkbox-primary text-center">
                                  <input disabled={this.state.userType === "FLU"  ?  true :false } className={"OWN_PO" + (index + this.state.sliceIndex)} type="checkbox" id={"OWN_PO" + (index + this.state.sliceIndex)} defaultChecked={agn.OWN_PO} onChange={this.onChangeHandler.bind(this, 'OWN_PO', index, agn)} onClick={this.textEnabled.bind(this, "PO_TEXT" + (index + this.state.sliceIndex))} onChange={this.onChangeHandler.bind(this, 'OWN_PO', (index + this.state.sliceIndex), agn)} />
                                  <label htmlFor="checkbox1"></label>
                                </div>


                              </td>

                              <td>
                                <input disabled={this.state.userType === "FLU"  ?  true :!agn.OWN_PO } className={"form-control PO_TEXT" + (index + this.state.sliceIndex)} id={"PO_TEXT" + (index + this.state.sliceIndex)} placeholder="Enter PO Text" type="text" defaultValue={agn.PO_TEXT} maxLength="20" onChange={this.onChangeHandler.bind(this, 'PO_TEXT', (index + this.state.sliceIndex), agn)} />

                              </td>
                              <td className="action-link">
                                <a onClick={this.Showhide.bind(this, "pid" + (index + this.state.sliceIndex), (index + this.state.sliceIndex), (index + this.state.sliceIndex))}><i className="mdi mdi-close-box" aria-hidden="true" id={"pid" + (index + this.state.sliceIndex) +"edit"}></i></a>
                                <a onClick={this.confirmationAlert.bind(this, agn, "pid" + (index + this.state.sliceIndex), (index + this.state.sliceIndex))}> <i className="mdi mdi-delete" id={"pid" + (index + this.state.sliceIndex) +"delete"} aria-hidden="true"></i></a>

                              </td>
                            </tr>
                          </tbody>

                        })}

                      </table>
                      : ""}
                    {this.state.dataSlice.length > 0 ? <div className='pagination pageShow22'>
                      <div className='pagination-controls pageShow'>

                        <div className='pagination-controls'>
                          {/*this.createControls()*/}
                          <Pagination
                            prevPageText='Prev'
                            nextPageText='Next'
                            firstPageText='First'
                            lastPageText='Last'
                            activePage={this.state.currentPage}
                            itemsCountPerPage={this.state.pageSize}
                            totalItemsCount={this.state.data.length}
                            pageRangeDisplayed={10}
                            onChange={this.agnPaginationUpdateConfirmAlert}
                          />
                        </div>


                        <div className="form-group">
                          <label >Show Entries</label>
                          <select value={this.state.pageSize} className="form-control selectpicker" onChange={this.changePageSize.bind(this)}>
                            {Constants.AGN_CONSTANTS.RECORDS_PER_PAGE.map(function (pageSize) {
                              return <option key={pageSize}
                                value={pageSize}>{pageSize}</option>;
                            })}
                          </select>
                        </div>


                      </div>
                    </div> : ""}

                  </div>
                  {this.state.dataSlice.length > 0 ? <div className="justify-content-end agnSave" id="SaveButton">
                    <div className="card-fl-item">
                      <span className="btn btn-primary waves-light waves-effect" onClick={this.onSave.bind(this)}>Save</span>
                    </div>
                  </div> : ""}
                </div>


              </div>
            </div>

          </div>
        </div>
        </Loader>
        <Footer />
      </div>
    )
  }


}

export default AgnList
