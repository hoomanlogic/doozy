// CommonJS, AMD, and Global shim
(function (factory) {
    'use strict';
	if (typeof exports === "object") {
		// CommonJS
		module.exports = exports = factory(
            require('react')
        );
	}
	else if (typeof define === "function" && define.amd) {
		// AMD
		define([
            'react'
        ], factory);
	}
	else {
		// Global (browser)
		window.WeatherIcon = factory(window.React);
	}
}(function (React) {
    'use strict';
    return React.createClass({
        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        getDefaultProps : function () {
            return { color: "black", width: 64, height: 80, style: { }};
        },

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
         * MISC
         *************************************************************/
        draw: function () {
            this.skycons.set(this.props.id, this.props.icon, this.props.color);
            //skycons.play();
        },
        skycons: new Skycons(),

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            return (
                <canvas className="weather-icon" style={this.props.style} width={this.props.width} height={this.props.height} id={this.props.id} data-toggle="tooltip" data-placement="left" title={this.props.info}></canvas>
            );
        }
    });
}));