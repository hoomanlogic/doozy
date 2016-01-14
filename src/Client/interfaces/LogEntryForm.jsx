(function (factory) {
    require('./Actions.less');
    module.exports = exports = factory(
        require('react'),
        require('pages/ManageLogEntry'),
    );
}(function (React, ManageLogEntry) {

    var LogEntryFormInterface = React.createClass({
        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            var mode = this.props.mode || 'Add';
            return (
                <ManageLogEntry id={this.props.id} actionId={this.props.actionId} actionName={this.props.actionName} mode={mode} />
            );
        },
    });

    return LogEntryFormInterface;
}));
