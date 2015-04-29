var NextActions = React.createClass({
    /*************************************************************
     * CALCULATIONS
     *************************************************************/
    isNextAction: function (item, index) {
        /**
          * Exclude boxed actions
          */ 
        var boxTags = _.filter(item.tags, function(tag) { return tag.slice(0,1) === '#'; });
        if (boxTags.length > 0) {
            return false;   
        }
        
        /**
          * Next Action has either never been performed or has a Next Date up to today
          */ 
        if ((item.nextDate === null && item.lastPerformed === null) || (item.nextDate !== null && item.nextDate <= new Date())) {
            return true;
        }
      
        /**
          * Keep Actions logged as performed today in Next Actions until tomorrow
          */
        return hldatetime.hourDiff(new Date(item.lastPerformed), new Date()) < 24 && new Date(item.lastPerformed).getDate() === (new Date()).getDate();
    },
    
    /*************************************************************
     * RENDERING
     *************************************************************/
    renderNextActionsTable: function (nextActions) {
        return (
            <table className="table table-striped">
                <tbody>                        
                    {nextActions.map(function(item, index) {
                        return (
                            <ActionRow key={item.ref || item.id} 
                                action={item} 
                                actionRef={item.ref} 
                                actionId={item.id} 
                                actionName={item.name} 
                                actionRetire={item.retire} 
                                actionLastPerformed={item.lastPerformed} 
                                actionNextDate={item.nextDate} />
                        );
                    }.bind(this))}
                </tbody>
            </table>  
        );
    },
    render: function () {
        
        var nextActionsTable = null,
            nextActions = this.props.actions.filter(this.isNextAction);
        
        /**
          * Sort the actions by completed and name
          */
        nextActions = _.sortBy(nextActions, function(action){ 
            var checked = 
                action.retire !== null || 
                (action.lastPerformed !== null && (action.nextDate === null || 
                                                   action.nextDate > new Date()));
            return (checked ? '1' : '0') + '-' + action.name.toLowerCase(); 
        })
        
        /**
          * Render the table if there are any actions
          */
        if (nextActions.length > 0) {
            nextActionsTable = this.renderNextActionsTable(nextActions); 
        }
        
        // html
        return (
            <div>
                <div className="table-title">
                    Next Actions
                    <button type="button" style={{ paddingTop: '3px', paddingBottom: '3px' }} className="btn btn-primary pull-right" onClick={ui.addAction}>
                        <i className="fa fa-plus"></i> Add Action
                    </button>
                </div>
                {nextActionsTable}
            </div>
        );
    }
});