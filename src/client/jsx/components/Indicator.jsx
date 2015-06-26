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
        window.Indicator = factory(window.React);
    }
}(function (React) {
    'use strict';
    return React.createClass({
        mixins: [React.addons.PureRenderMixin],
        propTypes: {
            value: React.PropTypes.string.isRequired,
            change: React.PropTypes.any.isRequired
        },
        
        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        getDefaultProps: function () {
            return {
                width: '100px',
                backgroundColor: 'white',
                isPercent: false
            };
        },
        
        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            
            var changeColor = 'rgb(68, 68, 68)',
                changePrefix = '',
                content,
                suffix = '';
            
            if (this.props.change > 0) {
                changeColor = 'hsl(120,90%,40%)';
            } else if (this.props.change < 0) {
                changeColor = 'hsl(0,90%,40%)';   
            }
            
            if (this.props.kind === 'percent') {
                suffix = '%';
            }
            if (this.props.change > 0) {
                changePrefix = '+';   
            }

            /**
             * Render content based on kind of indicator
             */
            if (this.props.kind === 'percent' || this.props.kind === 'simple') {
                content = (
                    <div style={{textAlign: 'center', backgroundColor: this.props.backgroundColor, color: (this.props.backgroundColor === 'white' ? 'black' : 'white'), fontSize: 'x-large'}}>
                        {this.props.value + suffix}
                    </div>
                );
            } else if (this.props.kind === 'comparison') {
                content = (
                    <div style={{textAlign: 'center', backgroundColor: this.props.backgroundColor, color: (this.props.backgroundColor === 'white' ? 'black' : 'white')}}>
                        <div style={{display: 'inline', fontSize: 'x-large'}}>{this.props.value + suffix}</div>
                        <div style={{display: 'inline'}}>/{this.props.compareValue + suffix}</div>
                    </div>
                );
            }
            
            return (
                <div style={{minWidth: this.props.width, margin: '5px'}}>
                    <div style={{textAlign: 'center', borderRadius: '8px 8px 0 0', backgroundColor: 'rgb(68, 68, 68)', color: 'white', marginBottom: '2px'}}>{this.props.title}</div>
                    {content}
                    <div style={{textAlign: 'center', borderRadius: '0 0 8px 8px', backgroundColor: 'rgb(68, 68, 68)', color: changeColor, marginTop: '2px'}}>{changePrefix + this.props.change + suffix}</div>
                </div>
            );
        },

    });
}));