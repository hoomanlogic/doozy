var TimerStore = function () {
    hlstore.SimpleStore.call(this);
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
        hlcommon.assign(me.updates.value, {workingOn: workingOn});
        me.notify();
        hlio.saveLocal('hl.timer', me.updates.value, 'nothingtohide');
    };
    
    this.startTimer = function () {
        hlcommon.assign(me.updates.value, {
            isRunning: true,
            startedAt: new Date().getTime(),
        });
        me.notify();
        hlio.saveLocal('hl.timer', me.updates.value, 'nothingtohide');
    };
    
    this.pauseTimer = function () {
        if (me.updates.value.isRunning) {
            this.updates.value.timeSoFar += new Date().getTime() - this.updates.value.startedAt;
            hlcommon.assign(me.updates.value, {
                isRunning: false,
                startedAt: null,
            });
            me.notify();
            hlio.saveLocal('hl.timer', me.updates.value, 'nothingtohide');
        }
    };
    
    this.resetTimer = function () {
        hlcommon.assign(me.updates.value, {
            startedAt: new Date().getTime(),
            workingOn: null,
            timeSoFar: 0
        });
        me.notify();
        hlio.saveLocal('hl.timer', me.updates.value, 'nothingtohide');
    };
    
    this.init();
};
TimerStore.prototype = Object.create(hlstore.SimpleStore.prototype);
TimerStore.prototype.constructor = TimerStore;

var timerStore = new TimerStore();