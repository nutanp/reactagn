import React from 'react';
import { Link } from 'react-router-dom';
import Constants from '../../../constants';


class Header extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      appIdleTime: 0

    }
    this.idleTImechecking = this.idleTImechecking.bind(this);

  }
  async idleTImechecking() {
    this.lastActiveTime = new Date();
    window.onclick = function () {
      this.lastActiveTime = new Date();
    };
    window.onmousemove = function () {
      this.lastActiveTime = new Date();
    };
    window.onkeypress = function () {
      this.lastActiveTime = new Date();
    };
    window.onscroll = function () {
      this.lastActiveTime = new Date();
    };

    //let idleTimer_k = window.setInterval(this.CheckIdleTime, 10000);


  }
  async CheckIdleTime() {
    let dateNowTime = new Date().getTime();
    let lastActiveTime = new Date(this.lastActiveTime).getTime();
    let remTime = Math.floor((dateNowTime - lastActiveTime) / 1000);
    if (remTime > Constants.AGN_CONSTANTS.SESSION_TIME_OUT) {
      console.log("logout time");
    }
      console.log("Idle since "+remTime+" Seconds", Constants.AGN_CONSTANTS.SESSION_TIME_OUT)
  }
  async componentWillMount() {
    console.log("Showing Deployment to team!")
    let loginStatus = localStorage.getItem("AzureUserEmail") ? localStorage.getItem("AzureUserEmail") : null;
    
    if(loginStatus === null){

    } else if (localStorage.getItem("agnType") === "null" || localStorage.getItem("agnType") === null || localStorage.getItem("agnType") === "") {

       await this.props.data.history.push("/un-authorized");

    }
    //this.idleTImechecking();
  }
  render() {

    return (<header id="topnav">
      <div className="topbar-main">
        <div className="container-fluid">


          <div className="logo">

            <a href="/" className="logo">
              <img src="/images/mck_small_Logo.png" alt="" height="26" className="logo-small" />
              <img src="/images/mck_Logo.png" alt="" height="22" className="logo-large" />

            </a>
            <div className="nav-head">
              <span className="">AGN</span>

            </div>

          </div>


          <div className="menu-extras topbar-custom">
            <ul className="list-unstyled topbar-right-menu float-right mb-0">


              <li className="dropdown notification-list"> <a className="nav-link dropdown-toggle waves-effect nav-user" data-toggle="dropdown" href="#" role="button"
                aria-haspopup="false" aria-expanded="false"> <img src="/images/user.png" alt="user" className="rounded-circle" /> <span className="ml-1 pro-user-name">{localStorage.getItem("AzureUserName")}<i className="mdi mdi-chevron-down"></i> </span> </a>
                <div className="dropdown-menu dropdown-menu-right profile-dropdown ">
             

                  <a href="/Azurelogout" className="dropdown-item notify-item"> <i className="mdi mdi-power"></i> <span>Logout</span> </a> </div>
              </li>
            </ul>
          </div>


          <div className="clearfix"></div>
        </div>

      </div>


      <div className="navbar-custom">
        <div className="container-fluid">
          <div id="navigation">
            <ul className="navigation-menu">
            <li className="has-submenu"><div className="module-head"> <span>{localStorage.getItem("agnType") === Constants.AGN_COMPASS ? 'COMPASS' : localStorage.getItem("agnType")}</span></div></li>
            <li className="has-submenu"><Link to="/" className={this.props.data.match.path == "/" || this.props.data.match.path == "/create-agn" || this.props.data.match.path == "/agn-list" ? "head-nav-active" : ""}>AGN</Link></li>
            <li className="has-submenu"><Link to="/assignment-list" className={this.props.data.match.path == "/assignment-list" || this.props.data.match.path == "/add-update-agn" || this.props.data.match.path == "/create-assignment" ? "head-nav-active" : ""}>Assign List</Link></li>

            {/*<li className="has-submenu"><Link to="/exclude-list" className={this.props.data.match.path=="/exclude-list" || this.props.data.match.path=="/create-exclusion"? "head-nav-active" : ""}>Exclude List</Link></li>*/}
            </ul>

          </div>
        </div>

      </div>

    </header>
    )
  }


}

export default Header
