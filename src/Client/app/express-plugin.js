(function (factory) {
    module.exports = exports = factory();
}(function () {

    return function (app, renderer, stats) {
        /**
         * Serve up main page of doozy UI 
         */
        app.get('/doozy', function (req, res) {
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

        app.get('/doozy/api/*', function (req, res) {
            /**
             * Set header to tell client that we're
             * sending json data in our response body
             */
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ path: 'GET ' + req.path }));
        });

        app.post('/doozy/api/*', function (req, res) {
            /**
             * Set header to tell client that we're
             * sending json data in our response body
             */
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ path: 'POST ' + req.path }));
        });
    }

}));