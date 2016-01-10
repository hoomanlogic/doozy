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
         * Serve up interfaces
         */
        var fs = require('fs');
        var path = require('path');
        var defaultHtmlTemplate = fs.readFileSync(path.resolve(__dirname, '../interfaces/_default.html'), 'utf-8');
        
        // ACTIONS INTERFACE
        operator.express.get('/doozy(/actions)?', operator.authenticate, function (req, res) {
            operator.renderer.renderHtml(
                defaultHtmlTemplate
                    .replace('SCRIPT_URL', operator.stats.publicPath + 'doozy/actions.js')
                    .replace('SELECTIZE_URL', operator.stats.publicPath + 'doozy-global-libs.js')
                    .replace('SELECTIZE_CSS_1', operator.stats.publicPath + 'selectize.css')
                    .replace('SELECTIZE_CSS_2', operator.stats.publicPath + 'selectize.default.css')
                    .replace('INTERFACE_PROPS', JSON.stringify({})),
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
        
        // ACTION EDIT
        operator.express.get('/doozy/action/:tag', operator.authenticate, function (req, res) {
            
            operator.getDb(function (db) {
                
                var result = db.find(req.params.tag, 'doozy.action').first();
                if (!result) {
                    result = db.find({id: req.params.tag}, 'doozy.action').first();
                }
                if (result) {
                    operator.renderer.renderHtml(
                        defaultHtmlTemplate
                            .replace('SCRIPT_URL', operator.stats.publicPath + 'doozy/action-form.js')
                            .replace('SELECTIZE_URL', operator.stats.publicPath + 'doozy-global-libs.js')
                            .replace('SELECTIZE_CSS_1', operator.stats.publicPath + 'selectize.css')
                            .replace('SELECTIZE_CSS_2', operator.stats.publicPath + 'selectize.default.css')
                            .replace('INTERFACE_PROPS', JSON.stringify({action: result.state, mode: 'Edit'})),
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
                }
                else {
                    res.end();
                }
            });
        });
        
        // ACTION ADD
        operator.express.get('/doozy/actions/new', operator.authenticate, function (req, res) {
            operator.getDb(function (db) {
                operator.renderer.renderHtml(
                    defaultHtmlTemplate
                        .replace('SCRIPT_URL', operator.stats.publicPath + 'doozy/action-form.js')
                        .replace('SELECTIZE_URL', operator.stats.publicPath + 'doozy-global-libs.js')
                        .replace('SELECTIZE_CSS_1', operator.stats.publicPath + 'selectize.css')
                        .replace('SELECTIZE_CSS_2', operator.stats.publicPath + 'selectize.default.css')
                        .replace('INTERFACE_PROPS', JSON.stringify({mode: 'Add'})),
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
        });
        
        // LOG ENTRY EDIT
        operator.express.get('/doozy/logentry/:tag', operator.authenticate, function (req, res) {
            
            operator.getDb(function (db) {
                
                var actionName;
                var result = db.find(req.params.tag, 'doozy.logentry').first();
                if (!result) {
                    result = db.find({id: req.params.tag}, 'doozy.logentry').first();
                    var actionNodes = result.siblings('doozy.action');
                    if (actionNodes.length > 0) {
                        actionName = actionNodes[0].target.state.name;
                    }
                }
                if (result) {
                    operator.renderer.renderHtml(
                        defaultHtmlTemplate
                            .replace('SCRIPT_URL', operator.stats.publicPath + 'doozy/logentry-form.js')
                            .replace('SELECTIZE_URL', operator.stats.publicPath + 'doozy-global-libs.js')
                            .replace('SELECTIZE_CSS_1', operator.stats.publicPath + 'selectize.css')
                            .replace('SELECTIZE_CSS_2', operator.stats.publicPath + 'selectize.default.css')
                            .replace('INTERFACE_PROPS', JSON.stringify({logEntry: result.state, mode: 'Edit', actionName: actionName})),
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
                }
                else {
                    res.end();
                }
            });
        });
        
        // LOG ENTRY ADD
        operator.express.get('/doozy/logentries/new(/:tag)?', operator.authenticate, function (req, res) {
            operator.getDb(function (db) {
                var action;
                
                if (req.params.tag) {
                    var result = db.find(req.params.tag, 'doozy.action').first();
                    if (!result) {
                        result = db.find({id: req.params.tag}, 'doozy.action').first();
                    }
                    if (result) {
                        action = result.state;
                    }    
                }
                
                operator.renderer.renderHtml(
                    defaultHtmlTemplate
                        .replace('SCRIPT_URL', operator.stats.publicPath + 'doozy/logentry-form.js')
                        .replace('SELECTIZE_URL', operator.stats.publicPath + 'doozy-global-libs.js')
                        .replace('SELECTIZE_CSS_1', operator.stats.publicPath + 'selectize.css')
                        .replace('SELECTIZE_CSS_2', operator.stats.publicPath + 'selectize.default.css')
                        .replace('INTERFACE_PROPS', JSON.stringify({mode: 'Add', action: action })),
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
        });

        operator.express.get('/doozy/plans', operator.authenticate, function (req, res) {
            operator.renderer.renderHtml(
                defaultHtmlTemplate
                    .replace('SCRIPT_URL', operator.stats.publicPath + 'doozy/plans.js')
                    .replace('SELECTIZE_URL', operator.stats.publicPath + 'doozy-global-libs.js')
                    .replace('SELECTIZE_CSS_1', operator.stats.publicPath + 'selectize.css')
                    .replace('SELECTIZE_CSS_2', operator.stats.publicPath + 'selectize.default.css')
                    .replace('INTERFACE_PROPS', JSON.stringify({})),
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
        
        operator.express.get('/doozy/plan/:tag', operator.authenticate, function (req, res) {
            operator.renderer.renderHtml(
                defaultHtmlTemplate
                    .replace('SCRIPT_URL', operator.stats.publicPath + 'doozy/plan-form.js')
                    .replace('SELECTIZE_URL', operator.stats.publicPath + 'doozy-global-libs.js')
                    .replace('SELECTIZE_CSS_1', operator.stats.publicPath + 'selectize.css')
                    .replace('SELECTIZE_CSS_2', operator.stats.publicPath + 'selectize.default.css')
                    .replace('INTERFACE_PROPS', JSON.stringify({planId: req.params.tag})),
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

        
        // PLANS VIEW
        operator.express.get('/doozy/plansteps/:tag', operator.authenticate, function (req, res) {
            operator.renderer.renderHtml(
                defaultHtmlTemplate
                    .replace('SCRIPT_URL', operator.stats.publicPath + 'doozy/plan-steps.js')
                    .replace('SELECTIZE_URL', operator.stats.publicPath + 'doozy-global-libs.js')
                    .replace('SELECTIZE_CSS_1', operator.stats.publicPath + 'selectize.css')
                    .replace('SELECTIZE_CSS_2', operator.stats.publicPath + 'selectize.default.css')
                    .replace('INTERFACE_PROPS', JSON.stringify({planId: req.params.tag})),
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
        
        // PLAN STEP ADD
        operator.express.get('/doozy/planstep/:plan/:parent/new', operator.authenticate, function (req, res) {
            operator.renderer.renderHtml(
                defaultHtmlTemplate
                    .replace('SCRIPT_URL', operator.stats.publicPath + 'doozy/plan-step-form.js')
                    .replace('SELECTIZE_URL', operator.stats.publicPath + 'doozy-global-libs.js')
                    .replace('SELECTIZE_CSS_1', operator.stats.publicPath + 'selectize.css')
                    .replace('SELECTIZE_CSS_2', operator.stats.publicPath + 'selectize.default.css')
                    .replace('INTERFACE_PROPS', JSON.stringify({planId: req.params.plan, parentId: req.params.parent, isNew: true})),
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
        
        operator.express.get('/doozy/planstep/:plan/new', operator.authenticate, function (req, res) {
            operator.renderer.renderHtml(
                defaultHtmlTemplate
                    .replace('SCRIPT_URL', operator.stats.publicPath + 'doozy/plan-step-form.js')
                    .replace('SELECTIZE_URL', operator.stats.publicPath + 'doozy-global-libs.js')
                    .replace('SELECTIZE_CSS_1', operator.stats.publicPath + 'selectize.css')
                    .replace('SELECTIZE_CSS_2', operator.stats.publicPath + 'selectize.default.css')
                    .replace('INTERFACE_PROPS', JSON.stringify({planId: req.params.plan, parentId: null, isNew: true})),
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
        
        // PLAN STEP EDIT
        operator.express.get('/doozy/planstep/:plan/:parent/:id', operator.authenticate, function (req, res) {
            operator.renderer.renderHtml(
                defaultHtmlTemplate
                    .replace('SCRIPT_URL', operator.stats.publicPath + 'doozy/plan-step-form.js')
                    .replace('SELECTIZE_URL', operator.stats.publicPath + 'doozy-global-libs.js')
                    .replace('SELECTIZE_CSS_1', operator.stats.publicPath + 'selectize.css')
                    .replace('SELECTIZE_CSS_2', operator.stats.publicPath + 'selectize.default.css')
                    .replace('INTERFACE_PROPS', JSON.stringify({planStepId: req.params.id, planId: req.params.plan, parentId: req.params.parent, isNew: false})),
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
        
        operator.express.get('/doozy/planstep/:plan/:id', operator.authenticate, function (req, res) {
            operator.renderer.renderHtml(
                defaultHtmlTemplate
                    .replace('SCRIPT_URL', operator.stats.publicPath + 'doozy/plan-step-form.js')
                    .replace('SELECTIZE_URL', operator.stats.publicPath + 'doozy-global-libs.js')
                    .replace('SELECTIZE_CSS_1', operator.stats.publicPath + 'selectize.css')
                    .replace('SELECTIZE_CSS_2', operator.stats.publicPath + 'selectize.default.css')
                    .replace('INTERFACE_PROPS', JSON.stringify({planStepId: req.params.id, planId: req.params.plan, parentId: null, isNew: false})),
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
            operator.getDb(function (db) {
                var gnode = db.get(req.params.path);
                res.end(JSON.stringify(gnode));
            });
        });
        
        
        var TAG_KIND = {
            FOCUS: '!',
            PLACE: '@',
            GOAL: '>',
            NEED: '$',
            BOX: '#',
            TAG: ''
        };
        var prefixSymbols = ['!','@','>','$','#'];
        var removePrefix = function (tag) {
            if (prefixSymbols.indexOf(tag.slice(0, 1)) === -1) {
                return tag;
            }
            else {
                return tag.slice(1);
            }
        };
        
        /*****************************************************
         * ACTIONS
         ****************************************************/
        var calculated = {
            action: ['id', 'lastPerformed', 'tags'],
            logentry: ['id','actionId','actionName','tags'],
            plan: ['id'],
            planstep: ['id','planId','parentId'],
            tag: ['id'],
            target: ['id']
        };
        var stripProps = function (obj, stripOut) {
            var newObj = {};
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop) && stripOut.indexOf(prop) === -1) {
                    newObj[prop] = obj[prop];
                }
            }
            return newObj;
        };
        
        operator.express.get('/doozy/api/actions', operator.authenticate, jsonResponse, function (req, res) {
            var result = [];
            operator.getDb(function (db) {
                db.allOf('doozy.action').forEach(function (each) {
                    /**
                     * defaults
                     */
                    each.state.recurrenceRules = each.state.recurrenceRules || [];
                    
                    /**
                     * calculations
                     */
                    // calc tags data
                    var tags = [];
                    each.siblings('doozy.tag').forEach(function (gnapse) {
                        tags.push(TAG_KIND[gnapse.target.state.kind.toUpperCase()] + gnapse.target.state.name);
                    });
                    each.state.tags = tags;
                    
                    // calc latest logentry
                    var lastPerformed = null;
                    each.siblings('doozy.logentry').forEach(function (gnapse) {
                        if (gnapse.target.state.entry === 'performed' && (!lastPerformed || lastPerformed < gnapse.target.state.date)) {
                            lastPerformed = gnapse.target.state.date;
                        }
                    });
                    
                    each.state.lastPerformed = lastPerformed;
                    
                    each.state.id = each.tag;
                    result.push(each.state); 
                });
                res.end(JSON.stringify(result));
            });
        });

        operator.express.get('/doozy/api/actions/:tag', operator.authenticate, jsonResponse, function (req, res) {
            operator.getDb(function (db) {
                var result = db.find(req.params.tag, 'doozy.action').first();
                res.end(JSON.stringify(result ? result.toGnon() : null));
            });
        });

        operator.express.post('/doozy/api/actions', operator.authenticate, jsonResponse, function (req, res) {
            // req.body;
            
            operator.getDb(function (db) {
                // Get state from body
                var state = req.body;
                
                // Create node
                var gnode = new db.Gnode(state.name, 'doozy.action', stripProps(state, calculated.action));
                
                // Add node to db
                db.add(gnode);
                
                // set connections
                if (state.tags && state.tags.length) {
                    state.tags.forEach(function (tag) {
                        var tagNode = db.find(removePrefix(tag), 'doozy.tag').first();
                        if (tagNode) {
                            gnode.connect(tagNode, db.RELATION.ASSOCIATE);    
                        }
                    });
                }
                
                // Commit
                db.commitChanges();
                
                // update calced id to be passed back to app
                state.id = gnode.tag;
                
                // Send response
                res.end(JSON.stringify(state));
            });
        });
        
        operator.express.put('/doozy/api/actions', operator.authenticate, jsonResponse, function (req, res) {
            operator.getDb(function (db) {
                var state = req.body;
                
                // Get node
                var gnode = db.find(state.id, 'doozy.action').first();
                
                if (gnode) {
                    // update existing action
                    gnode.setState(stripProps(state, calculated.action));
                    
                    // remove old connections
                    var removeConnections = [];
                    gnode.related('doozy.tag').forEach(function (tagGnapse) {
                        var isInState = false;
                        if (state.tags && state.tags.length) {
                            for (var i = 0; i < state.tags.length; i++) {
                                if (removePrefix(state.tags[i]) === tagGnapse.getTarget().tag) {
                                    isInState = true;
                                    break;
                                }
                            }
                        }
                        if (!isInState) {
                            removeConnections.push(tagGnapse);
                        }
                    });
                    
                    // TODO: Delete gnapses
                    console.log('Need to remove ' + removeConnections.length + ' gnapse(s)');
                    // removeConnections.
                    
                    // add tag connections that do not already exist
                    debugger;
                    if (state.tags && state.tags.length) {
                        state.tags.forEach(function (tag) {
                            debugger;
                            var tagNode = db.find(removePrefix(tag), 'doozy.tag').first();
                            if (tagNode && !tagNode.isRelated(gnode.path())) {
                                gnode.connect(tagNode, db.RELATION.ASSOCIATE);
                            }
                        });
                    }
                    
                    // commit
                    db.commitChanges();
                }
                
                res.end(JSON.stringify(state));
            });
        });
        
        operator.express.delete('/doozy/api/actions/:tag', operator.authenticate, jsonResponse, function (req, res) {
            operator.getDb(function (db) {
                var state = req.body;

                var gnode = db.find(req.params.tag, 'doozy.action').first();
                if (!gnode) {
                    // TODO: DELETE A GNODE
                    // gnode.setState(state);
                }
                // db.commitChanges();
                res.end(JSON.stringify(state));
            });
        });

        /*****************************************************
         * FOCUSES
         ****************************************************/
        operator.express.get('/doozy/api/focuses', operator.authenticate, jsonResponse, function (req, res) {
            var result = [];
            operator.getDb(function (db) {
                db.allOf('doozy.focus').forEach(function (each) {
                    each.state.id = each.tag;
                    result.push(each.state); 
                });
                res.end(JSON.stringify(result));
            });
        });

        operator.express.get('/doozy/api/focuses/:tag', operator.authenticate, jsonResponse, function (req, res) {
            operator.getDb(function (db) {
                var result = db.find(req.params.tag, 'doozy.focus').first();
                res.end(JSON.stringify(result ? result.toGnon() : null ));
            });
        });

        operator.express.post('/doozy/api/focuses', operator.authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ path: 'POST ' + req.user.userName }));
        });
        
        operator.express.put('/doozy/api/focuses', operator.authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ result: 'PUT SUCCESS' }));
        });
        
        operator.express.delete('/doozy/api/focuses/:tag', operator.authenticate, jsonResponse, function (req, res) {
            // req.body;
            res.end(JSON.stringify({ result: 'DELETE SUCCESS' }));
        });
        
        /*****************************************************
         * TAGS
         ****************************************************/
        operator.express.get('/doozy/api/tags', operator.authenticate, jsonResponse, function (req, res) {
            operator.getDb(function (db) {
                var result = [];
                db.allOf('doozy.tag').forEach(function (each) {
                    each.state.id = each.tag;
                    result.push(each.state); 
                });
                res.end(JSON.stringify(result));
            });
        });

        operator.express.get('/doozy/api/tags/:tag', operator.authenticate, jsonResponse, function (req, res) {
            operator.getDb(function (db) {
                var result = db.find(req.params.tag, 'doozy.tag').first();
                res.end(JSON.stringify(result ? result.toGnon() : null));
            });
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
            operator.getDb(function (db) {
                var result = [];
                db.allOf('doozy.target').forEach(function (each) {
                    each.state.id = each.tag;
                    result.push(each.state); 
                });
                res.end(JSON.stringify(result));
            });
        });

        operator.express.get('/doozy/api/target/:tag', operator.authenticate, jsonResponse, function (req, res) {
            operator.getDb(function (db) {
                var result = db.find(req.params.tag, 'doozy.target').first();
                res.end(JSON.stringify(result ? result.toGnon() : null));
            });
        });

        operator.express.get('/doozy/api/targets/:id', operator.authenticate, jsonResponse, function (req, res) {
            operator.getDb(function (db) { 
                var result = db.find({id: req.params.id}, 'doozy.target').first();
                res.end(JSON.stringify(result ? result.toGnon() : null));
            });
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
            operator.getDb(function (db) {
                var result = [];
                db.allOf('doozy.plan').forEach(function (each) {
                    each.state.id = each.tag;
                    result.push(each.state); 
                });
                res.end(JSON.stringify(result));
            });
        });

        operator.express.get('/doozy/api/plan/:tag', operator.authenticate, jsonResponse, function (req, res) {
            operator.getDb(function (db) {
                var result = db.find(req.params.tag, 'doozy.plan').first();
                res.end(JSON.stringify(result ? result.toGnon() : null));
            });
        });

        operator.express.get('/doozy/api/plans/:id', operator.authenticate, jsonResponse, function (req, res) {
            operator.getDb(function (db) {
                var result = db.find({id: req.params.id}, 'doozy.plan').first();
                res.end(JSON.stringify(result ? result.toGnon() : null));
            });
        });

        operator.express.post('/doozy/api/plans', operator.authenticate, jsonResponse, function (req, res) {
            operator.getDb(function (db) {
                // Get state from body
                var state = req.body;
                
                // Create new node
                var gnode = new db.Gnode(state.name, 'doozy.plan', stripProps(state, calculated.plan));
                
                // Add node to db
                db.add(gnode);
                
                // Commit
                db.commitChanges();
                
                // update calced id to be passed back to app
                state.id = gnode.tag;

                // Send response
                res.end(JSON.stringify(state));
            });
        });
        
        operator.express.put('/doozy/api/plans', operator.authenticate, jsonResponse, function (req, res) {
            operator.getDb(function (db) {
                var state = req.body;
                var gnode = db.find(state.id, 'doozy.plan').first();
                if (gnode) {
                    // update existing plan
                    gnode.setState(stripProps(state, calculated.plan));
                    // commit
                    db.commitChanges();
                }
                
                res.end(JSON.stringify(state));
            });
        });
        
        operator.express.delete('/doozy/api/plans/:tag', operator.authenticate, jsonResponse, function (req, res) {
            operator.getDb(function (db) {
                var gnode = db.find(req.params.tag, 'doozy.plan').first();
                if (gnode) {
                    // update existing plan
                    gnode.delete();
                    // commit
                    db.commitChanges();      
                }
            });
        });
        
        /*****************************************************
         * PLAN STEPS
         ****************************************************/
        operator.express.get('/doozy/api/plansteps', operator.authenticate, jsonResponse, function (req, res) {
            operator.getDb(function (db) {
                var result = [];
                db.allOf('doozy.planstep').forEach(function (each) {
                    each.state.id = each.tag;
                    // Get plan (may be parent or associate)
                    var plan = each.related('doozy.plan').first();
                    if (plan) {
                        each.state.planId = plan.target.tag;
                    }
                    // Get parent planstep (if not root)
                    var parent = each.parents('doozy.planstep').first();
                    if (parent && parent.target.kind === 'doozy.planstep') {
                        each.state.parentId = parent.target.tag;
                    }
                    else {
                        each.state.parentId = null;
                    }
                    result.push(each.state); 
                });
                res.end(JSON.stringify(result));
            });
        });
        operator.express.get('/doozy/api/plansteps/:tag', operator.authenticate, jsonResponse, function (req, res) {
            operator.getDb(function (db) {
                var result = db.find(req.params.tag, 'doozy.planstep').first();
                res.end(JSON.stringify(result ? result.toGnon() : null));
            });
        });

        operator.express.post('/doozy/api/plansteps', operator.authenticate, jsonResponse, function (req, res) {
            operator.getDb(function (db) {
                var state = req.body;
                
                // Create new node
                var gnode = new db.Gnode(state.name, 'doozy.planstep', stripProps(state, calculated.planstep));
                
                // Add node to db
                db.add(gnode);

                // set connections
                if (state.planId) {
                    // Get plan (may be parent or associate)
                    var plan = db.find(state.planId, 'doozy.plan').first();
                    if (plan) {
                        gnode.connect(plan, (state.parentId ? db.RELATION.ASSOCIATE : db.RELATION.CHILD_PARENT));
                    }
                }
                if (state.parentId) {
                    // Get parent planstep (if not root)
                    var parent = db.find(state.parentId, 'doozy.planstep').first();
                    if (parent) {
                        gnode.connect(parent, db.RELATION.CHILD_PARENT);
                    }
                }
                
                // update calced id to be passed back to app
                state.id = gnode.tag;

                // commit it
                db.commitChanges();
                
                res.end(JSON.stringify(state));
            });
        });
        
        operator.express.put('/doozy/api/plansteps', operator.authenticate, jsonResponse, function (req, res) {
            operator.getDb(function (db) {
                var state = req.body;

                var gnode = db.find(state.id, 'doozy.planstep').first();
                if (gnode) {
                    // update existing planstep
                    gnode.setState(stripProps(state, calculated.planstep));
                    // commit it
                    db.commitChanges();
                }

                
                res.end(JSON.stringify(state));
            });
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
            var commit = false;
            operator.getDb(function (db) {
                db.allOf('doozy.logentry').forEach(function (each) {
                    var actionGnapse = each.siblings('doozy.action').first();
                    if (actionGnapse) {
                        each.state.actionName = actionGnapse.target.state.name;
                    }
                    else if (each.state.actionId) {
                        var actionNode = db.find({id: each.state.actionId}, 'doozy.action').first();
                        if (actionNode) {
                            each.state.actionName = actionNode.state.name;
                            each.connect(actionNode, db.RELATION.ASSOCIATE);
                            commit = true;
                        }
                    }
                    each.state.id = each.tag;
                    result.push(each.state); 
                });
                if (commit) {
                    db.commitChanges();   
                }
                res.end(JSON.stringify(result));
            });
        });

        operator.express.get('/doozy/api/logentry/:tag', operator.authenticate, jsonResponse, function (req, res) {
            operator.getDb(function (db) {
                var result = db.find(req.params.tag, 'doozy.logentry').first();
                res.end(JSON.stringify(result ? result.toGnon() : null));
            });
        });

        operator.express.get('/doozy/api/logentries/:id', operator.authenticate, jsonResponse, function (req, res) {
            operator.getDb(function (db) { 
                var result = db.find({id: req.params.id}, 'doozy.logentry').first();
                res.end(JSON.stringify(result ? result.toGnon() : null));
            });
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