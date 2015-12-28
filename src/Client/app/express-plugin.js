(function (factory) {
    module.exports = exports = factory(
        require('./data'),
        require('./sql')
    );
}(function (dataAccess, legacy) {

    var db = null;
    dataAccess.open().then(function (gnodb) {
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
        app.get('/gnodes/:path', authenticate, jsonResponse, function (req, res) {
            var gnode = db.get(req.params.path);
            res.end(JSON.stringify(gnode));
        });

        app.get('/doozy/api/*', authenticate, jsonResponse, function (req, res) {
            res.end(JSON.stringify({ path: 'GET ' + req.user.userName }));
        });

        app.post('/doozy/api/*', authenticate, jsonResponse, function (req, res) {
            res.end(JSON.stringify({ path: 'POST ' + req.user.userName }));
        });
        
        // app.get('/doozy/import', authenticate, function (req, res) {
        //     legacy.importTo(db);
        //     res.end(JSON.stringify({ path: 'IMPORT STARTED FOR ' + req.user.userName }));
        // });
                
        /**
         * Set header to tell client that we're
         * sending json data in our response body
         */
        function jsonResponse (req, res, next) {    
            res.setHeader('Content-Type', 'application/json');
            next();
        }
    }

}));