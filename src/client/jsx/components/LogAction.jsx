var LogAction = React.createClass({
    setOptions: function (selectize) {
        // clear previously set options
        selectize.clearOptions();
        
        // get actions sorted by name
        var actions = actionStore.updates.value;
        actions = _.sortBy(actions, function(action){ 
            action.name;
        });
        // add tags that user has assigned to other actions
        actions.forEach( function (action) { 
            selectize.addOption({
                value: action.name,
                text: action.name
            });
        });
    },
    componentDidMount: function () {
        // initialize control for tags functionality
        $(this.refs.name.getDOMNode()).selectize({
            delimiter: '|',
            persist: true,
            create: function(input) {
                return {
                    value: input,
                    text: input
                }
            },
            maxItems: 1,
            openOnFocus: false,
            onItemAdd: function (value, $item) {
                var existingAction = this.getExistingAction(value);
                if (existingAction !== void 0 && existingAction !== null) {
                    var hoomanduration = babble.get('durations').translate(existingAction.duration + ' min').tokens[0].value.toString();
                    this.refs.actualduration.getDOMNode().value = hoomanduration;   
                }
            }.bind(this)
        });
    },
    render: function () {
        var buttons = [{type: 'danger', 
                        text: 'Cancel', 
                        handler: this.handleCancel},
                       {type: 'primary', 
                        text: 'Log', 
                        handler: this.handleSave}];

        return (
            <Modal ref="modal" show={false} header="Log Action" buttons={buttons}>
                <form role="form">
                    <div className="form-group">
                        <label htmlFor="f1">What did you do?</label>
                        <input id="f1" ref="name" type="text" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="f2">When did you do this?</label>
                        <input id="f2" ref="performedat" type="text" className="form-control" onChange={this.handleChange} />
                        <span>{this.state.dateParsed}</span>
                    </div>
                    <div className="form-group">
                        <label htmlFor="f3">How long did it take?</label>
                        <input id="f3" ref="actualduration" type="text" className="form-control" onChange={this.handleChange} />
                        <span>{this.state.durationParsed}</span>
                    </div>
                    <div className="form-group">
                        <label htmlFor="f4">Anything else?</label>
                        <input id="f4" ref="details" type="text" className="form-control" />
                    </div>
                </form>
            </Modal>
        );
    },
    getInitialState: function () {
        return {
            displayDate: Date.create('today').toLocaleDateString(),
            displayDuration: ''
        };
    },
    handleChange: function(event) {
        if (event.target === this.refs.performedat.getDOMNode()) {
            
            var dateParsed = Date.create(this.refs.performedat.getDOMNode().value.trim());
            var displayDate = '';
            try {
                displayDate = dateParsed.toISOString();
            } catch (e) {
                if (e instanceof RangeError) {
                    if (displayDate !== this.state.displayDate) {
                        this.setState({dateParsed: displayDate});
                    }
                    return;
                } else {
                    throw e;   
                }
            }
            
            if (dateParsed.getHours() === 0 && dateParsed.getMinutes() === 0) {
                displayDate = dateParsed.toLocaleDateString();
            } else {
                displayDate = dateParsed.toLocaleDateString() + ' ' + dateParsed.toLocaleTimeString();
            }
            
            if (displayDate !== this.state.displayDate) {
                this.setState({dateParsed: displayDate});
            }
        } else if (event.target === this.refs.actualduration.getDOMNode()) {
            var durationParsed = babble.get('durations').translate(this.refs.actualduration.getDOMNode().value.trim());
            var displayDuration = '';
            if (durationParsed.tokens.length > 0) {
                displayDuration = durationParsed.tokens[0].value.toString('minutes');
            }
            
            if (displayDuration !== this.state.durationParsed) {
                this.setState({durationParsed: displayDuration});
            }
        }
    },
    handleCancel: function(event) {
        // hide the modal
        this.refs.modal.hide();
    },
    handleSave: function(event) {
        // call method to save the action
        names = this.refs.name.getDOMNode().value.split('|');
        
        for (var i =0; i < names.length; i++) {
            
            var existingAction = this.getExistingAction(names[i]);

            if (existingAction) {
                var performedat = this.refs.performedat.getDOMNode().value.trim(); 
                if (performedat) {
                    performedat = Date.create(performedat);
                } else {
                    performedat = null;   
                }
                var pdur = babble.get('durations').translate(this.refs.actualduration.getDOMNode().value);
                var actualduration = pdur.tokens.length > 0 ? pdur.tokens[0].value.toMinutes() : 0;
                var details = this.refs.details.getDOMNode().value || null;
                
                if (performedat !== null) {
                    actionStore.log(existingAction, { performed: performedat, duration: actualduration, entry: 'performed', details: details });
                }
            } else {
                toastr.error('Action ' + names[i] + ' not found');
            }
        }
      
        // hide the modal
        this.refs.modal.hide();
    },
    getExistingAction: function (name) {
        var existingAction = _.find(actionStore.updates.value, function(item) { 
            return item.name.toLowerCase() === name.toLowerCase(); 
        });
        return existingAction;
    },
    log: function (action) {
        this.setState({dateParsed: Date.create('today').toLocaleDateString(), durationParsed: ''});
        
        if (action !== void 0) {
            this.props.action = action;
        } else {
            this.props.action = void 0;   
        }
        
        this.loadValues();
        this.refs.modal.show();
        $(this.refs.name.getDOMNode())[0].selectize.focus();
    },
    loadValues: function () {
        this.refs.performedat.getDOMNode().value = 'today';
        this.refs.actualduration.getDOMNode().value = this.props.action ? (this.props.action.duration || 0) : 0;
        this.refs.details.getDOMNode().value = '';
        
        var selectize = $(this.refs.name.getDOMNode())[0].selectize;
        this.setOptions(selectize);
        if (this.props.action !== void 0) {
            selectize.setValue(this.props.action.name);
        }
    }
});