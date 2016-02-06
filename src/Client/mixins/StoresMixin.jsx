(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('stores/gnode-store'),
        require('stores/store'),
        require('hl-common-js/src/store')
    );
}(function (React, gnodeStore, store, hlstore) {

    var initializeStores = function (host) {
        host.stores.forEach(function (s) {
            s.init('kat', 'foo');
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
                        s.subscribe(this.handleStoreListUpdate.bind(null, s), {});
                    }
                    else if (s instanceof hlstore.Store || s instanceof store.Store) {
                        s.subscribe(this.handleStoreListUpdate.bind(null, s));
                    }
                    else { // old style Rx Stores
                        this.observers.push(s.updates
                            .filter(function (result) {
                                return result.length > 0;
                            })
                            .subscribe(this.handleStoreListUpdate.bind(null, s)));
                    }
                }.bind(this));
            },

            componentWillUnmount: function () {
                this.stores.forEach(function (s) {
                    if (s instanceof gnodeStore.GnodeStore) {
                        s.unsubscribe(this.handleStoreListUpdate.bind(null, s), {});
                    }
                    else if (s instanceof hlstore.Store) {
                        s.dispose(this.handleStoreListUpdate.bind(null, s));
                    }
                    else if (s instanceof store.Store) {
                        s.unsubscribe(this.handleStoreListUpdate.bind(null, s));
                    }
                    else {
                        this.observers.forEach(function (observer) {
                            observer.dispose();
                        });
                        this.observers = [];
                    }
                }.bind(this));
            },

            handleStoreListUpdate: function (s) {
                if (this.handleStoresMixinUpdate) {
                    this.handleStoresMixinUpdate(s ? s.storeName : undefined);
                }
                else {
                    this.setState({
                        lastStoreListUpdate: new Date().toISOString()
                    });
                }
            }
        };
    };
    return StoresMixin;
}));
