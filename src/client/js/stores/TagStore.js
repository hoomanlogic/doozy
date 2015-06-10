var TagStore = function () {

    /**
     * REST API
     */
    var _api = {
        getTags: function () {
            return $.ajax({
                context: this,
                url: doozy.HOST_NAME + '/api/tags',
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + doozy.getAccessToken()
                }
            });
        },
        postTag: function (tag) {
            return $.ajax({
                context: this,
                url: doozy.HOST_NAME + '/api/tags',
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + doozy.getAccessToken()
                },
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(tag)
            });
        },
        putTag: function (tag) {
            return $.ajax({
                context: this,
                url: doozy.HOST_NAME + '/api/tags',
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + doozy.getAccessToken()
                },
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(tag)
            });
        },
        deleteTag: function (tag) {
            return $.ajax({
                context: this,
                url: doozy.HOST_NAME + '/api/tags/' + encodeURIComponent(tag.id),
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + doozy.getAccessToken()
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
    this.create = function (newTag, done, fail) {
        
        // update now for optimistic concurrency
        updates.onNext(updates.value.concat(newTag));
        
        _api.postTag(newTag)
        .done(function (result) {
            Object.assign(newTag, result);
            updates.onNext(updates.value);
            hlio.saveLocal('hl.' + user + '.tags', updates.value, secret);
            toastr.success('Added tag ' + newTag.name);
            if (typeof done !== 'undefined' && done !== null) {
                done(newTag);
            }
        })
        .fail( function (err) {
            var filtered = updates.value.filter( function (item) { return item !== newTag; });
            updates.onNext(filtered);
            toastr.error(err.responseText);
            if (typeof fail !== 'undefined' && fail !== null) {
                fail(err);
            }
        });
    };
    
    this.destroy = function (tag) {
        // optimistic concurrency
        var filtered = updates.value.filter( function (item) { return item.id !== tag.id; });
        updates.onNext(filtered);
        
        ui.queueRequest('Tag', tag.id, 'Deleted tag ' + tag.name, function () {
            _api.deleteTag(tag)
            .done( function () {
                hlio.saveLocal('hl.' + user + '.tags', updates.value, secret);
            })
            .fail( function (err) {
                updates.onNext(updates.value.concat(tag));
                toastr.error(err.responseText);
            });
        }, function () {
            updates.onNext(updates.value.concat(tag));
        });
    };
    
    this.update = function (tag) {
        
        // get object reference to tag in store
        var tagToSave = _.find(updates.value, function(item) { 
            return item.id === tag.id; 
        });
        
        // keep copy of original for undo
        var original = Object.assign({}, tagToSave);
        
        // optimistic concurrency
        Object.assign(tagToSave, tag);
        updates.onNext(updates.value);
        
        ui.queueRequest('Tag', tag.id, 'Updated tag ' + tagToSave.name, function () {
            _api.putTag(tagToSave)
            .done(function (result) {
                Object.assign(tagToSave, result);
                updates.onNext(updates.value);
                hlio.saveLocal('hl.' + user + '.tags', updates.value, secret);
            })
            .fail(function  (err) {
                Object.assign(tagToSave, original);
                updates.onNext(updates.value);
                toastr.error(err.responseText);
            });
        }, function () {
            Object.assign(tagToSave, original);
            updates.onNext(updates.value);
        });
    };
    
    this.getTagByName = function (name) {
        var existingTag = _.find(updates.value, function(item) { 
            return cleanTagName(item.name) === cleanTagName(name.toLowerCase()); 
        });
        return existingTag;
    };
    
    this.getTagById = function (id) {
        var existingTag = _.find(updates.value, function(item) { 
            return item.id.toLowerCase() === id.toLowerCase(); 
        });
        return existingTag;
    };
    
    var user = 'my';
    var secret = 'hash';
    
    var cleanTagName = function (name) {
        return name.replace(/:/g, '').replace(/  /g, ' ').trim().toLowerCase();
    };
    
    this.init = function (userName, userId) {
        
        user = userName;
        secret = userId;
        
        // populate store - call to database
        _api.getTags()
        .done(function (result) {
            hlio.saveLocal('hl.' + user + '.tags', result, secret);
            updates.onNext(result);
        })
        .fail(function (err) {
            toastr.error(err.responseText);
        });

        var tags = hlio.loadLocal('hl.' + user + '.tags', secret);
        if (tags) {
            updates.onNext(tags);   
        }
    };
};

var tagStore = new TagStore();