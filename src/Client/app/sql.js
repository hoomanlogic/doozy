 (function (factory) {
	module.exports = exports = factory(
		require('mssql')
	);
}(function (sql) {
    
    function getActions (callback) {
        sql.connect('mssql://gmanning:l00k0ut@basil.arvixe.com/hoomanlogic').then(function() {
            // Query
            new sql.Request().query('select * from dbo.Actions order by name').then(function(recordset) {
                callback(recordset);
            }).catch(function(err) {
                // ... query error checks
                console.log(err);
            });

            // Stored Procedure
            // new sql.Request()
            // .input('input_parameter', sql.Int, value)
            // .output('output_parameter', sql.VarChar(50))
            // .execute('procedure_name').then(function(recordset) {
            //     console.dir(recordset);
            // }).catch(function(err) {
            //     // ... execute error checks
            // });
            
            
        }).catch(function(err) {
            // ... connect error checks
            console.log(err);
        });
    }
    
    function getTags (callback) {
        sql.connect('mssql://gmanning:l00k0ut@basil.arvixe.com/hoomanlogic').then(function() {
            // Query
            new sql.Request().query('select * from dbo.Tags order by name').then(function(recordset) {
                callback(recordset);
            }).catch(function(err) {
                // ... query error checks
                console.log(err);
            });

            // Stored Procedure
            // new sql.Request()
            // .input('input_parameter', sql.Int, value)
            // .output('output_parameter', sql.VarChar(50))
            // .execute('procedure_name').then(function(recordset) {
            //     console.dir(recordset);
            // }).catch(function(err) {
            //     // ... execute error checks
            // });
            
            
        }).catch(function(err) {
            // ... connect error checks
            console.log(err);
        });
    }
    
    return {
      getActions: getActions,
      getTags: getTags
    };
}));