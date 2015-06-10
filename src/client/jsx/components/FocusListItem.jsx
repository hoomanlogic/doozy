/** @jsx React.DOM */

// CommonJS, AMD, and Global shim
(function (root, factory) {
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
		root.FocusListItem = factory(root.React);
	}
}(this, function (React) {
    'use strict';
    return React.createClass({
        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleFocusClick: function (item) {
            if (this.props.handleFocusClick) {
                this.props.handleFocusClick(item);
            }
        },

        /*************************************************************
         * CALCULATIONS
         *************************************************************/
        calcFocusTitle: function (focus) {
            if (focus.kind === 'Role') {
                if (doozy.hasPossessiveNoun(focus.name)) {
                    return 'You\'re ' + focus.name;
                } else {
                    return 'You\'re ' + (doozy.startsWithAVowel(focus.name) ? 'an' : 'a') + ' ' + focus.name;
                }
            } else if (focus.kind === 'Path') {
                return 'You\'re on a path of ' + focus.name;
            }
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            var data = this.props.data;
            var latestDate = new Date(data.latestEntry.date);

            var menuItemStyle = {
                display: 'block',
                padding: '3px 5px',
                borderBottom: '1px solid #e0e0e0', 
                clear: 'both',
                fontWeight: '400',
                lineHeight: '1.42857143',
                color: '#333',
                whiteSpace: 'nowrap',
                cursor: 'pointer'
            };
            
            var imageStyle = {
                maxHeight: '50px',
                width: '50px',
                paddingRight: '5px',
                display: 'inline', 
                verticalAlign: 'inherit'
            };

            return (
                <li key={data.id}>
                    <a onClick={this.handleFocusClick.bind(null, data)} style={menuItemStyle}>
                        <div>
                            <img style={imageStyle} src={data.iconUri} />
                            <div style={{display: 'inline-block', verticalAlign: 'top'}}>
                                <div>{this.calcFocusTitle(data)}</div>
                                <div style={{fontSize: '14px'}}>{'last acted '}<RelativeTime accuracy="d" isoTime={latestDate} /></div>
                            </div>
                        </div>
                    </a>
                </li>
            );
        }
    });
}));