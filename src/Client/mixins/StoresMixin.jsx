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
                        s.subscribe(this.handleStoreListUpdate, {});
                    }
                    else if (s instanceof hlstore.Store || s instanceof store.Store) {
                        s.subscribe(this.handleStoreListUpdate);
                    }
                    else { // old style Rx Stores
                        this.observers.push(s.updates
                            .filter(function (result) {
                                return result.length > 0;
                            })
                            .subscribe(this.handleStoreListUpdate));
                    }
                }.bind(this));
            },

            componentWillUnmount: function () {
                this.stores.forEach(function (s) {
                    if (s instanceof gnodeStore.GnodeStore) {
                        s.unsubscribe(this.handleStoreListUpdate, {});
                    }
                    else if (s instanceof hlstore.Store) {
                        s.dispose(this.handleStoreListUpdate);
                    }
                    else if (s instanceof store.Store) {
                        s.unsubscribe(this.handleStoreListUpdate);
                    }
                    else {
                        this.observers.forEach(function (observer) {
                            observer.dispose();
                        });
                        this.observers = [];
                    }
                }.bind(this));
            },

            handleStoreListUpdate: function () {
                if (this.handleStoresMixinUpdate) {
                    this.handleStoresMixinUpdate();
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
