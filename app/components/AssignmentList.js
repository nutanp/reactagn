import React from 'react';
import _ from 'lodash';
import Header from './common/Header';
import Footer from './common/Footer';
import Loadjs from 'loadjs';
import Loader from 'react-loader-advanced';
import { Link } from 'react-router-dom';
import $ from "jquery";
import AgnService from '../../services/agnService'
import NoDataFound from './common/NoDataFound'
import ServiceDown from './common/ServiceDown'
import { confirmAlert } from 'react-confirm-alert';
import Autosuggest from 'react-autosuggest';
import ExclusionForm from './ExclusionForm'
import moment from 'moment'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table'
import update from 'react-addons-update';
import AppController from '../controllers/appController';
import Constants from '../../constants';
import Pagination from "react-js-pagination";


const agnSuggestionValue = (suggestion) => suggestion.AGN;
const renderAgnSuggestion = (suggestion) => (<div className="autocomplete-suggestion">{suggestion.AGN} - {suggestion.DESCRIPTION}</div>);

const masterDataSuggestionValue = (suggestion) => suggestion.label;
const renderMasterDataSuggestion = (suggestion) => (<div className="autocomplete-suggestion">{suggestion.desc} - {suggestion.label}</div>);


class AssignmentList extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      
      category: [],
      data: [],
      filterObj: {},
      filterError: "",
      isSearch: false,
      description: '',
      agnKey: '',
      agn: '',
      suggestions: [],
      modelType: -1,
      agnObj: {},
      errorVal: 0,
      errorMessage: "",
      validTo: "",
      validFrom: "",
      startDate: moment(),
      update: false,
      message: "",
      AgnKeyLabel: "Account",
      GridAgnKeyLabel: "testing header",
      userType: localStorage.getItem("agnType"),
      serviceDown: false,
      addCategoryList: [],
      upadateParentIds: [],
      finalObjectBind: [],
      GridNSGKeyLabel: "",
      currentPage: null,
      pageCount: null,
      pageSize: 5,
      dataSlice: [],
      sliceIndex: 0,
      editObjectId: [],
      loaderStatus:false




    }

    this.onCatgoryChange = this.onCatgoryChange.bind(this);
    this.onDescriptionChange = this.onDescriptionChange.bind(this);
    this.agnKeyChange = this.agnKeyChange.bind(this);

    this.onAGNChange = this.onAGNChange.bind(this);
    this.AGNSuggestion = this.AGNSuggestion.bind(this);
    this.onAGNSuggestionSelect = this.onAGNSuggestionSelect.bind(this);
    this.clearSuggestions = this.clearSuggestions.bind(this);

    this.validToChange = this.validToChange.bind(this);
    this.Search = this.Search.bind(this);
    this.convertDate = this.convertDate.bind(this);
    this.changeHandler = this.changeHandler.bind(this);  // ??

    this.onSave = this.onSave.bind(this);

    this.textEnabled = this.textEnabled.bind(this);
    this.getCategoryName = this.getCategoryName.bind(this);
    // this.setToEditPage = this.setToEditPage.bind(this);
    this.deleteNewExclude = this.deleteNewExclude.bind(this);

    this.onRegionChange = this.onRegionChange.bind(this);
    this.regionSuggestion = this.regionSuggestion.bind(this);
    this.onRegionSuggestionSelect = this.onRegionSuggestionSelect.bind(this);

    this.onNSGChange = this.onNSGChange.bind(this);
    this.NSGSuggestion = this.NSGSuggestion.bind(this);
    this.onNSGSuggestionSelect = this.onNSGSuggestionSelect.bind(this);

    this.onAccountChange = this.onAccountChange.bind(this);
    this.onAccountSuggestionSelect = this.onAccountSuggestionSelect.bind(this);

    this.paginationUpdateConfirmationAlert = this.paginationUpdateConfirmationAlert.bind(this);

    this.masterDataSuggestion = this.masterDataSuggestion.bind(this);

  }
  async componentWillMount() {


    AppController.datePicker(this, '', 'search');

    //localStorage.setItem("agnType", this.state.userType);


    if (localStorage.getItem("category") === "") {
      const AgnCategories = await AgnService.agnCategory();
      if (AgnCategories === null) {
        //localStorage.setItem("category", []);
      } else {

        localStorage.setItem("category", JSON.stringify(AgnCategories.category));

      }
    }



    await this.setState(() => ({ category: localStorage.getItem("category") !== "" ? JSON.parse(localStorage.getItem("category")) : [] }));

    await AppController.selectpickerUpdate("")

    //if (localStorage.getItem("filterObj") !== "") {
    await this.setState(() => ({ filterObj: localStorage.getItem("filterObj") !== "" ? JSON.parse(localStorage.getItem("filterObj")) : {} }));
    localStorage.setItem("filterObj", "");
    //this.Search();
    //}
    if (localStorage.getItem("CreateAssignment") == "true") {
      localStorage.setItem("data", []);
      await AppController.createNotification('success', localStorage.getItem("CreateAssignmentMessage"));
      //await this.setState({ update: true, message: localStorage.getItem("CreateAssignmentMessage") })
      this.setState({ update: false, message: "", modelType: -1 })
      localStorage.setItem("CreateAssignment", false)
      localStorage.setItem("CreateAssignmentMessage", "")
      {/*setTimeout(function () {
        this.setState({ update: false, message: "", modelType: -1 })
        localStorage.setItem("CreateAssignment", false)
        localStorage.setItem("CreateAssignmentMessage", "")
      }.bind(this), 5500);*/}

    }
  }

  async changePageSize(e) {
    await this.setState({ pageSize: e.target.value })
    this.pagingNumCount();
    this.createPaginatedData();
  }
  /* Pagination part start here */
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
      this.setState({ finalObjectBind: [] })
    }
    await this.setState({ currentPage: num });
    await this.createPaginatedData();
  }
  paginationUpdateConfirmationAlert(num) {

    if (Object.keys(this.state.finalObjectBind).length > 0) {
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


  createPaginatedData() {
    const data = this.state.data;
    const pageSize = this.state.pageSize;
    const currentPage = this.state.currentPage;
    const upperLimit = currentPage * pageSize;
    const dataSlice = data.slice((upperLimit - pageSize), upperLimit);

    this.setState({ dataSlice: dataSlice, sliceIndex: (upperLimit - pageSize) })
  }
  /* Pagination part ends here */

  async onCatgoryChange(e) {
    let labelkey;
    let filterObj = Object.assign({}, this.state.filterObj);
    if (e.target.value === "0") {
      filterObj.CATEGORY = "";
     
      await this.setState({ filterObj, AgnKeyLabel: "agnsearch" });
      delete filterObj.CATEGORY;
     
      await this.setState({ filterObj, AgnKeyLabel: "Account" });
      await this.setState({ GridAgnKeyLabel: "Account" });
      if ('CHAIN' in filterObj) {
            delete filterObj.CHAIN;
      }
      if ('CUSTOMER' in filterObj) {
           delete filterObj.CUSTOMER;
      }
      if ('NATIONAL_GROUP' in filterObj) {
        
        delete filterObj.NATIONAL_GROUP;
      }
      if ('NATIONAL_SUB_GROUP' in filterObj) {
        filterObj.NATIONAL_SUB_GROUP = '';
      }
     
    } else {
      if ('CHAIN' in filterObj) {
        filterObj.CHAIN = '';
      }
      if ('CHAIN' in filterObj) {
        filterObj.CHAIN = '';
      }
      if ('CUSTOMER' in filterObj) {
        filterObj.CUSTOMER = '';
      }
      if ('NATIONAL_GROUP' in filterObj) {
        filterObj.NATIONAL_GROUP = '';
      }
      if ('NATIONAL_SUB_GROUP' in filterObj) {
        filterObj.NATIONAL_SUB_GROUP = '';
      }
   
      labelkey = _.filter(this.state.category, { 'CATEGORY': e.target.value });
      filterObj.CATEGORY = e.target.value.trim();
      await this.setState({ filterObj, AgnKeyLabel: labelkey[0].DESCRIPTION });
     
    }
    
  
    
  }

  /*auto suggestion*/
  async onDescriptionChange(e) {
    let filterObj = Object.assign({}, this.state.filterObj);
    if (e.target.value.trim() === "") {
      delete filterObj.description;
    } else {
      filterObj.description = e.target.value.trim();
    }
    await this.setState({ filterObj, description: e.target.value.trim() });
  }

  async agnKeyChange(e) {
    let filterObj = Object.assign({}, this.state.filterObj);

    if (e.target.value.trim() === "") {
      delete filterObj.agnKey;
    } else {
      filterObj.agnKey = e.target.value.trim();
    }
    await this.setState({ filterObj, agnKey: e.target.value.trim() });
  }

  async onAGNChange(event, { newValue, method }) {

    let filterObj = Object.assign({}, this.state.filterObj);
    if (newValue === "") {
      delete filterObj.AGN;
    } else {
      filterObj.AGN = newValue;
    }
    await this.setState({ filterObj, agn: newValue });

    if (method == 'click') {

      await this.AGNSuggestion({ value: newValue });
      //this.autoPopulate();
    }
  }
  async onSuggestionsGroup() {

  }
  async masterDataSuggestion({ value }) {
    let filterObj = Object.assign({}, this.state.filterObj);
    filterObj.CATEGORY = filterObj.CATEGORY ? filterObj.CATEGORY : "";

    if (value.length > 0 && filterObj.CATEGORY !== "") {
      let getString = "searchstring=" + value;
      let dataResult = [];
      if (filterObj.CATEGORY == "CA") {
        dataResult = await AgnService.AccountAutoComplete({ getString: getString });
      } if (filterObj.CATEGORY == "CH") {
        dataResult = await AgnService.ChainAutoComplete({ getString: getString });
      } if (filterObj.CATEGORY == "GR") {
        getString = getString + "&level=1"
        dataResult = await AgnService.NGAutoComplete({ getString: getString });
      }
      if (filterObj.CATEGORY == "SG" || filterObj.CATEGORY == "RG") {
        getString = getString + "&level=1"
        dataResult = await AgnService.NGAutoComplete({ getString: getString });
      }
    
      //if (dataResult.results.length > 0)
      if(dataResult.results !== null)
        await this.setState({ suggestions: dataResult.results });
    }
  }
  async onRegionChange(event, { newValue, method }) {

    newValue = newValue.trim();
    let filterObj = Object.assign({}, this.state.filterObj);
    if (newValue === "") {
      delete filterObj.REGION;

    } else {
      filterObj.REGION = newValue;

    }
    await this.setState({ filterObj });

    if (method == 'click') {

      //await this.AGNSuggestion({ value: newValue });
      //this.autoPopulate();
    }
  }
  async regionSuggestion({ value }) {
    let filterObj = Object.assign({}, this.state.filterObj);
    filterObj.NATIONAL_GROUP = filterObj.NATIONAL_GROUP ? filterObj.NATIONAL_GROUP : "";
    let NGsplitArray = filterObj.NATIONAL_GROUP.split("-");
    filterObj.NATIONAL_SUB_GROUP = filterObj.NATIONAL_SUB_GROUP ? filterObj.NATIONAL_SUB_GROUP : "";
    let NSGsplitArray = filterObj.NATIONAL_SUB_GROUP.split("-");

    if (value.length > 0 && NGsplitArray.length >=2 && NSGsplitArray.length >=2) {
      let getString = "searchstring=" + value;
      getString = getString + "&level=3&group=" + NGsplitArray[0].trim() + "&subgroup=" + NSGsplitArray[0].trim();
      const dataResult = await AgnService.NGAutoComplete({ getString: getString });
      //if (dataResult.results.length > 0)
      if(dataResult.results !== null)
        await this.setState({ suggestions: dataResult.results });
    }
  }
  async onNSGChange(event, { newValue, method }) {


    let filterObj = Object.assign({}, this.state.filterObj);
    if (newValue === "") {
      delete filterObj.NATIONAL_SUB_GROUP;

    } else {
      filterObj.NATIONAL_SUB_GROUP = newValue;
    }
    await this.setState({ filterObj });

    if (method == 'click') {

      await this.NSGSuggestion({ value: newValue });
      //this.autoPopulate();
    }
  }

  async NSGSuggestion({ value }) {
   
    let filterObj = Object.assign({}, this.state.filterObj);
    filterObj.NATIONAL_GROUP = filterObj.NATIONAL_GROUP ? filterObj.NATIONAL_GROUP : "";
    let splitArray = filterObj.NATIONAL_GROUP.split("-");
    
    if (value.length > 0 && splitArray.length >= 2) {

      let getString = "searchstring=" + value;
      getString = getString + "&level=2&group=" + splitArray[0].trim();
      const dataResult = await AgnService.NGAutoComplete({ getString: getString });
       
      //if (dataResult.results.length > 0)
      if(dataResult.results !== null)
        await this.setState({ suggestions: dataResult.results });
    }
  }

  async onAccountChange(event, { newValue, method }) {
    let filterObj = Object.assign({}, this.state.filterObj);
    let keyName = "CUSTOMER";
    if (filterObj.CATEGORY == "CH") {
      keyName = "CHAIN";
    }
    if (filterObj.CATEGORY == "GR") {
      keyName = "NATIONAL_GROUP";
    }
    if (filterObj.CATEGORY == "SG" || filterObj.CATEGORY == "RG") {
      keyName = "NATIONAL_GROUP";
    }

    //  let filterObj = Object.assign({}, this.state.filterObj);
    if (newValue === "") {
      delete filterObj[keyName];
    } else {
      filterObj[keyName] = newValue;
    }
    await this.setState({ filterObj });

    if (method == 'click') {

      await this.masterDataSuggestion({ value: newValue });

    }
  }



  async AGNSuggestion({ value }) {

    //if (value.length > 0) {
    let dataResult = [];
    if (localStorage.getItem("agnOriginalData") != null) {

      dataResult = JSON.parse(localStorage.getItem("agnOriginalData")).filter(
        data =>
          (value ? data.AGN.toUpperCase().includes(value.toUpperCase()) : true) ||
          (value ? data.DESCRIPTION.toUpperCase().includes(value.toUpperCase()) : true)
      );
      await this.setState({ suggestions: dataResult });
    } else if (localStorage.getItem("agnType") != null) {

      let getString = "&AGN=" + value;
      dataResult = await AgnService.getAGN({ getString: getString, agnType: localStorage.getItem("agnType") });
      if (dataResult !== null)
        localStorage.setItem("agnOriginalData", JSON.stringify(dataResult.results));
    }

    if (dataResult !== null) {
      if (dataResult.length > 0)
        await this.setState({ suggestions: dataResult });
    }

    //}
  }

  async onAGNSuggestionSelect(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) {
    let filterObj = Object.assign({}, this.state.filterObj);
    filterObj.AGN = this.state.suggestions[suggestionIndex].AGN + (this.state.suggestions[suggestionIndex].DESCRIPTION != '' ? " - " : "") + this.state.suggestions[suggestionIndex].DESCRIPTION;
    await this.setState({ filterObj });


  }

  async onRegionSuggestionSelect(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) {
    let filterObj = Object.assign({}, this.state.filterObj);
    filterObj.REGION = this.state.suggestions[suggestionIndex].desc + " - " + this.state.suggestions[suggestionIndex].label;
    await this.setState({ filterObj });
  }

  async onNSGSuggestionSelect(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) {
    let filterObj = Object.assign({}, this.state.filterObj);
    
    filterObj.NATIONAL_SUB_GROUP = this.state.suggestions[suggestionIndex].desc + " - " + this.state.suggestions[suggestionIndex].label;
    await this.setState({ filterObj });
  }

  async onAccountSuggestionSelect(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) {


    let filterObj = Object.assign({}, this.state.filterObj);
    let keyName = "CUSTOMER";
    if (filterObj.CATEGORY == "CH") {
      keyName = "CHAIN";
    }
    if (filterObj.CATEGORY == "GR") {
      keyName = "NATIONAL_GROUP";
    }
    if (filterObj.CATEGORY == "SG" || filterObj.CATEGORY == "RG") {
      keyName = "NATIONAL_GROUP";
    }

    filterObj[keyName] = this.state.suggestions[suggestionIndex].desc + " - " + this.state.suggestions[suggestionIndex].label;
    await this.setState({ filterObj });

  }

  clearSuggestions() {
    this.setState({ suggestions: [] });
  };



  convertDate(dateString) {
    let p = dateString.split(/\D/g)
    return [p[1], p[2], p[0]].join("-")
    //return dateString;
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
    
    // if(value=="")
    // return "search";
    // // else
    // {
    const labelkey = _.filter(this.state.category, { 'CATEGORY': value });
    return labelkey[0].DESCRIPTION;
    // }
  }

  async Search() {
    await this.setState({ data: [], dataSlice:[], loaderStatus:true })
    let filterObj = Object.assign({}, this.state.filterObj);
    await this.setState({ GridNSGKeyLabel: filterObj.CATEGORY ? filterObj.CATEGORY : "AgnSearch" })
    if(this.state.AgnKeyLabel==="Account")
    await this.setState({ GridAgnKeyLabel: "Account/Chain/Group/SG" });
    else
    await this.setState({ GridAgnKeyLabel: this.state.AgnKeyLabel });
   
    let getString = "";
    $.each(this.state.filterObj, function (key, value) {
      let eachKey = "&" + key + "=" + encodeURIComponent(value);
      getString = getString + eachKey;
    });
    
    // if (Object.keys(filterObj).length > 0 && filterObj.CATEGORY !== "" && filterObj.CATEGORY !== undefined) {
      if (Object.keys(filterObj).length > 0 ) {

       await this.setState({ data: [], loaderStatus:true });

      const dataResult = await AgnService.assignmentListGet({ getString: getString, agnType: this.state.userType });
      if (dataResult === null) {
        await this.setState({ serviceDown: true, loaderStatus:false})
      } else {
        await this.setState({ data: _.filter(dataResult.assignments, function (data) { return !data.deletedFlag; }) });
        setTimeout(function () {
          this.setState({loaderStatus:false })
        }.bind(this), 1000);

      }
      await this.setState({ filterError: "", isSearch: true });

    } else {
      await AppController.createNotification('error', "Please select category or Just enter AGN to search ");
      this.setState({ loaderStatus: false });
    }
    await AppController.datePicker(this, '');
    await AppController.selectpickerUpdate("");
    this.pagingNumCount();
    this.createPaginatedData();

  }


  clear() {

    this.setState({ data: [], filterObj: {}, isSearch: false, description: "", agnKey: "", agn: "", validTo: "" })
    AppController.selectpickerUpdate("val")

  }
  deleteConfirmationAlert(row, rowIndex, mainIndex) {
    let eid = localStorage.getItem('eid') ? localStorage.getItem('eid') : "";
    if (eid === "") {
      AppController.permissionDenied();
    } else {


let obj = this.state.finalObjectBind;
console.log("first time obj",obj)
let aletMsg = Constants.AGN_CONSTANTS.ERROR_MESSAGE_FOR_DELETE;
let saveFromDelete = 0;
if(obj[mainIndex] !== undefined) {
  if(obj[mainIndex].DELETED === true){
    aletMsg = Constants.AGN_CONSTANTS.ERROR_MESSAGE_FOR_CANCEL;
    saveFromDelete = 1;
  }
}



      confirmAlert({
        title: '',
        message: aletMsg,
        buttons: [
          {
            label: 'Yes',
            onClick: this.deleteAssignment.bind(this, row, rowIndex, mainIndex, saveFromDelete)
          },
          {
            label: 'No',
            onClick: () => ""
          }
        ]
      })
    }
  }

  excludeConfirmAlert(row, rowIndex, mainIndex, assignObj) {
    let eid = localStorage.getItem('eid') ? localStorage.getItem('eid') : "";
    if (eid === "") {
      AppController.permissionDenied();
    } else {
      let obj = this.state.finalObjectBind;

      let aletMsg = Constants.AGN_CONSTANTS.ERROR_MESSAGE_FOR_DELETE;
      let saveFromDelete = 0;
      if(this.state['cancel' + mainIndex] !== undefined){

         if(this.state['cancel' + mainIndex].indexOf(rowIndex) > -1){
           aletMsg = Constants.AGN_CONSTANTS.ERROR_MESSAGE_FOR_CANCEL;
           saveFromDelete = 1;
         }

      }


      confirmAlert({
        title: '',
        message: aletMsg,
        buttons: [
          {
            label: 'Yes',
            onClick: this.deleteExistingExclude.bind(this, row, rowIndex, mainIndex, assignObj, saveFromDelete)
          },
          {
            label: 'No',
            onClick: () => ""
          }
        ]
      })
    }
  }
  async deleteNewExclude(dataIndex, keyIndex) {
    let obj = this.state.finalObjectBind;
    let dynamicKey = update(this.state[keyIndex], { $splice: [[dataIndex, 1]] });
    await this.setState({ [keyIndex]: dynamicKey })

    if (obj[keyIndex]) {
      if (obj[keyIndex]['exc']) {
        delete obj[keyIndex]['exc'][dataIndex]
      }
    }

    if (this.state[keyIndex].length == 0 && this.state['del' + keyIndex] === undefined) {

      if (obj[keyIndex]) {
        delete obj[keyIndex];
      }
    }
    this.setState({ finalObjectBind: obj });



    jQuery(function ($) {
      $('.selectpicker').selectpicker("refresh");
    })

  }
  agnNewExcludeConfirmAlert(dataIndex, keyIndex) {

    confirmAlert({
      title: '',
      message: 'Are you sure you want to delete?',
      buttons: [
        {
          label: 'Yes',
          onClick: this.deleteNewExclude.bind(this, dataIndex, keyIndex)
        },
        {
          label: 'No',
          onClick: () => ""
        }
      ]
    })
  }
  async deleteAssignment(row, rowIndex, mainIndex, saveFromDelete) {
   console.log("saveFromDelete",saveFromDelete)
    let obj = this.state.finalObjectBind;
    console.log("printing object for rows1",obj)
    if(saveFromDelete === 1){
        row.DELETED = false;
        row.CHANGEDON = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
        row.CHANGEDBY = localStorage.getItem('eid') ? localStorage.getItem('eid') : null;
        obj[mainIndex] = row;
        delete obj[mainIndex];
        delete this.state['del' + mainIndex];
        delete this.state['cancel' + mainIndex];
        delete this.state[mainIndex];
        $('.greOut' + mainIndex).removeClass("greyagnDeleted");
        $('.greOut' + rowIndex).removeClass("greyagnDeleted");
        $("#"+ rowIndex + "delete").removeClass("mdi-close-box").addClass("mdi-delete");
        $("."+ rowIndex + "delete").removeClass("mdi-close-box").addClass("mdi-delete");
        $(".child"+ rowIndex).removeClass("mdi-close-box").addClass("mdi-delete");
        $(".child"+ rowIndex).css('visibility', 'visible');
        $('.hideAddMore' + mainIndex).show();
        await this.setState({ finalObjectBind: obj });
    } else {
        $("#"+ rowIndex + "delete").removeClass("mdi-delete").addClass("mdi-close-box");
        $(".child"+ rowIndex).css('visibility', 'hidden');
        $("."+ rowIndex + "delete").removeClass("mdi-delete").addClass("mdi-close-box");
        $('.hideAddMore' + mainIndex).hide();
        $('.greOut' + rowIndex).addClass("greyagnDeleted");
        row.DELETED = true;
        row.CHANGEDON = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
        row.CHANGEDBY = localStorage.getItem('eid') ? localStorage.getItem('eid') : null;
        obj[mainIndex] = row;
        await this.setState({ finalObjectBind: obj });
  }

  }
  async deleteExistingExclude(row, rowIndex, mainIndex, assignObj, saveFromDelete) {
    let obj = this.state.finalObjectBind;

    if(saveFromDelete === 1){
      let cancelIndex = this.state['cancel' + mainIndex].indexOf(rowIndex);

      cancelIndex = cancelIndex > -1 ? cancelIndex : -1;
      if(cancelIndex > -1){

        $("." + rowIndex).removeClass("greyagnDeleted");
        $("#childDeleteIcon" + rowIndex).removeClass("mdi-close-box").addClass("mdi-delete");

        //console.log(this.state['del' + mainIndex], this.state['cancel' + mainIndex], cancelIndex)
        this.state['del' + mainIndex].splice(cancelIndex, 1);
        this.state['cancel' + mainIndex].splice(cancelIndex, 1);
        //delete this.state['del' + mainIndex][cancelIndex];
        //delete this.state['cancel' + mainIndex][cancelIndex];
      }

    } else {
      row.DELETED = true;
      row.CHANGEDON = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
      row.CHANGEDBY = localStorage.getItem('eid') ? localStorage.getItem('eid') : null;

      const dynamicKey = _.concat(this.state['del' + mainIndex] ? this.state['del' + mainIndex] : [], row);
      const cancelKey = _.concat(this.state['cancel' + mainIndex] ? this.state['cancel' + mainIndex] : [], rowIndex);
      await this.setState({ ['del' + mainIndex]: dynamicKey });
      await this.setState({ ['cancel' + mainIndex]: cancelKey })
      $("." + rowIndex).addClass("greyagnDeleted");
      $("#childDeleteIcon" + rowIndex).removeClass("mdi-delete").addClass("mdi-close-box");
    }


    let finalDellArry = [];
    if (this.state['del' + mainIndex]) {
      this.state['del' + mainIndex].forEach(function (item) {
        finalDellArry.push(item);
      });
    }
    let cancelDellArry = [];
    if (this.state['cancel' + mainIndex]) {
      this.state['cancel' + mainIndex].forEach(function (item) {
        cancelDellArry.push(item);
      });
    }
    obj[mainIndex] = assignObj;
    obj[mainIndex]['del'] = finalDellArry;
    obj[mainIndex]['cancel'] = cancelDellArry;
    await this.setState({ finalObjectBind: obj });
    //console.log(this.state['del' + mainIndex], obj, this.state.finalObjectBind );
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
    return <input id="checkBox" type="checkbox" checked={row.ownPo} disabled />
  }
  anctionFormat(cell, row, rowIndex, index) {

    return <div><a data-toggle="modal" data-target="#EditAGNGroup" onClick={this.updateModelType.bind(this, 1, row)}><i className="mdi mdi-pencil-box" data-toggle="tooltip" data-placement="top" title="" data-original-title="Edit"></i></a> <a onClick={this.deleteConfirmationAlert.bind(this, row, index)} data-toggle="tooltip" data-placement="top" title="" data-original-title="Delete"><i className="mdi mdi-delete"></i></a></div>
  }
  dateFormat(cell, row) {
    return <div>{this.convertDate(row.validTo)}</div>
  }

  async updateValue(object, index, mainIndex, assign) {

    let obj = this.state.finalObjectBind;
    const updateObj = object.startDate == undefined ? { [object.name]: { $set: object.value } } : { [object.name]: { $set: object.value }, startDate: { $set: object.startDate } }
    let addCategoryList = update(this.state[mainIndex], { [index]: updateObj });
    if (object.name == "ownPo" && !object.value) {
      addCategoryList = update(addCategoryList, { [index]: { poText: { $set: "" } } });
    }
    await this.setState({ [mainIndex]: addCategoryList });
    let finalarray = [];


    if (this.state[mainIndex]) {
      this.state[mainIndex].forEach(function (item) {
        finalarray.push(item);
      });
    }
    obj[mainIndex] = assign;
    obj[mainIndex]['exc'] = finalarray;
    await this.setState({ finalObjectBind: obj })
    //console.log(finalarray);

    //obj[mainIndex]=finalarray;

  }


  async componentDidUpdate() {


  }
  async textEnabled(id, currentObject) {   //??

    if (currentObject.target.checked) {
      $('#' + id).attr('disabled', false);
    } else {
      $('#' + id).attr('disabled', true);
    }
  }
  async hideshow(cell) {
    $("#" + cell).removeClass("collapse");
    $("#Parent" + cell).hide();

  }
  async Showhide(cell) {
    $("#" + cell).addClass("collapse");
    $("#Parent" + cell).show();
  }
  async changeHandler(type, index, totalObject, thisObject) {


    if (typeof obj[index] === "undefined") {
      obj[index] = totalObject;
      obj[index]['exclusion'] = [];
    }
    if (thisObject.target.value !== "") {
      obj[index]['action'] = "update";
      // obj[index]['changedOn'] = moment().format('YYYY-MM-DD');
      obj[index]['changedBy'] = obj[index]['createdBy'];
      obj[index][type] = thisObject.target.value;
    }



    //this.setState({EditObject:obj});

  }



  // async setToEditPage(data, thisData) {

  //   localStorage.setItem("data", JSON.stringify([data]));
  //   localStorage.setItem("filterObj", JSON.stringify(this.state.filterObj));
  //   await this.props.history.push("/add-update-agn");
  // }

  async onSave() {
    let eid = localStorage.getItem('eid') ? localStorage.getItem('eid') : "";
    if (eid === "") {
      AppController.permissionDenied();
    } else {
      let errorVal = 0;
      _.this = this
      _.forOwn(this.state.editObjectId, function (obj, Mainindex) {
        if (_.this.state[Mainindex] === undefined) {
          return false;
        }
        _.forOwn(_.this.state[Mainindex], function (ExcludeValues, index) {
          _.forOwn(ExcludeValues, function (value, key) {
         
            if (ExcludeValues.CATEGORY == "") {
              $('.' + 'CATEGORY' + Mainindex + index).addClass('errorClass')
              errorVal++
              return false;
            } else {
              $('.' + 'CATEGORY' + Mainindex + index).removeClass('errorClass')
            }


          



            if (ExcludeValues.CATEGORY == "CA") {

              if (key === "AGN_DESCRIPTION" || key === "CUSTOMER") {
                if (value == "") {

                  $('.' + key + Mainindex + index).addClass('errorClass')
                  errorVal++
                } else if (key === "CUSTOMER" && value !== "") {
                  let keyArray = value.split('-');

                  if(keyArray.length < 2){
                    $('.' + key + Mainindex + index).addClass('errorClass')
                    errorVal++
                  } else {
                    $('.' + key + Mainindex + index).removeClass('errorClass')
                  }
                } else {
                  $('.' + key + Mainindex + index).removeClass('errorClass')
                }
              }
            }

            if (ExcludeValues.CATEGORY == "CH") {
              if (key === "AGN_DESCRIPTION" || key === "CHAIN") {
                if (value == "") {
                  $('.' + key + Mainindex + index).addClass('errorClass')
                  errorVal++
                } else if (key === "CHAIN" && value !== "") {
                  let keyArray = value.split('-');
                  if(keyArray.length < 2){
                    $('.' + key + Mainindex + index).addClass('errorClass')
                    errorVal++
                  } else {
                    $('.' + key + Mainindex + index).removeClass('errorClass')
                  }
                } else {
                  $('.' + key + Mainindex + index).removeClass('errorClass')
                }
              }
            }
            if (ExcludeValues.CATEGORY == "GR") {
              if (key === "AGN_DESCRIPTION" || key === "NATIONAL_GROUP") {
                if (value == "") {
                  $('.' + key + Mainindex + index).addClass('errorClass')
                  errorVal++
                } else if (key === "NATIONAL_GROUP" && value !== "") {
                  let keyArray = value.split('-');
                  if(keyArray.length < 2){
                    $('.' + key + Mainindex + index).addClass('errorClass')
                    errorVal++
                  } else {
                    $('.' + key + Mainindex + index).removeClass('errorClass')
                  }
                } else {
                  $('.' + key + Mainindex + index).removeClass('errorClass')
                }
              }
            }
            if (ExcludeValues.CATEGORY == "SG") {
              if (key === "AGN_DESCRIPTION" || key === "NATIONAL_GROUP" || key === "NATIONAL_SUB_GROUP" ) {
               
                if (value == "") {
                  $('.' + key + Mainindex + index).addClass('errorClass')
                  errorVal++
                } else if ((key === "NATIONAL_GROUP" || key === "NATIONAL_SUB_GROUP" )  && value !== "") {
                 
                  let keyArray = value.split('-');
                  
                  if(keyArray.length < 2){
                    $('.' + key + Mainindex + index).addClass('errorClass')
                    errorVal++
                  } else {
                    $('.' + key + Mainindex + index).removeClass('errorClass')
                  }
                } else {
                  $('.' + key + Mainindex + index).removeClass('errorClass')
                }
              }
            }
          });
        });
      });

      if (errorVal == 0) {
        $("tr").removeClass("greyagnDeleted");
        $(".mdi-close-box").addClass('mdi-delete').removeClass('mdi-close-box');
          $(".mdi-delete").css('visibility', 'visible');
        await this.onSaveData();
      } else {
        await AppController.createNotification('error', Constants.AGN_CONSTANTS.ERROR_MESSAGE_FOR_VALIDAION);
      }
    }
  }

  async onSaveData() {

    let finaldataObj = [];
    const objFinal = this.state.finalObjectBind;
    const AGN_TYPE = localStorage.getItem("agnType") ? localStorage.getItem("agnType") : "";
    _.this = this
    _.forOwn(objFinal, function (mainAddedData, key) {
      //console.log('@@@@@@@@@@@@@@@@@',mainAddedData);
      delete _.this.state[key];
      delete _.this.state['del' + key];
      delete _.this.state['cancel' + key];
      $('.hideAddMore' + key).show();

      if (mainAddedData.DELETED === true) {
        //console.log('Inside delete');
        mainAddedData.CHANGEDON = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
        mainAddedData.CHANGEDBY = localStorage.getItem('eid') ? localStorage.getItem('eid') : null;
        _.forOwn(mainAddedData.exclusions.exclusion, function (newExclusionsData, key) {
          newExclusionsData.DELETED = true;
          newExclusionsData.CHANGEDON = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
          newExclusionsData.CHANGEDBY = localStorage.getItem('eid') ? localStorage.getItem('eid') : null;
          mainAddedData.exclusions.exclusion[key] = newExclusionsData;
        })
      } else {
        mainAddedData.CHANGEDON = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
        mainAddedData.CHANGEDBY = localStorage.getItem('eid') ? localStorage.getItem('eid') : null;
        mainAddedData.exclusions = { "exclusion": [] };
        _.forOwn(mainAddedData.exc, function (newExclusionsData) {
          newExclusionsData.CREATEDON = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
          newExclusionsData.CHANGEDON = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
          newExclusionsData.CREATEDBY = localStorage.getItem('eid') ? localStorage.getItem('eid') : null;
          newExclusionsData.AGN_TYPE = AGN_TYPE;
          mainAddedData.exclusions.exclusion.push(newExclusionsData);
        })
        _.forOwn(mainAddedData.del, function (deletedExclusionsData) {
          mainAddedData.exclusions.exclusion.push(deletedExclusionsData);
        })

      }
      delete mainAddedData.exc;
      delete mainAddedData.del;
      delete mainAddedData.cancel;
      finaldataObj.push(mainAddedData);
    });
    //console.log(finaldataObj, this.state.finalObjectBind);
    //console.log("finalobject===", finaldataObj, this.state.finalObjectBind);
    this.Search();
    const updateResult = await AgnService.assignmentListPost({ assignments: finaldataObj });
    if(updateResult === null){
      await AppController.createNotification('error', Constants.AGN_CONSTANTS.ERROR_MESSAGE_SERVICE_DOWN);
      this.Search();
    }else if (updateResult.status === true) {
      await AppController.createNotification('success', "Assignment list updated successfully.");
      //this.setState({ update: true, message: "Assignment list updated successfully." });
      this.setState({ finalObjectBind: [] })
      this.Search();

    } else {
      this.Search();
      await AppController.createNotification('error', updateResult.message);
      {/*await this.setState({ errorVal: 1, errorMessage: updateResult.message, finalObjectBind: [] })
      setTimeout(function () {
        this.setState({ errorVal: 0, errorMessage: "" })
      }.bind(this), 5500);*/}
    }



    setTimeout(function () {
      this.setState({ update: false, message: "", modelType: -1 })
    }.bind(this), 5500);


  }
  async checkToggle(div, e) {
    $("#" + div).toggleClass("open");
  }

  async addMore(key) {
    let eid = localStorage.getItem('eid') ? localStorage.getItem('eid') : "";
    if (eid === "") {
      AppController.permissionDenied();
    } else {
      const dynamicKey = _.concat(this.state[key] ? this.state[key] : [], [Constants.AGN_CONSTANTS.excludeObject]);
      await this.setState({ [key]: dynamicKey })
      const editObjectId = this.state.editObjectId;
      editObjectId[key] = key;
      await this.setState({ editObjectId });

      AppController.selectpickerUpdate("");
    }


  }
  closeDangerAlert() {
    $('.alert.alert-danger').hide()
  }
 
  render() {

    let keyName = "CUSTOMER";
    let placeHolderLabel = "Account";
    let filterObj = Object.assign({}, this.state.filterObj);
    if (filterObj.CATEGORY == "CH") {
      keyName = "CHAIN";
      placeHolderLabel = "Chain"
    }
    if (filterObj.CATEGORY == "GR" || filterObj.CATEGORY == "SG" || filterObj.CATEGORY == "RG") {
      keyName = "NATIONAL_GROUP";
      placeHolderLabel = "National Group";
    }




    const AgnInputProps = {
      placeholder: "Enter AGN",
      className: "form-control agn",
      value: filterObj.AGN ? filterObj.AGN : "",
      onChange: this.onAGNChange
    };
    const AccountInputProps = {
      placeholder: "Enter " + placeHolderLabel,
      className: "form-control CUSTOMER",
      value: filterObj[keyName] ? filterObj[keyName] : "",
      onChange: this.onAccountChange
    };
    const NSGInputProps = {
      placeholder: "Enter National Sub Group",
      className: "form-control NATIONAL_SUB_GROUP",
      value: filterObj.NATIONAL_SUB_GROUP ? filterObj.NATIONAL_SUB_GROUP : "",
      onChange: this.onNSGChange
    };
    const RegionInputProps = {
      placeholder: "Enter Region",
      className: "form-control REGION",
      value: filterObj.REGION ? filterObj.REGION : "",
      onChange: this.onRegionChange
    };

  const spinner = <span><img src="/images/ajax-loader.gif"/><div>Loading...</div></span>;

    return (
      <div>

      <Loader show={this.state.loaderStatus} message={spinner}>
      <Header data={this.props} />
        <div className="wrapper">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-12">
                <div className="card-box m-t-10">

                  <div className="row">
                    <div className="col-sm-12 col-md-6 col-lg-2">
                      <div className="form-group">
                        <label >Category</label>
                        <select className="form-control selectpicker" id="Category" name="Category" onChange={this.onCatgoryChange.bind(this)}>
                          <option value="0">Select Category</option>
                          {this.state.category.map(function (category) {
                            return <option key={category.CATEGORY}
                              value={category.CATEGORY}>{category.DESCRIPTION}</option>;
                          })}
                        </select>
                      </div>
                    </div>
                    {/*   <div className="col-sm-12 col-md-6 col-lg-2">
                          <div className="form-group">
                            <label>AGN Description</label>
                            <input type="text" value={this.state.description} className="form-control" placeholder="AGN Description" onChange={this.onDescriptionChange.bind(this)}/>
                          </div>
                        </div> */ }
                    <div className={filterObj.CATEGORY === 'RG' ? "col-sm-12 col-md-6 col-lg-2" : "col-sm-12 col-md-6 col-lg-3"}>
                      <div className="form-group">
                        <label >{filterObj.CATEGORY === 'RG' || filterObj.CATEGORY === 'SG' ? 'National Group' : this.state.AgnKeyLabel}</label>
                        {/*<input type="text" value={this.state.agnKey} className="form-control" placeholder={this.state.AgnKeyLabel} onChange={this.agnKeyChange.bind(this)} />*/}

                        <Autosuggest
                          suggestions={this.state.suggestions}
                          onSuggestionsFetchRequested={this.masterDataSuggestion}
                          onSuggestionsClearRequested={this.clearSuggestions}
                          getSuggestionValue={masterDataSuggestionValue}
                          renderSuggestion={renderMasterDataSuggestion}
                          inputProps={AccountInputProps}
                          onSuggestionSelected={this.onAccountSuggestionSelect} />

                      </div>
                    </div>
                    {filterObj.CATEGORY === 'SG' || filterObj.CATEGORY == 'RG'?
                      <div className={filterObj.CATEGORY === 'SG'? "col-sm-12 col-md-6 col-lg-2" : "col-sm-12 col-md-6 col-lg-2"}>
                        <div className="form-group">
                          <label >National Sub Group</label>
                          <Autosuggest
                            suggestions={this.state.suggestions}
                            onSuggestionsFetchRequested={this.NSGSuggestion}
                            onSuggestionsClearRequested={this.clearSuggestions}
                            getSuggestionValue={masterDataSuggestionValue}
                            renderSuggestion={renderMasterDataSuggestion}
                            inputProps={NSGInputProps}
                            onSuggestionSelected={this.onNSGSuggestionSelect} />
                        </div>
                      </div> : ""}
                    {filterObj.CATEGORY === 'RG' ? <div className="col-sm-12 col-md-6 col-lg-2">
                      <div className="form-group">
                        <label >Region</label>
                        <Autosuggest
                          suggestions={this.state.suggestions}
                          onSuggestionsFetchRequested={this.regionSuggestion}
                          onSuggestionsClearRequested={this.clearSuggestions}
                          getSuggestionValue={masterDataSuggestionValue}
                          renderSuggestion={renderMasterDataSuggestion}
                          inputProps={RegionInputProps}
                          onSuggestionSelected={this.onRegionSuggestionSelect} />
                      </div>
                    </div> : ""}

                    <div className={filterObj.CATEGORY === 'RG' ? "col-sm-12 col-md-6 col-lg-2" : "col-sm-12 col-md-6 col-lg-3"}>
                      <div className="form-group">
                        <label >AGN</label>
                        <Autosuggest
                          suggestions={this.state.suggestions}
                          onSuggestionsFetchRequested={this.AGNSuggestion}
                          onSuggestionsClearRequested={this.clearSuggestions}
                          getSuggestionValue={agnSuggestionValue}
                          renderSuggestion={renderAgnSuggestion}
                          inputProps={AgnInputProps}
                          onSuggestionSelected={this.onAGNSuggestionSelect} />
                      </div>
                    </div>
                    <div className="col-sm-12 col-md-6 col-lg-2">
                      <div className="m-t-30 searchBtn-wrap">
                        <button type="button" className="btn btn-primary waves-light waves-effect" data-toggle="tooltip" data-placement="top" title="Search" onClick={this.Search.bind(this)}><i className="mdi mdi-magnify"></i></button>
                        <button type="button" className="btn btn-warning waves-light waves-effect m-l-5" data-toggle="tooltip" data-placement="top" title="Clear" onClick={this.clear.bind(this)}><i className="mdi mdi-close"></i></button>

                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-12">
                      <div className="pull-right searchBtn-wrap">
                        <Link to="/create-assignment" className="btn btn-primary waves-light waves-effect"><i className="mdi mdi-plus"></i> Create Assignment</Link>

                      </div>
                    </div>
                  </div>
                </div>
              </div>


            </div>

            <div className={(!this.state.isSearch && this.state.dataSlice.length == 0) ? "row NotDisplay" : "row"}>
              <div className="col-md-12">
                <div className="card-box">


                  {(this.state.isSearch && this.state.dataSlice.length == 0) ? (this.state.serviceDown === true ? <ServiceDown /> : <NoDataFound />) : ""}
                  {this.state.dataSlice.length > 0 ?

                    <table className="table fold-table">
                      <thead>
                        <tr>
                          <th>{this.state.GridNSGKeyLabel === 'RG' ||this.state.GridNSGKeyLabel === 'SG' ? 'National Group' : this.state.GridAgnKeyLabel}</th>
                          {this.state.GridNSGKeyLabel === 'SG' ||this.state.GridNSGKeyLabel === 'RG' ? <th>National Sub Group</th> : ""}
                          {this.state.GridNSGKeyLabel === 'RG' ? <th>Region</th> : ""}
                          <th>AGN</th>
                          <th className="validToFrom">Valid From</th>
                          <th className="validToFrom">Valid To</th>
                          <th className="action-space">Action</th>
                        </tr>
                      </thead>
                      
                      {this.state.dataSlice.map((assign, index) => {
                         assign.ID=assign.AGN + assign.OWN_PO+assign.CATEGORY
                        return <tbody key={index}>
                         
                          <tr id={"Parentpid" + assign.ID } className={"greOut" + index+assign.AGN_KEY+assign.ID}>
                            <td className="toggle-icon">
                              <i id={"EToggle" + assign.ID} className="mdi mdi-chevron-down" data-toggle={"collapse"} data-target={"#demo" + index} onClick={this.checkToggle.bind(this, "EToggle" + assign.ID)}></i>
                              {/* {this.state.GridNSGKeyLabel == 'AgnSearch' ? assign.CATEGORY +"-"+assign.CUSTOMER+assign.CHAIN+"/"+"/"+assign.NATIONAL_GROUP+"/"+assign.NATIONAL_SUB_GROUP+"/"+assign.REGION: ""} */}
                              {this.state.GridNSGKeyLabel == 'AgnSearch' && assign.CATEGORY=='CA' ? assign.CATEGORY+"-"+assign.CUSTOMER :""}
                              {this.state.GridNSGKeyLabel == 'AgnSearch' && assign.CATEGORY=='CH' ? assign.CATEGORY+"-"+assign.CHAIN :""}
                              {this.state.GridNSGKeyLabel == 'AgnSearch' && assign.CATEGORY=='GR' ? assign.CATEGORY+"-"+assign.NATIONAL_GROUP :""}
                              {this.state.GridNSGKeyLabel == 'AgnSearch' && assign.CATEGORY=='SG' ? assign.CATEGORY+"-"+assign.NATIONAL_GROUP+"/"+assign.NATIONAL_SUB_GROUP :""}
                              {this.state.GridNSGKeyLabel == 'AgnSearch' && assign.CATEGORY=='RG' ? assign.CATEGORY+"-"+assign.NATIONAL_GROUP+"/"+assign.NATIONAL_SUB_GROUP+"/"+assign.REGION :""}
                             
                              {this.state.GridNSGKeyLabel == 'CA' ? assign.CUSTOMER : ""}{this.state.GridNSGKeyLabel == 'CH' ? assign.CHAIN : ""}{this.state.GridNSGKeyLabel == 'GR' || this.state.GridNSGKeyLabel == 'SG' || this.state.GridNSGKeyLabel == 'RG' ? assign.NATIONAL_GROUP : ""}</td>
                            {this.state.GridNSGKeyLabel === 'SG' ? <td>{assign.NATIONAL_SUB_GROUP}</td> : ""}
                            {this.state.GridNSGKeyLabel === 'RG' ? <td>{assign.NATIONAL_SUB_GROUP}</td> : ""}
                            {this.state.GridNSGKeyLabel === 'RG' ? <td>{assign.REGION}</td> : ""}
                            <td>{assign.AGN +"-"+assign.AGN_DESCRIPTION }</td>
                            <td>{this.convertDate(assign.VALID_FROM)}</td>
                            <td>{this.convertDate(assign.VALID_TO)}</td>
                            <td className="action-link btn-exclude">

                              <a onClick={this.deleteConfirmationAlert.bind(this, assign, (index+assign.AGN_KEY+assign.ID), (assign.AGN + assign.CATEGORY+assign.AGN_KEY))}>  <i className={"mdi mdi-delete"+" "+ index+assign.AGN_KEY+assign.ID+"delete"} aria-hidden="true"></i></a>
                            </td>
                           
                          </tr>


                          <tr id={"demo" + index} className="collapse">
                            <td colSpan="9">
                              <div className="fold-content">
                                <table className="table">
                                  <thead>
                                    <tr>
                                      <th className="editFieldDisplay">Exclusion</th>
                                      <th className="editFieldDisplay longFieldWidth">Account / Chain / National Group</th>
                                      <th className="editFieldDisplay">National Sub Group</th>
                                      <th className="editFieldDisplay">Region</th>
                                      <th className="editFieldDisplay validToFrom">Valid From</th>
                                      <th className="editFieldDisplay validToFrom">Valid To</th>
                                      <th className="AheaderWidth text-center">
                                        {(this.state[assign.ID + assign.CATEGORY+assign.AGN_KEY] != undefined ? this.state[assign.ID + assign.CATEGORY + assign.AGN_KEY].length : 0) < Constants.AGN_CONSTANTS.MAX_ROW_CREATION_LIMIT ? (<button onClick={this.addMore.bind(this, assign.ID + assign.CATEGORY+assign.AGN_KEY)} type="button" className={"btn btn-sm btn-primary waves-light waves-effect pull-right mr-2 hideAddMore" + assign.ID + assign.CATEGORY+assign.AGN_KEY} data-toggle="tooltip" data-placement="top" title="Add"><i className="mdi mdi-plus"></i></button>) : ""}
                                      </th>
                                    </tr>
                                  </thead>
                                  {assign.exclusions != null ?
                                    <tbody>
                                      {assign.exclusions.exclusion.map((exclusionRow, index1) => {
                                        return  <tr key={index1 + exclusionRow.CATEGORY} id={"ParentSUBdemo" + index1 + assign.AGN} className={index1 + exclusionRow.CATEGORY + assign.ID + assign.CATEGORY + assign.AGN_KEY + " greOut" + assign.ID + assign.CATEGORY + assign.AGN_KEY}>
                                          <td className="editFieldDisplay">{this.getCategoryName(exclusionRow.CATEGORY)}</td>
                                          <td className="editFieldDisplay">{exclusionRow.CATEGORY == 'CA' ? exclusionRow.CUSTOMER : ""}{exclusionRow.CATEGORY == 'CH' ? exclusionRow.CHAIN : ""}{exclusionRow.CATEGORY == 'GR' || exclusionRow.CATEGORY == 'SG' ||exclusionRow.CATEGORY == 'RG' ? exclusionRow.NATIONAL_GROUP : ""}</td>
                                          <td className="editFieldDisplay">{exclusionRow.CATEGORY == 'SG' ||exclusionRow.CATEGORY == 'RG' ? exclusionRow.NATIONAL_SUB_GROUP : ""}</td>
                                          <td className="editFieldDisplay">{exclusionRow.CATEGORY == 'SG' ||exclusionRow.CATEGORY == 'RG' ? exclusionRow.REGION : ""}</td>
                                          <td className="editFieldDisplay">{this.convertDate(exclusionRow.VALID_FROM)}</td>
                                          <td className="editFieldDisplay">{this.convertDate(exclusionRow.VALID_TO)}</td>
                                          <td className="action-link text-center">
                                            <a onClick={this.excludeConfirmAlert.bind(this, exclusionRow, (index1 + exclusionRow.CATEGORY + assign.ID + assign.CATEGORY), (assign.ID + assign.CATEGORY + assign.AGN_KEY), assign)}> <i className={"mdi mdi-delete" + " child" + index + assign.ID + assign.CATEGORY + assign.AGN_KEY} id={"childDeleteIcon"+ index1 + exclusionRow.CATEGORY + assign.ID + assign.CATEGORY} aria-hidden="true"></i></a>
                                          </td>
                                        </tr>

                                      })}
                                    </tbody> : (this.state[assign.ID + assign.CATEGORY] != undefined ? this.state[assign.ID + assign.CATEGORY].length : 0) == 0 ? <tbody><tr><td colSpan="9" className="alignCenter">There is no existing exclude list</td></tr></tbody> : ""}
                                  {this.state[assign.ID + assign.CATEGORY+assign.AGN_KEY] != undefined ? <tbody>
                                    {this.state[assign.ID + assign.CATEGORY+assign.AGN_KEY].map((object, newindex) => {
                                      return <ExclusionForm {...this.state}
                                        rowData={object}
                                        agnCategory={assign.category}
                                        keyValue={newindex}
                                        addMore={this.addMore.bind(this)}
                                        assign={assign}
                                        mainIndex={assign.ID + assign.CATEGORY+assign.AGN_KEY}
                                        deleteConfirmationAlert={this.agnNewExcludeConfirmAlert.bind(this, newindex, assign.ID + assign.CATEGORY+assign.AGN_KEY)}
                                        updateValue={this.updateValue.bind(this)}
                                        key={'new' + newindex} />
                                    })} </tbody> : ""}
                                </table>
                              </div>
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
                          onChange={this.paginationUpdateConfirmationAlert}
                        />
                      </div>

                      <div className="">
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

                    </div>
                  </div> : ""}

                </div>
                {this.state.data.length > 0 ? <div className="justify-content-end agnSave" id="SaveButton">
                  <div className="card-fl-item">
                    {Object.keys(this.state.finalObjectBind).length > 0 ? <span className="btn btn-primary waves-light waves-effect" onClick={this.onSave.bind(this)}>Save</span> : ""}
                  </div>
                </div> : ""}
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

export default AssignmentList
