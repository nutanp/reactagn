import React from 'react';
import _ from 'lodash';
import Loadjs from 'loadjs';
import Header from './common/Header';
import Footer from './common/Footer';
import AgnService from '../../services/agnService'
import Constants from '../../constants'
import AssignmentForm from './AssignmentForm'
import update from 'react-addons-update';
import $ from "jquery";
import { confirmAlert } from 'react-confirm-alert';
import moment from 'moment'
import { Link } from 'react-router-dom';
import AppController from '../controllers/appController';


class CreateAssignment extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      category: [],
      addCategoryList: [Constants.AGN_CONSTANTS.createAssignmentObject],
      errorVal: 0,
      errorMessage: '',
      agnCategory: '',
      AgnKeyLabel: "Account",
      keyName: "CUSTOMER",
      isAdded: false 

    }
    this.onCategoryChange = this.onCategoryChange.bind(this);

  }

  async componentWillMount() {


    if (localStorage.getItem("category") === null) {
    
      const AgnCategories = await AgnService.agnCategory();
      if (AgnCategories !== null) {

        localStorage.setItem("category", JSON.stringify(AgnCategories.category));

      }
    }
    await this.setState(() => ({ category: localStorage.getItem("category") ? JSON.parse(localStorage.getItem("category")) : [] }));
    await AppController.selectpickerUpdate("")


  }
  async componentDidMount() {

  }

  async updateValue(object, index) {
    
    const updateObj = object.startDate == undefined ? { [object.name]: { $set: object.value } } : { [object.name]: { $set: object.value }, startDate: { $set: object.startDate } }
   
    let addCategoryList = update(this.state.addCategoryList, { [index]: updateObj });
    if (object.name == "ownPo" && !object.value) {
      addCategoryList = update(addCategoryList, { [index]: { poText: { $set: "" } } });
    }
    await this.setState({ addCategoryList });

    $('.' + object.name + index).removeClass('errorClass')
   
  }

  async onCategoryChange(e) {

    $('input').removeClass('errorClass');
    if (e.target.value != "") {

      let keyName = "CUSTOMER";
      if (e.target.value == "CH") {
        keyName = "CHAIN";
      }
      if (e.target.value == "GR") {
        keyName = "NATIONAL_GROUP";
      }
      if (e.target.value == "SG") {
        keyName = "NATIONAL_GROUP";
      }
      if (e.target.value == "RG") {
        keyName = "NATIONAL_GROUP";
      }

      const labelkey = _.filter(this.state.category, { 'CATEGORY': e.target.value });
      this.setState({ keyName, agnCategory: e.target.value, AgnKeyLabel: labelkey[0].DESCRIPTION })
      await this.setState({ addCategoryList: [Constants.AGN_CONSTANTS.createAssignmentObject] });
    } else {

      await this.setState({ keyName: "CUSTOMER", agnCategory: "", AgnKeyLabel: "Account", addCategoryList: [Constants.AGN_CONSTANTS.createAssignmentObject] });

    }

  }



  addMore() {
    const addCategoryList = _.concat(this.state.addCategoryList, [Constants.AGN_CONSTANTS.createAssignmentObject]);
    this.setState({ addCategoryList });

    AppController.selectpickerUpdate("")

  }
  async deleteRow(dataIndex) {

    $('input').removeClass('errorClass');
    await this.setState({ addCategoryList: update(this.state.addCategoryList, { $splice: [[dataIndex, 1]] }) });

    jQuery(function ($) {
      $('.selectpicker').selectpicker("refresh");
    })

  }
  deleteConfirmationAlert(dataIndex) {

    confirmAlert({
      title: '',
      message: 'Are you sure you want to delete ?',
      buttons: [
        {
          label: 'Yes',
          onClick: this.deleteRow.bind(this, dataIndex)
        },
        {
          label: 'No',
          onClick: () => ""
        }
      ]
    })
  }
  cancelButton() {
    confirmAlert({
      title: '',
      message: 'Are you sure you want to cancel?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => { this.props.history.push("/assignment-list") }
        },
        {
          label: 'No',
          onClick: () => ""
        }
      ]
    })
  }
  async createAgn() {
    let eid = localStorage.getItem('eid') ? localStorage.getItem('eid') : "";
    if (eid === "") {
      AppController.permissionDenied();
    } else {
     
      let errorVal = 0
      if (this.state.agnCategory == "") {
        $('.category').addClass('errorClass')
        errorVal++
      } else {
        $('.category').removeClass('errorClass')
      }
      let categoryCheck = this.state.agnCategory;

      _.forEach(this.state.addCategoryList, function (obj, index) {
        _.forEach(obj, function (value, key) {
         
          if (categoryCheck !== "") {
              if (key === "AGN") {
                if (value.trim() === "") {

                  $('.' + "AGN_DESCRIPTION" + index).addClass('errorClass')
                  errorVal++
                }
              }

              if (key === "AGN_KEY") {
                let errorlabel = "notthere";
                if (categoryCheck == "CA") {
                  errorlabel = "CUSTOMER";
                } else if(categoryCheck == "CH") {
                  errorlabel = "CHAIN";
                } else if(categoryCheck == "GR") {
                  errorlabel = "NATIONAL_GROUP";
                }else if(categoryCheck == "SG") {
                  errorlabel = "NATIONAL_GROUP";
                }
                if (value.trim() === "") {

                  $('.' + errorlabel + index).addClass('errorClass')
                  errorVal++
                }
              }
          }

          if (categoryCheck == "CA") {
             console.log("save button",value);
            if (key === "AGN_DESCRIPTION" || key === "CUSTOMER") {
              if (value.trim() === "") {

                $('.' + key + index).addClass('errorClass')
                errorVal++
              } if (key === "CUSTOMER" && value !== "") {
                let keyArray = value.split('-');
                if(keyArray.length < 2){
                  $('.' + key + index).addClass('errorClass')
                  errorVal++
                }
              }
            }
          }
          if (categoryCheck == "CH") {
            if (key === "AGN_DESCRIPTION" || key === "CHAIN") {
              if (value.trim() === "") {
                $('.' + key + index).addClass('errorClass')
                errorVal++
              } if (key === "CHAIN" && value !== "") {
                let keyArray = value.split('-');
                if(keyArray.length < 2){
                  $('.' + key + index).addClass('errorClass')
                  errorVal++
                }
              }
            }
          }
          if (categoryCheck == "GR") {
            if (key === "AGN_DESCRIPTION" || key === "NATIONAL_GROUP") {
              if (value.trim() === "") {
                $('.' + key + index).addClass('errorClass')
                errorVal++
              } if (key === "NATIONAL_GROUP" && value !== "") {
                let keyArray = value.split('-');
                if(keyArray.length < 2){
                  $('.' + key + index).addClass('errorClass')
                  errorVal++
                }
              }
            }
          }
          if (categoryCheck == "SG") {
            if (key === "AGN_DESCRIPTION" || key === "NATIONAL_GROUP" || key === "NATIONAL_SUB_GROUP") {

              if (value.trim() === "") {
                $('.' + key + index).addClass('errorClass')
                errorVal++
              } if ((key === "NATIONAL_GROUP" || key === "NATIONAL_SUB_GROUP") && value !== "") {
                let keyArray = value.split('-');
                if(keyArray.length < 2){
                  $('.' + key + index).addClass('errorClass')
                  errorVal++
                }
              }

            }
          }
          if (categoryCheck == "RG") {
            if (key === "AGN_DESCRIPTION" || key === "NATIONAL_GROUP" || key === "NATIONAL_SUB_GROUP" || key === "REGION") {

              if (value.trim() === "") {
                $('.' + key + index).addClass('errorClass')
                errorVal++
              } if ((key === "NATIONAL_GROUP" || key === "NATIONAL_SUB_GROUP" || key === "REGION") && value !== "") {
                let keyArray = value.split('-');
                if(keyArray.length < 2){
                  $('.' + key + index).addClass('errorClass')
                  errorVal++
                }
              }

            }
          }
         
        });

      });

      if (errorVal === 0) {

        //await this.setState({ errorVal, errorMessage: "" })
        await this.saveAgnData()
      } else {
        await AppController.createNotification('error', Constants.AGN_CONSTANTS.ERROR_MESSAGE_FOR_VALIDAION);
        //await this.setState({ errorVal, errorMessage: Constants.AGN_CONSTANTS.ERROR_MESSAGE_FOR_VALIDAION })
      }
    }

  }
  async saveAgnData() {
    if (this.state.errorVal == 0) {
      const agns = JSON.parse(localStorage.getItem("agnOriginalData"));
      $('.alert.alert-danger').hide()
      const addCateoryKey = this.state.agnCategory;
      
      const agnType = localStorage.getItem("agnType") ? localStorage.getItem("agnType") : "";
      const eid = localStorage.getItem('eid') ? localStorage.getItem('eid') : null;
      const finalData = _.forEach(this.state.addCategoryList, function (obj, key) {
        var agnSelected = null;
        if(obj.AGN != null && obj.AGN != undefined && obj.AGN != ''){
          agnSelected = agns.filter(agn => agn.AGN===obj.AGN);
        }
        obj.CATEGORY = addCateoryKey;
        obj.CREATEDON = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
        obj.CREATEDBY = eid;
        obj.AGN_TYPE = agnType;
        obj.CHANGEDON = "";
        obj.CHANGEDBY = "";
        obj.exclusions = {};
        obj.exclusions.exclusion=[];
        obj.OWN_PO = agnSelected != null ? agnSelected[0].OWN_PO : false;
        obj.PO_TEXT = agnSelected != null ? agnSelected[0].PO_TEXT : '';

      })
      await this.setState({ addCategoryList: finalData });

      const dataResult = await AgnService.assignmentListPost({ assignments: this.state.addCategoryList })

      if(dataResult === null){
        await AppController.createNotification('error', Constants.AGN_CONSTANTS.ERROR_MESSAGE_SERVICE_DOWN);

      } else if (dataResult.status === false) {
        await AppController.createNotification('error', dataResult.message);
        //await this.setState({ errorVal: 1, errorMessage: dataResult.message })
        jQuery(function ($) {
          $('.selectpicker').selectpicker("refresh");
        })

      } else if (dataResult.status === true) {
        localStorage.setItem("CreateAssignment", true)
        localStorage.setItem("CreateAssignmentMessage", "Assignments created successfully")
        await this.props.history.push("/assignment-list");
      } else {
        await AppController.createNotification('error', Constants.AGN_CONSTANTS.ERROR_MESSAGE_SERVICE_DOWN);

      }


    } else {
      $('.alert.alert-danger').show()
    }
  }
  closeDangerAlert() {
    $('.alert.alert-danger').hide()
  }


  render() {

    return (<div>
      <Header data={this.props} />
      <div className="wrapper">
        <div className={this.state.agnCategory !== 'RG' ? "col-md-10 mar-lr-auto" : ""}>
          <div className="container-fluid table-no-space">
            <div className="row m-t-10 m-b-10">

              <div className="col-sm-12">
                <div className="col-sm-3">

                </div>
                {this.state.errorVal > 0 ? <div className="row">
                  <div className="col-sm-12">
                    <div className="alert alert-danger" role="alert"><button type="button" className="close" aria-label="Close"> <span aria-hidden="true"><i className="mdi mdi-close" onClick={this.closeDangerAlert.bind(this)}></i></span> </button> {this.state.errorMessage}</div>
                  </div>
                </div> : ""}
                {this.state.isAdded ? <div className="row">
                  <div className="col-sm-12">
                    <div className="alert alert-success" role="alert"><button type="button" className="close" aria-label="Close"> <span aria-hidden="true"><i className="mdi mdi-close" onClick={this.closeDangerAlert.bind(this)}></i></span> </button>Success: AGN Assignments added Successfully</div>
                  </div>
                </div> : ""}
                <div className="row form-block">
                  <div className="col-sm-3">
                    <div className="form-group">
                      <label htmlFor="">Category</label>

                      <select value={this.state.agnCategory} className={"form-control selectpicker category"} data-minimum-results-for-search="Infinity" onChange={this.onCategoryChange.bind(this)}>
                        <option value="">Select Category</option>
                        {this.state.category ? this.state.category.map((categoryRow, index) => {

                          return <option value={categoryRow.CATEGORY} key={index}>{categoryRow.DESCRIPTION}</option>
                        }) : ''}

                      </select>
                    </div>
                  </div>
                  <div className="col-sm-9 form-btn">
                    {this.state.addCategoryList.length < Constants.AGN_CONSTANTS.MAX_ROW_CREATION_LIMIT && this.state.agnCategory != "" ?
                      <button onClick={this.addMore.bind(this)} type="button" className="btn btn-primary waves-light waves-effect pull-right" data-toggle="tooltip" data-placement="top" title="Add"><i className="mdi mdi-plus"></i></button>
                      : ""}
                  </div>


                </div>
              </div>
            </div>



            <table className="table fold-table">
              <thead>
                <tr>

                  {this.state.agnCategory == 'SG' || this.state.agnCategory == 'RG' ? <th>National Group</th> : <th>{this.state.AgnKeyLabel}</th>}
                  {this.state.agnCategory == 'SG' || this.state.agnCategory == 'RG' ? <th>National Sub Group</th> : ""}
                  {this.state.agnCategory == 'RG' ? <th>Region</th> : ""}
                  {/*<th className="nationsubgroup">{this.state.AgnKeyLabel} Description</th>*/}
                  <th>AGN</th>
                  {/*<th>AGN Description</th>*/}
                  <th className="validToFrom">Valid From</th>
                  <th className="validToFrom">Valid To</th>
                  <th className="ActionWidth">{this.state.addCategoryList.length > 1 ? "Action"  : ""}</th>
                </tr>
              </thead>
              <tbody>
                {this.state.addCategoryList.map((object, index) => {
                  return <AssignmentForm {...this.state}
                    rowData={object}
                    keyValue={index}
                    addMore={this.addMore.bind(this)}
                    deleteConfirmationAlert={this.deleteConfirmationAlert.bind(this, index)}
                    updateValue={this.updateValue.bind(this)}
                    key={index} />
                })}
              </tbody>
            </table>
            <div className="row">
              <div className="col-sm-12">
                <hr className="hr-nospace" />
                <div className="d-flex flex-row-reverse">
                  {this.state.agnCategory != "" ?
                    <button type="button" className="btn btn-primary btn-lg waves-light waves-effect m-l-5" onClick={this.createAgn.bind(this)}>Save</button>
                    : ""}
                  <button type="button" className="btn btn-light btn-lg waves-light waves-effect" onClick={this.cancelButton.bind(this)}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>)

  }


}

export default CreateAssignment
