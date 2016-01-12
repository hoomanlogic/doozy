(function (factory) {
    module.exports = exports = factory(
        require('hl-common-js/src/io')
    );
}(function (hlio) {
    /**
     * WARNING: ALL STORES RETURN AN INSTANCE AND ARE IMPLICIT SINGLETONS THAT SHOULD
     * NEVER BE SHARED INDIRECTLY BETWEEN MODULES, AS IT COULD
     * RESULT IN TWO SEPARATE RUNNING INSTANCES (TWO SEPARATE WEBPACKED FUNCTIONS)
     *
     * justjs.com/posts/singletons-in-node-js-modules-cannot-be-trusted-or-why-you-can-t-just-do-var-foo-require-baz-init
     *
     * Use this store to abstract the application's host
     * , wrap up all 'window' and 'document' references here
     * and do not reference them anywhere else in the application
     *
     * All methods are mocked - in a sort, the strategy is
     * to feign success when no implementation exists, however,
     * to proceed as expected when an implementation does exist
     *
     * IN THE FUTURE!!!
     * Choose host provider based on current context, this means we can have multiple providers
     * of a single host function and have it pick the one that fits the current user context
     * -- this means if the user's context includes do-not-disturb, applications that would have otherwise
     * used a 'notify' provider that have disturbed the user can either be silently ignored or simply put
     * a less in-you-face placement, such as upping the number of notifications in a notification icon.
     */
    // TODO: do provider (ie. window) specific setup when requiring.
    //       resulting functions should be swift and direct to the appropriate provider
    var Host = function () {
        // store.Store.call(this);
        // var me = this;

        this.context = {};

        var formDataMock = function () {
            this.append = function () {
                // just a mock for now
            };
        };

        // Window is default host provider
        /* eslint-disable no-undef */
        if (window) {
            this.providers = {
                go: function (url) {
                    window.location.href = url;
                },
                prompt: function (requestMsg, responseCb) {
                    /* eslint-disable no-alert */
                    var result = window.prompt(requestMsg);
                    /* eslint-enable no-alert */
                    responseCb(result);
                },
                setTitle: function (title) {
                    window.document.title = title;
                },
                FormData: window.FormData || formDataMock
            };
        }
        /* eslint-enable no-undef */

        // MOCK
        if (!this.providers) {
            this.providers = {
                go: function () {
                    // DO NOTHING
                },
                prompt: function (requestMsg, responseCb) {
                    responseCb('');
                },
                setTitle: function () {
                    // DO NOTHING
                },
                FormData: formDataMock
            };
        }

        // this.onFirstIn = function () {
            // window.addEventListener('resize', onWindowResize);
        // };

        // this.onLastOut = function () {
            // window.removeEventListener('resize', onWindowResize);
        // };
    };

    // Host.prototype = Object.create(store.Store.prototype);
    // Host.prototype.constructor = Host;

    Host.prototype = {

        go: function (uri, context) {
            this.providers.go(uri, context);
        },

        // always use callback-style prompt
        prompt: function (request, callback) {
            this.providers.prompt(request, callback);
        },

        // THIS IS A SPECIAL FUNCTION THAT DOES NOT USE A PROVIDER
        setContext: function (context) {
            Object.assign(this.context, context);
            hlio.saveLocal('host-context', context, 'host');
        },

        setTitle: function (title) {
            this.providers.setTitle(title);
        },
    };
    return new Host();
}));
