(function (factory) {
    module.exports = exports = factory(
        require('../app/doozy'),
        require('../app/data'),
        require('hl-common-js/src/those')
    );
}(function (doozy, data, those) {

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

        var addUI = function (kind, req, res) {
            operator.renderer.renderHtml(
                defaultHtmlTemplate
                    .replace('SCRIPT_URL', operator.stats.publicPath + 'doozy/'+ kind + '-form.js')
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
        };

        var editUI = function (kind, req, res) {
            // Pass kind identifier prop for edit
            var prop = 'id';
            var props = {mode: 'Edit'};
            props[prop] = req.params.id || req.params[0];

            operator.renderer.renderHtml(
                defaultHtmlTemplate
                    .replace('SCRIPT_URL', operator.stats.publicPath + 'doozy/' + kind + '-form.js')
                    .replace('SELECTIZE_URL', operator.stats.publicPath + 'doozy-global-libs.js')
                    .replace('SELECTIZE_CSS_1', operator.stats.publicPath + 'selectize.css')
                    .replace('SELECTIZE_CSS_2', operator.stats.publicPath + 'selectize.default.css')
                    .replace('INTERFACE_PROPS', JSON.stringify(props)),
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

        var listUI = function (kind, req, res) {
            operator.renderer.renderHtml(
                defaultHtmlTemplate
                    .replace('SCRIPT_URL', operator.stats.publicPath + 'doozy/' + kind + '-list.js')
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
        }

        /**
         * Serve up interfaces
         */
        var fs = require('fs');
        var path = require('path');
        var defaultHtmlTemplate = fs.readFileSync(path.resolve(__dirname, '../interfaces/_default.html'), 'utf-8');

        // ACTIONS VIEW
        operator.express.get('/doozy(/actions)?', operator.authenticate, function (req, res) {
            operator.renderer.renderHtml(
                defaultHtmlTemplate
                    .replace('SCRIPT_URL', operator.stats.publicPath + 'doozy/action-list.js')
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

        // ACTION ADD
        operator.express.get('/doozy/action/new', operator.authenticate, function (req, res) {
            addUI('action', req, res);
        });

        // ACTION EDIT
        operator.express.get('/doozy/action/:id', operator.authenticate, function (req, res) {
            editUI('action', req, res);
        });

        // LOG ENTRY ADD
        operator.express.get('/doozy/logentry/new(/:tag)?', operator.authenticate, function (req, res) {
            operator.getDb(function (db) {
                var actionId, actionName;
                if ((req.params.tag || '').indexOf(' ') > -1) {
                    actionName = req.params.tag;
                }
                else {
                    actionId = req.params.tag;
                }

                operator.renderer.renderHtml(
                    defaultHtmlTemplate
                        .replace('SCRIPT_URL', operator.stats.publicPath + 'doozy/logentry-form.js')
                        .replace('SELECTIZE_URL', operator.stats.publicPath + 'doozy-global-libs.js')
                        .replace('SELECTIZE_CSS_1', operator.stats.publicPath + 'selectize.css')
                        .replace('SELECTIZE_CSS_2', operator.stats.publicPath + 'selectize.default.css')
                        .replace('INTERFACE_PROPS', JSON.stringify({mode: 'Add', actionId: actionId, actionName: actionName })),
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
        operator.express.get('/doozy/logentry/:id', operator.authenticate, function (req, res) {
            editUI('logentry', req, res);
        });


        // FOCUSES VIEW
        operator.express.get('/doozy/focuses', operator.authenticate, function (req, res) {
            listUI('focus', req, res);
        });

        // FOCUS ADD
        operator.express.get('/doozy/focus/new', operator.authenticate, function (req, res) {
            addUI('focus', req, res);
        });

        // FOCUS EDIT
        operator.express.get('/doozy/focus/:id', operator.authenticate, function (req, res) {
            editUI('focus', req, res);
        });

        // PLANS VIEW
        operator.express.get('/doozy/plans', operator.authenticate, function (req, res) {
            listUI('plan', req, res);
        });


        // PLAN ADD
        operator.express.get('/doozy/plan/new', operator.authenticate, function (req, res) {
            addUI('plan', req, res);
        });

        // PLAN EDIT
        operator.express.get('/doozy/plan/:id', operator.authenticate, function (req, res) {
            editUI('plan', req, res);
        });


        // PLANSTEPS VIEW
        operator.express.get('/doozy/plansteps/:tag', operator.authenticate, function (req, res) {
            operator.renderer.renderHtml(
                defaultHtmlTemplate
                    .replace('SCRIPT_URL', operator.stats.publicPath + 'doozy/planstep-list.js')
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
                    .replace('SCRIPT_URL', operator.stats.publicPath + 'doozy/planstep-form.js')
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
                    .replace('SCRIPT_URL', operator.stats.publicPath + 'doozy/planstep-form.js')
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
                    .replace('SCRIPT_URL', operator.stats.publicPath + 'doozy/planstep-form.js')
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
                    .replace('SCRIPT_URL', operator.stats.publicPath + 'doozy/planstep-form.js')
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

        // TAGS VIEW
        operator.express.get('/doozy/tags', operator.authenticate, function (req, res) {
            listUI('tag', req, res);
        });

        // TAG ADD
        operator.express.get('/doozy/tag/new', operator.authenticate, function (req, res) {
            addUI('tag', req, res);
        })

        // TAG EDIT
        operator.express.get('/doozy/tag/:id', operator.authenticate, function (req, res) {
            editUI('tag', req, res);
        });

        // TARGETS VIEW
        operator.express.get('/doozy/targets', operator.authenticate, function (req, res) {
            listUI('target', req, res);
        });

        // TARGET ADD
        operator.express.get('/doozy/target/new', operator.authenticate, function (req, res) {
            addUI('target', req, res);
        });

        // TARGET EDIT
        operator.express.get('/doozy/target/:id', operator.authenticate, function (req, res) {
            editUI('target', req, res);
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

        var removePrefix = function (tag) {
            if (doozy.TAG_PREFIXES.indexOf(tag.slice(0, 1)) === -1) {
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
                    tags.push(doozy.TAG_KIND[gnapse.target.state.kind.toUpperCase()] + gnapse.target.state.name);
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

                // calc tags data
                var tags = [];
                gnode.siblings('doozy.tag').forEach(function (gnapse) {
                    tags.push(doozy.TAG_KIND[gnapse.target.state.kind.toUpperCase()] + gnapse.target.state.name);
                });
                strap.tags = tags;

                var actionGnapse = gnode.siblings('doozy.action').first();
                if (actionGnapse) {
                    strap.actionId = actionGnapse.target.tag;
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

        var create = function (kind, req, res, createConnections, generateTag) {
            operator.getDb(function (db) {
                // Get model from body
                var model = req.body;

                var name;
                if (generateTag && typeof generateTag === 'function') {
                    name = generateTag(gnode, db, model);
                }
                else {
                    name = model[(generateTag || 'name')];
                }

                // Strip model to state and create new node from it
                var gnode = new db.Gnode(name, 'doozy.' + kind, stripModel(model, modelProps[kind]));

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
            create('logentry', req, res,
            // Create Connections
            function (gnode, db, model) {
                // Create tag connections
                if (model.tags && model.tags.length) {
                    model.tags.forEach(function (tag) {
                        var tagNode = db.find(removePrefix(tag), 'doozy.tag').first();
                        if (tagNode) {
                            gnode.connect(tagNode, db.RELATION.ASSOCIATE);
                        }
                    });
                }
                // Create action connection
                if (model.actionId) {
                    var actionNode = db.find(model.actionId, 'doozy.action').first();
                    if (actionNode) {
                        gnode.connect(actionNode, db.RELATION.ASSOCIATE);
                    }
                }
            },
            // Generate Tag
            function (gnode, db, model) {
                // generate the log entry tag from data (log entries don't have names)
                var when = model.date.split('T')[0] + '-';
                var what;
                if (model.actionId) {
                    var actionNode = db.find(model.actionId, 'doozy.action').first();
                    if (actionNode) {
                        what = actionNode.tag;
                    }
                }
                else {
                    what = model.details;
                }
                return when + (what || '');
            });
        });

        operator.express.put('/doozy/api/logentry', operator.authenticate, jsonResponse, function (req, res) {
            update('logentry', req, res,
            // Update Connections
            function (gnode, db, model) {
                // TODO: tag is no longer connected
                // var removeTags = [];
                // gnode.siblings('doozy.tag').forEach(function (tagGnapse) {
                //     if (those(model.tags).first(tag) === null) {
                //         removeTags.push(tag);
                //     }
                // });

                // Create tag connections
                if (model.tags && model.tags.length) {
                    model.tags.forEach(function (tag) {
                        var tagNode = db.find(removePrefix(tag), 'doozy.tag').first();
                        if (tagNode) {
                            gnode.connect(tagNode, db.RELATION.ASSOCIATE);
                        }
                    });


                }

                // TODO: action is no longer connected
                // if (gnode.state.actionId && (model.state.actionId !== gnode.state.actionId)) {

                // }

                // action is now connected
                if (model.actionId && model.actionId !== gnode.state.actionId) {
                    var actionNode = db.find(model.actionId, 'doozy.action').first();
                    if (actionNode) {
                        gnode.connect(actionNode, db.RELATION.ASSOCIATE);
                    }
                }
            });
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