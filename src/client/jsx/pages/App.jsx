// CommonJS, AMD, and Global shim
(function (factory) {
    'use strict';
    if (typeof exports === "object") {
        // CommonJS
        module.exports = exports = factory(
            require('react'),
            require('../../js/stores/ActionStore'),
            require('../components/TimerBar'),
            require('../components/WeatherIcon'),
            require('../components/FocusActions'),
            require('./ManageFocus'),
            require('./ManageAction'),
            require('./ManageLogEntry'),
            require('../components/Conversation'));
    }
    else if (typeof define === "function" && define.amd) {
        // AMD
        define([
            'react',
            '../../js/stores/ActionStore',
            '../components/TimerBar',
            '../components/WeatherIcon',
            '../components/FocusActions',
            './ManageFocus',
            './ManageAction',
            './ManageLogEntry',
            '../components/Conversation'
        ], factory);
    }
    else {
        // Global (browser)
        window.DoozyApp = factory(
            window.React,
            window.actionStore,
            window.TimerBar,
            window.WeatherIcon,
            window.FocusActions,
            window.ManageFocus,
            window.ManageAction,
            window.ManageLogEntry,
            window.Conversation
        );
    }
}(function (React, actionStore, TimerBar, WeatherIcon, FocusActions, ManageFocus, ManageAction, ManageLogEntry, Conversation) {
    'use strict';
    return React.createClass({
        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        getInitialState: function () {
            // get last saved state of application
            var previousState = hlio.loadLocal('hl.' + this.props.settings.userName + '.settings', this.props.settings.userId);
            if (!previousState) {
                previousState = {
                    currentFocus: null
                };
            }

            var page = 'Do';
            if (window && window.history && window.history.state && window.history.state.page) {
                page = window.history.state.page;
            }

            return {
                currentFocus: previousState.currentFocus || null,
                weatherLastUpdated: null,
                conversations: [],
                activeConversation: null,
                page: page,
                pageOptions: null,
                requests: []
            };
        },

        componentWillMount: function () {
            /**
             * Global UI Handles
             */
            window['ui'] = window['ui'] || {};
            window['ui'].addAction = this.addAction;
            window['ui'].editAction = this.editAction;
            window['ui'].logEntry = this.logEntry;
            window['ui'].goTo = this.goTo;
            window['ui'].goBack = this.goBack;
            window['ui'].openConversation = this.selectConversation;
            window['ui'].getHeightBuffer = this.getHeightBuffer;
            window['ui'].queueRequest = this.queueRequest;

            // let error logger know which user
            errl.config.getUser = function () {
                return this.props.settings.userName;
            }.bind(this);

            /**
             * Initialize Data Stores
             */
            userStore.init(this.props.settings.userName, this.props.settings.userId);
            actionStore.init(this.props.settings.userName, this.props.settings.userId);
            focusStore.init(this.props.settings.userName, this.props.settings.userId);
            logEntryStore.init(this.props.settings.userName, this.props.settings.userId);
            planStore.init(this.props.settings.userName, this.props.settings.userId);
            planStepStore.init(this.props.settings.userName, this.props.settings.userId);
            tagStore.init(this.props.settings.userName, this.props.settings.userId);
            targetStore.init(this.props.settings.userName, this.props.settings.userId);
            weatherStore.init(this.props.settings.userName, this.props.settings.userId);

            connectionStore.getConnections();

            // Check that service workers are supported, if so, progressively
            // enhance and add push messaging support, otherwise continue without it.
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('./service-worker.js?v1')
                    .then(doozyNotifications.initialiseState);
            } else {
                console.log('Service workers aren\'t supported in this browser.');
            }

            /**
             * Work with initial data store values
             */
            if (userStore.updates.value) {
                this.handleUserStoreUpdate(userStore.updates.value);
            }

            /**
             * Subscribe to User Store to be
             * notified of updates to preferences
             */
            this.userObserver = userStore.updates
                .subscribe(this.handleUserStoreUpdate);

            /**
             * Subscribe to Focus Store so we can
             * update the current focus when necessary
             */
            this.focusesObserver = focusStore.updates
                .filter(function (focuses) {
                    return focuses.length > 0;
                })
                //.distinctUntilChanged() - this only works correctly if the entire object is replaced, not if a property changes
                .subscribe(this.handleFocusStoreUpdate);

            /**
             * Subscribe to Weather Store
             */
            weatherStore.subscribe(this.handleWeatherStoreUpdate);
        },
        componentWillUnmount: function () {
            /**
             * Clean up objects and bindings
             */
            this.focusesObserver.dispose();
            this.userObserver.dispose();
            weatherStore.dispose(this.handleWeatherStoreUpdate);
        },

        componentDidMount: function () {
            this.initializeSignalR();

            if (window && window.history) {
                window.history.replaceState({ page: this.state.page, pageOptions: this.state.pageOptions }, 'Doozy');
                window.onpopstate = this.handleBrowserStateChange;
            }

            window.addEventListener("beforeunload", this.handleBeforeUnload);
        },
        componentDidUpdate: function () {
            // save state of application
            hlio.saveLocal('hl.' + this.props.settings.userName + '.settings', {
                currentFocus: this.state.currentFocus,
            }, this.props.settings.userId);

            if (window && window.history && window.history.state && window.history.state.page && this.state.page !== window.history.state.page) {
                window.history.pushState({ page: this.state.page, pageOptions: this.state.pageOptions }, 'Doozy');
            }
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleBeforeUnload: function (e) {
            this.state.requests.forEach(function (item) {
                this.forceRequest(item.timeoutId);
            }.bind(this));

            //(e || window.event).returnValue = null;
            //return null;
        },
        handleBrowserStateChange: function (e) {
            if (e.state && e.state.page) {
                this.setState({ page: e.state.page, pageOptions: e.state.pageOptions || null });
            }
        },
        handleConversationClose: function () {
          this.setState({activeConversation: null, page: 'Do'});
        },
        handleFocusClick: function (item) {
            this.setState({ currentFocus: item });
        },
        handleFocusStoreUpdate: function (focuses) {
            if (this.state.currentFocus === null && focuses.length > 0) {
                this.setState({ currentFocus: focuses[0] });
            } else if (this.state.currentFocus !== null && (focuses === null || focuses.length === 0)) {
                this.setState({ currentFocus: null });
            } else {
                var currentFocus = null;
                if (this.state.currentFocus) {
                    currentFocus = _.find(focuses, function(item) {
                        return item.id === this.state.currentFocus.id;
                    }.bind(this));
                }
                this.setState({ currentFocus: currentFocus });
            }
        },
        handleUserStoreUpdate: function (prefs) {
            Date.setOptions({ weekStarts: prefs.weekStarts });
            if (prefs.location && prefs.location.trim() !== '') {
                weatherStore.updateLocation(prefs.location);
            }
        },
        handleWeatherStoreUpdate: function () {
            this.setState({weatherLastUpdated: new Date().toISOString()});
        },

        /*************************************************************
         * MISC
         *************************************************************/
        queueRequest: function (entityType, entityId, msg, fn, fnUndo, ms) {
            var uuid = hlcommon.uuid();
            if (typeof ms === 'undefined') {
                ms = 30000;
            }

            var processRequests = _.where(this.state.requests, {entityId: entityId, entityType: entityType});
            processRequests.forEach(function (item) {
                item.fn();
                clearTimeout(item.timeoutId);
            });

            var requests = _.reject(this.state.requests, function (item) {
                return item.entityId === entityId && item.entityType === entityType;
            });

            var request = {
                entityType: entityType,
                entityId: entityId,
                id: uuid,
                timeoutId: setTimeout(function () {
                    this.processRequest(fn, uuid);
                }.bind(this), ms),
                msg: msg,
                fn: fn,
                onUndo: fnUndo
            };

            requests.push(request);
            this.setState({requests: requests});
            toastr.info(msg);
        },
        processRequest: function (fn, id) {
            fn();
            this.state.requests = this.state.requests.filter( function (item) { return item.id !== id; });
            this.setState({requests: this.state.requests.slice()});
        },
        undoRequest: function (timeoutId) {
            var request = _.find(this.state.requests, {timeoutId: timeoutId});
            request.onUndo();
            clearTimeout(timeoutId);
            this.state.requests = this.state.requests.filter( function (item) { return item.timeoutId !== timeoutId; });
            this.setState({requests: this.state.requests.slice()});
        },
        forceRequest: function (timeoutId) {
            var request = _.find(this.state.requests, {timeoutId: timeoutId});
            request.fn();
            clearTimeout(timeoutId);
            this.state.requests = this.state.requests.filter( function (item) { return item.timeoutId !== timeoutId; });
            this.setState({requests: this.state.requests.slice()});
        },

        getHeightBuffer: function () {
            if (timerStore.updates.value.isOpen) {
                return 55 + 38;
            } else {
                return 55;
            }
        },
        initializeSignalR: function () {
            // signal-r chat server
            this.chat = $.connection.chatHub;

            // Create a function that the hub can call back to display messages.
            this.chat.client.addNewMessageToPage = function (userName, message) {
                // Add the message to the page.
                this.addMessageToConversation(userName, { from: userName, sent: new Date(), text: message, mode: 'relay', old: false });
            }.bind(this);

            // Create a function that the hub can call back to display messages.
            this.chat.client.sendNotification = function (notification) {
                notificationStore.addNotificationFromSignalR(notification);
            }.bind(this);

            // Create a function that the hub can call back to display messages.
            this.chat.client.notifyUserUnavailable = function (userName) {
                this.addMessageToConversation(userName, { from: 'server', sent: new Date(), text: 'User is unavailable for message relay. Disable relay to send to their inbox.', mode: 'relay', old: false, fileUri: null });
            }.bind(this);

            // Create a function that the hub can call back to update profile pic uri.
            this.chat.client.handleProfileUriUpdated = function (uri) {
                userStore.updateProfileUriFromSignalR(uri);
            }.bind(this);

            // Create a function that the hub can call back to update focus pic uri.
            this.chat.client.handleFocusUriUpdated = function (focusId, uri) {
                focusStore.updateFromServer(focusId, { iconUri: uri });
            }.bind(this);

            // Start the connection.
            $.connection.hub.start();
        },

        addAction: function (action) {
            this.goTo('Manage Action', { actionId: (action ? action.id : null), mode: 'Add'});
            //this.refs.addeditaction.add(action);
        },
        editAction: function (action) {
            this.goTo('Manage Action', { actionId: (action ? action.id : null), mode: 'Edit'});
            //this.refs.addeditaction.edit(action);
        },
        logEntry: function (action) {
            this.goTo('Log Recent Action', { actionId: action.id });
            //this.refs.logaction.log(action);
        },
        goTo: function (page, options) {
            if (this.state.page !== page) {
                if (options && typeof options === 'object' && options.hasOwnProperty('nativeEvent')) {
                    options = null;
                }
                this.setState({ page: page, pageOptions: options || null});
            }
        },
        goBack: function (page) {
            if (window.history && window.history.back) {
                window.history.back();
            }
            //ui.goTo('Do');
        },
        openConversation: function (userName) {
            var conversations = this.state.conversations;
            var conversation = conversations.find(userName, 'id');

            // add new conversation to collection
            if (conversation === null) {
                var connection = this.findConnectionFromId(userName);
                var name = userName;
                var profileUri = null;
                var myProfileUri = null;
                if (connection !== null) {
                    userName = connection.userName;
                    name = connection.name;
                    profileUri = connection.profileUri;
                    myProfileUri = connection.myProfileUri;
                }
                conversation = {
                    id: userName,
                    name: name,
                    messages: [],
                    selected: true,
                    profileUri: profileUri,
                    myProfileUri: myProfileUri
                };
                conversations.push(conversation);
                this.setState({ conversations: conversations });

                // get message history
                $.ajax({
                    context: this,
                    url: clientApp.HOST_NAME + '/api/messages',
                    dataType: 'json',
                    headers: {
                        'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    },
                    data: JSON.stringify({ userName: userName }),
                    type: 'POST',
                    contentType: 'application/json',
                    success: function(result) {
                        var messages = conversation.messages;
                        result.map(function (msg) {
                            messages.push({
                                from: msg.direction === 'Sent' ? this.props.settings.userName : userName,
                                sent: new Date(msg.sent),
                                text: msg.text,
                                mode: 'server',
                                old: true,
                                fileUri: msg.fileUri
                            });
                        }.bind(this));

                        this.setState({ conversations: conversations });
                    },
                    error: function(xhr, status, err) {
                        toastr.error('Oh no! There was a problem sending this message' + status + err);
                    }
                });
            }

            return conversation;
        },
        selectConversation: function (id) {
            var conversation = this.openConversation(id);

            var conversations = this.state.conversations;
            var selectedConversation = this.state.activeConversation;
            this.setState({ page: 'Conversation', activeConversation: conversation });
        },

        addMessageToConversation: function(id, msg, select) {
            var conversations = this.state.conversations,
                existingConversation = false;

            var connection = this.findConnectionFromId(id);

            if (_.isUndefined(select)) {
                select = false;
            }
            if (conversations.length === 0) {
                select = true;
            }

            // append message to existing conversation
            for (var i = 0; i < conversations.length; i++) {
                if (conversations[i].id === id) {
                    conversations[i].messages.push(msg);
                    existingConversation = true;
                    break;
                }
            }

            // add message to new conversation
            if (!existingConversation) {
                var connection = this.findConnectionFromId(id);
                var name = id;
                if (connection !== null) {
                    name = connection.name;
                }
                conversations.push({
                    id: id,
                    name: name,
                    messages: [msg],
                    selected: select
                });
            }

            this.setState({ conversations: conversations });
        },
        findConnectionFromId: function (id) {
            var connections = connectionStore.updates.value;
            for (var i = 0; i < connections.length; i++) {
                if (connections[i].userName === id || connections[i].name === id) {
                    return connections[i];
                }
            }
            return null;
        },

        getConversation: function (id) {
            if (id === null || this.state.conversations.length === 0) {
                return null;
            }

            for (var i = 0; i < this.state.conversations.length; i++) {
                if (this.state.conversations[i].id === id) {
                    return conversations[i];
                }
            }
        },

        send: function (mode, to, msg, dataUrl, fileName) {
            if (mode !== 'p2p') {
                // Call the Send method on the hub.
                this.addMessageToConversation(to, { from: this.props.settings.userName, sent: new Date(), text: msg, mode: 'relay', old: false, fileUri: dataUrl });
                this.chat.server.send(to, msg, mode === 'relay', dataUrl, fileName);
            } else {
                //if (this.p2psend(this.p2pformatId(to), msg)) {
                    // success: $('#msg').val('').focus();
                //}
            }
        },


        /*************************************************************
         * RENDERING
         *************************************************************/
        renderWeatherBackdrop: function () {
            // states
            var weather = weatherStore.updates.value,
                backdrop = null,
                color,
                info,
                style;

            if (weather !== null) {

                info = (
                    userStore.updates.value.location + '\n' +
                    weather.currently.summary + ' ' + weather.currently.temperature +
                    '\n\nToday: ' + weather.daily.data[0].summary +
                    '\nLow: ' + weather.daily.data[0].temperatureMin +
                    '\nHigh: ' + weather.daily.data[0].temperatureMax
                );

                style = {
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    opacity: weather.currently.temperature >= 60 && weather.currently.temperature <= 80 ? '0.05' : '0.1',
                    zIndex: '-1'
                };

                color = (
                    weather.currently.temperature < 60 ?
                        '#428bca' :
                        (weather.currently.temperature > 80 ?
                            '#d9534f' :
                            'black')
                );

                backdrop = (
                    <WeatherIcon
                        id={'icon1'}
                        icon={weather.currently.icon}
                        style={style}
                        info={info}
                        height={500}
                        width={window.innerWidth - 20}
                        color={color} />
                );
            }

            return backdrop;
        },
        render: function () {
            // let other components know what page we're on
            window['ui'].page = this.state.page;

            //var weatherBackdrop = this.renderWeatherBackdrop();
            var action, mode, actionId, planId, tagId, targetId;

            var page = null,
                hideMain = true;
            if (this.state.page === 'Focus Management') {
                page = (<ManageFocus currentFocus={this.state.currentFocus || focusStore.updates.value[0]} />);
            } else if (this.state.page === 'Preferences') {
                page = (<ManagePreferences />);
            } else if (this.state.page === 'Manage Action') {
                actionId = (this.state.pageOptions || {}).actionId || null;
                if (actionId) {
                    action = actionStore.getActionById(actionId);
                }
                mode = (this.state.pageOptions || {}).mode || 'Add';
                page = (<ManageAction action={action} mode={mode} focusTag={this.state.currentFocus ? '!' + this.state.currentFocus.tagName : ''} />);
            } else if (this.state.page === 'Log Recent Action') {
                actionId = (this.state.pageOptions || {}).actionId || null;
                if (actionId) {
                    action = actionStore.getActionById(actionId);
                }
                page = (<LogRecentAction action={action} focusTag={this.state.currentFocus ? '!' + this.state.currentFocus.tagName : ''} />);
            } else if (this.state.page === 'Conversation' && typeof this.state.activeConversation !== 'undefined' && this.state.activeConversation !== null) {
                page = (<Conversation conversation={this.state.activeConversation} send={this.send} userName={this.props.settings.userName} onClose={this.handleConversationClose} />);
            } else if (this.state.page === 'Notifications') {
                page = (<NotificationList />);
            } else if (this.state.page === 'Log Entries' && this.state.pageOptions && this.state.pageOptions.userName) {
                page = (<LogEntries userName={this.state.pageOptions.userName} />);
            } else if (this.state.page === 'Comment' && this.state.pageOptions && this.state.pageOptions.userName && this.state.pageOptions.id) {
                page = (<CommentForm userName={this.state.pageOptions.userName} articleId={this.state.pageOptions.id} />);
            } else if (this.state.page === 'Manage Tags') {
                page = (<ManageTags />);
            } else if (this.state.page === 'Manage Tag') {
                tagId = (this.state.pageOptions || {}).tagId || null;
                page = (<ManageTag tagId={tagId} />);
            } else if (this.state.page === 'Manage Plans') {
                page = (<ManagePlans />);
            } else if (this.state.page === 'Manage Plan') {
                planId = (this.state.pageOptions || {}).planId || null;
                page = (<ManagePlan planId={planId} />);
            } else if (this.state.page === 'Manage Targets') {
                page = (<ManageTargets />);
            } else if (this.state.page === 'Manage Target') {
                targetId = (this.state.pageOptions || {}).targetId || null;
                page = (<ManageTarget targetId={targetId} />);
            } else if (this.state.page === 'Plan View') {
                planId = (this.state.pageOptions || {}).planId || null;
                page = (<PlanSteps planId={planId} />);
            } else if (this.state.page === 'Manage Plan Step') {
                var mpsArgs = (this.state.pageOptions || {});
                page = (<ManagePlanStep isNew={mpsArgs.isNew} planId={mpsArgs.planId} planStepId={mpsArgs.planStepId} parentId={mpsArgs.parentId} />);
            } else { //DO
                hideMain = false;
            }

            var requests;
            if (this.state.requests.length > 0) {
                var containerStyle = {
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#444',
                    padding: '1px'
                };

                requests = (
                    <div style={containerStyle}>
                        {this.state.requests.map(function (item) {
                            var style = {
                                display: 'flex',
                                width: '100%',
                                padding: '3px 6px',
                                margin: '1px',
                                backgroundImage: 'none',
                                color: '#444',
                                backgroundColor: '#e2ff63',
                                borderColor: '#e2ff63',
                                fontWeight: 'bold',
                                outlineColor: 'rgb(40, 40, 40)',
                                borderRadius: '4px'
                            };
                            return (
                                <div style={style}>
                                    <div style={{flexGrow: '1'}}>
                                        <span>{item.msg}</span>
                                    </div>
                                    <div style={{minWidth: '45px'}}>
                                        <a className="clickable" onClick={this.undoRequest.bind(this, item.timeoutId)}>Undo</a>
                                    </div>
                                    <div style={{minWidth: '8px'}}>
                                        <a className="clickable" onClick={this.forceRequest.bind(this, item.timeoutId)}>&times;</a>
                                    </div>
                                </div>
                            );
                        }.bind(this))}
                    </div>
                );
            }

            return (
                <div>
                    <PrimaryNavigation
                        currentPage={this.state.page}
                        currentFocus={this.state.currentFocus}
                        handleFocusClick={this.handleFocusClick} />
                    <TimerBar />
                    {requests}
                    <FocusActions hidden={hideMain} focusTag={this.state.currentFocus ? '!' + this.state.currentFocus.tagName : ''} />
                    {page}
                </div>
            );
        },
    });

}));
