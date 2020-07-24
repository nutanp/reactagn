import React from 'react';
import _ from 'lodash';
import Loadjs from 'loadjs';
import moment from 'moment'
import Autosuggest from 'react-autosuggest';
import AgnService from '../../services/agnService'
import Constants from '../../constants'
import AppController from '../controllers/appController';

// const getSuggestionAccountDescriptionValue = (suggestion) => suggestion.desc;
// const renderAccountDescriptionSuggestion = (suggestion) => (<div className="autocomplete-suggestion">{suggestion.desc}</div>);
const getSuggestionAccountAgnKeyValue = (suggestion) => suggestion.label;
const renderAccountSuggestion = (suggestion) => (<div className="autocomplete-suggestion">{suggestion.desc} - {suggestion.label}</div>);

const getSuggestionDescriptionValue = (suggestion) => suggestion.description;
const renderDescriptionSuggestion = (suggestion) => (<div className="autocomplete-suggestion">{suggestion.description}</div>);

const getSuggestionAgnKeyValue = (suggestion) => suggestion.AGN;
const renderAgnSuggestion = (suggestion) => (<div className="autocomplete-suggestion">{suggestion.AGN} - {suggestion.DESCRIPTION}</div>);

const getSuggestionNsgValue = (suggestion) => suggestion.label;
const renderNsgSuggestion = (suggestion) => (<div className="autocomplete-suggestion">{suggestion.desc} - {suggestion.label}</div>);

const getSuggestionRegionValue = (suggestion) => suggestion.label;
const renderRegionSuggestion = (suggestion) => (<div className="autocomplete-suggestion">{suggestion.desc} - {suggestion.label}</div>);



class AssignmentForm extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      suggestions: [],
      account: this.props.rowData.CUSTOMER ? this.props.rowData.CUSTOMER : "",
      chain: this.props.rowData.CHAIN ? this.props.rowData.CHAIN : "",
      ng: this.props.rowData.NATIONAL_GROUP ? this.props.rowData.NATIONAL_GROUP : "",
      nsg: this.props.rowData.NATIONAL_SUB_GROUP ? this.props.rowData.NATIONAL_SUB_GROUP : "",
      region: this.props.rowData.REGION ? this.props.rowData.REGION : "",
      agn: this.props.rowData.AGN ? this.props.rowData.AGN + this.props.rowData.AGN_DESCRIPTION : ""
    }

    this.onSuggestionsDescripton = this.onSuggestionsDescripton.bind(this);
    this.clearSuggestions = this.clearSuggestions.bind(this);
    this.accountdescriptionChange = this.accountdescriptionChange.bind(this);
    this.onCategoryChange = this.onCategoryChange.bind(this);
    this.onSuggestionsagnKey = this.onSuggestionsagnKey.bind(this);
    this.onSuggestionSelected = this.onSuggestionSelected.bind(this);


    this.agnChange = this.agnChange.bind(this);
    this.onSuggestionsagn = this.onSuggestionsagn.bind(this);
    this.descriptionChange = this.descriptionChange.bind(this);
    this.onSuggestionsDescriptonAgn = this.onSuggestionsDescriptonAgn.bind(this);
    this.onSuggestionSelectedAgn = this.onSuggestionSelectedAgn.bind(this);


    this.nsgChange = this.nsgChange.bind(this);
    this.NSGSuggestion = this.NSGSuggestion.bind(this);
    this.onNSGSuggestionSelect = this.onNSGSuggestionSelect.bind(this);

    this.onRegionChange = this.onRegionChange.bind(this);
    this.regionSuggestion = this.regionSuggestion.bind(this);
    this.onRegionSuggestionSelect = this.onRegionSuggestionSelect.bind(this);

  }

  componentWillMount() {

    AppController.datePicker(this, 'ex', this.props.keyValue)
  }
  componentWillReceiveProps(nextProps, prevProps) {

    if (this.props.agnCategory !== nextProps.agnCategory) {
      this.setState({
        account: "",
        chain: "",
        ng: "",
        nsg: "",
        region: "",
        agn: ""

      })
    }
    if (nextProps.isAdded) {
      this.setState({ suggestions: [], agnKey: "" })
    }
  }

  setValue(field, index, e) {


    let valueData
    valueData = e.target.value
    if (field == "ownPo") {
      valueData = e.target.checked
      $(".poText" + index).prop('disabled', !valueData);
      $(".poText" + index).removeClass('errorClass')
    }
    this.props.updateValue({ name: field, value: valueData }, index)

  }
  setValueDate(field, index, value, date) {

    this.props.updateValue({ name: "VALID_FROM", value: field.value, startDate: date }, this.props.keyValue)
  }

  /*auto suggestion*/
  async accountdescriptionChange(event, { newValue, method }) {

    this.setState({ accountdescription: newValue });
    this.props.updateValue({ name: "accountdescription", value: newValue }, this.props.keyValue)
    if (method == 'click') {
      await this.onSuggestionsDescripton({ value: newValue });
      //this.autoPopulate();
    }
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
      if (dataResult !== null)
        await this.setState({ suggestions: dataResult.results });
    }
  }


  async descriptionChange(event, { newValue, method }) {

    this.setState({ description: newValue });
    this.props.updateValue({ name: "description", value: newValue }, this.props.keyValue)
    if (method == 'click') {
      await this.onSuggestionsDescriptonAgn({ value: newValue });
      //this.autoPopulate();
    }
  }

  async onSuggestionsDescriptonAgn({ value }) {

    //if (value.length > 0) {

    let dataResult = [];
    if (localStorage.getItem("agnOriginalData") != null) {

      dataResult = JSON.parse(localStorage.getItem("agnOriginalData")).filter(
        data =>
          (value ? data.AGN.includes(value) : true) ||
          (value ? data.DESCRIPTION.includes(value) : true)
      );
       
      await this.setState({ suggestions: dataResult });
    } else {
      let getString = "&desc=" + value;
      dataResult = await AgnService.getAGN({ getString: getString, agnType: localStorage.getItem("agnType") });
      localStorage.setItem("agnOriginalData", JSON.stringify(dataResult));
    }

    if (dataResult !== null)
      await this.setState({ suggestions: dataResult });
    //}
  }

  clearSuggestions() {
    this.setState({ suggestions: [] });
  };

  async onCategoryChange(event, { newValue, method }) {
   
    this.props.rowData.NATIONAL_SUB_GROUP="";
    this.props.rowData.REGION="";
    this.setState({ account: newValue });

   
    let keyName = "CUSTOMER";

    if (this.props.agnCategory == "CH") {
      keyName = "CHAIN";
    }
    if (this.props.agnCategory == "GR") {
      keyName = "NATIONAL_GROUP";
    }
    if (this.props.agnCategory == "SG" ||this.props.agnCategory == "RG") {
      keyName = "NATIONAL_GROUP";
    }
    // if (this.props.agnCategory == "RG") {
    //   keyName = "NATIONAL_GROUP";
    //   console.log("prop name1",this.props.agnCategory);
    // }
  
    this.props.updateValue({ name: keyName, value: newValue }, this.props.keyValue)
    if (method == 'click') {
      await this.onSuggestionsagnKey({ value: newValue });
      //this.autoPopulate();
    }
  }
  async onSuggestionsagnKey({ value }) {

    if (value.length > 0 && this.props.agnCategory != "") {
      let getString = "searchstring=" + value;
      let dataResult = [];
      if (this.props.agnCategory == "CA") {
        dataResult = await AgnService.AccountAutoComplete({ getString: getString });
      } if (this.props.agnCategory == "CH") {
        dataResult = await AgnService.ChainAutoComplete({ getString: getString });
      } if (this.props.agnCategory == "GR" ) {
        getString = getString + "&level=1"
        dataResult = await AgnService.NGAutoComplete({ getString: getString });
      }
      if (this.props.agnCategory == "SG" || this.props.agnCategory == "RG") {
        getString = getString + "&level=1"
        dataResult = await AgnService.NGAutoComplete({ getString: getString });
      }

      if(dataResult.results !== null)
      await this.setState({ suggestions: dataResult.results });
    }
  }


  async agnChange(event, { newValue, method }) {
     
    this.setState({ agn: newValue });
    await this.props.updateValue({ name: "AGN", value: "" }, this.props.keyValue)
    await this.props.updateValue({ name: "AGN_DESCRIPTION", value: newValue }, this.props.keyValue)

    if (method == 'click') {

      await this.onSuggestionsagn({ value: newValue });
      //this.autoPopulate();
    }
  }

  async nsgChange(event, { newValue, method }) {
    this.props.rowData.REGION="";
    this.setState({ nsg: newValue });
    this.props.updateValue({ name: "NATIONAL_SUB_GROUP", value: newValue }, this.props.keyValue)
    if (method == 'click') {
      await this.NSGSuggestion({ value: newValue });
      //this.autoPopulate();
    }
  }

  async onRegionChange(event, { newValue, method }) {

    this.setState({ region: newValue });
    this.props.updateValue({ name: "REGION", value: newValue }, this.props.keyValue)
    if (method == 'click') {
      await this.regionSuggestion({ value: newValue });
      //this.autoPopulate();
    }
  }



  async onSuggestionsagn({ value }) {

    //if (value.length > 0) {
    let dataResult = [];
    if (localStorage.getItem("agnOriginalData") != null) {
      dataResult = JSON.parse(localStorage.getItem("agnOriginalData")).filter(
        data =>
          (value ? data.AGN.toUpperCase().includes(value.toUpperCase()) : true) ||
          (value ? data.DESCRIPTION.toUpperCase().includes(value.toUpperCase()) : true)
      );
    await this.setState({ suggestions: dataResult });
    } else {

      let getString = "&desc=" + value;
      dataResult = await AgnService.getAGN({ getString: getString, agnType: localStorage.getItem("agnType") });
      localStorage.setItem("agnOriginalData", JSON.stringify(dataResult));
    }

    if (dataResult !== null) {
      if (dataResult.length > 0)
        await this.setState({ suggestions: dataResult });
    }


 
    //}
  }

  async NSGSuggestion({ value }) {
   let splitArray = this.state.account.split("-");
    if (value.length > 0 & splitArray.length >= 2) {
      let getString = "&searchstring=" + value;
      getString = getString + "&level=2&group=" + splitArray[0].trim();
      const dataResult = await AgnService.NGAutoComplete({ getString: getString });
      if(dataResult.results !== null)
      await this.setState({ suggestions: dataResult.results });
    }
  }

  async regionSuggestion({ value }) {

    let NGsplitArray = this.state.account.split("-");
    let NSGsplitArray = this.props.rowData.NATIONAL_SUB_GROUP.split("-");

    if (value.length > 0 && NGsplitArray.length >= 2 && NSGsplitArray.length >= 2) {
      let getString = "searchstring=" + value;
      getString = getString + "&level=3&group=" + NGsplitArray[0].trim() + "&subgroup=" + NSGsplitArray[0].trim();
      const dataResult = await AgnService.NGAutoComplete({ getString: getString });
      if(dataResult.results !== null)
      await this.setState({ suggestions: dataResult.results });
    }
  }


  async onSuggestionSelectedAgn(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) {
    let agnDescription = this.state.suggestions[suggestionIndex].DESCRIPTION;
    let agnKey = this.state.suggestions[suggestionIndex].AGN;
   
    //await this.setState({ agn: this.state.suggestions[suggestionIndex].DESCRIPTION + " - " + this.state.suggestions[suggestionIndex].AGN });
    await this.props.updateValue({ name: "AGN", value: agnKey }, this.props.keyValue);
    await this.props.updateValue({ name: "AGN_DESCRIPTION", value: agnDescription }, this.props.keyValue);


  }


  async onSuggestionSelected(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) {

    let keyName = "CUSTOMER";
    if (this.props.agnCategory == "CH") {
      keyName = "CHAIN";
    }
    if (this.props.agnCategory == "GR") {
      keyName = "NATIONAL_GROUP";
    }
    if (this.props.agnCategory == "SG") {
      keyName = "NATIONAL_GROUP";
    }
    if (this.props.agnCategory == "RG") {
      keyName = "NATIONAL_GROUP";
    }
    
    let label = this.state.suggestions[suggestionIndex].label;
    let desc = this.state.suggestions[suggestionIndex].desc;


    let agnkey = "";
    if (this.props.rowData.NATIONAL_SUB_GROUP !== null || this.props.rowData.NATIONAL_SUB_GROUP !== "") {
      let split_array = this.props.rowData.NATIONAL_SUB_GROUP.split('-');
      if (split_array.length === 2) {

        agnkey = split_array[1].trim() + " - ";
      }
    }


    await this.setState({ account: desc + " - " + label });
    await this.props.updateValue({ name: keyName, value: desc + " - " + label }, this.props.keyValue);
    await this.props.updateValue({ name: "AGN_KEY", value: agnkey + desc.trim() }, this.props.keyValue);

  }


  async onNSGSuggestionSelect(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) {


    let label = this.state.suggestions[suggestionIndex].label;
    let desc = this.state.suggestions[suggestionIndex].desc;
    let agnkey = "";
    if (this.props.rowData.NATIONAL_GROUP !== null || this.props.rowData.NATIONAL_GROUP !== "") {
      let split_array = this.props.rowData.NATIONAL_GROUP.split('-');
      if (split_array.length === 2) {
        agnkey = split_array[0].trim() + " - ";
      }
    }
    await this.setState({ nsg: label + " - " + desc });
    await this.props.updateValue({ name: "NATIONAL_SUB_GROUP", value: desc + " - " + label }, this.props.keyValue);
    await this.props.updateValue({ name: "AGN_KEY", value: agnkey + desc.trim() }, this.props.keyValue);
  }

  async onRegionSuggestionSelect(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) {
    this.setState({ region: this.state.suggestions[suggestionIndex].desc + " - " + this.state.suggestions[suggestionIndex].label });
    this.props.updateValue({ name: "REGION", value: this.state.suggestions[suggestionIndex].desc + " - " + this.state.suggestions[suggestionIndex].label }, this.props.keyValue);
  }

  render() {

    let keyName = "CUSTOMER";
    if (this.props.agnCategory == "CH") {
      keyName = "CHAIN";
    }
    if (this.props.agnCategory == "GR") {
      keyName = "NATIONAL_GROUP";
    }
    if (this.props.agnCategory == "SG") {
      keyName = "NATIONAL_GROUP";
    }
    if (this.props.agnCategory == "RG") {
      keyName = "NATIONAL_GROUP";
    }

    const AccountInputProps = {
      placeholder: "Enter " + this.props.AgnKeyLabel,
      className: "form-control " + this.props.keyName + this.props.keyValue,
      value: this.props.rowData[keyName] ? this.props.rowData[keyName] : "",
      onChange: this.onCategoryChange,
      disabled: this.props.agnCategory == ""
    };

    const NGInputProps = {
      placeholder: "Enter National Group",
      className: "form-control " + this.props.keyName + this.props.keyValue,
      value: this.props.rowData[keyName] ? this.props.rowData[keyName] : "",
      onChange: this.onCategoryChange
    };

    const DescriptioninputProps = {
      placeholder: "Enter Description",
      className: "form-control description" + this.props.keyValue,
      value: this.state.description,
      onChange: this.descriptionChange,
    };

    const AgninputProps = {
      placeholder: "Enter AGN",
      className: "form-control AGN_DESCRIPTION" + this.props.keyValue,
      value: this.props.rowData.AGN_DESCRIPTION ? ((this.props.rowData.AGN !== "" ? (this.props.rowData.AGN +  '-' ) : "") + this.props.rowData.AGN_DESCRIPTION ) : "",
      onChange: this.agnChange,
      disabled: this.props.agnCategory == ""
    };

    const NSGProps = {
      placeholder: "Enter National Sub Group",
      className: "form-control NATIONAL_SUB_GROUP" + this.props.keyValue,
      value: this.props.rowData.NATIONAL_SUB_GROUP ? this.props.rowData.NATIONAL_SUB_GROUP : "",
      onChange: this.nsgChange,
      disabled: !this.state.account,
    };

    const RegionProps = {
      placeholder: "Enter Region",
      className: "form-control REGION" + this.props.keyValue,
      value: this.props.rowData.REGION ? this.props.rowData.REGION : "",
      onChange: this.onRegionChange,
      disabled: !this.state.nsg,
    };

    const localAgnType = localStorage.getItem("agnType")

    return (
      <tr>
        {this.props.agnCategory == 'SG' || this.props.agnCategory == 'RG' ? <td>
        <Autosuggest
                      suggestions={this.state.suggestions}
                      onSuggestionsFetchRequested={this.onSuggestionsagnKey}
                      onSuggestionsClearRequested={this.clearSuggestions}
                      getSuggestionValue={getSuggestionAccountAgnKeyValue}
                      renderSuggestion={renderAccountSuggestion}
                      inputProps={NGInputProps}
                      onSuggestionSelected={this.onSuggestionSelected} />

        </td> : <td>
        <Autosuggest
            suggestions={this.state.suggestions}
            onSuggestionsFetchRequested={this.onSuggestionsagnKey}
            onSuggestionsClearRequested={this.clearSuggestions}
            getSuggestionValue={getSuggestionAccountAgnKeyValue}
            renderSuggestion={renderAccountSuggestion}
            inputProps={AccountInputProps}
            onSuggestionSelected={this.onSuggestionSelected} />
          
          </td>
        }
        {this.props.agnCategory == 'RG' || this.props.agnCategory == 'SG' ? <td>
          <Autosuggest
            suggestions={this.state.suggestions}
            onSuggestionsFetchRequested={this.NSGSuggestion}
            onSuggestionsClearRequested={this.clearSuggestions}
            getSuggestionValue={getSuggestionNsgValue}
            renderSuggestion={renderNsgSuggestion}
            inputProps={NSGProps}
            onSuggestionSelected={this.onNSGSuggestionSelect} />


        </td> : ""}
        {this.props.agnCategory == 'RG' ? <td>
          <Autosuggest
            suggestions={this.state.suggestions}
            onSuggestionsFetchRequested={this.regionSuggestion}
            onSuggestionsClearRequested={this.clearSuggestions}
            getSuggestionValue={getSuggestionRegionValue}
            renderSuggestion={renderRegionSuggestion}
            inputProps={RegionProps}
            onSuggestionSelected={this.onRegionSuggestionSelect} />

        </td> : ""}


        <td>
          <Autosuggest
            suggestions={this.state.suggestions}
            onSuggestionsFetchRequested={this.onSuggestionsagn}
            onSuggestionsClearRequested={this.clearSuggestions}
            getSuggestionValue={getSuggestionAgnKeyValue}
            renderSuggestion={renderAgnSuggestion}
            inputProps={AgninputProps}
            onSuggestionSelected={this.onSuggestionSelectedAgn} />
        </td>



       
        <td>
          <div className={this.props.agnCategory == "" ? "input-group" : "input-group datepicker-wrap"}>
            
            <input disabled={this.props.agnCategory == ""} defaultValue={moment(this.date).format('MM-DD-YYYY')} type="text" readOnly id={"datepicker-autoclose" + this.props.keyValue} className={"form-control datepicker-autoclose validFrom" + this.props.keyValue} placeholder="MM-DD-YYYY" />
            {this.props.agnCategory == "" ? "" : <span ><i className="mdi mdi-calendar"></i></span>}
          </div>
        </td>
        <td>
          <input value={moment('9999-12-31').format('MM-DD-YYYY')} disabled type="text" className={"form-control datepicker-autoclose"}  placeholder="MM-DD-YYYY" onChange={this.setValueDate.bind(this, 'VALID_TO', this.props.keyValue)}/>

        </td>
      <td>
            {this.props.addCategoryList.length > 1 ? <button type="button" className="btn btn-danger waves-light waves-effect" data-toggle="tooltip" data-placement="top" title="Remove" onClick={this.props.deleteConfirmationAlert}><i className="mdi mdi-delete"></i></button> : ""}
        </td>
        
        
        </tr>
    )

  }


}

export default AssignmentForm
