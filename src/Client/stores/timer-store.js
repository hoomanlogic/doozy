(function (factory) {
    module.exports = exports = factory(
        require('./context-store')
    );
}(function (contextStore) {

    // Object to hold all timeout ids
    var timerIds = {

    };

    var handleTimer = function (contextArgs) {
        // Get context from args
        var context = timerStore.context(contextArgs);

        // Notify subscribers of timer elapsed
        timerStore.notify({ ts: new Date(), idx: context.intervalIndex, id: contextArgs.id}, contextArgs);

        // Move to next interval in array
        nextInterval(context);

        // Set next timeout
        timerStart(contextArgs, context.intervalIndex);
    };

    // Move to next interval in array
    var nextInterval = function (context) {
        if (context.intervalIndex === context.args.intervals.length - 1) {
            context.intervalIndex = 0;
        }
        else {
            context.intervalIndex++;
        }
    };

    var timerStop = function (id) {
        if (timerIds[id]) {
            clearTimeout(timerIds[id]);
            timerIds[id] = null;
        }
    };

    var timerStart = function (contextArgs, intervalIndex, syncTimeout) {
        timerIds[contextArgs.id] = setTimeout(handleTimer, (syncTimeout || contextArgs.intervals[intervalIndex] * 1000), contextArgs);
    };

    var TimerStore = function () {
        // Call base class constructor
        contextStore.ContextStore.call(this);

        this.onFirstIn = function (context) {
            context.intervalIndex = 0;
            if (context.args.hasOwnProperty('id') && context.args.hasOwnProperty('intervals')) {
                timerStart(context.args, context.intervalIndex);
            }
        };

        this.onLastOut = function (context) {
            timerStop(context.args.id);
        };

        this.notify = function (value, contextArgs) {
            this.update(value, contextArgs);
        };
    };

    TimerStore.prototype = Object.create(contextStore.ContextStore.prototype);
    TimerStore.prototype.constructor = TimerStore;

    TimerStore.prototype.resetTimer = function (contextArgs, index) {
        // Override interval
        if (index !== undefined && index !== null && typeof index === 'number') {
            var ctx = timerStore.context(contextArgs);
            ctx.intervalIndex = index || ctx.intervalIndex;
        }
        this.startTimer(contextArgs, index);
    };

    TimerStore.prototype.stopTimer = function (contextArgs) {
        timerStop(contextArgs.id);
    };

    TimerStore.prototype.startTimer = function (contextArgs) {
        // stop existing timer
        timerStop(contextArgs.id);
        // start timer
        var ctx = timerStore.context(contextArgs);

        timerStart(contextArgs, ctx.intervalIndex);
    };

    TimerStore.prototype.sync = function (contextArgs, lastTick, index) {
        var now = new Date().getTime();
        var diff = now - lastTick.getTime();
        var ctx = timerStore.context(contextArgs);
        // Override interval
        if (index !== undefined && index !== null && typeof index === 'number') {
            ctx.intervalIndex = index || ctx.intervalIndex;
        }
        var chunk = contextArgs.intervals[ctx.intervalIndex] * 1000;
        var syncTimeout = chunk - (diff % chunk);
        timerStop(contextArgs.id);
        timerStart(contextArgs, ctx.intervalIndex, syncTimeout);
    };

    var timerStore = new TimerStore();
    return timerStore;
}));
