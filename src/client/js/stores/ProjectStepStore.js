var ProjectStepStore = function () {

    /**
     * REST API
     */
    var _api = {
        getProjectSteps: function () {
            return $.ajax({
                context: this,
                url: hlapp.HOST_NAME + '/api/projectsteps',
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + hlapp.getAccessToken()
                }
            });
        },
        postProjectStep: function (projectStep) {
            return $.ajax({
                context: this,
                url: hlapp.HOST_NAME + '/api/projectsteps',
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + hlapp.getAccessToken()
                },
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(projectStep)
            });
        },
        putProjectStep: function (projectStep) {
            return $.ajax({
                context: this,
                url: hlapp.HOST_NAME + '/api/projectsteps',
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + hlapp.getAccessToken()
                },
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(projectStep)
            });
        },
        deleteProjectStep: function (projectStep) {
            return $.ajax({
                context: this,
                url: hlapp.HOST_NAME + '/api/projectsteps/' + encodeURIComponent(projectStep.id),
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + hlapp.getAccessToken()
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
    this.create = function (newProjectStep, done, fail) {
        
        // update now for optimistic concurrency
        updates.onNext(updates.value.concat(newProjectStep));
        
        _api.postProjectStep(newProjectStep)
        .done(function (result) {
            Object.assign(newProjectStep, result);
            updates.onNext(updates.value);
            hlio.saveLocal('hl.' + user + '.projectsteps', updates.value, secret);
            toastr.success('Added project step ' + newProjectStep.name);
            if (typeof done !== 'undefined' && done !== null) {
                done(newProjectStep);
            }
        })
        .fail( function (err) {
            var filtered = updates.value.filter( function (item) { return item !== newProjectStep; });
            updates.onNext(filtered);
            toastr.error(err.responseText);
            if (typeof fail !== 'undefined' && fail !== null) {
                fail(err);
            }
        });
    };
    
    this.destroy = function (projectStep) {
        // optimistic concurrency
        var filtered = updates.value.filter( function (item) { return item.id !== projectStep.id; });
        updates.onNext(filtered);
        
        ui.queueRequest('Deleted project step ' + projectStep.name, function () {
            _api.deleteProjectStep(projectStep)
            .done( function () {
                hlio.saveLocal('hl.' + user + '.projectsteps', updates.value, secret);
            })
            .fail( function (err) {
                updates.onNext(updates.value.concat(projectStep));
                toastr.error(err.responseText);
            });
        }, function () {
            updates.onNext(updates.value.concat(projectStep));
        });
    };
    
    this.update = function (projectStep) {
        
        // get object reference to projectStep in store
        var projectStepToSave = _.find(updates.value, function(item) { 
            return item.id === projectStep.id; 
        });
        
        // keep copy of original for undo
        var original = Object.assign({}, projectStepToSave);
        
        // optimistic concurrency
        Object.assign(projectStepToSave, projectStep);
        updates.onNext(updates.value);
        
        ui.queueRequest('Updated project step ' + projectStepToSave.name, function () {
            _api.putProjectStep(projectStepToSave)
            .done(function (result) {
                Object.assign(projectStepToSave, result);
                updates.onNext(updates.value);
                hlio.saveLocal('hl.' + user + '.projectsteps', updates.value, secret);
            })
            .fail(function  (err) {
                Object.assign(projectStepToSave, original);
                updates.onNext(updates.value);
                toastr.error(err.responseText);
            });
        }, function () {
            Object.assign(projectStepToSave, original);
            updates.onNext(updates.value);
        });
    };
    
    this.getProjectStepByName = function (name) {
        var existingProjectStep = _.find(updates.value, function(item) { 
            return cleanProjectStepName(item.name) === cleanProjectStepName(name.toLowerCase()); 
        });
        return existingProjectStep;
    };
    
    this.getProjectStepById = function (id) {
        var existingProjectStep = _.find(updates.value, function(item) { 
            return item.id.toLowerCase() === id.toLowerCase(); 
        });
        return existingProjectStep;
    };
    
    var user = 'my';
    var secret = 'hash';
    
    var cleanProjectStepName = function (name) {
        return name.replace(/:/g, '').replace(/  /g, ' ').trim().toLowerCase();
    };
    
    this.init = function (userName, userId) {
        
        user = userName;
        secret = userId;
        
        // populate store - call to database
        _api.getProjectSteps()
        .done(function (result) {
            hlio.saveLocal('hl.' + user + '.projectsteps', result, secret);
            updates.onNext(result);
        })
        .fail(function (err) {
            toastr.error(err.responseText);
        });

        var projectSteps = hlio.loadLocal('hl.' + user + '.projectsteps', secret);
        if (projectSteps) {
            updates.onNext(projectSteps);   
        }
    };
};

var projectStepStore = new ProjectStepStore();