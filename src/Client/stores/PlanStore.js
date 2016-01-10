(function (factory) {
    module.exports = exports = factory(
        require('jquery'),
        require('rx'),
        require('hl-common-js/src/io'),
        require('components/MessageBox'),
        require('lodash')
    );
}(function ($, Rx, hlio, MessageBox, _) {

    var PlanStore = function () {

        /**
         * REST API
         */
        var _api = {
            getPlans: function () {
                return $.ajax({
                    context: this,
                    url: baseUrl + '/api/plan',
                    dataType: 'json',
                    // headers: {
                    //     'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    // }
                });
            },
            postPlan: function (plan) {
                return $.ajax({
                    context: this,
                    url: baseUrl + '/api/plan',
                    dataType: 'json',
                    // headers: {
                    //     'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    // },
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(plan)
                });
            },
            putPlan: function (plan) {
                return $.ajax({
                    context: this,
                    url: baseUrl + '/api/plan',
                    dataType: 'json',
                    // headers: {
                    //     'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    // },
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify(plan)
                });
            },
            deletePlan: function (plan) {
                return $.ajax({
                    context: this,
                    url: baseUrl + '/api/plan/' + encodeURIComponent(plan.id),
                    dataType: 'json',
                    // headers: {
                    //     'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    // },
                    type: 'DELETE',
                    contentType: 'application/json'
                });
            }
        };

        /**
         * RxJS Event Publisher
         */
        var updates = new Rx.BehaviorSubject([]);
        this.updates = updates;

        /**
         * Store Methods
         */
        this.create = function (model) {

            // update now for optimistic concurrency
            updates.onNext(updates.value.concat(model));

            _api.postPlan(model)
            .done(function (result) {
                updates.value.forEach(function (item) {
                    if (item === model) {
                        Object.assign(item, result);
                        model = item; // eslint-disable-line no-param-reassign
                    }
                });
                updates.onNext(updates.value);
                hlio.saveLocal('hl.' + user + '.plans', updates.value, secret);
                MessageBox.notify('Added plan ' + model.name, 'success');
            })
            .fail( function (err) {
                var filtered = updates.value.filter( function (item) { return item !== model; });
                updates.onNext(filtered);
                MessageBox.notify(err.responseText, 'error');
            });
        };

        this.destroy = function (id) {
            // optimistic concurrency
            var filtered = updates.value.filter( function (item) { return item !== id; });
            updates.onNext(filtered);

            _api.deletePlan(id)
            .done( function () {
                MessageBox.notify('Deleted plan ' + id, 'success');
                hlio.saveLocal('hl.' + user + '.plans', updates.value, secret);
            })
            .fail( function (err) {
                updates.onNext(updates.value.concat(plan));
                MessageBox.notify(err.responseText, 'error');
            });
        };

        this.update = function (plan) {

            var planToSave = _.find(updates.value, function (item) {
                return item.id === plan.id;
            });
            var state = plan;
            var original = Object.assign({}, planToSave);

            var val = planToSave;
            Object.assign(val, state);
            updates.onNext(updates.value);

            _api.putPlan(val)
            .done(function (result) {
                Object.assign(val, result);
                updates.onNext(updates.value);
                hlio.saveLocal('hl.' + user + '.plans', updates.value, secret);
                MessageBox.notify('Updated plan ' + val.name, 'success');
            })
            .fail(function (err) {
                Object.assign(val, original);
                updates.onNext(updates.value);
                MessageBox.notify(err.responseText, 'error');
            });
        };

        this.get = function (id) {
            var obj = _.find(updates.value, function (item) {
                return item.id.toLowerCase() === id.toLowerCase() || (item.gtag || '').toLowerCase() === id.toLowerCase();
            });
            return obj;
        };

        this.updateFromServer = function (planId, newState) {
            var planToUpdate = _.find(updates.value, function (item) {
                return item.id === planId;
            });
            Object.assign(planToUpdate, newState);
            updates.onNext(updates.value);
        };

        var user = 'my';
        var secret = 'hash';
        var baseUrl = null;

        this.init = function (userName, userId) {

            user = userName;
            secret = userId;
            baseUrl = window.location.href.split('/').slice(0,3).join('/') + '/doozy';

            // populate store - call to database
            _api.getPlans()
            .done(function (result) {
                updates.onNext(result);
                hlio.saveLocal('hl.' + user + '.plans', updates.value, secret);
            })
            .fail(function (err) {
                MessageBox.notify(err.responseText, 'error');
            });

            var plans = hlio.loadLocal('hl.' + user + '.plans', secret);
            if (plans) {
                updates.onNext(plans);
            }
        };

    };

    return new PlanStore();
}));
