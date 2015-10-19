(function (factory) {
    module.exports = exports = factory(
        require('react')
    );
}(function (React) {
    var WeatherIcon = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        skycons: new Skycons(),
        getDefaultProps : function () {
            return { color: "black", width: 64, height: 80, style: { }};
        },

        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        componentWillUnmount: function () {
            this.skycons.remove(this.props.id);
        },

        componentDidMount: function () {
            this.draw();
        },
        componentDidUpdate: function () {
            this.draw();
        },

        /*************************************************************
         * RENDERING HELPERS
         *************************************************************/
        draw: function () {
            this.skycons.set(this.props.id, this.props.icon, this.props.color);
            //skycons.play();
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            return (
                <canvas className="weather-icon" style={this.props.style} width={this.props.width} height={this.props.height} id={this.props.id} data-toggle="tooltip" data-placement="left" title={this.props.info}></canvas>
            );
        }
    });

    return WeatherIcon;
}));
