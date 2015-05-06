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
         * COMPONENT LIFECYCLE
         *************************************************************/
        getInitialState: function () {
            return {
                filesSelected: false  
            };
        },
        
        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleOnFileChange: function (filesSelected) {
            this.setState({
                filesSelected: filesSelected
            });
        },
        
        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            var currentImage;
            if (!this.state.filesSelected) {
                currentImage = (<img style={{display: 'inline', maxWidth: '100px', maxHeight: '100px'}} src={this.props.uri} />);
            }
            return (
                <div>
                    <label>What picture do you want others to see?</label>
                    {currentImage}
                    <Uploader type="Profile" onFileChange={this.handleOnFileChange} />
                </div>
            );
        }
    });
}));