(function (factory) {
    require('./Actions.less');
    module.exports = exports = factory(
        require('react'),
        require('stores/ActionStore'),
        require('stores/FocusStore'),
        require('stores/TagStore'),
        require('components/FocusBar'),
        require('components/TimerBar'),
        require('components/FocusActions'),
    );
}(function (React, actionStore, focusStore, tagStore, FocusBar, TimerBar, FocusActions) {

    var initializeStores = function () {
        actionStore.init('kat', 'foo');
        focusStore.init('kat', 'foo');
        tagStore.init('kat', 'foo');
    };

    var ActionsInterface = React.createClass({
        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        componentWillMount: function () {
            initializeStores();
            
            /**
             * Subscribe to Action Store so we can
             * update the current focus when necessary
             */
            this.actionsObserver = actionStore.updates
                .filter(function (result) {
                    return result.length > 0;
                })
                .subscribe(this.handleStoreUpdate);
                
            /**
             * Subscribe to Focus Store so we can
             * update the current focus when necessary
             */
            this.focusesObserver = focusStore.updates
                .filter(function (result) {
                    return result.length > 0;
                })
                .subscribe(this.handleStoreUpdate);

            /**
             * Subscribe to Tag Store so we can
             * update the current focus when necessary
             */
            this.tagsObserver = tagStore.updates
                .filter(function (result) {
                    return result.length > 0;
                })
                .subscribe(this.handleStoreUpdate);
        },
        componentWillUnmount: function () {
            /**
             * Clean up objects and bindings
             */
            this.actionsObserver.dispose();
            this.focusesObserver.dispose();
            this.tagsObserver.dispose();
        },
        
        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleFocusClick: function (item) {
            this.setState({ currentFocus: item.name === null ? undefined : item });
        },
        // handleFocusStoreUpdate: function (focuses) {
        //     if (this.state.currentFocus === null && focuses.length > 0) {
        //         this.setState({ currentFocus: focuses[0] });
        //     } else if (this.state.currentFocus !== null && (focuses === null || focuses.length === 0)) {
        //         this.setState({ currentFocus: null });
        //     } else {
        //         var currentFocus = null;
        //         if (this.state.currentFocus) {
        //             currentFocus = _.find(focuses, function(item) {
        //                 return item.id === this.state.currentFocus.id;
        //             }.bind(this));
        //         }
        //         this.setState({ currentFocus: currentFocus });
        //     }
        // },
        handleStoreUpdate: function () {
            this.setState({
                lastStoreUpdate: new Date().toISOString() 
            });
        },
        
        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            // let other components know what page we're on
            
            var actions;
            if (!tagStore.updates.value) {
                return (<div>No results</div>);
            }
            return (
                <div>
                    <FocusBar currentFocus={this.state.currentFocus}
                        handleFocusClick={this.handleFocusClick} />
                    <TimerBar />
                    <FocusActions focusTag={this.state.currentFocus ? '!' + this.state.currentFocus.tagName : undefined} />
                </div>
            );
        },
    });

    return ActionsInterface;
}));
