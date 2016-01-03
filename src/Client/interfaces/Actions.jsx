(function (factory) {
    require('./Actions.less');
    module.exports = exports = factory(
        require('react'),
        require('stores/ActionStore'),
        require('stores/FocusStore'),
        require('stores/LogEntryStore'),
        require('stores/PlanStore'),
        require('stores/PlanStepStore'),
        require('stores/TagStore'),
        require('stores/TargetStore'),
        require('mixins/StoresMixin'),
        require('components/FocusBar'),
        require('components/TimerBar'),
        require('components/FocusActions'),
    );
}(function (React, actionStore, focusStore, logEntryStore, planStore, planStepStore, tagStore, targetStore, StoresMixin, FocusBar, TimerBar, FocusActions) {

    // var initializeGlobals = function (host) {
    //     /**
    //         * Global UI Handles
    //         */
    //     window['ui'] = window['ui'] || {};
    //     //window['ui'].addAction = host.addAction;
    //     //window['ui'].editAction = host.editAction;
    //     //window['ui'].logEntry = host.logEntry;
    //     //window['ui'].logNewAction = host.logNewAction;
    //     //window['ui'].editLogEntry = host.editLogEntry;
    //     // window['ui'].goTo = host.goTo;
    //     // window['ui'].goBack = host.goBack;
    //     // window['ui'].openConversation = host.selectConversation;
    //     // window['ui'].getHeightBuffer = host.getHeightBuffer;
    //     // window['ui'].queueRequest = host.queueRequest;
    //     // window['ui'].message = host (text, kind) {
    //     //     if (!kind) {
    //     //         kind = 'info';
    //     //     }
    //     //     toastr[kind](text);
    //     // }
    // };

    var ActionsInterface = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        mixins: [StoresMixin([actionStore, focusStore, logEntryStore, planStore, planStepStore, tagStore, targetStore], true)],
        getInitialState: function () {
            return {
                currentFocus: null
            };
        },

        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/

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

            if (!actionStore.updates.value) {
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
