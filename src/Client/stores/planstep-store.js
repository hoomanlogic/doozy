(function (factory) {
    module.exports = exports = factory(
        require('lodash'),
        require('./gnode-store')
    );
}(function (_, gnodeStore) {
    // Create an entity store for sites and register it with the entity hub notifications api
    var planStepStore = new gnodeStore.GnodeStore('PlanStep');

    planStepStore.get = function (id, planId, parentId) {
        var planSteps = (this.context({}).value || []).slice();
        var obj = _.find(planSteps, function (item) {
            return item.id.toLowerCase() === id.toLowerCase() && 
                item.planId.toLowerCase() === planId.toLowerCase() && 
                (item.parentId || '').toLowerCase() === (parentId || '').toLowerCase();
        });
        return obj;
    };

    planStepStore.getChildren = function (id, planId) {
        var planSteps = (this.context({}).value || []).slice();
        return _.where(planSteps, { planId: planId, parentId: id });
    };

    planStepStore.getPlan = function (planId) {
        var planSteps = (this.context({}).value || []).slice();
        return _.where(planSteps, { planId: planId });
    };

    // Export instance
    return planStepStore;
}));
