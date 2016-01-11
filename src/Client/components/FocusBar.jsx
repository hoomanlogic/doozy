(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('app/doozy'),
        require('stores/focus-store'),
        require('components/FocusListItem'),
        require('components/DropdownMenu'),
        require('components/Microphone'),
        require('components/NotificationDropdown'),
        require('components/Timer')
    );
}(function (React, doozy, focusStore,
    FocusListItem, DropdownMenu, Microphone, NotificationDropdown, Timer) {

    var FocusBar = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        getInitialState: function () {
            return {
                storeLastUpdated: new Date().toISOString(),
                windowWidth: window.innerWidth
            };
        },

        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        componentDidMount: function () {
            window.addEventListener('resize', this.handleResize);
        },

        componentWillMount: function () {
            focusStore.subscribe(this.handleStoreUpdate, {});
        },
        componentWillUnmount: function () {
            focusStore.unsubscribe(this.handleStoreUpdate, {});
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/

        handleStoreUpdate: function () {
            this.setState({storeLastUpdated: new Date().toISOString()});
        },
        handleFocusClick: function (item) {
            this.props.handleFocusClick(item);
        },
        handleResize: function () {
            this.setState({windowWidth: window.innerWidth});
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        renderFocusesDropDownMenu: function () {
            var currentFocus = this.props.currentFocus;

            /**
             * Add a focus list item for each item in the list
             */
            if (!focusStore.context({}) || !focusStore.context({}).value) {
                return <div>Loading...</div>;
            }

            var menuItems = focusStore.context({}).value.map(function (item) {
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
            var f = doozy.focus();

            if (this.props.currentPage === 'Focus Management') {
                menuItems.push((
                    <li key="newfocus" >
                        <a onClick={this.handleFocusClick.bind(null, f)} style={styles.menuItem}>
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
            else {
                f.name = null;
                f.tagName = 'nofocus';
                menuItems.push((
                    <li key="nofocus" >
                        <a onClick={this.handleFocusClick.bind(null, f)} style={styles.menuItem}>
                            <div>
                                <div style={{display: 'inline', verticalAlign: 'inherit'}}>
                                    <i className="fa fa-eye fa-2x" style={{width: '50px'}}></i>
                                </div>
                                <div style={{display: 'inline-block'}}>Clear Focus</div>
                            </div>
                        </a>
                    </li>
                ));
            }

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
            else {

                button = (
                    <div><i className="fa fa-eye fa-2x" style={{width: '50px'}}></i></div>
                );
            }

            return (
                <DropdownMenu style={{padding: '2px', width: '50px'}} buttonContent={button} menuItems={menuItems} />
            );
        },
        render: function () {

            var focusesDropDownMenu = this.renderFocusesDropDownMenu();

            // if (this.state.windowWidth < 500) {
            //     var adjustDropDownMenu = { marginRight: '-103px'};
            // }

            return (
                <div className="navbar navbar-hl-theme">
                    <ul className="nav navbar-nav">
                        {focusesDropDownMenu}
                        <Microphone focusTag={this.props.currentFocus ? '!' + this.props.currentFocus.tagName : ''} />
                        <Timer />
                    </ul>
                </div>
            );
        }
    });

    var styles = {
        menuItem: {
            display: 'block',
            padding: '3px 5px',
            borderBottom: '1px solid #e0e0e0',
            clear: 'both',
            fontWeight: '400',
            lineHeight: '1.42857143',
            color: '#333',
            whiteSpace: 'nowrap',
            cursor: 'pointer'
        }
    };

    return FocusBar;
}));
