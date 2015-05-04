/** @jsx React.DOM */

// CommonJS, AMD, and Global shim
(function (root, factory) {
    'use strict';
	if (typeof exports === "object") {
		// CommonJS
		module.exports = exports = factory(
            require('react'),
            require('../../js/stores/ConnectionStore'),
            require('../../js/stores/NotificationStore'),
            require('../../js/stores/TimerStore'),
            require('../components/FocusListItem'),
            require('../../../../../react_components/src/DropdownMenu'), 
            require('../components/NotificationDropDown'),
            require('../components/Timer')
        );
	}
	else if (typeof define === "function" && define.amd) {
		// AMD
		define([
            'react',
            '../../js/stores/ConnectionStore',
            '../../js/stores/NotificationStore',
            '../../js/stores/TimerStore',
            '../components/FocusListItem',
            '../../../../../react_components/src/DropdownMenu', 
            '../components/NotificationDropDown',
            '../components/Timer'
        ], factory);
	}
	else {
		// Global (browser)
		root.PrimaryNavigation = factory(
            root.React,
            root.connectionStore, 
            root.notificationStore, 
            root.timerStore, 
            root.FocusListItem, 
            root.DropdownMenu, 
            root.NotificationDropDown, 
            root.Timer);
	}
}(this, function (React, connectionStore, notificationStore, timerStore, FocusListItem, DropdownMenu, NotificationDropDown, Timer) {
    'use strict';
    return React.createClass({

        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        getInitialState: function () {
            return {
                connectionsLastUpdated: new Date().toISOString(),
                notificationsLastUpdated: new Date().toISOString(),
                preferencesLastUpdated: new Date().toISOString(),
                timerLastUpdated: new Date().toISOString(),
                windowWidth: window.innerWidth
            };
        },

        componentDidMount: function() {
            window.addEventListener('resize', this.handleResize);
        },
        
        componentWillMount: function () {
            connectionStore.subscribe(this.handleConnectionStoreUpdate);
            notificationStore.subscribe(this.handleNotificationStoreUpdate);
            timerStore.subscribe(this.handleTimerStoreUpdate);
            this.userObserver = userStore.updates
                .subscribe(this.handleUserStoreUpdate);
        },
        componentWillUnmount: function () {
            connectionStore.dispose(this.handleConnectionStoreUpdate);
            notificationStore.dispose(this.handleNotificationStoreUpdate);
            timerStore.dispose(this.handleTimerStoreUpdate);
            this.userObserver.dispose();
            window.removeEventListener('resize', this.handleResize);
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleChange: function (event) {
            timerStore.updateWorkingOn(event.target.value);
        },
        handleConnectionStoreUpdate: function () {
            this.setState({connectionsLastUpdated: new Date().toISOString()});
        },
        handleNotificationStoreUpdate: function () {
            this.setState({notificationsLastUpdated: new Date().toISOString()});
        },
        handleDoneTimerClick: function () {
            timerStore.pauseTimer();
            var duration = new babble.Duration(timerStore.updates.value.timeSoFar);

            ui.logAction({
                name: timerStore.updates.value.workingOn,
                duration: duration.toMinutes(),
                tags: ui.tags
            });
        },
        handleResetTimerClick: function () {
            timerStore.resetTimer();
        },
        handleUserStoreUpdate: function (prefs) {
            this.setState({preferencesLastUpdated: new Date().toISOString()});
        },
        handleTimerStoreUpdate: function (prefs) {
            this.setState({timerLastUpdated: new Date().toISOString()});
        },
        handleFocusClick: function (item) {
            this.props.handleFocusClick(item);  
        },
        handleResize: function(e) {
            this.setState({windowWidth: window.innerWidth});
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        renderFocusesDropDownMenu: function () {
            var currentFocus = this.props.currentFocus;

            var button = null;
            if (currentFocus !== null) { 

                button = (
                    <div className="focus"><img src={currentFocus.iconUri} title={currentFocus.kind + ': ' + currentFocus.name} /></div>
                );
            }

            var menuItems = focusStore.updates.value.map(function (item) {
                return (
                    <FocusListItem 
                        key={item.id} 
                        data={item} 
                        handleFocusClick={this.handleFocusClick} />
                ); 
            }.bind(this));

            /**
             * Add additional menu item when in Focus Management
             */
            if (this.props.currentPage === 'Focus Management') {
                var ref = hlcommon.uuid();
                var f = {
                    isNew: true,
                    ref: ref,
                    id: ref,
                    kind: 'Role',
                    name: '',
                    tagName: ''
                };
                menuItems.push((
                    <a onClick={this.handleFocusClick.bind(null, f)}>
                        <div className="focus">
                            Add New Focus
                        </div>
                    </a>
                ));
            }

            return (
                <DropdownMenu className="focus" style={{padding: '2px'}} buttonContent={button} menuItems={menuItems} />  
            );
        },
        renderConnectionsDropDownMenu: function () {

            var button = (<i className="fa fa-2x fa-users"></i>);

            var menuItems = connectionStore.updates.value.map(function (item) {
                return (
                    <li key={item.userName}>
                        <a href="javascript:;" 
                            onClick={ui.openConversation.bind(null, item.userName)} 
                            title={item.userName}>

                            <div style={{display: 'inline-block'}} 
                                className="w50">

                                <img className="img-responsive" src={item.profileUri} />
                            </div>
                            <span style={{verticalAlign: 'super'}}>{item.name}</span>
                        </a>
                    </li>
                ); 
            }.bind(this));

            return (
                <DropdownMenu
                    style={{padding: '5px'}} 
                    buttonContent={button} 
                    menuItems={menuItems} />
            );
        },
        renderSettingsDropDownMenu: function () {

            if (userStore.updates.value.profileUri) {
                var button = (<img style={{maxHeight: '40px'}} src={userStore.updates.value.profileUri} title={userStore.updates.value.userName} />);
            } else {
                var button = (<i className="fa fa-2x fa-gear"></i>);
            }

            var menuItems = ([
                <li key="manage-focuses"><a href="javascript:;" onClick={ui.goTo.bind(null, 'Focus Management')} title="Manage Focuses">Manage Focuses</a></li>,
                <li key="manage-persona"><a href="javascript:;" onClick={ui.goTo.bind(null, 'Preferences')} title="Preferences">Preferences</a></li>,
                <li key="manage-account"><a href="/Manage" title="Manage">Account</a></li>,
                <li key="logout"><a href="javascript:sessionStorage.removeItem('accessToken');$('#logoutForm').submit();">Log off</a></li>		    
            ]);

            return (
                <DropdownMenu
                    style={{padding: '5px'}} 
                    buttonContent={button} 
                    menuItems={menuItems} />  
            );
        },
        render: function () {

            var focusesDropDownMenu = this.renderFocusesDropDownMenu();
            var connectionsDropDownMenu = this.renderConnectionsDropDownMenu();
            var settingsDropDownMenu = this.renderSettingsDropDownMenu();

            var aStyle = {
                padding: '5px'
            };

            var inputStyle = {
                position: 'relative',
                top: '10px'   
            };

            var timer, workingOn, timerDone, timerReset;

            if (this.state.windowWidth > 600) {
                timer = (<Timer />);
                workingOn = (
                    <li>
                        <input ref="workingOn" style={inputStyle} type="text" placeholder="What are you working on?" onChange={this.handleChange} value={timerStore.updates.value.workingOn} />
                    </li>
                );
                timerDone = (<li>
                            <a style={aStyle} href="javascript:;" onClick={this.handleDoneTimerClick}>
                                <i className="fa fa-2x fa-check-square-o"></i>
                            </a>
                        </li>);
                timerReset = (<li>
                            <a style={aStyle} href="javascript:;" onClick={this.handleResetTimerClick}>
                                <i style={{marginTop: '-2px'}} className="fa fa-2x fa-times"></i>
                            </a>
                        </li>);
            }

            if (this.state.windowWidth < 500) {
                var adjustDropDownMenu = { marginRight: '-103px'};
            }

            return (
                <div className="navbar navbar-hl-theme navbar-fixed-top">
                    <ul className="nav navbar-nav">
                        {focusesDropDownMenu}
                        <Microphone focusTag={this.props.currentFocus ? '!' + this.props.currentFocus.tagName : ''} />
                        {timer}
                        {workingOn}
                        {timerDone}
                        {timerReset}
                    </ul>
                    <ul className="nav navbar-nav navbar-right">
                        <NotificationDropdown dropDownMenuStyle={adjustDropDownMenu} />
                        {connectionsDropDownMenu}
                        {settingsDropDownMenu}
                    </ul>
                </div>
            );
        }
    });
}));