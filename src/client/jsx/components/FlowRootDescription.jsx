var FlowRootDescription = React.createClass({
    render: function () {
        // props
        var item = this.props.data;
        var thisIndex = this.props.thisIndex;
        var thisArray = this.props.thisArray;
        // calcs
        var description = item.name + (thisIndex !== (thisArray.length - 1) ? ', ' : '');
        // html
        return (
            <span>{description}</span>
        );
    }
});