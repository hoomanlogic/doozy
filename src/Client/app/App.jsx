(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('stores/ActionStore'),
        require('stores/FocusStore'),
        require('stores/TagStore'),
        require('components/FocusActions'),
    );
}(function (React, actionStore, focusStore, tagStore, FocusActions) {

    var initializeStores = function () {
        actionStore.init('kat', 'foo');
        focusStore.init('kat', 'foo');
        tagStore.init('kat', 'foo');
    };

    var DoozyApp = React.createClass({
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
        
        handleStoreUpdate: function () {
            this.setState({
                lastStoreUpdate: new Date().toISOString() 
            });
        },
        
        render: function () {
            // let other components know what page we're on
            
            var actions;
            if (!tagStore.updates.value) {
                return (<div>No results</div>);
            }
            return (
                <div>
                    <FocusActions focusTag={this.state.currentFocus ? '!' + this.state.currentFocus.tagName : undefined} />
                </div>
            );
        },
    });

    return DoozyApp;
}));
