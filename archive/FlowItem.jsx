var FlowItem = React.createClass({
    render: function () {
        var item = this.props.data;
        var children = null;
        if (typeof item.items !== 'undefined' && item.items.length > 0) {
            children = (
                <ul className="list-group">
                    {item.items.map(function(item) {
                        return <FlowItem key={item.name} data={item} editAction={this.props.editAction} />;
                    })}
                </ul>
            );
        }
        
        return (
            <li className="list-group-item" onDoubleClick={this.handleDblClick}>
                {item.name} {item.getFormattedDuration()} {item instanceof Log ? item.questions[0].question : '' }
                {children}
            </li>
        );
    },
    handleDblClick: function () {
        this.props.editAction(this.props.data);
    }
});