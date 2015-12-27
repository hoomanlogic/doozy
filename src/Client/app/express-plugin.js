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
            legacy.get('Actions', importActions);
            
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ path: 'IMPORT FOR ' + req.user.userName }));
        });
        
        function importActions (table) {
            table.forEach(function (row) {
                var gnode = new db.Gnode(row.Name, 'doozy.action', camelize(row));
                gnode.born = gnode.state.created || gnode.state.enlist || gnode.born;
                db.add(gnode);
            });
            
            // Next
            legacy.get('Tags', importTags);
        }
        
        function importTags (table) {
            table.forEach(function (row) {
                var gnode = new db.Gnode(row.Name, 'doozy.tag', camelize(row));
                gnode.born = gnode.state.created || gnode.state.enlist || gnode.born;
                db.add(gnode);
            });
            
            // Next
            legacy.get('ActionsTags', importActionsTags);
        }
        
        function importActionsTags (table) {
            table.forEach(function (row) {
                var node1 = db.find({ id: row.ActionId }, 'doozy.action').first();
                var node2 = db.find({ id: row.TagId }, 'doozy.tag').first();
                if (node1 && node2) {
                    console.log('Connecting nodes: ' + node1.tag + ':' + node2.tag);
                    node2.connect(node1, db.RELATION.ASSOCIATE);
                }
            });
            
            // Next
            legacy.get('LogEntries', importLogEntries);
        }
        
        function importLogEntries (table) {
            table.forEach(function (row) {
                var name = row.Date.toISOString().split('T')[0] + '-';
                if (row.ActionId !== null) {
                    var actionNode = db.find({ id: row.ActionId }, 'doozy.action').first();
                    name += actionNode.tag;
                }
                else {
                    name += row.Details;
                }
                console.log('naming logentry ' + name);
                var gnode = new db.Gnode(name, 'doozy.logentry', camelize(row));
                gnode.born = gnode.state.created || gnode.state.enlist || gnode.born;
                db.add(gnode);
            });
            
            // Next
            legacy.get('LogEntriesTags', importLogEntriesTags);
        }
        
        function importLogEntriesTags (table) {
            table.forEach(function (row) {
                var node1 = db.find({ id: row.LogEntryId }, 'doozy.logentry').first();
                var node2 = db.find({ id: row.TagId }, 'doozy.tag').first();
                if (node1 && node2) {
                    console.log('Connecting nodes: ' + node1.tag + ':' + node2.tag);
                    node2.connect(node1, db.RELATION.ASSOCIATE);
                }
            });
            
            // Next
            legacy.get('Focuses', importFocuses);
        }
        
        function importFocuses (table) {
            table.forEach(function (row) {
                var gnode = new db.Gnode(row.Name, 'doozy.focus', camelize(row));
                gnode.born = gnode.state.created || gnode.state.enlist || gnode.born;
                db.add(gnode);
            });
            
            // Next
            legacy.get('Plans', importPlans);
        }
        
        function importPlans (table) {
            table.forEach(function (row) {
                var gnode = new db.Gnode(row.Name, 'doozy.plan', camelize(row));
                gnode.born = gnode.state.created || gnode.state.enlist || gnode.born;
                db.add(gnode);
            });
            
            // Next
            legacy.get('PlanSteps', importPlanSteps);
        }
        
        function importPlanSteps (table) {
            var gnodes = [];
            table.forEach(function (row) {
                var gnode = new db.Gnode(row.Name, 'doozy.planstep', camelize(row));
                gnode.born = gnode.state.created || gnode.state.enlist || gnode.born;
                db.add(gnode);
                
                // Get Plan Association/Parent
                var associate = db.find({ id: row.ProjectId }, 'doozy.plan').first();
                if (associate) {
                    console.log('Connecting nodes: ' + gnode.tag + ':' + associate.tag);
                    associate.connect(gnode, db.RELATION.ASSOCIATE);
                    if (gnode.state.parentId === null) {
                        console.log('also as parent');
                        associate.connect(gnode, db.RELATION.PARENT_CHILD);    
                    }
                }
                
                gnodes.push(gnode);
                
            });
            
            gnodes.forEach(function (gnode) {
               if (gnode.state.parentId !== null) {
                   var parent = db.find({ id: gnode.state.parentId }, 'doozy.planstep').first();
                   if (parent) {
                       console.log('Connecting nodes: ' + parent.tag + ':' + gnode.tag);
                       parent.connect(gnode, db.RELATION.PARENT_CHILD);
                   }
               } 
            });
            
            // Next
            legacy.get('Targets', importTargets);
        }
        
        function importTargets (table) {
            table.forEach(function (row) {
                var gnode = new db.Gnode(row.Name, 'doozy.target', camelize(row));
                gnode.born = gnode.state.created || gnode.state.enlist || gnode.born;
                db.add(gnode);
            });
            
            db.commitChanges();
            // TODO: Handle importing log entries
            // Next
            // legacy.get('LogEntries', importLogs);
        }
        
        // function importLogs (table) {
        //     table.forEach(function (row) {
        //         var name = row.Date;
                // var gnode = new db.Gnode(row.Name, 'doozy.logentry', camelize(row));
                // gnode.born = gnode.state.created || gnode.state.enlist || gnode.born;
                // db.add(gnode);
        //     });
            
        //     db.commitChanges();
        // }
               
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