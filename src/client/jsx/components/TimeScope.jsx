var TimeScope = React.createClass({
    render: function () {
        var item = this.props.data;

        return (
            <li key={item}>
                <a onClick={this.handleTimeScopeClicked.bind(null, item)}>
                    <div><span>{item}</span></div>
                </a>
            </li>
        );
    },
    handleTimeScopeClicked: function (item) {
        if (this.props.handleTimeScopeClicked) {
            this.props.handleTimeScopeClicked(item);   
        }
    }
});