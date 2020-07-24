import React from 'react';
import { Link } from 'react-router-dom';

class PageNotFound extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        }

    }


    render() {


        return (
            <div className="error-bg2">
                <div className="error-wrap2"> <img className="img-fluid" src="./images/404.png" alt="" />
                    <h1>Whoops!</h1>
                    <p>We couldn{"'"}t find the page you were looking for</p>
                    <Link to="/" className="btn btn-warning btn-rounded waves-light waves-effect btn-lg"><i className="mdi mdi-arrow-left"></i> Back to Home</Link> </div>
            </div>
        )
    }


}

export default PageNotFound
