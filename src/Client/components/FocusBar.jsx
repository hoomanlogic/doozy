(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('hl-common-js/src/those'),
        require('app/doozy'),
        require('stores/tag-store'),
        require('components/FocusListItem'),
        require('components/DropdownMenu'),
        require('components/Microphone'),
        require('components/NotificationDropdown'),
        require('components/Timer')
    );
}(function (React, those, doozy, tagStore,
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
            tagStore.subscribe(this.handleStoreUpdate, {});
        },
        componentWillUnmount: function () {
            tagStore.unsubscribe(this.handleStoreUpdate, {});
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
             * Add a tag list item for each item in the list
             */
            if (!tagStore.context({}) || !tagStore.context({}).value) {
                return <div>Loading...</div>;
            }

            var menuItems = those(tagStore.context({}).value).like({ kind: 'Focus' }).map(function (item) {
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
            var f = doozy.tag();
            f.name = 'nofocus';
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

            var button = null;
            if (currentFocus && currentFocus.name !== 'nofocus') {

                var imageStyle = {
                    width: '50px',
                    display: 'inline-block',
                    paddingRight: '5px'
                };

                button = (
                    <div><img style={imageStyle} src={'/my/doozy/tag/' + currentFocus.name + '/icon.png'} title={currentFocus.kind + ': ' + currentFocus.name} /></div>
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
                        <Microphone focusTag={this.props.currentFocus ? this.props.currentFocus.name : ''} />
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
