 (function (factory) {
	module.exports = exports = factory(
		require('gnodes'),
        require('../../../../gnodes.config.js')
	);
}(function (Gnodes, config) {
	
	/**
	 * Set the context for data access
	 */
	function open () {
		return Gnodes.open(config).then(function (db) {
			db.api = new DoozyApi(db);
			return db;
		});
	};
    
    var KIND = {
      ACTION: 'doozy.action'
    };

	var DoozyApi = function (db) {
		this.db = db;
	};
	
	DoozyApi.prototype = {
		/**
		 * Add an action
		 */
		addAction: function (action) {
			// Set variables
			var actionNode = this.db.add(new this.db.Gnode(action.name, KIND.ACTION, action));
            this.db.commitChanges();
			return actionNode.state;
		},

		removeAction: function (action) {
			
            this.db.remove(this.db.get(action.name, KIND.ACTION));
            
		}
	}

	return {
		open: open	
	};

}));
