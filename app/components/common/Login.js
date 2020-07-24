import React from 'react';
import { Link } from 'react-router-dom';
import Constants from '../../../constants';
import AgnService from '../../../services/agnService';
import _ from 'lodash';
import Loader from 'react-loader-advanced';




class Login extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
          loaderStatus:false,
          sleepMode:true
        }
        this.onClickLogin = this.onClickLogin.bind();

    }
    async componentWillMount() {
        console.log("Showing Deployment to team!")
      const loginDetails = await AgnService.Azurelogin();
            await this.setState({loaderStatus:true});
            const userInfo = loginDetails;
            const envInfo=global.gConfig.config_id;
            console.log("Automated deployemnt testing-TV : ",envInfo);
            if (Object.keys(userInfo).length > 0) {

                // localStorage.setItem("AzureId", userInfo.aio);
                localStorage.setItem("AzureUserName", userInfo.name ? userInfo.name : "");
                localStorage.setItem("AzureUserEmail", userInfo.preferred_username ? userInfo.preferred_username : "");
                userInfo.groups = userInfo.groups ? userInfo.groups : [];
                let userType = false;
                //Adding Logic to seperate Prod and Dev Azure Athorization
                if (envInfo==="development" || envInfo==="QA")
                {    console.log("we are inside DEV/QA/Support");
               
                    if (userInfo.groups.indexOf(Constants.AGN_CONSTANTS.AZURE_AD_FLU_GROUP_ID) > -1) {//AZURE_AD_COMPASS_GROUP_ID

                        localStorage.setItem("agnType", Constants.AGN_FLU); //AGN_COMPASS
                        userType = true;
                    } else if (userInfo.groups.indexOf(Constants.AGN_CONSTANTS.AZURE_AD_COMPASS_GROUP_ID) > -1) {//AZURE_AD_FLU_GROUP_ID

                        localStorage.setItem("agnType", Constants.AGN_COMPASS);//AGN_FLU
                        userType = true;
                    } 
                    else if (userInfo.groups.indexOf('a6b1134f-04aa-40b1-b1aa-139d8d089897') > -1) {//AZURE_AD_SUPPORT_GROUP_ID

                        localStorage.setItem("agnType",Constants.AGN_FLU);//AGN_FLU
                        console.log("you are also in support");
                        userType = true;
                    } 
                    
                    else {
                        localStorage.setItem("agnType",Constants.AGN_FLU);//AGN_FLU
                        console.log("support");
                        userType = true;
                        //
                      //  localStorage.setItem("agnType", null);
                      //  await this.props.history.push("/un-authorized");//temporary disabling unauthorized ppl
                    }
                }
               else if (envInfo=="production")
                {
                    if (userInfo.groups.indexOf(Constants.AGN_CONSTANTS.AZURE_AD_FLU_GROUP_ID_PROD) > -1) {//AZURE_AD_COMPASS_GROUP_ID

                        localStorage.setItem("agnType", Constants.AGN_FLU); //AGN_COMPASS
                        userType = true;
                    } else if (userInfo.groups.indexOf(Constants.AGN_CONSTANTS.AZURE_AD_COMPASS_GROUP_ID_PROD) > -1) {//AZURE_AD_FLU_GROUP_ID

                        localStorage.setItem("agnType", Constants.AGN_COMPASS);//AGN_FLU
                        userType = true;
                    } else {
                        localStorage.setItem("agnType", null);
                        await this.props.history.push("/un-authorized");
                    }
                }
                else
                {
                    if (userInfo.groups.indexOf(Constants.AGN_CONSTANTS.AZURE_AD_FLU_GROUP_ID_PROD) > -1) {//AZURE_AD_COMPASS_GROUP_ID

                        localStorage.setItem("agnType", Constants.AGN_FLU); //AGN_COMPASS
                        userType = true;
                    } else if (userInfo.groups.indexOf(Constants.AGN_CONSTANTS.AZURE_AD_COMPASS_GROUP_ID_PROD) > -1) {//AZURE_AD_FLU_GROUP_ID

                        localStorage.setItem("agnType", Constants.AGN_COMPASS);//AGN_FLU
                        userType = true;
                    } else {
                        localStorage.setItem("agnType", null);
                        await this.props.history.push("/un-authorized");
                    }
                }

                if (userType === true) {
                    const employeeId = await AgnService.getEmployeeId({ "submittedBy": userInfo.preferred_username });
                    if (employeeId !== null) {
                      await localStorage.setItem("eid", employeeId.eid);
                    } else {
                        localStorage.setItem("eid", "");
                    }



                    await this.props.history.push("/");
                }

            } else{
              await this.setState({loaderStatus:false, sleepMode:false});
            }


    }
    async onClickLogin() {

        //authContext.config.redirectUri = Constants.AGN_CONSTANTS.AZURE_REDIRECT_URL
        //console.log(authContext);
        //authContext.login();

    }

    render() {
      const spinner = <span><img src="/images/ajax-loader.gif"/><div>Loading...</div></span>;


        return (
            <div>
            <Loader show={this.state.loaderStatus} message={spinner}>
            {this.state.sleepMode !== true ?
                <div className="logout-wrap">
                    <div className="mc_logo">
                        <img src="images/mck-logo.png" />
                    </div>
                    <div className="logout-text">
                        <h1>AGN</h1>
                    </div>
                    <div className="logout-btn">
                        <a href="/AzureLogin" className="btn btn-primary btn-rounded" onClick={this.onClickLogin.bind(this)}>Login</a>
                    </div>
                </div> : ""}

                </Loader>
            </div>
        )
    }


}

export default Login
