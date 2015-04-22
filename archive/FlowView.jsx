var FlowView = React.createClass({
    render: function () {
        // props
        var todaysActions = this.props.todaysActions;
        var activeAction = this.props.activeAction;
        
        // html
        return (
            <div className="panel-group">
                {todaysActions.map(function(action, index) {
                    return <FlowRootItem key={action.name} data={action} thisIndex={index} isCurrent={activeAction === action} editAction={this.props.editAction} />;
                }.bind(this))}
            </div>
        );
    }
});