(function (factory) {
    module.exports = exports = factory(
        require('jquery'),
        require('rx'),
        require('hl-common-js/src/io')
    );
}(function ($, Rx, hlio) {
    /* global ui */
    var PlanStore = function () {

        /**
         * REST API
         */
        var _api = {
            getPlans: function () {
                return $.ajax({
                    context: this,
                    url: clientApp.HOST_NAME + '/api/plans',
                    dataType: 'json',
                    headers: {
                        'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    }
                });
            },
            postPlan: function (plan) {
                return $.ajax({
                    context: this,
                    url: clientApp.HOST_NAME + '/api/plans',
                    dataType: 'json',
                    headers: {
                        'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    },
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(plan)
                });
            },
            putPlan: function (plan) {
                return $.ajax({
                    context: this,
                    url: clientApp.HOST_NAME + '/api/plans',
                    dataType: 'json',
                    headers: {
                        'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    },
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify(plan)
                });
            },
            deletePlan: function (plan) {
                return $.ajax({
                    context: this,
                    url: clientApp.HOST_NAME + '/api/plans/' + encodeURIComponent(plan.id),
                    dataType: 'json',
                    headers: {
                        'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    },
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
        this.create = function (newPlan) {

            // update now for optimistic concurrency
            updates.onNext(updates.value.concat(newPlan));

            _api.postPlan(newPlan)
            .done(function (result) {
                updates.value.forEach(function (item) {
                    if (item === newPlan) {
                        Object.assign(item, result);
                        newPlan = item;
                    }
                });
                updates.onNext(updates.value);
                hlio.saveLocal('hl.' + user + '.plans', updates.value, secret);
                ui.message('Added plan ' + newPlan.name, 'success');
            })
            .fail( function (err) {
                var filtered = updates.value.filter( function (item) { return item !== newPlan; });
                updates.onNext(filtered);
                ui.message(err.responseText, 'error');
            });
        };

        this.destroy = function (plan) {
            // optimistic concurrency
            var filtered = updates.value.filter( function (item) { return item !== plan; });
            updates.onNext(filtered);

            _api.deletePlan(plan)
            .done( function () {
                ui.message('Deleted plan ' + plan.name, 'success');
                hlio.saveLocal('hl.' + user + '.plans', updates.value, secret);
            })
            .fail( function (err) {
                updates.onNext(updates.value.concat(plan));
                ui.message(err.responseText, 'error');
            });
        };

        this.update = function (plan) {

            var planToSave = _.find(updates.value, function(item) {
                return item.id === plan.id;
            });
            var state = plan,
                original = Object.assign({}, planToSave);

            var val = planToSave;
            Object.assign(val, state);
            updates.onNext(updates.value);

            _api.putPlan(val)
            .done(function (result) {
                Object.assign(val, result);
                updates.onNext(updates.value);
                hlio.saveLocal('hl.' + user + '.plans', updates.value, secret);
                ui.message('Updated plan ' + val.name, 'success');
            })
            .fail(function  (err) {
                Object.assign(val, original);
                updates.onNext(updates.value);
                ui.message(err.responseText, 'error');
            });
        };

        this.updateFromServer = function (planId, newState) {
            var planToUpdate = _.find(updates.value, function(item) {
                return item.id === planId;
            });
            Object.assign(planToUpdate, newState);
            updates.onNext(updates.value);
        };

        var user = 'my';
        var secret = 'hash';

        this.init = function (userName, userId) {

            user = userName;
            secret = userId;

            // populate store - call to database
            _api.getPlans()
            .done(function (result) {
                updates.onNext(result);
                hlio.saveLocal('hl.' + user + '.plans', updates.value, secret);
            })
            .fail(function (err) {
                ui.message(err.responseText, 'error');
            });

            var plans = hlio.loadLocal('hl.' + user + '.plans', secret);
            if (plans) {
                updates.onNext(plans);
            }
        };

    };

    return new PlanStore();
}));
