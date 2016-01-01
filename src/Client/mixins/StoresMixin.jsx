(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('hl-common-js/src/store')
    );
}(function (React, hlstore) {
    
    var initializeStores = function (host) {
        host.stores.forEach(function (store) {
            store.init('kat', 'foo');
        }.bind(this));
    };
    
    var StoresMixin = function(stores, init) {
        return {
            stores: stores,
            observers: [],
            componentWillMount: function() {
                
                if (init) {
                    initializeStores(this);    
                }
                
                this.stores.forEach(function (store) {
                    if (store instanceof hlstore.Store) {
                        store.subscribe(this.handleStoreUpdate);
                    }
                    else {
                        this.observers.push(store.updates
                            .filter(function (result) {
                                return result.length > 0;
                            })
                            .subscribe(this.handleStoreUpdate));
                    }
                }.bind(this));
            },

            componentWillUnmount: function() {
                 this.stores.forEach(function (store) {
                    if (store instanceof hlstore.Store) {
                        store.dispose(this.handleStoreUpdate);
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
