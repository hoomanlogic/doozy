var HoomanHubApp = React.createClass({
    
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
    
        return {
            currentFocus: previousState.currentFocus || null,
            weatherLastUpdated: null, 
            conversations: [], 
            activeConversation: null,
            page: 'Do'
        };
    },
    
    componentWillMount: function () {
        /**
         * Global UI Handles
         */
        window['ui'] = window['ui'] || {};
        window['ui'].addAction = this.addAction;
        window['ui'].editAction = this.editAction;
        window['ui'].logAction = this.logAction;
        window['ui'].goTo = this.goTo;
        window['ui'].openConversation = this.selectConversation;
        
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
        weatherStore.init(this.props.settings.userName, this.props.settings.userId);
        
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
    },
    componentDidUpdate: function () {
        // save state of application
        hlio.saveLocal('hl.' + this.props.settings.userName + '.settings', { 
            currentFocus: this.state.currentFocus,
        }, this.props.settings.userId);
    },
    
    /*************************************************************
     * EVENT HANDLING
     *************************************************************/
    handleCancelClick: function () {
        this.setState({ page: 'Do' });
    },
    handleConversationClose: function () {
      this.setState({activeConversation: null});  
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
                    return item.ref === this.state.currentFocus.ref; 
				}.bind(this));
            }
            this.setState({ currentFocus: currentFocus });
        }
    },
    handleSavePreferencesClick: function () {
        
        userStore.updatePrefs({
            email: this.refs.prefsEmail.getDOMNode().value,
            emailNotifications: this.refs.prefsEmailNotifications.getDOMNode().value,
            weekStarts: parseInt(this.refs.prefsWeekStarts.getDOMNode().value),
            location: this.refs.prefsLocation.getDOMNode().value
        });
        
        this.setState({ page: 'Do' });
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
            userStore.updateProfileUriFromSignalR(uri)
        }.bind(this);
        
        // Create a function that the hub can call back to update focus pic uri.
        this.chat.client.handleFocusUriUpdated = function (focusId, uri) {
            focusStore.updateFromServer(focusId, { iconUri: uri });
        }.bind(this);

        // Start the connection.
        $.connection.hub.start();
    },

    addAction: function (action) {
        this.refs.addeditaction.add(action);
    },
    editAction: function (action) {
        this.refs.addeditaction.edit(action);
    },
    logAction: function (action) {
        this.refs.logaction.log(action);
    },
    
    goTo: function (page) {
        if (this.state.page !== page) {
            this.setState({ page: page });
        }
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
                url: hlapp.HOST_NAME + '/api/messages',
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + hlapp.getAccessToken()
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
    
        
    },
    selectConversation: function (id) {
        var conversation = this.openConversation(id);
        
        var conversations = this.state.conversations;
        var selectedConversation = this.state.activeConversation;

        // avoid setting state when it's already selected
        if (selectedConversation !== null && selectedConversation.id === id) {
            return;   
        }
        
        for (var i = 0; i < conversations.length; i++) {
            if (conversations[i].id === id) {
                this.setState({ activeConversation: conversations[i] });   
            }
        }
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
            if (connections[i].userName === id) {
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
    renderManagePersona: function () {
        return (
            <div style={{padding: '5px'}}>
                <form role="form">
                    <ProfilePic uri={userStore.updates.value.profileUri} />
                    <div className="form-group">
                        <label htmlFor="prefs-location">Where do you live?</label>
                        <input id="prefs-location" ref="prefsLocation" type="text" className="form-control" placeholder="eg. Boulder, CO" defaultValue={userStore.updates.value.location} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="prefs-week-starts">Which day does your week start on?</label>
                        <select id="prefs-week-starts" ref="prefsWeekStarts" className="form-control" defaultValue={userStore.updates.value.weekStarts}>
                            <option value="0">Sunday</option>
                            <option value="1">Monday</option>
                            <option value="2">Tuesday</option>
                            <option value="3">Wednesday</option>
                            <option value="4">Wednesday</option>
                            <option value="5">Friday</option>
                            <option value="6">Saturday</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="prefs-email">What's your email address?</label>
                        <input id="prefs-email" ref="prefsEmail" type="text" className="form-control" placeholder="" defaultValue={userStore.updates.value.email} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="prefs-email-notifications">Send notifications through email?</label>
                        <input id="prefs-email-notifications" ref="prefsEmailNotifications" type="checkbox" className="form-control" defaultValue={userStore.updates.value.emailNotifications} />
                    </div>
                    <button type="button" className="btn btn-primary" onClick={this.handleSavePreferencesClick}>Save Changes</button>
                    <button type="button" className="btn btn-default" onClick={this.handleCancelClick}>Cancel Changes</button>
                </form>
            </div>
        );
    },
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
                bottom: '2px', 
                right: '20px', 
                opacity: '0.1', 
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
                    width={420} 
                    color={color} />
            );
        }
    
        return backdrop;
    },
    render: function () {
        var weatherBackdrop = this.renderWeatherBackdrop();
    
        var page = null;
        if (this.state.page === 'Do') {
            page = (<FocusActions focusTag={this.state.currentFocus ? '!' + this.state.currentFocus.tagName : ''} />);
        } else if (this.state.page === 'Focus Management') {
            page = (<ManageFocus currentFocus={this.state.currentFocus} />);
        } else if (this.state.page === 'Persona Management') {
            page = this.renderManagePersona();
        }

        return (
            <div>
                <PrimaryNavigation 
                    currentPage={this.state.page} 
                    currentFocus={this.state.currentFocus} 
                    handleFocusClick={this.handleFocusClick} />
                {weatherBackdrop}
                {page}
                <AddEditAction ref="addeditaction" focusTag={this.state.currentFocus ? '!' + this.state.currentFocus.tagName : ''} />
                <LogAction ref="logaction" focusTag={this.state.currentFocus ? '!' + this.state.currentFocus.tagName : ''} />
                <Conversation conversation={this.state.activeConversation} send={this.send} userName={this.props.settings.userName} onClose={this.handleConversationClose} />
            </div>
        );
    },
});