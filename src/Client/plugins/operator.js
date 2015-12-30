(function (factory) {
    module.exports = exports = factory(
        require('../app/data'),
        require('../app/sql')
    );
}(function (data, legacy) {

    /**
     * Set the context for data access
     */
    return function (operator) {
        
        // var contextCues = [{
        //     kind: 'app',
        //     tag: 'doozy'  
        // }];
        
        // operator.registerGooey('/doozy', operator.authenticate, function (ctx) {
        //     // ctx.db
        //     // ctx.req
        //     // ctx.res
        // });
        
        // operator.registerCommand('get', '/gnodes/:path', operator.authenticate, jsonResponse, function (ctx) {
        //     var gnode = ctx.db.get(ctx.req.params.path);
        //     ctx.res.end(JSON.stringify(gnode));
        // });
        
        /**
         * Serve up main page of doozy UI 
         */
        operator.express.get('/doozy', operator.authenticate, function (req, res) {
            operator.renderer.renderWithScript(
                operator.stats.publicPath + 'doozy.js',
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
        operator.express.get('/gnodes/:path', operator.authenticate, jsonResponse, function (req, res) {
            var gnode = operator.db.get(req.params.path);
            res.end(JSON.stringify(gnode));
        });
        
        
        /*****************************************************
         * ACTIONS
         ****************************************************/
        operator.express.get('/doozy/api/actions', operator.authenticate, jsonResponse, function (req, res) {
            var result = [];
            operator.db.allOf('doozy.action').forEach(function (each) {
                result.push(each.state); 
            });       
            res.end(JSON.stringify(result));
        });

        operator.express.get('/doozy/api/action/:tag', operator.authenticate, jsonResponse, function (req, res) {
            var result = operator.db.find(req.params.tag, 'doozy.action').first();
            res.end(JSON.stringify(result ? result.toGnon() : null));
        });

        operator.express.get('/doozy/api/actions/:id', operator.authenticate, jsonResponse, function (req, res) {
            var result = operator.db.find({id: req.params.id}, 'doozy.action').first();
            res.end(JSON.stringify(result ? result.toGnon() : null));
        });

        operator.express.post('/doozy/api/actions', operator.authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ path: 'POST ' + req.user.userName }));
        });
        
        operator.express.put('/doozy/api/actions', operator.authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ result: 'PUT SUCCESS' }));
        });
        
        operator.express.delete('/doozy/api/actions/:id', operator.authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ result: 'DELETE SUCCESS' }));
        });

        /*****************************************************
         * FOCUSES
         ****************************************************/
        operator.express.get('/doozy/api/focuses', operator.authenticate, jsonResponse, function (req, res) {
            var result = [];
            operator.db.allOf('doozy.focus').forEach(function (each) {
                result.push(each.state); 
            });
            res.end(JSON.stringify(result));
        });

        operator.express.get('/doozy/api/focus/:tag', operator.authenticate, jsonResponse, function (req, res) {
            var result = operator.db.find(req.params.tag, 'doozy.focus').first();
            res.end(JSON.stringify(result ? result.toGnon() : null ));
        });

        operator.express.get('/doozy/api/focuses/:id', operator.authenticate, jsonResponse, function (req, res) {
            var result = operator.db.find({id: req.params.id}, 'doozy.focus').first();
            res.end(JSON.stringify(result ? result.toGnon() : null ));
        });

        operator.express.post('/doozy/api/focuses', operator.authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ path: 'POST ' + req.user.userName }));
        });
        
        operator.express.put('/doozy/api/focuses', operator.authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ result: 'PUT SUCCESS' }));
        });
        
        operator.express.delete('/doozy/api/focuses/:id', operator.authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ result: 'DELETE SUCCESS' }));
        });
        
        /*****************************************************
         * TAGS
         ****************************************************/
        operator.express.get('/doozy/api/tags', operator.authenticate, jsonResponse, function (req, res) {
            var result = [];
            operator.db.allOf('doozy.tag').forEach(function (each) {
                console.log(each.state);
                result.push(each.state); 
            });
            res.end(JSON.stringify(result));
        });

        operator.express.get('/doozy/api/tag/:tag', operator.authenticate, jsonResponse, function (req, res) {
            var result = operator.db.find(req.params.tag, 'doozy.tag').first();
            res.end(JSON.stringify(result ? result.toGnon() : null));
        });

        operator.express.get('/doozy/api/tags/:id', operator.authenticate, jsonResponse, function (req, res) {
            var result = operator.db.find({id: req.params.id}, 'doozy.tag').first();
            res.end(JSON.stringify(result ? result.toGnon() : null));
        });

        operator.express.post('/doozy/api/tags', operator.authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ path: 'POST ' + req.user.userName }));
        });
        
        operator.express.put('/doozy/api/tags', operator.authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ result: 'PUT SUCCESS' }));
        });
        
        operator.express.delete('/doozy/api/tags/:id', operator.authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ result: 'DELETE SUCCESS' }));
        });

        /*****************************************************
         * TARGETS
         ****************************************************/
        operator.express.get('/doozy/api/targets', operator.authenticate, jsonResponse, function (req, res) {
            var result = [];
            operator.db.allOf('doozy.target').forEach(function (each) {
                console.log(each.state);
                result.push(each.state); 
            });
            res.end(JSON.stringify(result));
        });

        operator.express.get('/doozy/api/target/:tag', operator.authenticate, jsonResponse, function (req, res) {
            var result = operator.db.find(req.params.tag, 'doozy.target').first();
            res.end(JSON.stringify(result ? result.toGnon() : null));
        });

        operator.express.get('/doozy/api/targets/:id', operator.authenticate, jsonResponse, function (req, res) {
            var result = operator.db.find({id: req.params.id}, 'doozy.target').first();
            res.end(JSON.stringify(result ? result.toGnon() : null));
        });

        operator.express.post('/doozy/api/targets', operator.authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ path: 'POST ' + req.user.userName }));
        });
        
        operator.express.put('/doozy/api/targets', operator.authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ result: 'PUT SUCCESS' }));
        });
        
        operator.express.delete('/doozy/api/targets/:id', operator.authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ result: 'DELETE SUCCESS' }));
        });
        
        /*****************************************************
         * PLANS
         ****************************************************/
        operator.express.get('/doozy/api/plans', operator.authenticate, jsonResponse, function (req, res) {
            var result = [];
            operator.db.allOf('doozy.plan').forEach(function (each) {
                console.log(each.state);
                result.push(each.state); 
            });
            res.end(JSON.stringify(result));
        });

        operator.express.get('/doozy/api/plan/:tag', operator.authenticate, jsonResponse, function (req, res) {
            var result = operator.db.find(req.params.tag, 'doozy.plan').first();
            res.end(JSON.stringify(result ? result.toGnon() : null));
        });

        operator.express.get('/doozy/api/plans/:id', operator.authenticate, jsonResponse, function (req, res) {
            var result = operator.db.find({id: req.params.id}, 'doozy.plan').first();
            res.end(JSON.stringify(result ? result.toGnon() : null));
        });

        operator.express.post('/doozy/api/plans', operator.authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ path: 'POST ' + req.user.userName }));
        });
        
        operator.express.put('/doozy/api/plans', operator.authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ result: 'PUT SUCCESS' }));
        });
        
        operator.express.delete('/doozy/api/plans/:id', operator.authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ result: 'DELETE SUCCESS' }));
        });
        
        /*****************************************************
         * PLAN STEPS
         ****************************************************/
        operator.express.get('/doozy/api/plansteps', operator.authenticate, jsonResponse, function (req, res) {
            var result = [];
            operator.db.allOf('doozy.planstep').forEach(function (each) {
                result.push(each.state); 
            });
            res.end(JSON.stringify(result));
        });

        operator.express.get('/doozy/api/planstep/:tag', operator.authenticate, jsonResponse, function (req, res) {
            var result = operator.db.find(req.params.tag, 'doozy.planstep').first();
            res.end(JSON.stringify(result ? result.toGnon() : null));
        });

        operator.express.get('/doozy/api/plansteps/:id', operator.authenticate, jsonResponse, function (req, res) {
            var result = operator.db.find({id: req.params.id}, 'doozy.planstep').first();
            res.end(JSON.stringify(result ? result.toGnon() : null));
        });

        operator.express.post('/doozy/api/plansteps', operator.authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ path: 'POST ' + req.user.userName }));
        });
        
        operator.express.put('/doozy/api/plansteps', operator.authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ result: 'PUT SUCCESS' }));
        });
        
        operator.express.delete('/doozy/api/plansteps/:id', operator.authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ result: 'DELETE SUCCESS' }));
        });
        
        /*****************************************************
         * LOG ENTRIES
         ****************************************************/
        operator.express.get('/doozy/api/logentries', operator.authenticate, jsonResponse, function (req, res) {
            var result = [];
            operator.db.allOf('doozy.logentry').forEach(function (each) {
                result.push(each.state); 
            });
            res.end(JSON.stringify(result));
        });

        operator.express.get('/doozy/api/logentry/:tag', operator.authenticate, jsonResponse, function (req, res) {
            var result = operator.db.find(req.params.tag, 'doozy.logentry').first();
            res.end(JSON.stringify(result ? result.toGnon() : null));
        });

        operator.express.get('/doozy/api/logentries/:id', operator.authenticate, jsonResponse, function (req, res) {
            var result = operator.db.find({id: req.params.id}, 'doozy.logentry').first();
            res.end(JSON.stringify(result ? result.toGnon() : null));
        });

        operator.express.post('/doozy/api/logentries', operator.authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ path: 'POST ' + req.user.userName }));
        });
        
        operator.express.put('/doozy/api/logentries', operator.authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ result: 'PUT SUCCESS' }));
        });
        
        operator.express.delete('/doozy/api/logentries/:id', operator.authenticate, jsonResponse, function (req, res) {
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