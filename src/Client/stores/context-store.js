(function (factory) {
    module.exports = exports = factory();
}(function () {
    var numProps = function (obj) {
        var count = 0;
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                ++count;
            }
        }
        return count;
    };

    var Context = function (contextArgs) {
        this.value = null;
        this.consumers = [];
        this.args = contextArgs;
    };

    var ContextStore = function () {
        this.contexts = [new Context({})];
    };

    ContextStore.prototype = {
        /**
         * Hook up a callback to be called when
         * an update matching the given context is available.
         */
        subscribe: function (callback, contextArgs) {
            // add new context if it doesn't exist yet
            var context = this.context(contextArgs);
            if (!context) {
                context = new Context(contextArgs);
                this.contexts.push(context);
            }

            var len = context.consumers.length;
            context.consumers.push(callback);

            if (len === 0 && this.onFirstIn !== undefined) {
                this.onFirstIn(context);
            }
            if (this.onSubscribe !== undefined) {
                this.onSubscribe(context);
            }

            return context;
        },
        /**
         * Unhook a callback from a given context.
         */
        unsubscribe: function (callback, contextArgs) {
            // return if context not found
            var index = this.indexOf(contextArgs);
            if (index === -1) {
                return;
            }

            var context = this.contexts[index];

            // detach consumer
            for (var i = 0; i < context.consumers.length; i++) {
                if (context.consumers[i] === callback) {
                    context.consumers.splice(i, 1);
                    break;
                }
            }

            // no more consumers?
            if (context.consumers.length === 0) {
                if (this.onLastOut !== undefined) {
                    this.onLastOut(context);
                }
                this.contexts.splice(index, 1);
            }

            return context;
        },
        /**
         * Return context with matching args, or null if a match doesn't exist.
         */
        context: function (contextArgs) {
            var index = this.indexOf(contextArgs);
            if (index === -1) {
                return null;
            }
            return this.contexts[index];
        },
        /**
         * Return index of context with matching args, or -1 if a match doesn't exist.
         */
        indexOf: function (contextArgs) {
            var ctxPropCount = numProps(contextArgs);
            if (ctxPropCount === 0) {
                return 0;
            }

            for (var i = 0; i < this.contexts.length; i++) {
                if (ctxPropCount !== numProps(this.contexts[i].args)) {
                    continue;
                }

                var contextMatch = true;
                for (var prop in this.contexts[i].args) {
                    if (!contextArgs.hasOwnProperty(prop)) {
                        contextMatch = false;
                        break;
                    }
                    if ((Array.isArray(this.contexts[i].args[prop]) && !this.contexts[i].args[prop].equals(contextArgs[prop])) ||
                        (!Array.isArray(this.contexts[i].args[prop]) && this.contexts[i].args[prop] !== contextArgs[prop])) {
                        contextMatch = false;
                        break;
                    }
                }
                if (contextMatch) {
                    return i;
                }
            }

            return -1;
        },
        /**
         * Update value and notify consumers
         */
        updateContext: function (value, contextArgs) {
            var context = this.context(contextArgs);
            if (!context) {
                return;
            }

            context.value = value;
            context.consumers.map(function (callback) {
                callback(value);
            });
        }
    };

    return {
        ContextStore: ContextStore
    };

}));
