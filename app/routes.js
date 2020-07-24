'use strict'
/* Importing the node modules, child components, services and controllers used */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';


// Import routing components
import { browserHistory } from 'react-router';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import AssignmentList from './components/AssignmentList'
import agn from './components/AgnList'
import logout from './components/common/Logout'
import Login from './components/common/Login'
import CreateAssignment from './components/CreateAssignment'
import CreateAgn from './components/CreateAgn'
import PageNotFound from './components/PageNotFound'
import UnauthorizePage from './components/common/UnauthorizePage'


var $auth = {
	isLoggedIn: function () {
		if (localStorage.getItem("AzureUserName") != null) {
			return true;
	}else
	{
		return true;
	}
}
};
/* Load the components based on Local storage elements empty or not */
function decide() {

}

export default <Router history={browserHistory}>
	<div>
		<Switch>
			<Route exact path="/" component={agn} />

			<Route exact path="/assignment-list" component={AssignmentList} />
			<Route exact path="/create-agn" component={CreateAgn} />
			<Route exact path="/create-assignment" component={CreateAssignment} />
			<Route exact path="/un-authorized" component={UnauthorizePage} />

			<Route exact path="/logout" component={logout} />
			<Route exact path="/login" component={Login} />
			<Route path="*" component={PageNotFound} />
		</Switch>
	</div>
</Router>
