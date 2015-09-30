(function (factory) {
    module.exports = exports = factory(
        require('hl-common-js/src/store'),
        require('hl-common-js/src/io')
    );
}(function (hlstore, hlio) {

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
                };
            }
            me.updates.value = timer;
            me.notify();
        };

        this.updateWorkingOn = function (workingOn) {
            Object.assign(me.updates.value, {workingOn: workingOn});
            me.notify();
            me.saveLocal('hl.timer', me.updates.value, 'nothingtohide');
        };

        this.openTimer = function () {
            Object.assign(me.updates.value, {
                isOpen: true
            });
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

        this.hideTimer = function () {
            Object.assign(me.updates.value, {
                isOpen: false,
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
