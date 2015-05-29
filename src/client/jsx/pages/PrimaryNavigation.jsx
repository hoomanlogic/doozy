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
            root.FocusListItem, 
            root.DropdownMenu, 
            root.NotificationDropDown, 
            root.Timer);
	}
}(this, function (React, connectionStore, notificationStore, FocusListItem, DropdownMenu, NotificationDropDown, Timer) {
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
                windowWidth: window.innerWidth
            };
        },

        componentDidMount: function() {
            window.addEventListener('resize', this.handleResize);
        },
        
        componentWillMount: function () {
            connectionStore.subscribe(this.handleConnectionStoreUpdate);
            notificationStore.subscribe(this.handleNotificationStoreUpdate);
            this.userObserver = userStore.updates
                .subscribe(this.handleUserStoreUpdate);
        },
        componentWillUnmount: function () {
            connectionStore.dispose(this.handleConnectionStoreUpdate);
            notificationStore.dispose(this.handleNotificationStoreUpdate);
            this.userObserver.dispose();
            window.removeEventListener('resize', this.handleResize);
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/

        handleConnectionStoreUpdate: function () {
            this.setState({connectionsLastUpdated: new Date().toISOString()});
        },
        handleNotificationStoreUpdate: function () {
            this.setState({notificationsLastUpdated: new Date().toISOString()});
        },
        handleUserStoreUpdate: function (prefs) {
            this.setState({preferencesLastUpdated: new Date().toISOString()});
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
            if (typeof currentFocus !== 'undefined' && currentFocus !== null) { 

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
                    tagName: '',
                    iconUri: null
                };
                
                menuItems.push((
                    <li key="newfocus" >
                        <a onClick={this.handleFocusClick.bind(null, f)} style={{borderBottom: '1px solid #e0e0e0', paddingTop: '3px', paddingBottom: '3px'}}>
                            <div className="focus">
                                <div style={{display: 'inline', verticalAlign: 'inherit'}}>
                                    <i className="fa fa-eye fa-2x" style={{width: '50px'}}></i>
                                </div>
                                <div style={{display: 'inline-block'}}>Add New Focus</div>
                            </div>
                        </a>
                    </li>
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
                        <a href="javascript:;" onClick={ui.openConversation.bind(null, item.userName)} title={item.userName}>
                            <div style={{}} style={{display: 'inline-block', width: '50px'}}>
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
                <li key="manage-projects"><a href="javascript:;" onClick={ui.goTo.bind(null, 'Manage Projects')} title="Manage Projects">Manage Projects</a></li>,
                <li key="manage-tags"><a href="javascript:;" onClick={ui.goTo.bind(null, 'Manage Tags')} title="Manage Tags">Manage Tags</a></li>,
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

            if (this.state.windowWidth < 500) {
                var adjustDropDownMenu = { marginRight: '-103px'};
            }
            
            return (
                <div className="navbar navbar-hl-theme">
                    <ul className="nav navbar-nav">
                        {focusesDropDownMenu}
                        <Microphone focusTag={this.props.currentFocus ? '!' + this.props.currentFocus.tagName : ''} />
                        <Timer />
                    </ul>
                    <ul className="nav navbar-nav navbar-right">
                        <NotificationDropdown isOpen={ui.page === 'Notifications'} dropDownMenuStyle={adjustDropDownMenu} />
                        {connectionsDropDownMenu}
                        {settingsDropDownMenu}
                    </ul>
                </div>
            );
        }
    });
}));