(function (factory) {
    module.exports = exports = factory(
        require('jquery'),
        require('rx'),
        require('hl-common-js/src/io'),
        require('components/MessageBox'),
        require('lodash')
    );
}(function ($, Rx, hlio, MessageBox, _) {

    var GnodeStore = function () {
        /**
         * REST API
         */
        var _api = {
            getGnodes: function () {
                return $.ajax({
                    context: this,
                    url: baseUrl + '/api/gnodes',
                    dataType: 'json',
                    // headers: {
                    //     'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    // }
                });
            },
        };

        /**
         * RxJS Event Publisher
         */
        var updates = new Rx.BehaviorSubject([]);
        this.updates = updates;

        var user = 'my';
        var secret = 'hash';
        var baseUrl = null;

        this.init = function (userName, userId) {

            user = userName;
            secret = userId;
            baseUrl = window.location.href.split('/').slice(0,3).join('/') + '/doozy';

            var gnodes = hlio.loadLocal('hl.' + user + '.gnodes', secret);
            if (gnodes) {
                updates.onNext(gnodes);
            }
            // TODO: how can we decide if the data in gnodes is the newest, and send a timestamp
            // through getGnodes() so it only sends any changes since then.

            // Also, we should have a strategy to query the gnodes db and prioritize relevance and 'nearness' to keep the query quick, and

            // I guesstimate that about 2000 gnodes and gnapes is about 1mb of data. So we should start to think about only bringing in recent log entries
            // These 'omissions'  or chopping of gnodes and gnapses could result in a gnode not knowing it is actually connected to something else that COULD be relevant
            // to the user, gnapse.target() should be a function so we can support delayed connecting to gnodes that aren't yet loaded in memory

            // populate store - call to database
            _api.getGnodes()
            .done(function (result) {
                result.gnodes.forEach();
                result.gnapses.forEach();
            })
            .fail(function (err) {
                MessageBox.notify(err.responseText, 'error');
            });


        };
    };

    return new GnodeStore();
}));
