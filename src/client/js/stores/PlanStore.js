(function (factory) {
    if (typeof exports === "object") {
        // CommonJS
        module.exports = exports = factory(
            require('jquery'),
            require('rx'),
            require('toastr'),
            require('hl-common-js/src/io')
        );
    }
    else {
        // Global (browser)
        window.planStore = factory(window.$, window.Rx, window.toastr, window.hlio);
    }
}(function ($, Rx, toastr, hlio) {

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
                toastr.success('Added plan ' + newPlan.name);
            })
            .fail( function (err) {
                var filtered = updates.value.filter( function (item) { return item !== newPlan; });
                updates.onNext(filtered);
                toastr.error(err.responseText);
            });
        };

        this.destroy = function (plan) {
            // optimistic concurrency
            var filtered = updates.value.filter( function (item) { return item !== plan; });
            updates.onNext(filtered);

            _api.deletePlan(plan)
            .done( function () {
                toastr.success('Deleted plan ' + plan.name);
                hlio.saveLocal('hl.' + user + '.plans', updates.value, secret);
            })
            .fail( function (err) {
                updates.onNext(updates.value.concat(plan));
                toastr.error(err.responseText);
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
                toastr.success('Updated plan ' + val.name);
            })
            .fail(function  (err) {
                Object.assign(val, original);
                updates.onNext(updates.value);
                toastr.error(err.responseText);
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
                toastr.error(err.responseText);
            });

            var plans = hlio.loadLocal('hl.' + user + '.plans', secret);
            if (plans) {
                updates.onNext(plans);
            }
        }

    };

    return new PlanStore();
}));
