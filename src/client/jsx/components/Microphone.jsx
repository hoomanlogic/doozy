var Microphone = React.createClass({
    /*************************************************************
     * COMPONENT LIFECYCLE
     *************************************************************/
    getInitialState: function () {
        return {
            isListening: false
        };
    },
    
    componentDidMount: function () {
        if (typeof webkitSpeechRecognition !== 'undefined') {
            var recognition = this.recognition = new webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.onresult = this.handleSpeech;
        }
    },

    /*************************************************************
     * EVENT HANDLING
     *************************************************************/
    handleSpeakReadyClick: function () {
        this.recognition.start();
        this.setState({isListening: true});
    },
    
    handleLogEventCommand: function (speech) {
        var date = Date.create('today'), 
            duration = 0, 
            dateSignal = false, 
            durationSignal = false,
            actionIndex = 0;
        
        if (speech.indexOf(' i did ') > -1) {
            dateSignal = true;
            speech = speech.replace(' i did ', '|');
        }
        if (speech.slice(0, 6) === 'i did ') {
            speech = speech.replace('i did ', '');
        }
        if (speech.indexOf(' for ') > -1) {
            durationSignal = true;
            speech = speech.replace(' for ', '|');
        }
        var commandParts = speech.split('|');

        if (dateSignal) {
            date = Date.create(commandParts[0]);
        }
        if (durationSignal) {
            duration = babble.get('durations')
                .translate(commandParts[commandParts.length - 1])
                .tokens[0].value.toMinutes();
        }

        if (commandParts.length === 3) {
            actionIndex = 1;
        } else if (commandParts.length === 2 && dateSignal) {
            actionIndex = 1;
        } else if  (commandParts.length === 2 && durationSignal) {
            actionIndex = 0;
        }

        var existingAction = this.getExistingAction(commandParts[actionIndex]);


        if (existingAction) {
            actionStore.log(existingAction, { 
                performed: date, 
                duration: duration, 
                entry: 'performed', 
                details: null 
            });
        } else {

            var tags = ui.tags || [];
            tags = tags.slice();
            tags.push(this.props.focusTag);

            newAction = new ToDo(commandParts[actionIndex].slice(0,1).toUpperCase() + commandParts[actionIndex].slice(1), tags);
            newAction.enlist = date;

            actionStore.lognew(newAction, { 
                performed: date, 
                duration: duration, 
                entry: 'performed', 
                details: 'Added with speech recognition!' 
            });
        }
    },
    handleNewActionCommand: function (speech) {
        var date = Date.create('today'), 
            duration = 0, 
            dateSignal = false, 
            durationSignal = false,
            actionIndex = 0;
        
        if (speech.indexOf(' i will ') > -1) {
            dateSignal = true;
            speech = speech.replace(' i will ', '|');
        }
        if (speech.slice(0, 6) === 'i will ') {
            speech = speech.replace('i will ', '');
        }
        if (speech.indexOf(' for ') > -1) {
            durationSignal = true;
            speech = speech.replace(' for ', '|');
        }
        var commandParts = speech.split('|');

        if (dateSignal) {
            date = Date.create(commandParts[0]);
        }
        if (durationSignal) {
            duration = babble.get('durations')
                .translate(commandParts[commandParts.length - 1])
                .tokens[0].value.toMinutes();
        }

        if (commandParts.length === 3) {
            actionIndex = 1;
        } else if (commandParts.length === 2 && dateSignal) {
            actionIndex = 1;
        } else if  (commandParts.length === 2 && durationSignal) {
            actionIndex = 0;
        }

        var existingAction = this.getExistingAction(commandParts[actionIndex]);
        if (existingAction) {
            toastr.error('An action by this name already exists');
        } else {
            var tags = ui.tags || [];
            tags = tags.slice();
            tags.push(this.props.focusTag);
            var actionName = commandParts[actionIndex].slice(0,1).toUpperCase() + commandParts[actionIndex].slice(1);
            newAction = new ToDo(actionName, tags);
            newAction.enlist = date;
            newAction.nextDate = date;
            newAction.duration = duration;
            actionStore.create(newAction);
        }
    },
    handleSpeech: function (event) {
        var speech,
            mode;
        
        if (event.results.length > 0) {
            
//            if (this.isExpectingAnswer) {
//                
//                this.isExpectingAnswer = false;
//                speech = event.results[0][0].transcript.trim().toLowerCase()
//                
//                if (speech.slice(0,1) === 'y') {
//                    duration = this.duration;
//                    date = this.date;
//                    
//                    var tags = ui.tags || [];
//                    tags = tags.slice();
//                    tags.push(this.props.focusTag);
//
//                    newAction = new ToDo(this.actionName.slice(0,1).toUpperCase() + this.actionName.slice(1), tags);
//                    newAction.enlist = date;
//                    
//                    actionStore.lognew(newAction, { 
//                        performed: date, 
//                        duration: duration, 
//                        entry: 'performed', 
//                        details: null 
//                    });
//                    
//                    this.setState({isListening: false});
//                    return;
//                }
//            } else {
            
            speech = event.results[0][0].transcript.trim().toLowerCase();
            if (speech.indexOf('i did ') > -1) {
                mode = 'log-action';
            } else if (speech.indexOf('i will ') > -1 || speech.indexOf('i want to ') > -1) {
                mode = 'new-action';
            }

            if (mode === 'log-action') {
                this.handleLogEventCommand(speech);
            } else if (mode === 'new-action') {
                this.handleNewActionCommand(speech);
            } else {
                toastr.error('Sorry, I did not understand. I heard, "' + event.results[0][0].transcript + '"');
            }
//            }
            
        }
        
        this.setState({isListening: false});
    },

    getExistingAction: function (name) {
        var existingAction = _.find(actionStore.updates.value, function(item) { 
            return item.name.replace(/:/g, '').toLowerCase() === name.toLowerCase(); 
        });
        return existingAction;
    },
    /*************************************************************
     * RENDERING
     *************************************************************/
    render: function () {
        if (typeof webkitSpeechRecognition === 'undefined') {
            return null;   
        }
        
        var iconStyle = this.state.isListening ? { } : { color: '#b2b2b2' };
        
        var style = {
            padding: '5px'
        };
        
        return (
            <li key="mic"><a style={style} href="javascript:;" onClick={this.handleSpeakReadyClick}><i style={iconStyle} className="fa fa-2x fa-microphone"></i></a></li>
        );
    },
});