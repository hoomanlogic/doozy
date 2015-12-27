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
    
    return {
      get: get
    };
}));