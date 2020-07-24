import React from 'react';
import { Link } from 'react-router-dom';
import Constants from '../../../constants';


class NoDataFound extends React.Component {
  constructor(props) {
    super(props)
    this.state = {

    }


  }


  render() {

    return (<div className="row">
      <div className="col-md-12">
        <div className="m-t-30">
          <div className="d-flex justify-content-between">
            <div className="card-fl-item">
              <h4 className="m-b-30 header-title"></h4>
            </div>

          </div>

          <div className="noresults-wrap">
            <div className="noresult-item"><img className="img-fluid" src="/images/noresults.png" alt="" /> </div>
            <div className="noresult-item">
              <h3>{Constants.AGN_CONSTANTS.ERROR_MESSAGE_NO_DATA_FOUND}</h3>
            </div>
          </div>

        </div>
      </div>


    </div>
    )
  }


}

export default NoDataFound
