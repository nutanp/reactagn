import React from 'react';
import _ from 'lodash';
import Loadjs from 'loadjs';
import moment from 'moment'
import Autosuggest from 'react-autosuggest';
import AgnService from '../../services/agnService'
import Constants from '../../constants'
import AppController from '../controllers/appController';
import $ from "jquery";

const descriptionSuggestion = (suggestion) => suggestion.description;
const renderDescriptionSuggestion = (suggestion) => (<div className="autocomplete-suggestion">{suggestion.description}</div>);
// const getSuggestionAgnKeyValue = (suggestion) => suggestion.number;
// const renderAgnKeySuggestion = (suggestion) => (<div className="autocomplete-suggestion">{suggestion.number}</div>);


class AgnForm extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      description: this.props.rowData.DESCRIPTION,
      suggestions: [],
      agn: this.props.rowData.AGN,
      userType: localStorage.getItem("agnType")
     // userType: "Compass"
    }

    this.descriptionChange = this.descriptionChange.bind(this);
    this.agnKeyChange = this.agnKeyChange.bind(this);
    



  }
  componentWillMount() {
    AppController.datePicker(this, '', this.props.keyValue)
  }
  componentWillReceiveProps(nextProps, prevProps) {
    if (nextProps.isAGNAdded) {
      this.setState({ description: "", suggestions: [], agnKey: "" })
    }
  }
  async setValue(field, index, e) {



    let valueData
    valueData = (field == 'AGN' ? e.target.value.toUpperCase() : e.target.value);
    if (field == "OWN_PO") {
      valueData = e.target.checked ? true : false;

      if (valueData === false) {

        $("#PO_TEXT" + index).val("");
        await this.props.updateValue({ name: "PO_TEXT", value: "" }, index);
      }
      if(this.state.userType === "FLU" )
      $(".PO_TEXT" + index).prop('disabled', true);
      else
      $(".PO_TEXT" + index).prop('disabled', !valueData);
      $(".PO_TEXT" + index).removeClass('errorClass')
    }
   
  //   if(field == 'AGN' && this.state.userType === "FLU" )
  //   {
  //     let valueData1 =  true ;
  //  //  await this.props.updateValue({ name: "own_po", value: valueData1}, index)
  //   }
   this.props.updateValue({ name: field, value: valueData }, index)

  }
  setValueDate(field, index, value, date) {
    this.props.updateValue({ name: field, value: value, startDate: date }, index)
  }

  /*auto suggestion*/
  async descriptionChange(event, { newValue, method }) {

    this.setState({ description: newValue });
    this.props.updateValue({ name: "DESCRIPTION", value: newValue }, this.props.keyValue)

  }





  async agnKeyChange(event, { newValue, method }) {

    this.setState({ agn: newValue });
    this.props.updateValue({ name: "AGN", value: newValue }, this.props.keyValue)

  }




  render() {



    const localAgnType = localStorage.getItem("agnType")

    return (

      <tr key={this.props.keyValue} id={this.props.keyValue}><td>
        <input maxLength="20" className={"form-control AGN" + this.props.keyValue} id="agn-agn" placeholder="Enter AGN" type="text" value={this.props.rowData.AGN} onChange={this.setValue.bind(this, 'AGN', this.props.keyValue)} />
      </td>

        <td>
        <input maxLength="40" className={"form-control DESCRIPTION" + this.props.keyValue} id="agn-agn" placeholder="Enter AGN Description" type="text" value={this.props.rowData.DESCRIPTION} onChange={this.setValue.bind(this, 'DESCRIPTION', this.props.keyValue)} />

        </td>


        <td>
          <div className="form-group text-center">

            <div className="checkbox checkbox-primary">
              <input className={"ownPo" + this.props.keyValue} type="checkbox" id="agn-own-po" defaultChecked={this.state.userType === "FLU"  ?  true : this.props.rowData.OWN_PO } onClick={this.setValue.bind(this, 'OWN_PO', this.props.keyValue)}   />
              <label htmlFor="checkbox1"></label>
            </div>
          </div>
        </td>
        <td>
          <input maxLength="20" className={"form-control PO_TEXT" + this.props.keyValue} id={"PO_TEXT" + this.props.keyValue} placeholder="Enter PO Text" type="text" disabled value={this.props.rowData.PO_TEXT} onChange={this.setValue.bind(this, 'PO_TEXT', this.props.keyValue)}  />
        </td>
        <td>
          {this.props.AGNCreateObject.length > 1 ? <button type="button" className="btn btn-danger waves-light waves-effect" data-toggle="tooltip" data-placement="top" title="Remove" onClick={this.props.deleteConfirmationAlert}><i className="mdi mdi-delete"></i></button> : ""}
        </td></tr>
    )

  }


}

export default AgnForm
