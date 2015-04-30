/** @jsx React.DOM */

// CommonJS, AMD, and Global shim
(function (root, factory) {
    'use strict';
	if (typeof exports === "object") {
		// CommonJS
		module.exports = exports = factory(
            require('react'),
            require('./Uploader')
        );
	}
	else if (typeof define === "function" && define.amd) {
		// AMD
		define([
            'react',
            './Uploader'
        ], factory);
	}
	else {
		// Global (browser)
		root.ProfilePic = factory(root.React, root.Uploader);
	}
}(this, function (React, Uploader) {
    'use strict';
    return React.createClass({
        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            return (
                <div className="focus">
                    <img style={{display: 'inline'}} src={this.props.uri} />
                    <Uploader type="Profile" />
                </div>
            );
        }
    });
}));