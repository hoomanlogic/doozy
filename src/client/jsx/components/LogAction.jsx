var LogAction = React.createClass({
    /*************************************************************
     * COMPONENT LIFECYCLE
     *************************************************************/
    getInitialState: function () {
        return {
            name: '',
            isNewAction: false,
            date: Date.create('today'),
            dateInput: 'today',
            dateFeedback: Date.create('today').toLocaleDateString(),
            duration: 0,
            durationInput: '',
            durationFeedback: '',
            details: '',
        };
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
    
    /*************************************************************
     * EVENT HANDLING
     *************************************************************/
    handleCancel: function(event) {
        // hide the modal
        this.refs.modal.hide();
    },
    handleChange: function(event) {
        if (event.target === this.refs.performedat.getDOMNode()) {
            
            var date = Date.create(event.target.value.trim());
            var dateFeedback = date.toLocaleDateString();
            
            var isValid = true;
            
            try {
                date.toISOString();
            } catch (e) {
                if (e instanceof RangeError) {
                    isValid = false;
                } else {
                    throw e;   
                }
            }

            if (isValid && (date.getHours() !== 0 || date.getMinutes() !== 0)) {
                dateFeedback += ' ' + date.toLocaleTimeString();
            }
            
            this.setState({
                date: date,
                dateInput: event.target.value,
                dateFeedback: dateFeedback
            });
            
        } else if (event.target === this.refs.actualduration.getDOMNode()) {
            var duration = 0;
            var durationParseResult = babble.get('durations').translate(this.refs.actualduration.getDOMNode().value.trim());
            var durationFeedback = '';
            if (durationParseResult.tokens.length > 0) {
                duration = durationParseResult.tokens[0].value.toMinutes();
                durationFeedback = durationParseResult.tokens[0].value.toString('minutes');
            }
            
            this.setState({
                duration: duration,
                durationInput: event.target.value,
                durationFeedback: durationFeedback
            });
        } else if (event.target === this.refs.details.getDOMNode()) {
            this.setState({
                details: event.target.value
            });
        }
    },
    handleSave: function(event) {
        var existingAction, newAction;
        
        // call method to save the action
        names = this.refs.name.getDOMNode().value.split('|');
        
        var validationApology = 'Sorry, we don\'t have enough information yet.\n\n';
        
        if (names.length === 1 && names[0] === '') {
            toastr.error(validationApology + 'What did you do?');
            return;
        }
        
        if (String(this.state.date.getTime()) === 'NaN') {
            toastr.error(validationApology + 'When did you do this?');
            return;
        }
        
        for (var i =0; i < names.length; i++) {
            
            existingAction = this.getExistingAction(names[i]);

            if (existingAction) {
                actionStore.log(existingAction, { performed: this.state.date, duration: this.state.duration, entry: 'performed', details: this.state.details });
            } else {
                var tags = ui.tags || [];
                tags = tags.slice(); //copy
                tags.push(TAG_PREFIX.FOCUS + this.props.currentFocus.tagName);
                
                newAction = new ToDo(names[i], tags);
                newAction.enlist = this.state.date;
                actionStore.lognew(newAction, { performed: this.state.date, duration: this.state.duration, entry: 'performed', details: this.state.details });
            }
        }
      
        // hide the modal
        this.refs.modal.hide();
    },
    
    /*************************************************************
     * MISC
     *************************************************************/
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
    getExistingAction: function (name) {
        var existingAction = _.find(actionStore.updates.value, function(item) { 
            return item.name.toLowerCase() === name.toLowerCase(); 
        });
        return existingAction;
    },
    
    /*************************************************************
     * API
     *************************************************************/
    log: function (action) {
        var actionName;
        
        var state = {
            date: Date.create('today'),
            dateInput: 'today',
            dateFeedback: Date.create('today').toLocaleDateString(),
            duration: 0,
            durationInput: '',
            durationFeedback: '',
            details: '',
        };
        
        if (typeof action === 'object' && action.hasOwnProperty('duration') && action.duration) {
            var duration = new babble.Duration(action.duration * 60 * 1000);
            hlcommon.assign(state, {
                duration: duration.toMinutes(),
                durationInput: duration.toString(),
                durationFeedback: duration.toString()
            });
        }
        
        if (action.hasOwnProperty('name')) {
            actionName = action.name;
        } else if (typeof action === 'string') {
            actionName = action;
        }
        
        this.setState(state);
        
        /**
         * Selectize the actions
         */
        var selectize = $(this.refs.name.getDOMNode())[0].selectize;
        this.setOptions(selectize);
        if (actionName) {
            
            if (!this.getExistingAction(actionName)) {
                selectize.addOption({
                    value: actionName,
                    text: actionName
                });
            }
            
            selectize.setValue(actionName);
        }
        
        /**
         * Show modal and focus
         */
        this.refs.modal.show();
        $(this.refs.name.getDOMNode())[0].selectize.focus();
    },
    
    /*************************************************************
     * RENDERING
     *************************************************************/
    render: function () {
        var buttons = [{type: 'danger', 
                        text: 'Cancel', 
                        handler: this.handleCancel},
                       {type: 'primary', 
                        text: 'Log', 
                        handler: this.handleSave}];
        
        var forceHeightStyle = {
            height: '59px'  
        };
        var feedbackStyle = {
            position: 'relative',
            top: '-28px',
            left: '285px'
        };

        return (
            <Modal ref="modal" show={false} header="Log Action" buttons={buttons}>
                <form role="form">
                    <div className="form-group">
                        <label htmlFor="f1">What did you do?</label>
                        <input id="f1" ref="name" type="text" />
                    </div>
                    <div style={forceHeightStyle} className="form-group">
                        <label htmlFor="f2">When did you do this?</label>
                        <input id="f2" ref="performedat" type="text" className="form-control" onChange={this.handleChange} value={this.state.dateInput} />
                        <span style={feedbackStyle}>{this.state.dateFeedback}</span>
                    </div>
                    <div style={forceHeightStyle} className="form-group">
                        <label htmlFor="f3">How long did it take?</label>
                        <input id="f3" ref="actualduration" type="text" className="form-control" onChange={this.handleChange} value={this.state.durationInput} />
                        <span style={feedbackStyle}>{this.state.durationFeedback}</span>
                    </div>
                    <div className="form-group">
                        <label htmlFor="f4">Anything else?</label>
                        <input id="f4" ref="details" type="text" className="form-control" onChange={this.handleChange} value={this.state.details} />
                    </div>
                </form>
            </Modal>
        );
    },
});