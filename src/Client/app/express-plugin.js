(function (factory) {
    module.exports = exports = factory(
        require('./data'),
        require('./sql')
    );
}(function (dataAccess, legacy) {

    var db = null;
    dataAccess.open('Geoffrey Floyd', 'geoffreyfloyd@hoomanlogic.com', '../../test-db', 'https://github.com/geoffreyfloyd/tdb.git').then(function (gnodb) {
        db = gnodb;
    });
    
    /**
     * Set the context for data access
     */
    return function (app, authenticate, renderer, stats) {
        /**
         * Serve up main page of doozy UI 
         */
        app.get('/doozy', authenticate, function (req, res) {
            renderer.renderWithScript(
                stats.publicPath + 'doozy.js',
                req.path,
                null,
                function (err, html) {
                    if (err) {
                        res.statusCode = 500;
                        res.contentType = 'text; charset=utf8';
                        res.end(err.message);
                        return;
                    }
                    res.contentType = 'text/html; charset=utf8';
                    res.end(html);
                }
            );
        });

        /**
         * Get a gnode by path
         * TODO: Move this to Gnodes express plugin
         */
        app.get('/gnodes/:path', authenticate, function (req, res) {
            /**
             * Set header to tell client that we're
             * sending json data in our response body
             */
            res.setHeader('Content-Type', 'application/json');
            
            var gnode = db.get(req.params.path);
            res.end(JSON.stringify(gnode));
        });

        app.get('/doozy/import', authenticate, function (req, res) {
            /**
             * Set header to tell client that we're
             * sending json data in our response body
             */
            legacy.getActions(importActions);
            
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ path: 'IMPORT FOR ' + req.user.userName }));
        });
        
        function importActions (actions) {
            actions.forEach(function (action) {
                db.add(new db.Gnode(action.Name, 'doozy.action', camelize(action)));
            });
            
            // Next
            legacy.getTags(importTags);
        }
        
        function importTags (tags) {
            tags.forEach(function (tag) {
                db.add(new db.Gnode(tag.Name, 'doozy.tag', camelize(tag)));
            });
            
            db.commitChanges();
        }
        
        function camelize(obj) {
            var camelized = {};
            for (var p in obj) {
                var camel = p.slice(0, 1).toLowerCase() + p.slice(1);
                if (obj.hasOwnProperty(p)) {
                    camelized[camel] = obj[p];
                }
            }
            return camelized;
        }
        
        app.get('/doozy/api/*', authenticate, function (req, res) {
            /**
             * Set header to tell client that we're
             * sending json data in our response body
             */
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ path: 'GET ' + req.user.userName }));
        });

        app.post('/doozy/api/*', authenticate, function (req, res) {
            /**
             * Set header to tell client that we're
             * sending json data in our response body
             */
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ path: 'POST ' + req.user.userName }));
        });
    }

}));