var FlowRootItem = React.createClass({
    render: function () {
        // props
        var item = this.props.data;
        var thisIndex = this.props.thisIndex;
        var isCurrent = this.props.isCurrent;
        
        var description = null;
        var children = null;
        if (typeof item.items !== 'undefined' && item.items.length > 0) {
            description = (
                <div className="inline">
                    {item.items.map(function(item, index, array) {
                        return <FlowRootDescription key={'desc' + item.name} data={item} thisIndex={index} thisArray={array} />;
                    })}
                </div>
            );
            children = (
                <ul className="list-group">
                    {item.items.map(function(item) {
                        return <FlowItem key={item.name} data={item} editAction={this.props.editAction} />;
                    }.bind(this))}
                </ul>
            );
        }
                                     
        var header = (
            <span onDoubleClick={this.handleDblClick}>{hldatetime.formatTimeFromMinutes(item.startAt)} - {hldatetime.formatTimeFromMinutes(item.startAt + item.getDuration())} <strong>{item.name}</strong> {description}</span>
        );
        
        return (
            <Panel header={header} type={isCurrent ? 'info' : 'default'} children={children} />
        );
    },
    handleDblClick: function () {
        this.props.editAction(this.props.data);
    }
});