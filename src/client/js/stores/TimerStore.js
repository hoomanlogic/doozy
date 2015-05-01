// CommonJS, AMD, and Global shim
(function (root, factory) {
    'use strict';
	if (typeof exports === "object") {
		// CommonJS
		module.exports = exports = factory(
            require('../../../../../common_js/src/store')
        );
	}
	else if (typeof define === "function" && define.amd) {
		// AMD
		define([
            '../../../../../common_js/src/store'
        ], factory);
	}
	else {
		// Global (browser)
		root.timerStore = factory(root.hlstore);
	}
}(this, function (hlstore) {
    'use strict';
    
    var TimerStore = function () {
        hlstore.Store.call(this);
        this.updates.value = [];
        var me = this;

        this.init = function () {
            var timer = hlio.loadLocal('hl.timer', 'nothingtohide');
            if (!timer) {
                timer = {
                    isRunning: false,
                    startedAt: null,
                    workingOn: null,
                    timeSoFar: 0
                }
            }
            me.updates.value = timer;
            me.notify();
        };

        this.updateWorkingOn = function (workingOn) {
            Object.assign(me.updates.value, {workingOn: workingOn});
            me.notify();
            me.saveLocal('hl.timer', me.updates.value, 'nothingtohide');
        };

        this.startTimer = function () {
            Object.assign(me.updates.value, {
                isRunning: true,
                startedAt: new Date().getTime(),
            });
            me.notify();
            me.saveLocal('hl.timer', me.updates.value, 'nothingtohide');
        };

        this.pauseTimer = function () {
            if (me.updates.value.isRunning) {
                me.updates.value.timeSoFar += new Date().getTime() - me.updates.value.startedAt;
                Object.assign(me.updates.value, {
                    isRunning: false,
                    startedAt: null,
                });
                me.notify();
                me.saveLocal('hl.timer', me.updates.value, 'nothingtohide');
            }
        };

        this.resetTimer = function () {
            Object.assign(me.updates.value, {
                startedAt: new Date().getTime(),
                workingOn: null,
                timeSoFar: 0
            });
            me.notify();
            me.saveLocal('hl.timer', me.updates.value, 'nothingtohide');
        };

        this.init();
    };
    
    TimerStore.prototype = Object.create(hlstore.Store.prototype);
    TimerStore.prototype.constructor = TimerStore;

    return new TimerStore();
}));