(function (factory) {
    module.exports = exports = factory(
        require('jquery'),
        require('rx'),
        require('hl-common-js/src/io'),
        require('components/MessageBox')
    );
}(function ($, Rx, hlio, MessageBox) {

    var TagStore = function () {

        /**
         * REST API
         */
        var _api = {
            getTags: function () {
                return $.ajax({
                    context: this,
                    url: baseUrl + '/api/tags',
                    dataType: 'json',
                    // headers: {
                    //     'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    // }
                });
            },
            postTag: function (tag) {
                return $.ajax({
                    context: this,
                    url: baseUrl + '/api/tags',
                    dataType: 'json',
                    // headers: {
                    //     'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    // },
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(tag)
                });
            },
            putTag: function (tag) {
                return $.ajax({
                    context: this,
                    url: baseUrl + '/api/tags',
                    dataType: 'json',
                    // headers: {
                    //     'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    // },
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify(tag)
                });
            },
            deleteTag: function (tag) {
                return $.ajax({
                    context: this,
                    url: baseUrl + '/api/tags/' + encodeURIComponent(tag.id),
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
        this.create = function (newTag, done, fail) {

            // update now for optimistic concurrency
            updates.onNext(updates.value.concat(newTag));

            _api.postTag(newTag)
            .done(function (result) {
                Object.assign(newTag, result);
                updates.onNext(updates.value);
                hlio.saveLocal('hl.' + user + '.tags', updates.value, secret);
                MessageBox.notify('Added tag ' + newTag.name, 'success');
                if (typeof done !== 'undefined' && done !== null) {
                    done(newTag);
                }
            })
            .fail( function (err) {
                var filtered = updates.value.filter( function (item) { return item !== newTag; });
                updates.onNext(filtered);
                MessageBox.notify(err.responseText, 'error');
                if (typeof fail !== 'undefined' && fail !== null) {
                    fail(err);
                }
            });
        };

        this.destroy = function (tag) {
            // optimistic concurrency
            var filtered = updates.value.filter( function (item) { return item.id !== tag.id; });
            updates.onNext(filtered);

            // ui.queueRequest('Tag', tag.id, 'Deleted tag ' + tag.name, function () {
                _api.deleteTag(tag)
                .done( function () {
                    hlio.saveLocal('hl.' + user + '.tags', updates.value, secret);
                })
                .fail( function (err) {
                    updates.onNext(updates.value.concat(tag));
                    MessageBox.notify(err.responseText, 'error');
                });
            // }, function () {
            //     updates.onNext(updates.value.concat(tag));
            // });
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

            // ui.queueRequest('Tag', tag.id, 'Updated tag ' + tagToSave.name, function () {
                _api.putTag(tagToSave)
                .done(function (result) {
                    Object.assign(tagToSave, result);
                    updates.onNext(updates.value);
                    hlio.saveLocal('hl.' + user + '.tags', updates.value, secret);
                })
                .fail(function  (err) {
                    Object.assign(tagToSave, original);
                    updates.onNext(updates.value);
                    MessageBox.notify(err.responseText, 'error');
                });
            // }, function () {
            //     Object.assign(tagToSave, original);
            //     updates.onNext(updates.value);
            // });
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
        var baseUrl = null;
        
        var cleanTagName = function (name) {
            return name.replace(/:/g, '').replace(/  /g, ' ').trim().toLowerCase();
        };

        this.init = function (userName, userId) {

            user = userName;
            secret = userId;
            baseUrl = window.location.href.split('/').slice(0,3).join('/') + '/doozy';
            
            // populate store - call to database
            _api.getTags()
            .done(function (result) {
                hlio.saveLocal('hl.' + user + '.tags', result, secret);
                updates.onNext(result);
            })
            .fail(function (err) {
                MessageBox.notify(err.responseText, 'error');
            });

            var tags = hlio.loadLocal('hl.' + user + '.tags', secret);
            if (tags) {
                updates.onNext(tags);
            }
        };
    };

    return new TagStore();
}));
