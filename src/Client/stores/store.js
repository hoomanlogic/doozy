(function (factory) {
    module.exports = exports = factory();
}(function () {
    var Store = function () {
        this.updates = { value: null };
        this.subscribers = [];
    };

    Store.prototype = {
        update: function (value) {
            this.updates.value = value;
            this.notify();
        },
        subscribe: function (callback) {
            if (this.subscribers.length === 0 && typeof this.onFirstIn !== 'undefined') {
                this.onFirstIn();
            }
            this.subscribers.push(callback);
        },
        unsubscribe: function (callback) {
            // remove the subscriber
            for (var i = 0; i < this.subscribers.length; i++) {
                if (callback === this.subscribers[i]) {
                    this.subscribers.splice(i, 1);
                }
            }

            // duck-type dispose check (Rx.Observer)
            if (callback.hasOwnProperty('dispose') && typeof callback.dispose === 'function') {
                callback.dispose();
            }

            // cleanup on last out
            if (this.subscribers.length === 0 && typeof this.onLastOut !== 'undefined') {
                this.onLastOut();
            }
        },
        notify: function () {
            for (var i = 0; i < this.subscribers.length; i++) {
                this.subscribers[i](this.updates.value);
            }
        }
    };

    return {
        Store: Store
    };

}));
