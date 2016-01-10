(function (factory) {
    module.exports = exports = factory(
        require('./store')
    );
}(function (store) {
    var WindowSizeStore = function () {
        store.Store.call(this);
        var me = this;

        var onWindowResize = function () {
            me.update({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        this.onFirstIn = function () {
            window.addEventListener('resize', onWindowResize);
            onWindowResize();
        };

        this.onLastOut = function () {
            window.removeEventListener('resize', onWindowResize);
        };
    };
    WindowSizeStore.prototype = Object.create(store.Store.prototype);
    WindowSizeStore.prototype.constructor = WindowSizeStore;
    WindowSizeStore.prototype.getWindowSize = function () {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        };
    };
    WindowSizeStore.prototype.getClientSize = function () {
        return {
            width: document.body.clientWidth,
            height: document.body.clientHeight
        };
    };
    return new WindowSizeStore();
}));
