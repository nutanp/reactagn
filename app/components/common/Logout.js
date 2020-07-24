import React from 'react';
import { Link } from 'react-router-dom';
import Constants from '../../../constants';

//let authContext = new AuthenticationContext({
//clientId: Constants.AGN_CONSTANTS.AZURE_CLIENT_ID,
//postLogoutRedirectUri: Constants.AGN_CONSTANTS.AZURE_LOGOUT_URL
//});


class logout extends React.Component {
  constructor(props) {
    super(props)
    this.state = {

    }


  }
  async componentWillMount() {


    if (localStorage.getItem("AzureUserName") != null) {
      //console.log(authContext);
      localStorage.clear();
      //authContext.logOut();
    } else {
      //await this.props.history.push("/login");
    }

  }


  render() {


    return (
      <div>

        <div className="logout-wrap">
          <div className="mc_logo">
            <img src="images/mck-logo.png" />
          </div>
          <div className="logout-text">
            <h1>Logout successfully</h1>
          </div>
          <div className="logout-btn">
            <Link to="/login" className="btn btn-primary btn-rounded">Login Page</Link>
          </div>
        </div>


      </div>
    )
  }


}

export default logout
