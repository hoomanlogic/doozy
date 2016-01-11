(function (factory) {
    require('./Actions.less');
    module.exports = exports = factory(
        require('react'),
        require('stores/ActionStore'),
        require('stores/TagStore'),
        require('mixins/StoresMixin'),
        require('components/FocusBar'),
        require('components/TimerBar'),
        require('pages/ManageActions'),
    );
}(function (React, actionStore, tagStore, StoresMixin, FocusBar, TimerBar, ManageActions) {

    var ActionsInterface = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        mixins: [StoresMixin([actionStore, tagStore], true)],
        getInitialState: function () {
            return {
                currentFocus: null
            };
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleFocusClick: function (item) {
            this.setState({ currentFocus: item.name === null ? undefined : item });
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {

            if (!actionStore.updates.value || !tagStore.updates.value) {
                return (<div>No results</div>);
            }

            return (
                <div>
                    <FocusBar currentFocus={this.state.currentFocus}
                        handleFocusClick={this.handleFocusClick} />
                    <TimerBar />
                    <ManageActions focusTag={this.state.currentFocus ? '!' + this.state.currentFocus.tagName : undefined} />
                </div>
            );
        },
    });

    return ActionsInterface;
}));
