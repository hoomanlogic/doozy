(function (factory) {
    require('./Actions.less');
    module.exports = exports = factory(
        require('react'),
        require('stores/ActionStore'),
        require('stores/LogEntryStore'),
        require('mixins/StoresMixin'),
        require('pages/ManageLogEntry'),
    );
}(function (React, actionStore, logEntryStore, StoresMixin, ManageLogEntry) {

    var LogEntryFormInterface = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        mixins: [StoresMixin([actionStore, logEntryStore], true)],
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

            if (!actionStore.updates.value || !logEntryStore.updates.value) {
                return (<div>No results</div>);
            }

            // let other components know what page we're on
            var mode = this.props.mode || 'Add';
            var page = (<ManageLogEntry logEntry={this.props.logentry} action={this.props.action} actionId={this.props.actionId} mode={mode} focusTag={this.state.currentFocus ? '!' + this.state.currentFocus.tagName : ''} />);

            return (
                <div>
                    {page}
                </div>
            );
        },
    });

    return LogEntryFormInterface;
}));
