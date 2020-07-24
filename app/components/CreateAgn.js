import React from 'react';
import _ from 'lodash';
import Header from './common/Header';
import Footer from './common/Footer';
import AgnService from '../../services/agnService'
import Constants from '../../constants'
import AgnForm from './AgnForm'
import update from 'react-addons-update';
import $ from "jquery";
import { confirmAlert } from 'react-confirm-alert';
import moment from 'moment'
import { Link } from 'react-router-dom';
import AppController from '../controllers/appController';


class CreateAgn extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      category: [],
      AGNCreateObject: [Constants.AGN_CONSTANTS.agnObject],
      errorVal: 0,
      errorMessage: '',
      agnCategory: 'CA',
      AgnKeyLabel: "AGN",
      isAGNAdded: false   

    }
    this.onCategoryChange = this.onCategoryChange.bind(this);

  }

  async componentWillMount() {

    if (localStorage.getItem("category") == null) {
      const AgnCategories = await AgnService.agnCategory();
      localStorage.setItem("category", JSON.stringify(AgnCategories.category));
    }
    await this.setState(() => ({ category: localStorage.getItem("category") !== "" ? JSON.parse(localStorage.getItem("category")) : [] }));
    await AppController.selectpickerUpdate("")

  }

  async componentDidMount() {

  }

  updateValue(object, index) {

    const updateObj = object.startDate == undefined ? { [object.name]: { $set: object.value } } : { [object.name]: { $set: object.value }, startDate: { $set: object.startDate } }
    let AGNCreateObject = update(this.state.AGNCreateObject, { [index]: updateObj });
    if (object.name == "ownPo" && !object.value) {
      AGNCreateObject = update(AGNCreateObject, { [index]: { poText: { $set: "" } } });
    }
    this.setState({ AGNCreateObject });
    $('.' + object.name + index).removeClass('errorClass')

  }

  async onCategoryChange(e) {
    const labelkey = _.filter(this.state.category, { 'category': e.target.value });
    this.setState({ agnCategory: e.target.value, AgnKeyLabel: labelkey[0].description })
  }



  addMore() {
    const AGNCreateObject = _.concat(this.state.AGNCreateObject, [Constants.AGN_CONSTANTS.agnObject]);
    this.setState({ AGNCreateObject });
    // console.log(addCategoryList);
    AppController.selectpickerUpdate("")

  }
  async deleteRow(dataIndex) {

    await this.setState({ AGNCreateObject: update(this.state.AGNCreateObject, { $splice: [[dataIndex, 1]] }) });
    jQuery(function ($) {
      $('.selectpicker').selectpicker("refresh");
    })

  }
  deleteConfirmationAlert(dataIndex) {

    confirmAlert({
      title: '',
      message: 'Are you sure you want to delete?',
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
          onClick: () => { this.props.history.push("/") }
        },
        {
          label: 'No',
          onClick: () => ""
        }
      ]
    })
  }
 checkExistingAgnList(value){
  const dataResult = JSON.parse(localStorage.getItem("agnOriginalData")).filter(
    data => data.AGN.toLowerCase() === value.toLowerCase()
  );
  return dataResult.length;
}
  async createAgn() {
    let eid = localStorage.getItem('eid') ? localStorage.getItem('eid') : "";
    if (eid === "") {
      AppController.permissionDenied();
    } else {
      let errorVal = 0;
      let agnError =0;
     _.this = this;
      _.forEach(this.state.AGNCreateObject, function (obj, index) {
        _.forEach(obj, function (value, key) {

          if ((key === "OWN_PO" && (value === "" || value === false)) || key === "CREATEDBY" || key === "AGN_TYPE" || key === "CHANGEDON" || key === "CHANGEDBY" || key === "DELETED") {
          }
          else if(key === "AGN" && value !== ""){
            let resultAgn = _.this.checkExistingAgnList(value);
            if(resultAgn > 0) {
              $('.' + key + index).addClass('errorClass')
              agnError++
            } else {
                $('.' + key + index).removeClass('errorClass')
            }
          }else if (key === "PO_TEXT") {
            if (obj['OWN_PO'] === true && value.trim() === "") {
              $('.' + key + index).addClass('errorClass')
              errorVal++
            }
          } else if (key === "PO_TEXT" && obj['OWN_PO'] === false) {
            $('.' + key + index).removeClass('errorClass')
          } else if (key !== 'OWN_PO') {
            if (value.trim() === "") {
              $('.' + key + index).addClass('errorClass')
              errorVal++
            }
          } else {
            $('.' + key + index).removeClass('errorClass')
          }
        });

      });

      if(errorVal > 0){
        await AppController.createNotification('error', Constants.AGN_CONSTANTS.ERROR_MESSAGE_FOR_VALIDAION);
      }else if(agnError > 0){
        //await this.setState({ errorVal, errorMessage: Constants.AGN_CONSTANTS.ERROR_MESSAGE_FOR_VALIDAION })
        await AppController.createNotification('error', Constants.AGN_CONSTANTS.ERROR_MESSAGE_AGN_ALREADY_EXISTS);
      } else {
        await this.setState({ errorVal, errorMessage: "" })
        await this.saveAgnData()
      }
    }

  }
  async saveAgnData() {


    if (this.state.errorVal === 0) {
      let passData = []
      $('.alert.alert-danger').hide()

      const AGN_TYPE = localStorage.getItem("agnType");
      const finalData = _.forEach(this.state.AGNCreateObject, function (obj, key) {
        obj.AGN_TYPE = AGN_TYPE;
        obj.CREATEDBY = localStorage.getItem('eid') ? localStorage.getItem('eid') : null;
        obj.CHANGEDBY = localStorage.getItem('eid') ? localStorage.getItem('eid') : null;
        obj.CHANGEDON = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
      })

      await this.setState({ AGNCreateObject: finalData });

      const dataResult = await AgnService.createAGN({ agns: this.state.AGNCreateObject })


      if(dataResult === null){
        await AppController.createNotification('error', Constants.AGN_CONSTANTS.ERROR_MESSAGE_SERVICE_DOWN);

      } else if (dataResult.status === true) {

        localStorage.setItem("createAGN", true)
        localStorage.setItem("createAgnMessage", "AGN created successfully")
        await this.props.history.push("/")


      } else {
        await AppController.createNotification('error', dataResult.message);
        //await this.setState({ errorVal: 1, errorMessage: dataResult.message })
        jQuery(function ($) {
          $('.selectpicker').selectpicker("refresh");
        })

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
        <div className="container-fluid table-no-space">

          <div className="col-md-10 mar-lr-auto">
            <div className="row m-t-10 m-b-10 ">

              <div className="col-sm-12">
                <div className="col-sm-3">

                </div>
                {this.state.errorVal > 0 ? <div className="row">
                  <div className="col-sm-12">
                    <div className="alert alert-danger" role="alert"><button type="button" className="close" aria-label="Close"> <span aria-hidden="true"><i className="mdi mdi-close" onClick={this.closeDangerAlert.bind(this)}></i></span> </button> {this.state.errorMessage}</div>
                  </div>
                </div> : ""}
                {this.state.isAGNAdded ? <div className="row">
                  <div className="col-sm-12">
                    <div className="alert alert-success" role="alert"><button type="button" className="close" aria-label="Close"> <span aria-hidden="true"><i className="mdi mdi-close" onClick={this.closeDangerAlert.bind(this)}></i></span> </button>Success: AGN added Successfully</div>
                  </div>
                </div> : ""}
                <div className="row form-block">
                  <div className="col-sm-3">
                    <div className="form-group">

                    </div>
                  </div>
                  <div className="col-sm-9 form-btn fixedheight">
                    {this.state.AGNCreateObject.length < Constants.AGN_CONSTANTS.MAX_ROW_CREATION_LIMIT ? <button onClick={this.addMore.bind(this)} type="button" className="btn btn-primary waves-light waves-effect pull-right" data-toggle="tooltip" data-placement="top" title="Add"><i className="mdi mdi-plus"></i></button> : ""}
                  </div>


                </div>
              </div>
            </div>



            <table className="table fold-table">
              <thead>
                <tr><th className="createAgnLabel">AGN</th>
                  <th className="createDescriptionLabel">Description</th>
                  <th className="createOwnPoLabel text-center">Own PO</th>
                  <th className="createPotextLabel">PO Text</th>
                  <th className={this.state.AGNCreateObject.length > 1 ? "ActionWidth" : "ActionWidth"}>{this.state.AGNCreateObject.length > 1 ? "Action" : ""}</th>
                </tr>
              </thead>
              <tbody>
                {this.state.AGNCreateObject.map((object, index) => {
                  return <AgnForm {...this.state}
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
                  <button type="button" className="btn btn-primary btn-lg waves-light waves-effect m-l-5" onClick={this.createAgn.bind(this)}>Save</button>
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

export default CreateAgn
