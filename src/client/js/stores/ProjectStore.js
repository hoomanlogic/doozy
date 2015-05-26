var ProjectStore = function () {

    /**
     * REST API
     */
    var _api = {
        getProjects: function () {
            return $.ajax({
                context: this,
                url: hlapp.HOST_NAME + '/api/projects',
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + hlapp.getAccessToken()
                }
            });
        },
        postProject: function (project) {
            return $.ajax({
                context: this,
                url: hlapp.HOST_NAME + '/api/projects',
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + hlapp.getAccessToken()
                },
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(project)
            });
        },
        putProject: function (project) {
            return $.ajax({
                context: this,
                url: hlapp.HOST_NAME + '/api/projects',
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + hlapp.getAccessToken()
                },
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(project)
            });
        },
        deleteProject: function (project) {
            return $.ajax({
                context: this,
                url: hlapp.HOST_NAME + '/api/projects/' + encodeURIComponent(project.id),
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
    this.create = function (newProject) {
        
        // update now for optimistic concurrency
        updates.onNext(updates.value.concat(newProject));
        
        _api.postProject(newProject)
        .done(function (result) {
            updates.value.forEach(function (item) { 
                if (item === newProject) {
                    Object.assign(item, result);
                    newProject = item;
                }
            });
            updates.onNext(updates.value);
            hlio.saveLocal('hl.' + user + '.projects', updates.value, secret);
            toastr.success('Added project ' + newProject.name);
        })
        .fail( function (err) {
            var filtered = updates.value.filter( function (item) { return item !== newProject; });
            updates.onNext(filtered);
            toastr.error(err.responseText);
        });
    };
    
    this.destroy = function (project) {
        // optimistic concurrency
        var filtered = updates.value.filter( function (item) { return item !== project; });
        updates.onNext(filtered);
        
        _api.deleteProject(project)
        .done( function () {
            toastr.success('Deleted project ' + project.name);
            hlio.saveLocal('hl.' + user + '.projects', updates.value, secret);
        })
        .fail( function (err) {
            updates.onNext(updates.value.concat(project));
            toastr.error(err.responseText);
        });
    };
    
    this.update = function (project) {
        
        var projectToSave = _.find(updates.value, function(item) { 
            return item.id === project.id; 
        });
        var state = project,
            original = Object.assign({}, projectToSave);
        
        var val = projectToSave;
        Object.assign(val, state);
        updates.onNext(updates.value);
        
        _api.putProject(val)
        .done(function (result) {
            Object.assign(val, result);
            updates.onNext(updates.value);
            hlio.saveLocal('hl.' + user + '.projects', updates.value, secret);
            toastr.success('Updated project ' + val.name);
        })
        .fail(function  (err) {
            Object.assign(val, original);
            updates.onNext(updates.value);
            toastr.error(err.responseText);
        });
    };
    
    this.updateFromServer = function (projectId, newState) {
        var projectToUpdate = _.find(updates.value, function(item) { 
            return item.id === projectId; 
        });
        Object.assign(projectToUpdate, newState);
        updates.onNext(updates.value);
    };

    var user = 'my';
    var secret = 'hash';
    
    this.init = function (userName, userId) {
        
        user = userName;
        secret = userId;
        
        // populate store - call to database
        _api.getProjects()
        .done(function (result) {
            updates.onNext(result);
            hlio.saveLocal('hl.' + user + '.projects', updates.value, secret);
        })
        .fail(function (err) {
            toastr.error(err.responseText);
        });

        var projects = hlio.loadLocal('hl.' + user + '.projects', secret);
        if (projects) {
            updates.onNext(projects);   
        }
    }
    
};

var projectStore = new ProjectStore();