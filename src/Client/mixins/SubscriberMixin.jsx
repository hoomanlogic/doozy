(function (factory) {
    module.exports = exports = factory(
        require('stores/store')
    );
}(function (storeClass) {
    var SubscriberMixin = function (store, propName, pathArg) {

        var mixinObj;
        var path = pathArg || 'props';
        var thisStore = store;
        var handleStoreUpdateName = 'handle' + (store.storeName || String(Math.random()).split('.')[1].slice(0, 3)) + 'StoreUpdate';

        if (store instanceof storeClass.Store) {
            mixinObj = {
                /*************************************************************
                * COMPONENT LIFECYCLE
                *************************************************************/
                componentWillMount: function () {
                    thisStore.subscribe(this[handleStoreUpdateName]);
                },

                componentWillUnmount: function () {
                    thisStore.unsubscribe(this[handleStoreUpdateName]);
                },
            };
        }
        else {
            var thisProp = propName || thisStore.storeName.slice(0, 1).toLowerCase() + thisStore.storeName.slice(1) + 'Id';
            mixinObj = {
                /*************************************************************
                * COMPONENT LIFECYCLE
                *************************************************************/
                componentWillMount: function () {
                    if (this[path][thisProp]) {
                        thisStore.subscribe(this[handleStoreUpdateName], { id: this[path][thisProp] });
                    }
                },

                componentWillReceiveProps: function (nextProps) {
                    if (nextProps[thisProp] !== this[path][thisProp]) {
                        if (this[path][thisProp]) {
                            thisStore.unsubscribe(this[handleStoreUpdateName], { id: this[path][thisProp] });
                        }
                        if (nextProps[thisProp]) {
                            thisStore.subscribe(this[handleStoreUpdateName], { id: nextProps[thisProp] });
                        }
                    }
                },

                componentWillUnmount: function () {
                    if (this[path][thisProp]) {
                        thisStore.unsubscribe(this[handleStoreUpdateName], { id: this[path][thisProp] });
                    }
                },
            };
        }




        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        mixinObj[handleStoreUpdateName] = function (result) {
            if (this.handleStoreUpdate) {
                this.handleStoreUpdate(result);
            }
            else {
                this.setState({
                    lastStoreNotify: (new Date()).toISOString()
                });
            }
        };

        return mixinObj;
    };

    return SubscriberMixin;
}));
