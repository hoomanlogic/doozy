 (function (factory) {
	module.exports = exports = factory();
}(function () {
	
	/**
	 * Set the context for data access
	 */
	function init (db) {
	    db.api = new DoozyApi(db);
        return db;
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
		init: init	
	};

}));
