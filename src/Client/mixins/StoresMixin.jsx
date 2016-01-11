(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('stores/gnode-store'),
        require('stores/store'),
        require('hl-common-js/src/store')
    );
}(function (React, gnodeStore, store, hlstore) {

    var initializeStores = function (host) {
        host.stores.forEach(function (store) {
            store.init('kat', 'foo');
        });
    };

    var StoresMixin = function (stores, init) {
        return {
            stores: stores,
            observers: [],
            componentWillMount: function () {

                if (init) {
                    initializeStores(this);
                }

                this.stores.forEach(function (s) {
                    if (s instanceof gnodeStore.GnodeStore) {
                        s.subscribe(this.handleStoreUpdate, {});
                    }
                    else if (s instanceof hlstore.Store || s instanceof store.Store) {
                        s.subscribe(this.handleStoreUpdate);
                    }
                    else { // old style Rx Stores
                        this.observers.push(s.updates
                            .filter(function (result) {
                                return result.length > 0;
                            })
                            .subscribe(this.handleStoreUpdate));
                    }
                }.bind(this));
            },

            componentWillUnmount: function () {
                this.stores.forEach(function (s) {
                    if (s instanceof gnodeStore.GnodeStore) {
                        s.unsubscribe(this.handleStoreUpdate, {});
                    }
                    else if (s instanceof hlstore.Store) {
                        s.dispose(this.handleStoreUpdate);
                    }
                    else if (s instanceof store.Store) {
                        s.unsubscribe(this.handleStoreUpdate);
                    }
                    else {
                        this.observers.forEach(function (observer) {
                            observer.dispose();
                        });
                        this.observers = [];
                    }
                }.bind(this));
            },

            handleStoreUpdate: function () {
                this.setState({
                    lastStoreUpdate: new Date().toISOString()
                });
            }
        };
    };
    return StoresMixin;
}));
