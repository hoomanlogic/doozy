 (function (factory) {
	module.exports = exports = factory(
		require('mssql')
	);
}(function (sql) {
    
    function join(records, prop, value) {
        var matches = [];
        for (var i = 0; i < records.length; i++) {
            if (records[i][prop] === value) {
                matches.push(records[i]);
            }
        }
        return matches;
    }
    
    function get (entityKind, callback) {
       
        sql.connect('mssql://gmanning:l00k0ut@basil.arvixe.com/hoomanlogic').then(function() {
            switch (entityKind) {
                case 'Actions':
                    // Query
                    new sql.Request().query('select * from dbo.' + entityKind + ' order by name').then(function(actionSet) {
                        new sql.Request().query('select * from dbo.RecurrenceRules').then(function(recurrenceSet) {
                            for (var i = 0; i < recurrenceSet.length; i++) {
                                join(actionSet, 'Id', recurrenceSet[i].ActionId).forEach(function (action) {
                                    console.log('Adding recurrence rules to action');
                                    action.recurrenceRules = action.recurrenceRules || [];
                                    action.recurrenceRules.push(recurrenceSet[i].Rule);
                                });
                            }
                            console.log('Returning action set');
                            callback(actionSet);
                        }).catch(function(er) {
                            // ... query error checks
                            console.log(er);
                        });
                    }).catch(function(err) {
                        // ... query error checks
                        console.log(err);
                    });  
                    break;
                default:
                    // Query
                    new sql.Request().query('select * from dbo.' + entityKind).then(function(recordset) {
                        callback(recordset);
                    }).catch(function(err) {
                        // ... query error checks
                        console.log(err);
                    });
                break;                
            }
          
        }).catch(function(err) {
            // ... connect error checks
            console.log(err);
        });
    }
    
    var db;
    
    function importTo (db) {
        get('Actions', importActions);
    }
    
    function importActions (table) {
        table.forEach(function (row) {
            var gnode = new db.Gnode(row.Name, 'doozy.action', camelize(row));
            gnode.born = gnode.state.created || gnode.state.enlist || gnode.born;
            db.add(gnode);
        });
        
        // Next
        get('Tags', importTags);
    }
    
    function importTags (table) {
        table.forEach(function (row) {
            var gnode = new db.Gnode(row.Name, 'doozy.tag', camelize(row));
            gnode.born = gnode.state.created || gnode.state.enlist || gnode.born;
            db.add(gnode);
        });
        
        // Next
        get('ActionsTags', importActionsTags);
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
        get('LogEntries', importLogEntries);
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
        get('LogEntriesTags', importLogEntriesTags);
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
        get('Focuses', importFocuses);
    }
    
    function importFocuses (table) {
        table.forEach(function (row) {
            var gnode = new db.Gnode(row.Name, 'doozy.focus', camelize(row));
            gnode.born = gnode.state.created || gnode.state.enlist || gnode.born;
            db.add(gnode);
        });
        
        // Next
        get('Plans', importPlans);
    }
    
    function importPlans (table) {
        table.forEach(function (row) {
            var gnode = new db.Gnode(row.Name, 'doozy.plan', camelize(row));
            gnode.born = gnode.state.created || gnode.state.enlist || gnode.born;
            db.add(gnode);
        });
        
        // Next
        get('PlanSteps', importPlanSteps);
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
        get('Targets', importTargets);
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

    return {
      get: get
    };
}));