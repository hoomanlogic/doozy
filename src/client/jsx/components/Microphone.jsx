/** @jsx React.DOM */

// CommonJS, AMD, and Global shim
(function (root, factory) {
    'use strict';
	if (typeof exports === "object") {
		// CommonJS
		module.exports = exports = factory(
            require('react')
        );
	}
	else if (typeof define === "function" && define.amd) {
		// AMD
		define([
            'react'
        ], factory);
	}
	else {
		// Global (browser)
		root.Microphone = factory(root.React);
	}
}(this, function (React) {
    'use strict';
    return React.createClass({
        mixins: [React.addons.PureRenderMixin],
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
                recognition.onend = this.handleNoSpeech;
            }
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleSpeakReadyClick: function () {
            /**
             * Already listening, abort
             */
            if (this.state.isListening) {
                return;   
            }
            
            this.recognition.start();
            this.setState({isListening: true});
        },
        handleLogActionCommand: function (speech) {
            var date = Date.create('today'),
                parseDuration = null,
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
                var parseDuration = babble.get('durations').translate(commandParts[commandParts.length - 1]);
                if (parseDuration.tokens.length > 0) {
                    duration = parseDuration.tokens[0].value.toMinutes();
                }
            }

            if (commandParts.length === 3) {
                actionIndex = 1;
            } else if (commandParts.length === 2 && dateSignal) {
                actionIndex = 1;
            } else if  (commandParts.length === 2 && durationSignal) {
                actionIndex = 0;
            }

            var existingAction = actionStore.getExistingAction(commandParts[actionIndex]);


            if (existingAction) {
                logEntryStore.log({
                    actionId: existingAction.id,
                    date: date, 
                    duration: duration, 
                    entry: 'performed', 
                    details: null
                });
            } else {

                var tags = ui.tags || [];
                tags = tags.slice();
                tags.push(this.props.focusTag);

                var newAction = hlapp.action(commandParts[actionIndex].slice(0,1).toUpperCase() + commandParts[actionIndex].slice(1), tags);
                newAction.created = date;

                logEntryStore.lognew(newAction, {
                    date: date, 
                    duration: duration, 
                    entry: 'performed', 
                    details: null
                });
            }
        },
        handleNewActionCommand: function (speech) {
            var date = Date.create('today'), 
                parseDuration = null,
                duration = 0, 
                dateSignal = false, 
                durationSignal = false,
                actionIndex = 0;

            if (speech.indexOf(' i will ') > -1) {
                dateSignal = true;
                speech = speech.replace(' i will ', '|');
            }
            if (speech.slice(0, 7) === 'i will ') {
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
                var parseDuration = babble.get('durations').translate(commandParts[commandParts.length - 1]);
                if (parseDuration.tokens.length > 0) {
                    duration = parseDuration.tokens[0].value.toMinutes();
                }
            }

            if (commandParts.length === 3) {
                actionIndex = 1;
            } else if (commandParts.length === 2 && dateSignal) {
                actionIndex = 1;
            } else if  (commandParts.length === 2 && durationSignal) {
                actionIndex = 0;
            }

            var existingAction = actionStore.getExistingAction(commandParts[actionIndex]);
            if (existingAction) {
                toastr.error('An action by this name already exists');
            } else {
                var tags = ui.tags || [];
                tags = tags.slice();
                tags.push(this.props.focusTag);
                var actionName = commandParts[actionIndex].slice(0,1).toUpperCase() + commandParts[actionIndex].slice(1);
                var newAction = hlapp.action(actionName, tags);
                newAction.created = date;
                newAction.nextDate = date;
                newAction.duration = duration;
                actionStore.create(newAction);
            }
        },
        handleSpeech: function (event) {
            var speech,
                mode;

            if (event.results.length > 0) {
                speech = event.results[0][0].transcript.trim().toLowerCase();
                if (speech.indexOf('i did ') > -1) {
                    mode = 'log-action';
                } else if (speech.indexOf('i will ') > -1 || speech.indexOf('i want to ') > -1) {
                    mode = 'new-action';
                }

                if (mode === 'log-action') {
                    this.handleLogActionCommand(speech);
                } else if (mode === 'new-action') {
                    this.handleNewActionCommand(speech);
                } else {
                    toastr.error('Sorry, I did not understand. I heard, "' + event.results[0][0].transcript + '"');
                }
            }

            this.setState({isListening: false});
        },
        handleNoSpeech: function () {
            this.setState({isListening: false});
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            if (typeof webkitSpeechRecognition === 'undefined') {
                return null;   
            }

            var iconStyle = { minWidth: '40px' };

            var listItemContentStyle = {
                padding: '5px',
                textAlign: 'center'
            };

            return (
                <li key="mic"><a className={this.state.isListening ? 'active' : ''} style={listItemContentStyle} href="javascript:;" onClick={this.handleSpeakReadyClick}><i style={iconStyle} className="fa fa-2x fa-microphone"></i></a></li>
            );
        },
    });
}));