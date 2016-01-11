(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('react/addons'),
        require('app/doozy'),
        require('stores/ActionStore'),
        require('stores/LogEntryStore'),
        require('babble'),
        require('components/MessageBox')
    );
}(function (React, addons, doozy, actionStore, logEntryStore, babble, MessageBox) {
    /* globals webkitSpeechRecognition */
    var Microphone = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        mixins: [addons.PureRenderMixin],

        statics: {
            START_TIME: ['start', 'begin'],
            STOP_TIME: ['stop', 'done', 'end'],
            stringify: function (logs) {
                return logs.map(function (log) {
                    var count = Microphone.count(log);
                    if (count > 0) {
                        return count + ' x ' + log.text[0] + ' (' + Microphone.duration(log) + ' ms)';
                    }
                    else {
                        return log.text[0] + ' (' + Microphone.duration(log) + ' ms)';
                    }
                }).join('\r\n');
            },
            totalDuration: function (logs) {
                var duration = 0;
                logs.forEach(function (log) {
                    duration += Microphone.duration(log);
                });
                return (duration / 1000) / 60; // we don't log anything less than minutes here
            },
            duration: function (log) {
                var d1 = Date.create(log.started);
                var d2 = Date.create(log.stopped);

                return d2.getTime() - d1.getTime();
            },
            count: function (log) {
                var count = 0;
                if (log.text.length > 1) {
                    var lastOne = log.text[log.text.length - 1];
                    lastOne = lastOne.split(' ');
                    lastOne = lastOne[lastOne.length - 1];

                    if (!isNaN(parseInt(lastOne, 10))) {
                        count = parseInt(lastOne, 10);
                    }
                    else {
                        count = log.text.length - 1;
                    }
                }
                return count;
            }
        },

        getInitialState: function () {
            return {
                isListening: false
            };
        },

        current: null,
        timerLogs: [],

        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        componentDidMount: function () {
            if (webkitSpeechRecognition !== undefined) {
                var recognition = this.recognition = new webkitSpeechRecognition();
                recognition.continuous = true;
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

        handleSpeech: function (event) {
            var context,
                existingAction,
                newAction,
                speech,
                spokenArgs;

            if (event.results.length > 0) {

                speech = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();

                if (speech.indexOf('i did ') > -1) {
                    context = 'log-action';
                }
                else if (speech.indexOf('i will ') > -1 || speech.indexOf('i want to ') > -1) {
                    context = 'new-action';
                }
                else if (Microphone.START_TIME.filter(function (item) { return speech.indexOf(item) > -1; }).length > 0) {
                    this.current = {
                        isListening: true,
                        started: new Date().toISOString(),
                        stopped: null,
                        text: [speech.slice(5).trim()]
                    };
                    context = 'start-logging';
                    MessageBox.show(this.current.text.join('<br />'), 'success');
                }
                else if (Microphone.STOP_TIME.filter(function (item) { return speech.indexOf(item) > -1; }).length > 0 && this.current !== null && this.current.isListening) {
                    context = 'stop-logging';
                    this.current.isListening = false;
                    this.current.stopped = new Date().toISOString();
                    this.timerLogs.push(this.current);

                    MessageBox.show('stopped ' + this.current.text[0], 'success');

                    this.current = {
                        isListening: false,
                    };
                }
                else if (this.current !== null && this.current.isListening) {
                    context = 'is-logging';
                    this.current.text.push(speech);
                    MessageBox.show(this.current.text.join('\r\n'), 'success');
                }
                else if (speech.indexOf('finish') > -1 && this.timerLogs.length > 0) {
                    /**
                     * Create log entry for existing action
                     */
                    logEntryStore.create({
                        date: this.timerLogs[0].started,
                        duration: Microphone.totalDuration(this.timerLogs),
                        entry: 'performed',
                        details: Microphone.stringify(this.timerLogs),
                        tags: ['$sweat']
                    });
                    this.current = null;
                    this.timerLogs = [];
                }
                else if (speech.indexOf('go away') > -1) {
                    this.current = null;
                }

                if (context === undefined) {
                    MessageBox.show('Sorry, I did not understand. I heard, "' + speech + '"', 'error');
                    return;
                }

                if (context === 'log-action') {
                    spokenArgs = this.parseSpeech(speech, context);

                    existingAction = actionStore.getActionByName(spokenArgs.actionName);

                    if (existingAction) {
                        /**
                         * Create log entry for existing action
                         */
                        logEntryStore.create({
                            actionId: existingAction.id,
                            date: spokenArgs.date,
                            duration: spokenArgs.duration,
                            entry: 'performed',
                            details: null
                        });
                    }
                    else {
                        newAction = this.createActionObjectLiteral(spokenArgs.actionName, spokenArgs.date);

                        /**
                         * Call API store function to create and log a new action
                         */
                        logEntryStore.createWithNewAction(newAction, {
                            date: spokenArgs.date,
                            duration: spokenArgs.duration,
                            entry: 'performed',
                            details: null
                        });
                    }

                }
                else if (context === 'new-action') {
                    spokenArgs = this.parseSpeech(speech, context);

                    existingAction = actionStore.getActionByName(spokenArgs.actionName);

                    if (existingAction) {
                        MessageBox.show('An action by this name already exists', 'error');
                    }
                    else {

                        newAction = this.createActionObjectLiteral(spokenArgs.actionName, spokenArgs.date);

                        newAction.duration = spokenArgs.duration;
                        newAction.nextDate = spokenArgs.date;

                        actionStore.create(newAction);
                    }
                }
            }
        },

        handleNoSpeech: function () {
            if (this.current !== null) {
                setTimeout(function () { this.recognition.start(); }.bind(this), 10);
            }
            else {
                this.setState({ isListening: false });
            }
        },

        /*************************************************************
         * HELPERS
         *************************************************************/
        createActionObjectLiteral: function (actionName, created) {
            // Use IIFE for lexical scope
            var newAction,
                tags;

            /**
             * Get current focus and filter tags
             */
            // tags = ui.tags || [];
            // tags = tags.slice();
            // tags.push(this.props.focusTag);
            tags = [];

            /**
             * Create new action {} object literal
             */
            newAction = doozy.action(actionName, tags);
            newAction.created = created;
            return newAction;
        },

        /* eslint-disable no-param-reassign */
        parseSpeech: function (speech, context) {
            var actionName,
                contextWord,
                commandArgs,
                date,
                duration,
                parseDuration;
            var actionIndex = 0;
            var dateSignal = false;
            var durationSignal = false;

            if (context === 'new-action') {
                contextWord = 'will';
            }
            else if (context === 'log-action') {
                contextWord = 'did';
            }

            /**
             * Check for a language signal that a date is referenced
             */
            if (speech.indexOf(' i ' + contextWord + ' ') > -1) {
                dateSignal = true;
                speech = speech.replace(' i ' + contextWord + ' ', '|');
            }

            /**
             * Check for a language signal that a duration is referenced
             */
            if (speech.indexOf(' for ') > -1) {
                durationSignal = true;
                speech = speech.replace(' for ', '|');
            }

            /**
             * Remove 'excess' language for clean split of command arguments
             */
            if (speech.slice(0, (3 + contextWord.length)) === 'i ' + contextWord + ' ') {
                speech = speech.replace('i ' + contextWord + ' ', '');
            }

            /**
             * Split command arguments
             */
            commandArgs = speech.split('|');

            /**
             * Parse date argument if supplied, else today
             */
            date = Date.create('today');
            if (dateSignal) {
                date = Date.create(commandArgs[0]);
                if (isNaN(date.getTime())) {
                    console.log('Bad Date Argument: ' + commandArgs[0]);
                    date = Date.create('today');
                }
            }
            date = date.toISOString();

            /**
             * Parse duration argument if supplied, else 0
             */
            duration = 0;
            if (durationSignal) {
                parseDuration = babble.get('durations')
                    .translate(commandArgs[commandArgs.length - 1]);

                if (parseDuration.tokens.length > 0) {
                    duration = parseDuration.tokens[0].value.toMinutes();
                }
            }

            /**
             * Determine the arg index that contains the name of the action
             */
            if (commandArgs.length === 3) {
                actionIndex = 1;
            }
            else if (commandArgs.length === 2 && dateSignal) {
                actionIndex = 1;
            }
            else if (commandArgs.length === 2 && durationSignal) {
                actionIndex = 0;
            }

            /**
             * Build a clean action name (begin with uppercase)
             */
            actionName = commandArgs[actionIndex].slice(0,1).toUpperCase() + commandArgs[actionIndex].slice(1);

            /**
             * Return an object literal of parsed arguments
             */
            return {
                actionName: actionName,
                date: date,
                duration: duration
            };
        },
        /* eslint-enable no-param-reassign */

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            if (webkitSpeechRecognition === undefined) {
                return null;
            }

            /* eslint-disable no-script-url */
            return (
                <li key="mic">
                    <a className={this.state.isListening ? 'active' : ''}
                            style={styles.listItemContent}
                            href="javascript:;"
                            onClick={this.handleSpeakReadyClick}>
                        <i style={styles.icon} className="fa fa-2x fa-microphone"></i>
                    </a>
                </li>
            );
            /* eslint-enable no-script-url */
        },
    });

    var styles = {
        icon: {
            minWidth: '40px'
        },
        listItemContent: {
            padding: '5px',
            textAlign: 'center'
        }
    };

    return Microphone;
}));
