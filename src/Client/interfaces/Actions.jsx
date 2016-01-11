(function (factory) {
    require('./Actions.less');
    module.exports = exports = factory(
        require('react'),
        require('stores/ActionStore'),
        require('stores/LogEntryStore'),
        require('stores/PlanStore'),
        require('stores/TagStore'),
        require('mixins/StoresMixin'),
        require('components/FocusBar'),
        require('components/TimerBar'),
        require('components/FocusActions'),
    );
}(function (React, actionStore, logEntryStore, planStore, tagStore, StoresMixin, FocusBar, TimerBar, FocusActions) {

    var ActionsInterface = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        mixins: [StoresMixin([actionStore, logEntryStore, planStore, tagStore], true)],
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

            if (!actionStore.updates.value || !logEntryStore.updates.value) {
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
