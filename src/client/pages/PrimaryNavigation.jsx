(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('../../js/stores/ConnectionStore'),
        require('../../js/stores/FocusStore'),
        require('../../js/stores/NotificationStore'),
        require('../../js/stores/UserStore'),
        require('../components/FocusListItem'),
        require('../../../../../react_components/src/DropdownMenu'),
        require('../components/Microphone'),
        require('../components/NotificationDropdown'),
        require('../components/Timer')
    );
}(function (React, connectionStore, focusStore, notificationStore, userStore,
    FocusListItem, DropdownMenu, Microphone, NotificationDropdown, Timer) {

    var PrimaryNavigation = React.createClass({

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

                var imageStyle = {
                    width: '50px',
                    display: 'inline-block',
                    paddingRight: '5px'
                };

                button = (
                    <div><img style={imageStyle} src={currentFocus.iconUri} title={currentFocus.kind + ': ' + currentFocus.name} /></div>
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

                var menuItemStyle = {
                    display: 'block',
                    padding: '3px 5px',
                    borderBottom: '1px solid #e0e0e0',
                    clear: 'both',
                    fontWeight: '400',
                    lineHeight: '1.42857143',
                    color: '#333',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                };

                menuItems.push((
                    <li key="newfocus" >
                        <a onClick={this.handleFocusClick.bind(null, f)} style={menuItemStyle}>
                            <div>
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
                <DropdownMenu style={{padding: '2px', width: '50px'}} buttonContent={button} menuItems={menuItems} />
            );
        },
        renderConnectionsDropDownMenu: function () {

            var button = (<i className="fa fa-2x fa-users"></i>);

            var menuItems = connectionStore.updates.value.map(function (item) {
                return (
                    <li key={item.userName}>
                        <a href="javascript:;" onClick={ui.openConversation.bind(null, item.userName)} title={item.userName}>
                            <div style={{display: 'inline-block', width: '50px'}}>
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
                <li key="view-calendar"><a href="javascript:;" onClick={ui.goTo.bind(null, 'Calendar')} title="View Calendar">View Calendar</a></li>,
                <li key="manage-focuses"><a href="javascript:;" onClick={ui.goTo.bind(null, 'Focus Management')} title="Manage Focuses">Manage Focuses</a></li>,
                <li key="manage-plans"><a href="javascript:;" onClick={ui.goTo.bind(null, 'Manage Plans')} title="Manage Plans">Manage Plans</a></li>,
                <li key="manage-tags"><a href="javascript:;" onClick={ui.goTo.bind(null, 'Manage Tags')} title="Manage Tags">Manage Tags</a></li>,
                <li key="manage-targets"><a href="javascript:;" onClick={ui.goTo.bind(null, 'Manage Targets')} title="Manage Targets">Manage Targets</a></li>,
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
    return PrimaryNavigation;
}));
