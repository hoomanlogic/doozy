var skycons = new Skycons();
var WeatherIcon = React.createClass({
    componentDidMount: function () {
        this.draw();
    },
    componentDidUpdate: function () {
        this.draw();
    },
    componentWillUnmount: function () {
        skycons.remove(this.props.id);
    },
    getDefaultProps : function () {
        return { color: "black", width: 64, height: 80, style: { }};
    },
    render: function () {
            return (<canvas className="weather-icon" style={this.props.style} width={this.props.width} height={this.props.height} id={this.props.id} data-toggle="tooltip" data-placement="left" title={this.props.info}></canvas>);
    },
    draw: function () {
        skycons.set(this.props.id, this.props.icon, this.props.color);
        //skycons.play();
    }
});