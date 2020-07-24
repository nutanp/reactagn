import React from 'react';
import _ from 'lodash';
import Loadjs from 'loadjs';
import moment from 'moment'
import Autosuggest from 'react-autosuggest';
import AgnService from '../../services/agnService'
import Constants from '../../constants'
import AppController from '../controllers/appController';



const masterDataSuggestionValue = (suggestion) => suggestion.label;
const renderMasterDataSuggestion = (suggestion) => (<div className="autocomplete-suggestion">{suggestion.desc} - {suggestion.label}</div>);


class ExclusionForm extends React.Component {
  constructor(props) {
    super(props)

    this.state = {

      suggestions: [],
      account: this.props.rowData.CUSTOMER ? this.props.rowData.CUSTOMER : "",
      chain: this.props.rowData.CHAIN ? this.props.rowData.CHAIN : "",
      ng: this.props.rowData.NATIONAL_GROUP ? this.props.rowData.NATIONAL_GROUP : "",
      nsg: this.props.rowData.NATIONAL_SUB_GROUP ? this.props.rowData.NATIONAL_SUB_GROUP : "",
      region: this.props.rowData.REGION ? this.props.rowData.REGION : "",
      assign: this.props.assign,
      category: this.props.rowData.category ? this.props.rowData.category : ""

    }

    this.onSuggestionsDescripton = this.onSuggestionsDescripton.bind(this);
    this.clearSuggestions = this.clearSuggestions.bind(this);

    this.onAccountChange = this.onAccountChange.bind(this);
    this.masterDataSuggestion = this.masterDataSuggestion.bind(this);
    this.onSuggestionSelected = this.onSuggestionSelected.bind(this);


    this.onAgnChange = this.onAgnChange.bind(this);
    this.agnSuggestion = this.agnSuggestion.bind(this);
    this.onDescriptionChange = this.onDescriptionChange.bind(this);
    
    this.onSuggestionSelectedAgn = this.onSuggestionSelectedAgn.bind(this);
    


    this.onChainChange = this.onChainChange.bind(this);
    this.onChainSuggestionSelect = this.onChainSuggestionSelect.bind(this);

    this.onNGChange = this.onNGChange.bind(this);
    this.onNGSuggestionSelect = this.onNGSuggestionSelect.bind(this);

    this.onNSGChange = this.onNSGChange.bind(this);
    this.NSGSuggestion = this.NSGSuggestion.bind(this);
    this.onNSGSuggestionSelect = this.onNSGSuggestionSelect.bind(this);

    this.onRegionChange = this.onRegionChange.bind(this);
    this.RegionSuggestion = this.RegionSuggestion.bind(this);
    this.onRegionSuggestionSelect = this.onRegionSuggestionSelect.bind(this);

  }

  componentWillMount() {

    AppController.datePicker(this, 'ex', this.props.keyValue)
  }


  async setValue(field, index, e) {


    let valueData
    valueData = e.target.value
    if (field == "ownPo") {
      valueData = e.target.checked
      $(".poText" + index).prop('disabled', !valueData);
      $(".poText" + index).removeClass('errorClass')
    }
    if (field == 'CATEGORY') {

      //this.setState({category:valueData});
      await this.setState({ category: valueData, account: "", chain: "", ng: "", nsg: "", region: "" });
      await this.props.updateValue({ name: "CUSTOMER", value: "" }, this.props.keyValue, this.props.mainIndex, this.state.assign);
      await this.props.updateValue({ name: "CHAIN", value: "" }, this.props.keyValue, this.props.mainIndex, this.state.assign);
      await this.props.updateValue({ name: "NATIONAL_GROUP", value: "" }, this.props.keyValue, this.props.mainIndex, this.state.assign);
      await this.props.updateValue({ name: "NATIONAL_SUB_GROUP", value: "" }, this.props.keyValue, this.props.mainIndex, this.state.assign);
      await this.props.updateValue({ name: "REGION", value: "" }, this.props.keyValue, this.props.mainIndex, this.state.assign);

    }
    await this.props.updateValue({ name: field, value: valueData }, this.props.keyValue, this.props.mainIndex, this.state.assign);
   


  }
  setValueDate(field, index, value, date) {
    this.props.updateValue({ name: "VALID_FROM", value: field.value, startDate: date }, this.props.keyValue, this.props.mainIndex, this.state.assign)
  }



  async onSuggestionsDescripton({ value }) {

    if (value.length > 0 && this.props.agnCategory != "") {
      let getString = "searchstring=" + value;
      let dataResult = [];
      if (this.props.agnCategory == "CA") {
        dataResult = await AgnService.AccountAutoComplete({ getString: getString });
      } if (this.props.agnCategory == "CH") {
        dataResult = await AgnService.ChainAutoComplete({ getString: getString });
      }
      if (dataResult.results.length > 0)
        await this.setState({ suggestions: dataResult.results });
    }
  }


  async onDescriptionChange(event, { newValue, method }) {

    this.setState({ description: newValue });
    this.props.updateValue({ name: "description", value: newValue }, this.props.keyValue, this.props.mainIndex, this.state.assign)
    if (method == 'click') {
      await this.agnSuggestion({ value: newValue });
      //this.autoPopulate();
    }
  }


  // async agnSuggestion({ value }) {

  //   if (value.length > 0) {
  //     let dataResult = [];
  //     if (localStorage.getItem("agnOriginalData") != null) {
  //       dataResult = JSON.parse(localStorage.getItem("agnOriginalData")).filter(
  //         data =>
  //           (value ? data.agn.includes(value) : true) ||
  //           (value ? data.description.includes(value) : true)
  //       );
  //     } else {

  //       let getString = "&desc=" + value;
  //       dataResult = await AgnService.getAGN({ getString: getString, agnType: localStorage.getItem("agnType") });
  //       localStorage.setItem("agnOriginalData", JSON.stringify(dataResult));
  //     }



  //     if (dataResult.length > 0)
  //       await this.setState({ suggestions: dataResult });
  //   }
  // }

  async agnSuggestion({ value }) {

    if (value.length > 0) {

      let dataResult = [];
      if (localStorage.getItem("agnOriginalData") != null) {
        dataResult = JSON.parse(localStorage.getItem("agnOriginalData")).filter(
          data =>
            (this.state.filterobj.agn ? data.agn.includes(this.state.filterobj.agn) : true) ||
            (this.state.filterobj.agn ? data.description.includes(this.state.filterobj.agn) : true)
        );
      } else {
        let getString = "&desc=" + value;
        dataResult = await AgnService.getAGN({ getString: getString, agnType: localStorage.getItem("agnType") });
        localStorage.setItem("agnOriginalData", JSON.stringify(dataResult));
      }

      if (dataResult.length > 0)
        await this.setState({ suggestions: dataResult });
    }
  }

  clearSuggestions() {
    this.setState({ suggestions: [] });
  };

  async onAccountChange(event, { newValue, method }) {

    this.setState({ account: newValue });
    this.props.updateValue({ name: "CUSTOMER", value: newValue }, this.props.keyValue, this.props.mainIndex, this.state.assign)
    if (method == 'click') {
      await this.masterDataSuggestion({ value: newValue });
      //this.autoPopulate();
    }
  }

  async onChainChange(event, { newValue, method }) {

    this.setState({ chain: newValue });
    this.props.updateValue({ name: "CHAIN", value: newValue }, this.props.keyValue, this.props.mainIndex, this.state.assign)
    if (method == 'click') {
      await this.masterDataSuggestion({ value: newValue });
      //this.autoPopulate();
    }
  }
  async onNGChange(event, { newValue, method }) {
    console.log(newValue, method);
    if (method == 'click') {
      await this.masterDataSuggestion({ value: newValue });
      //this.autoPopulate();
    }else{
      await this.setState({ ng: newValue });
      await this.props.updateValue({ name: "NATIONAL_GROUP", value: newValue }, this.props.keyValue, this.props.mainIndex, this.state.assign)

    }
  }
  async masterDataSuggestion({ value }) {

    if (value.length > 0 && this.props.rowData.CATEGORY != "") {
      let getString = "searchstring=" + value;
      let dataResult = [];
      if (this.props.rowData.CATEGORY == "CA") {
        dataResult = await AgnService.AccountAutoComplete({ getString: getString });
      } if (this.props.rowData.CATEGORY == "CH") {
        dataResult = await AgnService.ChainAutoComplete({ getString: getString });
      } if (this.props.rowData.CATEGORY == "GR") {
        getString = getString + "&level=1"
        dataResult = await AgnService.NGAutoComplete({ getString: getString });
      }
      if (this.props.rowData.CATEGORY == "SG" || this.props.rowData.CATEGORY == "RG") {
        getString = getString + "&level=1"
        dataResult = await AgnService.NGAutoComplete({ getString: getString });
      }
     
      //if (dataResult.results.length > 0)
       if(dataResult.results !== null)
        await this.setState({ suggestions: dataResult.results });
    }
  }


  async onAgnChange(event, { newValue, method }) {

    this.setState({ agn: newValue });
    this.props.updateValue({ name: "agn", value: newValue }, this.props.keyValue, this.props.mainIndex, this.state.assign)
    if (method == 'click') {
      await this.agnSuggestion({ value: newValue });
      //this.autoPopulate();
    }
  }

  async onNSGChange(event, { newValue, method }) {

    if (method == 'click') {
      await this.NSGSuggestion({ value: newValue });
      //this.autoPopulate();
    }else{
      await this.setState({ nsg: newValue });
      await this.props.updateValue({ name: "NATIONAL_SUB_GROUP", value: newValue }, this.props.keyValue, this.props.mainIndex, this.state.assign)

    }
  }

  async onRegionChange(event, { newValue, method }) {

    this.setState({ region: newValue });
    this.props.updateValue({ name: "REGION", value: newValue }, this.props.keyValue, this.props.mainIndex, this.state.assign)
    if (method == 'click') {
      await this.RegionSuggestion({ value: newValue });
      //this.autoPopulate();
    }
  }





  async NSGSuggestion({ value }) {

    let splitArray = this.props.rowData.NATIONAL_GROUP.split("-");
    if (value.length > 0 && splitArray.length >= 2) {

      let getString = "searchstring=" + value;
      getString = getString + "&level=2&group=" + splitArray[0].trim();
      const dataResult = await AgnService.NGAutoComplete({ getString: getString });

      //if (dataResult.results.length > 0)
      if(dataResult.results !== null)
      await this.setState({ suggestions: dataResult.results });
    }
  }

  async RegionSuggestion({ value }) {
    let NGsplitArray = this.props.rowData.NATIONAL_GROUP.split("-");
    let NSGsplitArray = this.props.rowData.NATIONAL_SUB_GROUP.split("-");
    if (value.length > 0 && NGsplitArray.length >= 2 && NSGsplitArray.length >= 2) {
      let getString = "searchstring=" + value;
      getString = getString + "&level=3&group=" + NGsplitArray[0].trim() + "&subgroup=" + NSGsplitArray[0].trim();
      const dataResult = await AgnService.NGAutoComplete({ getString: getString });
      //if (dataResult.results.length > 0)
      if(dataResult.results !== null)
      await this.setState({ suggestions: dataResult.results });
    }
  }


  async onSuggestionSelectedAgn(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) {
    this.setState({ description: this.state.suggestions[suggestionIndex].description });
    this.setState({ agn: this.state.suggestions[suggestionIndex].agn + " - " + this.state.suggestions[suggestionIndex].description });
    this.props.updateValue({ name: "agn", value: this.state.suggestions[suggestionIndex].description + " - " + this.state.suggestions[suggestionIndex].agn }, this.props.keyValue, this.props.mainIndex, this.state.assign);
    this.props.updateValue({ name: "description", value: this.state.suggestions[suggestionIndex].description }, this.props.keyValue, this.props.mainIndex, this.state.assign);

  }
  async onChainSuggestionSelect(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) {

    this.setState({ chain: this.state.suggestions[suggestionIndex].label + " - " + this.state.suggestions[suggestionIndex].desc });
    this.props.updateValue({ name: "CHAIN", value: this.state.suggestions[suggestionIndex].desc + " - " + this.state.suggestions[suggestionIndex].label }, this.props.keyValue, this.props.mainIndex, this.state.assign);

  }
  async onNGSuggestionSelect(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) {
     let desc = this.state.suggestions[suggestionIndex].desc;
     let label = this.state.suggestions[suggestionIndex].label;
     let NGVALUE = (desc + " - " + label);
    if(desc !== "" && label !==""){


    this.setState({ ng: this.state.suggestions[suggestionIndex].label + " - " + this.state.suggestions[suggestionIndex].desc });
    await this.props.updateValue({ name: "NATIONAL_GROUP", value: NGVALUE }, this.props.keyValue, this.props.mainIndex, this.state.assign);
      }

  }


  async onSuggestionSelected(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) {
    this.setState({ account: this.state.suggestions[suggestionIndex].label + " - " + this.state.suggestions[suggestionIndex].desc });
    this.props.updateValue({ name: "CUSTOMER", value: this.state.suggestions[suggestionIndex].desc + " - " + this.state.suggestions[suggestionIndex].label }, this.props.keyValue, this.props.mainIndex, this.state.assign);

  }


  async onNSGSuggestionSelect(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) {
    this.setState({ nsg: this.state.suggestions[suggestionIndex].label + " - " + this.state.suggestions[suggestionIndex].desc });
    this.props.updateValue({ name: "NATIONAL_SUB_GROUP", value: this.state.suggestions[suggestionIndex].desc + " - " + this.state.suggestions[suggestionIndex].label }, this.props.keyValue, this.props.mainIndex, this.state.assign);
  }

  async onRegionSuggestionSelect(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) {
    this.setState({ region: this.state.suggestions[suggestionIndex].label + " - " + this.state.suggestions[suggestionIndex].desc });
    this.props.updateValue({ name: "REGION", value: this.state.suggestions[suggestionIndex].desc + " - " + this.state.suggestions[suggestionIndex].label }, this.props.keyValue, this.props.mainIndex, this.state.assign);
  }

  render() {


    const AccountInputProps = {
      placeholder: this.props.rowData.CATEGORY == 'CA' ? "Enter Account" : "",
      className: "form-control CUSTOMER" + this.props.mainIndex + this.props.keyValue,
      value: this.props.rowData.CUSTOMER ? this.props.rowData.CUSTOMER : "",
      onChange: this.onAccountChange,
      disabled: this.props.rowData.CATEGORY != 'CA'
    };
    const ChainInputProps = {
      placeholder: this.props.rowData.CATEGORY == 'CH' ? "Enter Chain" : "",
      className: "form-control CHAIN" + this.props.mainIndex + this.props.keyValue,
      value: this.props.rowData.CHAIN ? this.props.rowData.CHAIN : "",
      onChange: this.onChainChange,
      disabled: this.props.rowData.CATEGORY != 'CH'
    };
    const NGInputProps = {
      placeholder: this.props.rowData.CATEGORY == 'GR' || this.props.rowData.CATEGORY == 'SG' || this.props.rowData.CATEGORY == 'RG' ? "Enter National Group" : "",
      className: "form-control NATIONAL_GROUP" + this.props.mainIndex + this.props.keyValue,
      value: this.props.rowData.NATIONAL_GROUP ? this.props.rowData.NATIONAL_GROUP : "",
      onChange: this.onNGChange,
      disabled: !(this.props.rowData.CATEGORY == 'GR' || this.props.rowData.CATEGORY == 'SG' || this.props.rowData.CATEGORY == 'RG')
    };

    const DescriptioninputProps = {
      placeholder: "Enter Description",
      className: "form-control description" + this.props.mainIndex + this.props.keyValue,
      value: this.state.description,
      onChange: this.onDescriptionChange,
    };

    const AgninputProps = {
      placeholder: "Enter AGN",
      className: "form-control agn" + this.props.mainIndex + this.props.keyValue,
      value: this.props.rowData.AGN_DESCRIPTION + this.props.rowData.AGN_KEY,
      onChange: this.onAgnChange,
      disabled: this.props.agnCategory == ""
    };

    const NsgProps = {
      placeholder: this.props.rowData.CATEGORY == 'SG' ? "Enter National Sub Group" : "",
      className: "form-control NATIONAL_SUB_GROUP" + this.props.mainIndex + this.props.keyValue,
      value: this.props.rowData.NATIONAL_SUB_GROUP ? this.props.rowData.NATIONAL_SUB_GROUP : "",
      onChange: this.onNSGChange,
      disabled: !((this.props.rowData.NATIONAL_GROUP ? this.props.rowData.NATIONAL_GROUP : "") != "" && this.props.rowData.CATEGORY == 'SG'||this.props.rowData.CATEGORY == 'RG')
    };

    const RegionProps = {
      placeholder: this.props.rowData.CATEGORY == 'RG' ? "Enter Region" : "",
      className: "form-control REGION" + this.props.mainIndex + this.props.keyValue,
      value: this.props.rowData.REGION ? this.props.rowData.REGION : "",
      onChange: this.onRegionChange,
      disabled: !((this.props.rowData.NATIONAL_SUB_GROUP ? this.props.rowData.NATIONAL_SUB_GROUP : "")!= "" && this.props.rowData.CATEGORY == 'RG'||this.props.rowData.CATEGORY == 'SG')
    };

    const localAgnType = localStorage.getItem("agnType")

    return (
      <tr className="NewExcludeTrBackgroud">

        <td className="category-ex">
          <div className="form-group m-b-0 table-category">
            <select value={this.props.rowData.CATEGORY} className={"form-control selectpicker CATEGORY" + this.props.mainIndex + this.props.keyValue} data-minimum-results-for-search="Infinity" onChange={this.setValue.bind(this, 'CATEGORY', this.props.keyValue)} >
              <option value="">Select Category</option>
              {this.props.category ? this.props.category.map((categoryRow, index) => {

                return <option value={categoryRow.CATEGORY} key={index}>{categoryRow.DESCRIPTION}</option>
              }) : ''}

            </select>
          </div>
        </td>
        {this.props.rowData.CATEGORY === 'CA' ? <td>
          <Autosuggest
            suggestions={this.state.suggestions}
            onSuggestionsFetchRequested={this.masterDataSuggestion}
            onSuggestionsClearRequested={this.clearSuggestions}
            getSuggestionValue={masterDataSuggestionValue}
            renderSuggestion={renderMasterDataSuggestion}
            inputProps={AccountInputProps}
            onSuggestionSelected={this.onSuggestionSelected} />

        </td> : ""}

        {this.props.rowData.CATEGORY === 'CH' ? <td>
          <Autosuggest
            suggestions={this.state.suggestions}
            onSuggestionsFetchRequested={this.masterDataSuggestion}
            onSuggestionsClearRequested={this.clearSuggestions}
            getSuggestionValue={masterDataSuggestionValue}
            renderSuggestion={renderMasterDataSuggestion}
            inputProps={ChainInputProps}
            onSuggestionSelected={this.onChainSuggestionSelect} />

        </td> : ""}
        {this.props.rowData.CATEGORY === 'GR' || this.props.rowData.CATEGORY === 'SG' || this.props.rowData.CATEGORY === 'RG' ? <td>
          <Autosuggest
            suggestions={this.state.suggestions}
            onSuggestionsFetchRequested={this.masterDataSuggestion}
            onSuggestionsClearRequested={this.clearSuggestions}
            getSuggestionValue={masterDataSuggestionValue}
            renderSuggestion={renderMasterDataSuggestion}
            inputProps={NGInputProps}
            onSuggestionSelected={this.onNGSuggestionSelect} />

        </td> : ""}
        {this.props.rowData.CATEGORY === '' ? <td colSpan="1"> <Autosuggest
          suggestions={this.state.suggestions}
          onSuggestionsFetchRequested={this.masterDataSuggestion}
          onSuggestionsClearRequested={this.clearSuggestions}
          getSuggestionValue={masterDataSuggestionValue}
          renderSuggestion={renderMasterDataSuggestion}
          inputProps={NGInputProps}
          onSuggestionSelected={this.onNGSuggestionSelect} /></td> : ""}
        <td>
          <Autosuggest
            suggestions={this.state.suggestions}
            onSuggestionsFetchRequested={this.NSGSuggestion}
            onSuggestionsClearRequested={this.clearSuggestions}
            getSuggestionValue={masterDataSuggestionValue}
            renderSuggestion={renderMasterDataSuggestion}
            inputProps={NsgProps}
            onSuggestionSelected={this.onNSGSuggestionSelect} />


        </td>  <td>
          <Autosuggest
            suggestions={this.state.suggestions}
            onSuggestionsFetchRequested={this.RegionSuggestion}
            onSuggestionsClearRequested={this.clearSuggestions}
            getSuggestionValue={masterDataSuggestionValue}
            renderSuggestion={renderMasterDataSuggestion}
            inputProps={RegionProps}
            onSuggestionSelected={this.onRegionSuggestionSelect} />

        </td>


       
        <td>
          <div className={this.props.agnCategory == "" ? "input-group" : "input-group datepicker-wrap"}>

            <input disabled={this.props.agnCategory == ""} defaultValue={moment(this.date).format('MM-DD-YYYY')} readOnly type="text" id={"datepicker-autoclose" + this.props.keyValue} className={"form-control datepicker-autoclose VALID_FROM" + this.props.mainIndex + this.props.keyValue} placeholder="YYYY-MM-DD" />
            {this.props.agnCategory == "" ? "" : <span ><i className="mdi mdi-calendar"></i></span>}
          </div>
        </td>
        <td>
          <input value={moment('9999-12-31').format('MM-DD-YYYY')} type="text" className={"form-control datepicker-autoclose"} readOnly placeholder="YYYY-MM-DD" />

        </td>
        <td className="button-sm text-center">
          <button type="button" className="btn btn-danger btn-sm waves-light waves-effect m-t-5" data-toggle="tooltip" data-placement="top" title="Remove" onClick={this.props.deleteConfirmationAlert}><i className="mdi mdi-delete"></i></button>
        </td>
      </tr>
    )

  }


}

export default ExclusionForm
