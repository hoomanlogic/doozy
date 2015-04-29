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
        this.setupActionsControl();
    },
    
    componentDidUpdate: function () {
        if (this.show) {
            
            if (this.state.isNewAction) {
                this.setupTagsControl();
            }
            this.show = false;
            this.refs.modal.show();
            if (this.actionName.length > 0) {
                $(this.refs.actualduration.getDOMNode()).focus();
            } else {
                $(this.refs.name.getDOMNode())[0].selectize.focus();
            }
        }
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
            
            existingAction = actionStore.getExistingAction(names[i]);

            if (existingAction) {
                actionStore.log(existingAction, { performed: this.state.date, duration: this.state.duration, entry: 'performed', details: this.state.details });
            } else {
                var tags;
                if (this.refs.tags) {
                    // get tags from control
                    var tags = [];
                    if (this.refs.tags.getDOMNode().value) {
                        tags = this.refs.tags.getDOMNode().value.split(',');
                    }
                } else {
                    // get tags from UI filter
                    var tags = ui.tags || [];
                    tags = tags.slice(); //copy
                    tags.push(this.props.focusTag);
                }
                
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
    setOptionsAction: function (selectize) {
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
    setOptionsTag: function (selectize) {
        // clear previously set options
        selectize.clearOptions();
        
        // get distinct tags user has assigned to other actions
        var actions = actionStore.updates.value;
        var distinctTags = [];
        actions.map(function(item) {
            distinctTags = _.union(distinctTags, item.tags);
        });
        // { kind: 'Tag', name: tag }
        // add tags that user has assigned to other actions
        distinctTags.forEach( function (tag) {
            selectize.addOption(parseTag(tag));
        });
    },
    setupActionsControl: function () {
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
                var existingAction = actionStore.getExistingAction(value);
                if (existingAction !== void 0 && existingAction !== null) {
                    var duration = new babble.Duration(existingAction.duration * 60000);
                    this.setState({
                        duration: duration.toMinutes(),
                        durationInput: duration.toString(),
                        durationFeedback: duration.toString()
                    });
                }
            }.bind(this)
        });  
    },
    setupTagsControl: function () {
       
        // initialize control for tags functionality
        $(this.refs.tags.getDOMNode()).selectize({
            delimiter: ',',
            persist: true,
            valueField: 'value',
            labelField: 'name',
            searchField: ['name', 'kind'],
            render: {
                item: function(item, escape) {
                    return '<div class="item">' + escape(item.value) + '</div>';
                },
                option: function(item, escape) {
                    var label = item.name || item.kind;
                    var caption = item.kind ? item.kind : null;
                    return '<div>' +
                        '<span class="label">' + escape(label) + '</span>' +
                        (caption ? '<span class="caption">' + escape(caption) + '</span>' : '') +
                    '</div>';
                }
            },
            create: function(input) {
                var kind = 'Tag';
                var name = input;
                if (name.indexOf('!') === 0) {
                    kind = 'Focus'; // part of
                    name = name.substring(1);
                } else if (name.indexOf('@') === 0) {
                    kind = 'Place'; // where
                    name = name.substring(1);
                } else if (name.indexOf('>') === 0) {
                    kind = 'Goal'; // to what end
                    name = name.substring(1);
                } else if (name.indexOf('$') === 0) {
                    kind = 'Need'; // why
                    name = name.substring(1);
                } else if (name.indexOf('#') === 0) {
                    kind = 'Box'; // when
                    name = name.substring(1);
                }
                return {
                    value: input,
                    kind: kind,
                    name: name
                };
            }
        });

        // populate existing tag options
        var selectize = $(this.refs.tags.getDOMNode())[0].selectize;
        this.setOptionsTag(selectize);

        // set current value
        var tags = ui.tags || [];
        tags = tags.slice(); //copy
        tags.push(this.props.focusTag);
        selectize.setValue(tags);
    },
    
    /*************************************************************
     * API
     *************************************************************/
    log: function (action) {
        
        // flag to call modal's graceful open dialog function
        this.show = true;
        
        var actionName = '';
        
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
            actionName = action.name || '';
        } else if (typeof action === 'string') {
            actionName = action || '';
        }
        this.actionName = actionName;
        
        if (!actionStore.getExistingAction(actionName)) {
            state.isNewAction = true;
        }
        
        this.setState(state);
        
        /**
         * Selectize the actions
         */
        var selectize = $(this.refs.name.getDOMNode())[0].selectize;
        this.setOptionsAction(selectize);
        if (actionName) {
            if (state.isNewAction && actionName.length > 0) {
                selectize.addOption({
                    value: actionName,
                    text: actionName
                });
            }
            selectize.setValue(actionName);
        }
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
        
        var tags;
        
        if (this.state.isNewAction) {
            tags = (
                <div className="form-group">
                    <label htmlFor="action-tags">Tags</label>
                    <input id="action-tags" ref="tags" type="text" />
                </div>  
            );
        }

        return (
            <Modal ref="modal" show={false} header="Log Action" buttons={buttons}>
                <form role="form">
                    <div className="form-group">
                        <label htmlFor="f1">What did you do?</label>
                        <input id="f1" ref="name" type="text" />
                    </div>
                    {tags}
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