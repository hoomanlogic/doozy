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

        // PLANS
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
        

        // PLAN ADD
        operator.express.get('/doozy/plan/new', operator.authenticate, function (req, res) {
            operator.renderer.renderHtml(
                defaultHtmlTemplate
                    .replace('SCRIPT_URL', operator.stats.publicPath + 'doozy/plan-form.js')
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
        
        // PLAN EDIT
        operator.express.get('/doozy/plan/:id', operator.authenticate, function (req, res) {
            operator.renderer.renderHtml(
                defaultHtmlTemplate
                    .replace('SCRIPT_URL', operator.stats.publicPath + 'doozy/plan-form.js')
                    .replace('SELECTIZE_URL', operator.stats.publicPath + 'doozy-global-libs.js')
                    .replace('SELECTIZE_CSS_1', operator.stats.publicPath + 'selectize.css')
                    .replace('SELECTIZE_CSS_2', operator.stats.publicPath + 'selectize.default.css')
                    .replace('INTERFACE_PROPS', JSON.stringify({planId: req.params.id})),
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

        
        // PLANSTEPS
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
        
        // PLANSTEP ADD
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
        
        // PLANSTEP EDIT
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
                
        // PLANSTEP EDIT
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
        
        // TAGS        
        operator.express.get('/doozy/tags', operator.authenticate, function (req, res) {
            operator.renderer.renderHtml(
                defaultHtmlTemplate
                    .replace('SCRIPT_URL', operator.stats.publicPath + 'doozy/tags.js')
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
        
        // TAG ADD
        operator.express.get('/doozy/tag/new', operator.authenticate, function (req, res) {
            operator.renderer.renderHtml(
                defaultHtmlTemplate
                    .replace('SCRIPT_URL', operator.stats.publicPath + 'doozy/tag-form.js')
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
        
        // TAG EDIT
        operator.express.get('/doozy/tag/:id', operator.authenticate, function (req, res) {
            operator.renderer.renderHtml(
                defaultHtmlTemplate
                    .replace('SCRIPT_URL', operator.stats.publicPath + 'doozy/tag-form.js')
                    .replace('SELECTIZE_URL', operator.stats.publicPath + 'doozy-global-libs.js')
                    .replace('SELECTIZE_CSS_1', operator.stats.publicPath + 'selectize.css')
                    .replace('SELECTIZE_CSS_2', operator.stats.publicPath + 'selectize.default.css')
                    .replace('INTERFACE_PROPS', JSON.stringify({tagId: req.params.id})),
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
        
        // TARGETS
        operator.express.get('/doozy/targets', operator.authenticate, function (req, res) {
            operator.renderer.renderHtml(
                defaultHtmlTemplate
                    .replace('SCRIPT_URL', operator.stats.publicPath + 'doozy/targets.js')
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
        
        // TARGET ADD
        operator.express.get('/doozy/target/new', operator.authenticate, function (req, res) {
            operator.renderer.renderHtml(
                defaultHtmlTemplate
                    .replace('SCRIPT_URL', operator.stats.publicPath + 'doozy/target-form.js')
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
        
        // TARGET EDIT
        operator.express.get('/doozy/target/:id', operator.authenticate, function (req, res) {
            operator.renderer.renderHtml(
                defaultHtmlTemplate
                    .replace('SCRIPT_URL', operator.stats.publicPath + 'doozy/target-form.js')
                    .replace('SELECTIZE_URL', operator.stats.publicPath + 'doozy-global-libs.js')
                    .replace('SELECTIZE_CSS_1', operator.stats.publicPath + 'selectize.css')
                    .replace('SELECTIZE_CSS_2', operator.stats.publicPath + 'selectize.default.css')
                    .replace('INTERFACE_PROPS', JSON.stringify({targetId: req.params.id})),
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
        
        var baseModel = function (gnode) {
            if (gnode) {
                return {
                    id: gnode.tag,
                    version: gnode.version,
                    isNew: false
                };    
            }
            else {
                return null;
            }
        };
        
        var getModel = function (gnode, db, kind) {
            var model = null;
            if (gnode) {
                
                // Strap the model if this kind has one
                var strap = modelStraps[kind];
                if (strap) {
                    strap = strap(gnode, db);
                }
                
                // Merge state and calc into model
                model = Object.assign({}, gnode.state, strap, baseModel(gnode));
                    
            }
            return model;
        };
        
        var modelProps = {
            action: ['id', 'version', 'isNew', 'lastPerformed', 'tags'],
            logentry: ['id', 'version', 'isNew','actionId','actionName','tags'],
            plan: ['id', 'version', 'isNew'],
            planstep: ['id', 'version', 'isNew','planId','parentId'],
            tag: ['id', 'version', 'isNew'],
            target: ['id', 'version', 'isNew']
        };
        
        var modelStraps = {
            action: function (gnode, db) {
                var strap = {};
                
                /**
                 * defaults
                 */
                strap.recurrenceRules = gnode.state.recurrenceRules || [];
                
                /**
                 * calculations
                 */
                // calc tags data
                var tags = [];
                gnode.siblings('doozy.tag').forEach(function (gnapse) {
                    tags.push(TAG_KIND[gnapse.target.state.kind.toUpperCase()] + gnapse.target.state.name);
                });
                strap.tags = tags;
                
                // calc latest logentry
                var lastPerformed = null;
                gnode.siblings('doozy.logentry').forEach(function (gnapse) {
                    if (gnapse.target.state.entry === 'performed' && (!lastPerformed || lastPerformed < gnapse.target.state.date)) {
                        lastPerformed = gnapse.target.state.date;
                    }
                });
                
                strap.lastPerformed = lastPerformed;
                
                return strap;
            },
            logentry: function (gnode, db) {
                var strap = {};
                var actionGnapse = gnode.siblings('doozy.action').first();
                if (actionGnapse) {
                    strap.actionName = actionGnapse.target.state.name;
                }
                return strap;
            },
            planstep: function (gnode, db) {
                var strap = {};
                // Get plan (may be parent or associate)
                var plan = gnode.related('doozy.plan').first();
                if (plan) {
                    strap.planId = plan.target.tag;
                }
                // Get parent planstep (if not root)
                var parent = gnode.parents('doozy.planstep').first();
                if (parent && parent.target.kind === 'doozy.planstep') {
                    strap.parentId = parent.target.tag;
                }
                else {
                    strap.parentId = null;
                }
                return strap;
            }
        }
        
        var stripModel = function (model, stripOut) {
            var state = {};
            for (var prop in model) {
                // Only copy over if the propery isn't in list of ones to strip out
                if (model.hasOwnProperty(prop) && stripOut.indexOf(prop) === -1) {
                    state[prop] = model[prop];
                }
            }
            return state;
        };
        
        var create = function (kind, req, res, createConnections) {
            operator.getDb(function (db) {
                // Get model from body
                var model = req.body;
                
                // Strip model to state and create new node from it
                var gnode = new db.Gnode(model.name, 'doozy.' + kind, stripModel(model, modelProps[kind]));
                
                // Add node to db
                db.add(gnode);
                
                // Create connections callback
                if (createConnections) {
                    createConnections(gnode, db, model);
                }
                
                // Commit new node
                db.commitChanges();
                
                // refresh the model
                model = getModel(gnode, db, kind);

                // Send refreshed model
                res.end(JSON.stringify(model));
            });            
        };

        var update = function (kind, req, res, updateConnections) {
            operator.getDb(function (db) {
                // Get model from body
                var model = req.body;
                
                // Get gnode from db
                var gnode = db.find(model.id, 'doozy.' + kind).first();
                if (gnode) {
                    
                    // Strip model to state and update existing gnode's state
                    gnode.setState(stripModel(model, modelProps[kind]));
                    
                    // Update connections callback
                    if (updateConnections) {
                        updateConnections(gnode, db, model);
                    }
                    
                    // Commit the updated gnode state
                    db.commitChanges();
                    
                    // refresh the model
                    model = getModel(gnode, db, kind);
                    
                    // Send refreshed model
                    res.end(JSON.stringify(model));    
                }
            });          
        };
        
        var remove = function (kind, req, res) {
            operator.getDb(function (db) {
                var gnode = db.find(req.params.id, 'doozy.' + kind).first();
                if (gnode) {
                    // TODO: DELETE A GNODE
                    // gnode.setState(state);
                    
                    // db.commitChanges();
                    
                    res.end();
                }
                else {
                    res.end(JSON.stringify({ error: 'Gnode not found'}));
                }
                
                
            });
        };
        
        var getAll = function (kind, req, res) {
            var result = [];
            operator.getDb(function (db) {
                db.allOf('doozy.' + kind).forEach(function (gnode) {
                    var model = getModel(gnode, db, kind);
                    result.push(model); 
                });
                res.end(JSON.stringify(result));
            });
        };
        
        var get = function (kind, req, res) {
            operator.getDb(function (db) {
                var gnode = db.find(req.params.id, 'doozy.' + kind).first();
                if (gnode) {
                    var model = getModel(gnode, db, kind);
                    res.end(JSON.stringify(model));
                }
                else {
                    res.end(JSON.stringify({ error: 'Gnode not found'}));
                }
            });
        };
        
        /*****************************************************
         * ACTIONS
         ****************************************************/
        operator.express.get('/doozy/api/action', operator.authenticate, jsonResponse, function (req, res) {
            getAll('action', req, res);
        });

        operator.express.get('/doozy/api/action/:id/:version', operator.authenticate, jsonResponse, function (req, res) {
            get('action', req, res);
        });

        operator.express.post('/doozy/api/action', operator.authenticate, jsonResponse, function (req, res) {
            create('action', req, res, function (gnode, db, model) {
                // Create tag connections
                if (model.tags && model.tags.length) {
                    model.tags.forEach(function (tag) {
                        var tagNode = db.find(removePrefix(tag), 'doozy.tag').first();
                        if (tagNode) {
                            gnode.connect(tagNode, db.RELATION.ASSOCIATE);    
                        }
                    });
                }
            });
        });
        
        operator.express.put('/doozy/api/action', operator.authenticate, jsonResponse, function (req, res) {
            update('action', req, res, function (gnode, db, model) {
                // remove old connections
                var removeConnections = [];
                gnode.related('doozy.tag').forEach(function (tagGnapse) {
                    var isInState = false;
                    if (model.tags && model.tags.length) {
                        for (var i = 0; i < model.tags.length; i++) {
                            if (removePrefix(model.tags[i]) === tagGnapse.getTarget().tag) {
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
                if (model.tags && model.tags.length) {
                    model.tags.forEach(function (tag) {
                        var tagNode = db.find(removePrefix(tag), 'doozy.tag').first();
                        if (tagNode && !tagNode.isRelated(gnode.path())) {
                            gnode.connect(tagNode, db.RELATION.ASSOCIATE);
                        }
                    });
                }
            });
        });
        
        operator.express.delete('/doozy/api/action/:id', operator.authenticate, jsonResponse, function (req, res) {
            remove('action', req, res);
        });

        /*****************************************************
         * FOCUSES
         ****************************************************/
        operator.express.get('/doozy/api/focus', operator.authenticate, jsonResponse, function (req, res) {
            getAll('focus', req, res);
        });

        operator.express.get('/doozy/api/focus/:id/:version', operator.authenticate, jsonResponse, function (req, res) {
            get('focus', req, res);
        });

        operator.express.post('/doozy/api/focus', operator.authenticate, jsonResponse, function (req, res) {
            create('focus', req, res);
        });
        
        operator.express.put('/doozy/api/focus', operator.authenticate, jsonResponse, function (req, res) {
            update('focus', req, res);
        });
        
        operator.express.delete('/doozy/api/focus/:id', operator.authenticate, jsonResponse, function (req, res) {
            delete('focus', req, res);
        });
        
        /*****************************************************
         * TAGS
         ****************************************************/
        operator.express.get('/doozy/api/tag', operator.authenticate, jsonResponse, function (req, res) {
            getAll('tag', req, res);
        });

        operator.express.get('/doozy/api/tag/:id/:version', operator.authenticate, jsonResponse, function (req, res) {
            get('tag', req, res);
        });

        operator.express.post('/doozy/api/tag', operator.authenticate, jsonResponse, function (req, res) {
            create('tag', req, res);
        });
        
        operator.express.put('/doozy/api/tag', operator.authenticate, jsonResponse, function (req, res) {
            update('tag', req, res);
        });
        
        operator.express.delete('/doozy/api/tag/:id', operator.authenticate, jsonResponse, function (req, res) {
            delete('tag', req, res);
        });

        /*****************************************************
         * TARGETS
         ****************************************************/
        operator.express.get('/doozy/api/target', operator.authenticate, jsonResponse, function (req, res) {
            getAll('target', req, res);
        });

        operator.express.get('/doozy/api/target/:id/:version', operator.authenticate, jsonResponse, function (req, res) {
            get('target', req, res);
        });

        operator.express.post('/doozy/api/target', operator.authenticate, jsonResponse, function (req, res) {
            create('target', req, res);
        });
        
        operator.express.put('/doozy/api/target', operator.authenticate, jsonResponse, function (req, res) {
            update('target', req, res);
        });
        
        operator.express.delete('/doozy/api/target/:id', operator.authenticate, jsonResponse, function (req, res) {
            delete('target', req, res);
        });
        
        /*****************************************************
         * PLANS
         ****************************************************/
        operator.express.get('/doozy/api/plan', operator.authenticate, jsonResponse, function (req, res) {
            getAll('plan', req, res);
        });

        operator.express.get('/doozy/api/plan/:id/:version', operator.authenticate, jsonResponse, function (req, res) {
            get('plan', req, res);
        });
        
        operator.express.post('/doozy/api/plan', operator.authenticate, jsonResponse, function (req, res) {
            create('plan', req, res);
        });
        
        operator.express.put('/doozy/api/plan', operator.authenticate, jsonResponse, function (req, res) {
            update('plan', req, res);
        });
        
        operator.express.delete('/doozy/api/plan/:id', operator.authenticate, jsonResponse, function (req, res) {
            delete('plan', req, res);
        });
        
        /*****************************************************
         * PLAN STEPS
         ****************************************************/
        operator.express.get('/doozy/api/planstep', operator.authenticate, jsonResponse, function (req, res) {
            getAll('planstep', req, res);
        });
        operator.express.get('/doozy/api/planstep/:id/:version', operator.authenticate, jsonResponse, function (req, res) {
            get('planstep', req, res);
        });

        operator.express.post('/doozy/api/planstep', operator.authenticate, jsonResponse, function (req, res) {
            create('planstep', req, res, function (gnode, db, model) {
                // set connections
                if (model.planId) {
                    // Get plan (may be parent or associate)
                    var plan = db.find(model.planId, 'doozy.plan').first();
                    if (plan) {
                        gnode.connect(plan, (model.parentId ? db.RELATION.ASSOCIATE : db.RELATION.CHILD_PARENT));
                    }
                }
                if (model.parentId) {
                    // Get parent planstep (if not root)
                    var parent = db.find(model.parentId, 'doozy.planstep').first();
                    if (parent) {
                        gnode.connect(parent, db.RELATION.CHILD_PARENT);
                    }
                } 
            });
        });
        
        operator.express.put('/doozy/api/planstep', operator.authenticate, jsonResponse, function (req, res) {
            update('planstep', req, res);
        });
        
        operator.express.delete('/doozy/api/planstep/:id', operator.authenticate, jsonResponse, function (req, res) {
            delete('planstep', req, res)
        });
        
        /*****************************************************
         * LOG ENTRIES
         ****************************************************/
        operator.express.get('/doozy/api/logentry', operator.authenticate, jsonResponse, function (req, res) {
            getAll('logentry', req, res);
        });

        operator.express.get('/doozy/api/logentry/:id/:version', operator.authenticate, jsonResponse, function (req, res) {
            get('logentry', req, res);
        });

        operator.express.post('/doozy/api/logentry', operator.authenticate, jsonResponse, function (req, res) {
            create('logentry', req, res);
        });
        
        operator.express.put('/doozy/api/logentry', operator.authenticate, jsonResponse, function (req, res) {
            update('logentry', req, res);
        });
        
        operator.express.delete('/doozy/api/logentry/:id', operator.authenticate, jsonResponse, function (req, res) {
            delete('logentry', req, res);
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