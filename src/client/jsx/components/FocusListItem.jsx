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
                if (hlapp.hasPossessiveNoun(focus.name)) {
                    return 'You\'re ' + focus.name;
                } else {
                    return 'You\'re ' + (hlapp.startsWithAVowel(focus.name) ? 'an' : 'a') + ' ' + focus.name;
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
            var lastDate = new Date(data.latestEntry ? data.latestEntry.date : data.created.toISOString());
            var lastDone = hlapp.calcNaturalDays(new Date(lastDate));

            return (
                <li key={data.id}>
                    <a onClick={this.handleFocusClick.bind(null, data)} style={{borderBottom: '1px solid #e0e0e0', paddingTop: '3px', paddingBottom: '3px'}}>
                        <div className="focus">
                            <img style={{display: 'inline', verticalAlign: 'inherit'}} src={data.iconUri} />
                            <div style={{display: 'inline-block', verticalAlign: 'top'}}>
                                <div>{this.calcFocusTitle(data)}</div>
                                <div>{'last acted ' + lastDone}</div>
                            </div>
                        </div>
                    </a>
                </li>
            );
        }
    });
}));