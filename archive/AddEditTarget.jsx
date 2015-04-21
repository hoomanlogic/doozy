var AddEditTarget = React.createClass({
    render: function () {
        var buttons = [{type: 'danger', 
                        text: 'Cancel', 
                        handler: this.handleCancel}, 
                       {type: 'danger', 
                        text: 'Delete', 
                        handler: this.handleDelete},
                       {type: 'primary', 
                        text: 'Save', 
                        handler: this.handleSave}];

        return (
            <Modal ref="modal" show={false} header="Edit Target" buttons={buttons}>
                <form role="form">
                    <div className="form-group">
                        <label htmlFor="f1">Tag</label>
                        <input id="f1" ref="tagName" type="text" className="form-control" placeholder="Name of tag" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="f2">Target</label>
                        <input id="f2" ref="goal" type="number" className="form-control" placeholder="Target" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="f3">Type</label>
                        <select id="f3" ref="kind" className="form-control">
                            <option value="Duration">By Total Duration</option>
                            <option value="Occurrence">By Action Occurrences</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="f4">Timeline</label>
                        <input id="f4" ref="timeline" type="text" className="form-control" placeholder="Timeline" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="f5">Enlist</label>
                        <input id="f5" ref="enlist" type="datetime" className="form-control" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="f6">Retire</label>
                        <input id="f6" ref="retire" type="datetime" className="form-control" />
                    </div>
                </form>
            </Modal>
        );
    },
    handleCancel: function(event) {
        // hide the modal
        this.refs.modal.hide();
    },
    handleSave: function(event) {
        // call method to save the target
        if (this.props.mode === 'edit') {
            targetStore.update({ targetRef: this.props.target.ref, state: this.getCurrentValues() });
        } else {
            hlcommon.assign(this.props.target, this.getCurrentValues());
            targetStore.add(this.props.target);
        }
      
        // hide the modal
        this.refs.modal.hide();
    },
    handleDelete: function() {
        targetStore.destroy(this.props.target);
        
        // hide the modal
        this.refs.modal.hide();
    },
    add: function (target) {
        this.props.mode = 'add';
        this.props.target = target;
        target.tagName = null;
        target.enlist = new Date();
        this.loadValues();
        this.refs.modal.show();
        $(this.refs.tagName.getDOMNode()).focus();
    },
    edit: function (target) {
        this.props.mode = 'edit';
        this.props.target = target;
        this.loadValues();
        this.refs.modal.show();
    },
    loadValues: function () {
        this.refs.kind.getDOMNode().value = this.props.target.kind;
        this.refs.tagName.getDOMNode().value = this.props.target.tagName;
        this.refs.goal.getDOMNode().value = this.props.target.goal;
        this.refs.timeline.getDOMNode().value = this.props.target.timeline;
        this.refs.enlist.getDOMNode().value = this.props.target.enlist;
        this.refs.retire.getDOMNode().value = this.props.target.retire;
    },
    getCurrentValues: function () {
        
        // pull values from modal
        var kind = this.refs.kind.getDOMNode().value;
        var tagName = this.refs.tagName.getDOMNode().value;
        var goal = parseInt(this.refs.goal.getDOMNode().value);
        var timeline = this.refs.timeline.getDOMNode().value;

        var enlist = this.refs.enlist.getDOMNode().value.trim(); 
        if (enlist) {
            enlist = new Date(enlist);
        } else {
            enlist = null;   
        }
        
        var retire = this.refs.retire.getDOMNode().value.trim(); 
        if (retire) {
            retire = new Date(retire);
        } else {
            retire = null;   
        }
        
        return { 
            kind: kind, 
            tagName: tagName,
            goal: goal,
            timeline: timeline,
            enlist: enlist, 
            retire: retire
        };
    }
});