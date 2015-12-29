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
        
        
        /*****************************************************
         * ACTIONS
         ****************************************************/
        app.get('/doozy/api/actions', authenticate, jsonResponse, function (req, res) {
            var result = [];
            db.allOf('doozy.action').forEach(function (each) {
                result.push(each.state); 
            });       
            res.end(JSON.stringify(result));
        });

        app.get('/doozy/api/action/:tag', authenticate, jsonResponse, function (req, res) {
            var result = db.find(req.params.tag, 'doozy.action').first();
            res.end(JSON.stringify(result ? result.toGnon() : null));
        });

        app.get('/doozy/api/actions/:id', authenticate, jsonResponse, function (req, res) {
            var result = db.find({id: req.params.id}, 'doozy.action').first();
            res.end(JSON.stringify(result ? result.toGnon() : null));
        });

        app.post('/doozy/api/actions', authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ path: 'POST ' + req.user.userName }));
        });
        
        app.put('/doozy/api/actions', authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ result: 'PUT SUCCESS' }));
        });
        
        app.delete('/doozy/api/actions/:id', authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ result: 'DELETE SUCCESS' }));
        });

        /*****************************************************
         * FOCUSES
         ****************************************************/
        app.get('/doozy/api/focuses', authenticate, jsonResponse, function (req, res) {
            var result = [];
            db.allOf('doozy.focus').forEach(function (each) {
                result.push(each.state); 
            });
            res.end(JSON.stringify(result));
        });

        app.get('/doozy/api/focus/:tag', authenticate, jsonResponse, function (req, res) {
            var result = db.find(req.params.tag, 'doozy.focus').first();
            res.end(JSON.stringify(result ? result.toGnon() : null ));
        });

        app.get('/doozy/api/focuses/:id', authenticate, jsonResponse, function (req, res) {
            var result = db.find({id: req.params.id}, 'doozy.focus').first();
            res.end(JSON.stringify(result ? result.toGnon() : null ));
        });

        app.post('/doozy/api/focuses', authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ path: 'POST ' + req.user.userName }));
        });
        
        app.put('/doozy/api/focuses', authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ result: 'PUT SUCCESS' }));
        });
        
        app.delete('/doozy/api/focuses/:id', authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ result: 'DELETE SUCCESS' }));
        });
        
        /*****************************************************
         * TAGS
         ****************************************************/
        app.get('/doozy/api/tags', authenticate, jsonResponse, function (req, res) {
            var result = [];
            db.allOf('doozy.tag').forEach(function (each) {
                console.log(each.state);
                result.push(each.state); 
            });
            res.end(JSON.stringify(result));
        });

        app.get('/doozy/api/tag/:tag', authenticate, jsonResponse, function (req, res) {
            var result = db.find(req.params.tag, 'doozy.tag').first();
            res.end(JSON.stringify(result ? result.toGnon() : null));
        });

        app.get('/doozy/api/tags/:id', authenticate, jsonResponse, function (req, res) {
            var result = db.find({id: req.params.id}, 'doozy.tag').first();
            res.end(JSON.stringify(result ? result.toGnon() : null));
        });

        app.post('/doozy/api/tags', authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ path: 'POST ' + req.user.userName }));
        });
        
        app.put('/doozy/api/tags', authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ result: 'PUT SUCCESS' }));
        });
        
        app.delete('/doozy/api/tags/:id', authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ result: 'DELETE SUCCESS' }));
        });

        /*****************************************************
         * TARGETS
         ****************************************************/
        app.get('/doozy/api/targets', authenticate, jsonResponse, function (req, res) {
            var result = [];
            db.allOf('doozy.target').forEach(function (each) {
                console.log(each.state);
                result.push(each.state); 
            });
            res.end(JSON.stringify(result));
        });

        app.get('/doozy/api/target/:tag', authenticate, jsonResponse, function (req, res) {
            var result = db.find(req.params.tag, 'doozy.target').first();
            res.end(JSON.stringify(result ? result.toGnon() : null));
        });

        app.get('/doozy/api/targets/:id', authenticate, jsonResponse, function (req, res) {
            var result = db.find({id: req.params.id}, 'doozy.target').first();
            res.end(JSON.stringify(result ? result.toGnon() : null));
        });

        app.post('/doozy/api/targets', authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ path: 'POST ' + req.user.userName }));
        });
        
        app.put('/doozy/api/targets', authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ result: 'PUT SUCCESS' }));
        });
        
        app.delete('/doozy/api/targets/:id', authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ result: 'DELETE SUCCESS' }));
        });
        
        /*****************************************************
         * PLANS
         ****************************************************/
        app.get('/doozy/api/plans', authenticate, jsonResponse, function (req, res) {
            var result = [];
            db.allOf('doozy.plan').forEach(function (each) {
                console.log(each.state);
                result.push(each.state); 
            });
            res.end(JSON.stringify(result));
        });

        app.get('/doozy/api/plan/:tag', authenticate, jsonResponse, function (req, res) {
            var result = db.find(req.params.tag, 'doozy.plan').first();
            res.end(JSON.stringify(result ? result.toGnon() : null));
        });

        app.get('/doozy/api/plans/:id', authenticate, jsonResponse, function (req, res) {
            var result = db.find({id: req.params.id}, 'doozy.plan').first();
            res.end(JSON.stringify(result ? result.toGnon() : null));
        });

        app.post('/doozy/api/plans', authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ path: 'POST ' + req.user.userName }));
        });
        
        app.put('/doozy/api/plans', authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ result: 'PUT SUCCESS' }));
        });
        
        app.delete('/doozy/api/plans/:id', authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ result: 'DELETE SUCCESS' }));
        });
        
        /*****************************************************
         * PLAN STEPS
         ****************************************************/
        app.get('/doozy/api/plansteps', authenticate, jsonResponse, function (req, res) {
            var result = [];
            db.allOf('doozy.planstep').forEach(function (each) {
                result.push(each.state); 
            });
            res.end(JSON.stringify(result));
        });

        app.get('/doozy/api/planstep/:tag', authenticate, jsonResponse, function (req, res) {
            var result = db.find(req.params.tag, 'doozy.planstep').first();
            res.end(JSON.stringify(result ? result.toGnon() : null));
        });

        app.get('/doozy/api/plansteps/:id', authenticate, jsonResponse, function (req, res) {
            var result = db.find({id: req.params.id}, 'doozy.planstep').first();
            res.end(JSON.stringify(result ? result.toGnon() : null));
        });

        app.post('/doozy/api/plansteps', authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ path: 'POST ' + req.user.userName }));
        });
        
        app.put('/doozy/api/plansteps', authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ result: 'PUT SUCCESS' }));
        });
        
        app.delete('/doozy/api/plansteps/:id', authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ result: 'DELETE SUCCESS' }));
        });
        
        /*****************************************************
         * LOG ENTRIES
         ****************************************************/
        app.get('/doozy/api/logentries', authenticate, jsonResponse, function (req, res) {
            var result = [];
            db.allOf('doozy.logentry').forEach(function (each) {
                result.push(each.state); 
            });
            res.end(JSON.stringify(result));
        });

        app.get('/doozy/api/logentry/:tag', authenticate, jsonResponse, function (req, res) {
            var result = db.find(req.params.tag, 'doozy.logentry').first();
            res.end(JSON.stringify(result ? result.toGnon() : null));
        });

        app.get('/doozy/api/logentries/:id', authenticate, jsonResponse, function (req, res) {
            var result = db.find({id: req.params.id}, 'doozy.logentry').first();
            res.end(JSON.stringify(result ? result.toGnon() : null));
        });

        app.post('/doozy/api/logentries', authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ path: 'POST ' + req.user.userName }));
        });
        
        app.put('/doozy/api/logentries', authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ result: 'PUT SUCCESS' }));
        });
        
        app.delete('/doozy/api/logentries/:id', authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ result: 'DELETE SUCCESS' }));
        });
                
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