var PrimaryNavigation = React.createClass({

    /*************************************************************
     * COMPONENT LIFECYCLE
     *************************************************************/
    getInitialState: function () {
        return {
            connectionsLastUpdated: new Date().toISOString(),
            notificationsLastUpdated: new Date().toISOString(),
            preferencesLastUpdated: new Date().toISOString(),
            timerLastUpdated: new Date().toISOString()
        };
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
            duration: duration.toMinutes()
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
                <Focus 
                    key={item.id} 
                    data={item} 
                    handleFocusClick={this.handleFocusClick} />
            ); 
        }.bind(this));
        
        /**
         * Add additional menu item when in Focus Management
         */
        if (this.props.currentPage === 'Focus Management') {
            var f = new Focus();
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
                        onClick={this.props.openConversation.bind(null, item.userName)} 
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
                className='pull-right' 
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
            <li key="manage-focuses"><a href="javascript:;" onClick={this.props.goTo.bind(null, 'Focus Management')} title="Manage Focuses">Manage Focuses</a></li>,
            <li key="manage-persona"><a href="javascript:;" onClick={this.props.goTo.bind(null, 'Persona Management')} title="Manage Persona">Manage Persona</a></li>,
            <li key="manage-account"><a href="/Manage" title="Manage">Account</a></li>,
		    <li key="logout"><a href="javascript:sessionStorage.removeItem('accessToken');$('#logoutForm').submit();">Log off</a></li>		    
        ]);
                          
        return (
            <DropdownMenu 
                className='pull-right' 
                style={{padding: '5px', paddingRight: '20px'}} 
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
        
        return (
            <div className="navbar navbar-hl-theme navbar-fixed-top">
                <ul className="nav navbar-nav">
                    {focusesDropDownMenu}
                    <Timer />
                    <li>
                        <input ref="workingOn" style={inputStyle} type="text" placeholder="What are you working on?" onChange={this.handleChange} value={timerStore.updates.value.workingOn} />
                    </li>
                    <li>
                        <a style={aStyle} href="javascript:;" onClick={this.handleDoneTimerClick}>
                            <i className="fa fa-2x fa-check-square-o"></i>
                        </a>
                    </li>
                    <li>
                        <a style={aStyle} href="javascript:;" onClick={this.handleResetTimerClick}>
                            <i style={{marginTop: '-2px'}} className="fa fa-2x fa-times"></i>
                        </a>
                    </li>
                </ul>
                <ul className="nav navbar-nav navbar-right">
                    {settingsDropDownMenu}
                    {connectionsDropDownMenu}
                    <NotificationDropdown
                        goTo={this.props.goTo} 
                        openConversation={this.props.openConversation} />
                </ul>
            </div>
        );
    },
});