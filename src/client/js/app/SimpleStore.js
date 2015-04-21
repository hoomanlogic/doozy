(function (exports) {
    'use strict';
    
    var SimpleStore = function () {
        this.updates = { value: null };
        this.subscribers = [];
    }
    
    SimpleStore.prototype = {
        subscribe: function (callback) {
            this.subscribers.push(callback);
        },
        dispose: function (callback) {
            for (var i = 0; i < this.subscribers.length; i++) {
                if (callback === this.subscribers[i]) {
                    this.subscribers.splice(i, 1);
                }
            }
        },
        notify: function () {
            for (var i = 0; i < this.subscribers.length; i++) {
                this.subscribers[i](this.updates.value);
            }
        }
    };
    
    exports.SimpleStore = SimpleStore;

}(typeof exports === 'undefined' ? this['hlstore'] = {}: exports));