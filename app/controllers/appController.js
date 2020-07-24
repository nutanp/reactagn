import $ from "jquery";
import moment from 'moment'
import { confirmAlert } from 'react-confirm-alert';
import Constants from '../../constants';
import {NotificationContainer, NotificationManager} from 'react-notifications';
/**
 * Application controller - controls application state and interaction among various components.
 */

const appController = {
  createNotification(type, msg){

     switch (type) {
       case 'info':
         NotificationManager.info(msg);
         break;
       case 'success':
         NotificationManager.success(msg, 'success', 3000);
         break;
       case 'warning':
         NotificationManager.warning(msg, 'Warning', 3000);
         break;
       case 'error':
         NotificationManager.error(msg, 'Error', 10000);
         break;
     }

 },
  permissionDenied(){
    confirmAlert({
      title: '',
      message: Constants.AGN_CONSTANTS.ERROR_MESSAGE_FOR_PERMISSION_DENIED,
      buttons: [
        {
          label: 'Cancel',
          onClick: () => ""
        }
      ]
    })
  },
  selectpickerUpdate(val) {

    $(document)
      .ready(function () {
        jQuery(function ($) {
          val != ""
            ? $('.selectpicker').selectpicker("val", "0")
            : $('.selectpicker').selectpicker()

        })
      })

  },
  datePicker(thisObject, isModel, keyId) {

    $(document)
      .ready(function () {
        jQuery(function ($) {
          $(keyId != undefined ? '#datepicker-autoclose'+keyId : '.datepicker-autoclose')
            .datepicker({autoclose: true, format: 'mm-dd-yyyy', todayHighlight: true ,startDate: new Date()})
            .on('changeDate', function (e) {


              console.log("isModel"+isModel+"Key ID",keyId)
              if(isModel == 'agn'){
                thisObject.props.updateValue({name: 'validTo', value: moment(e.date).format('YYYY-MM-DD')})
              }
              else if(isModel == 'ex'){
               // thisObject.setValueDate({name: 'VALID_TO', value: moment(e.date).format('YYYY-MM-DD')});
                thisObject.setValueDate({name: 'VALID_FROM', value: moment(e.date).format('YYYY-MM-DD')});
              } else if (keyId == 'search') {

                let filterObj = Object.assign({}, thisObject.state.filterObj);
                if (moment(e.date).format('YYYY-MM-DD') === null) {
                  delete filterObj.validTo;
                  thisObject.setState({
                    filterObj,
                    validTo: moment(e.date).format('MM-DD-YYYY')
                  });
                } else {
                  filterObj.validTo = moment(e.date).format('YYYY-MM-DD');

                  thisObject.setState({
                    filterObj,
                    validTo: moment(e.date).format('MM-DD-YYYY')
                  });
                }

              } else if (keyId != undefined) {

                thisObject
                  .props
                  .updateValue({
                    name: 'validTo',
                    value: moment(e.date).format('YYYY-MM-DD'),
                    startDate: e.date
                  }, keyId)

              } else {



              }

            });

        })

      })
  }

}

export default appController
