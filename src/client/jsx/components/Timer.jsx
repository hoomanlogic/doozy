// CommonJS, AMD, and Global shim
(function (root, factory) {
    'use strict';
	if (typeof exports === "object") {
		// CommonJS
		module.exports = exports = factory(
            require('react'),
            require('../../js/stores/TimerStore')
        );
	}
	else if (typeof define === "function" && define.amd) {
		// AMD
		define([
            'react',
            '../../js/stores/TimerStore'
        ], factory);
	}
	else {
		// Global (browser)
		root.Timer = factory(root.React, root.timerStore);
	}
}(this, function (React, timerStore) {
    'use strict';
    return React.createClass({
        mixins: [React.addons.PureRenderMixin],
        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        getInitialState: function () {
            return {
                timerLastUpdated: new Date().toISOString()
            };
        },

        componentWillMount: function () {
            timerStore.subscribe(this.handleTimerStoreUpdate);
            this.handleTimerStoreUpdate(timerStore.updates.value);
        },
        componentWillUnmount: function () {
            timerStore.dispose(this.handleTimerStoreUpdate);
            if (this.interval) {
                clearInterval(this.interval);
            }
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleTimerStoreUpdate: function (timer) {
            this.setState({timerLastUpdated: new Date().toISOString()});
        },
        handleToggleTimerClick: function () {
            if (timerStore.updates.value.isOpen) {
                timerStore.hideTimer();
            } else {
                timerStore.openTimer();
            }
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            var iconStyle = { marginRight: '5px' };
            
            var timerStyle = {
                padding: '5px'
            };
            
            return (
                <li key="timer"><a className={timerStore.updates.value.isRunning ? 'active' : ''} style={timerStyle} href="javascript:;" onClick={this.handleToggleTimerClick}><i style={iconStyle} className="fa fa-2x fa-clock-o"></i></a></li>
            );
        },
    });
 }));