import React from 'react';
import { Link } from 'react-router-dom';
import Constants from '../../../constants';


class UnauthorizePage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {

    }


  }
  

  render() {

    return (<div className="bg__unauthorized">
      <div>
        <img src="images/unauthorised.png" alt="" />
      </div>
      <div className="unauthorized__text__wrap">
        <h1>401</h1>
        <h2>Unauthorized</h2>
        <p>{Constants.AGN_CONSTANTS.ERROR_MESSAGE_FOR_UNAUTHORIZED_USER}</p>
        <a href="/Azurelogout"><button className="btn btn-default btn-rounded waves-light waves-effect btn-lg"><i className="mdi mdi-arrow-left"></i>Logout</button></a>
      </div>

    </div>

    )
  }


}

export default UnauthorizePage
