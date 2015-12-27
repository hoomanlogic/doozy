(function (factory) {
    module.exports = exports = factory(
        require('jquery'),
        require('rx'),
        require('hl-common-js/src/io')
    );
}(function ($, Rx, hlio) {
    /* global ui */
    var PlanStepStore = function () {

        /**
         * REST API
         */
        var _api = {
            getPlanSteps: function () {
                return $.ajax({
                    context: this,
                    url: clientApp.HOST_NAME + '/api/plansteps',
                    dataType: 'json',
                    headers: {
                        'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    }
                });
            },
            postPlanStep: function (planStep) {
                return $.ajax({
                    context: this,
                    url: clientApp.HOST_NAME + '/api/plansteps',
                    dataType: 'json',
                    headers: {
                        'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    },
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(planStep)
                });
            },
            putPlanStep: function (planStep) {
                return $.ajax({
                    context: this,
                    url: clientApp.HOST_NAME + '/api/plansteps',
                    dataType: 'json',
                    headers: {
                        'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    },
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify(planStep)
                });
            },
            deletePlanStep: function (planStep) {
                return $.ajax({
                    context: this,
                    url: clientApp.HOST_NAME + '/api/plansteps/' + encodeURIComponent(planStep.id),
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
        this.create = function (newPlanStep, done, fail) {

            // update now for optimistic concurrency
            updates.onNext(updates.value.concat(newPlanStep));

            _api.postPlanStep(newPlanStep)
            .done(function (result) {
                Object.assign(newPlanStep, result);
                updates.onNext(updates.value);
                hlio.saveLocal('hl.' + user + '.plansteps', updates.value, secret);
                ui.message('Added plan step ' + newPlanStep.name, 'success');
                if (typeof done !== 'undefined' && done !== null) {
                    done(newPlanStep);
                }
            })
            .fail( function (err) {
                var filtered = updates.value.filter( function (item) { return item !== newPlanStep; });
                updates.onNext(filtered);
                ui.message(err.responseText, 'error');
                if (typeof fail !== 'undefined' && fail !== null) {
                    fail(err);
                }
            });
        };

        this.destroy = function (planStep) {
            // optimistic concurrency
            var filtered = updates.value.filter( function (item) { return item.id !== planStep.id; });
            updates.onNext(filtered);

            ui.queueRequest('Plan Step', planStep.id, 'Deleted plan step ' + planStep.name, function () {
                _api.deletePlanStep(planStep)
                .done( function () {
                    hlio.saveLocal('hl.' + user + '.plansteps', updates.value, secret);
                })
                .fail( function (err) {
                    updates.onNext(updates.value.concat(planStep));
                    ui.message(err.responseText, 'error');
                });
            }, function () {
                updates.onNext(updates.value.concat(planStep));
            });
        };

        this.update = function (planStep) {

            // get object reference to planStep in store
            var planStepToSave = _.find(updates.value, function(item) {
                return item.id === planStep.id;
            });

            // keep copy of original for undo
            var original = Object.assign({}, planStepToSave);

            // optimistic concurrency
            Object.assign(planStepToSave, planStep);
            updates.onNext(updates.value);

            ui.queueRequest('Plan Step', planStep.id, 'Updated plan step ' + planStepToSave.name, function () {
                _api.putPlanStep(planStepToSave)
                .done(function (result) {
                    Object.assign(planStepToSave, result);
                    updates.onNext(updates.value);
                    hlio.saveLocal('hl.' + user + '.plansteps', updates.value, secret);
                })
                .fail(function  (err) {
                    Object.assign(planStepToSave, original);
                    updates.onNext(updates.value);
                    ui.message(err.responseText, 'error');
                });
            }, function () {
                Object.assign(planStepToSave, original);
                updates.onNext(updates.value);
            });
        };

        this.getPlanStepByName = function (name) {
            var existingPlanStep = _.find(updates.value, function(item) {
                return cleanPlanStepName(item.name) === cleanPlanStepName(name.toLowerCase());
            });
            return existingPlanStep;
        };

        this.getPlanStepById = function (id) {
            var existingPlanStep = _.find(updates.value, function(item) {
                return item.id.toLowerCase() === id.toLowerCase();
            });
            return existingPlanStep;
        };

        var user = 'my';
        var secret = 'hash';

        var cleanPlanStepName = function (name) {
            return name.replace(/:/g, '').replace(/  /g, ' ').trim().toLowerCase();
        };

        this.init = function (userName, userId) {

            user = userName;
            secret = userId;

            // populate store - call to database
            _api.getPlanSteps()
            .done(function (result) {
                hlio.saveLocal('hl.' + user + '.plansteps', result, secret);
                updates.onNext(result);
            })
            .fail(function (err) {
                ui.message(err.responseText, 'error');
            });

            var planSteps = hlio.loadLocal('hl.' + user + '.plansteps', secret);
            if (planSteps) {
                updates.onNext(planSteps);
            }
        };
    };

    return new PlanStepStore();
}));