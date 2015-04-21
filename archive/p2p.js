    
    chat: null,
    
    initializeChatClient: function () {
        // signal-r chat server
        this.chat = $.connection.chatHub;
        
        // Create a function that the hub can call back to display messages.
        this.chat.client.addNewMessageToPage = function (userName, message) {
            // Add the message to the page.
            this.addMessageToConversation(userName, { from: userName, sent: new Date(), text: message, mode: 'relay', old: false });
        }.bind(this);
        
        // Create a function that the hub can call back to display messages.
        this.chat.client.sendNotification = function (notification) {
            var notifications = this.state.notifications;
            
            // change strings to dates
            notification.occurredAt = new Date(notification.occurredAt);
            if (notification.readAt !== null) {
                notification.readAt = new Date(notification.readAt);
            }
            
            // add to notifications and set state
            notifications.push(notification);
            this.setState({ notifications: notifications });
            
            // if it hasn't been read, then give an extra visible indicator
            if (notification.readAt === null) {
                toastr.success('You\'ve got a new notification!');
            }
        }.bind(this);
        
        // Create a function that the hub can call back to display messages.
        this.chat.client.notifyUserUnavailable = function (userName) {
            this.addMessageToConversation(userName, { from: 'server', sent: new Date(), text: 'User is unavailable for message relay. Disable relay to send to their inbox.', mode: 'relay', old: false, fileUri: null });
        }.bind(this);
        
        // Create a function that the hub can call back to update profile pic uri.
        this.chat.client.handleProfileUriUpdated = function (uri) {
            this.setState({ profileUri: uri });
        }.bind(this);
        
        // Create a function that the hub can call back to update focus pic uri.
        this.chat.client.handleFocusUriUpdated = function (focusId, uri) {
            focusStore.updateFromServer(focusId, { iconUri: uri });
        }.bind(this);

        // Start the connection.
        $.connection.hub.start();
    },
    findConnectionFromP2P: function (p2pid) {
        var connections = this.state.connections;
        for (var i = 0; i < connections.length; i++) {
            if (this.p2pformatId(connections[i].userName) === p2pid) {
                return connections[i];
            }
        }
        return null;
    },
    p2ppeer: null,
    p2pconnections: [],
    p2pformatId: function (userName) {
        return userName.replace('@', '').replace('.', '').replace('.', '').replace('.', '').replace('.', '');
    },
    p2pconnect: function () {
        var id = this.p2pformatId(this.props.settings.userName);

        // create a peer and subscribe to error event
        this.p2ppeer = new Peer(id, { key: 'xqhkjoxq9u4ygb9' });

        // handle error event
        this.p2ppeer.on('error', function (error) {
            if (error.type === 'peer-unavailable') {
                var cannotFindId = error.message.replace('Could not connect to peer ', ''),
                    conn = this.p2pconnections.find(cannotFindId, 'id');
                if (conn.status !== hlsocial.CONNECTION_STATUS.OFFLINE) {
                    conn.status = hlsocial.CONNECTION_STATUS.OFFLINE;
                    this.p2prefreshTable();
                }
                $('#chatLog').prepend('<li>' + cannotFindId + ' is unavailable for P2P chat</li>');
            } else {
                // unexpected errors
                $('#chatLog').prepend(error + '<br />');
                if (error === 'Error: Lost connection to server.') {
                    this.p2pthis.p2ppeer.destroy();
                    this.p2pconnect(id);
                }
            }

        }.bind(this));

        // handle open event (connection to server)
        this.p2ppeer.on('open', function (id) {
            $('#chatLog').prepend('<li>Ready to receive messages as ' + id + '!</li>');
        });

        // handle connection event (someone initiates connection with you)
        this.p2ppeer.on('connection', function (connection) {
            console.log('On Connection ' + connection.peer);
            console.log(connection);
            var conn = this.p2pconnections.find(connection.peer, 'id');
            if (conn === null) {
                conn = this.p2paddConnection(connection.peer, connection);
            }
        }.bind(this));

        // handle disconnected event (disconnection from server)
        //peer.on('disconnected', function () {
        //    peer.reconnect();
        //});

        // load connections
        $.jStorage.set('hl_' + this.p2ppeer.id + '_connections', []); // so far connection won't work unless the initial connection is established when they already exist, need a way to update the dataConnection even though the connection wrapper exists
        this.p2ploadConnections2(id);

        // ping every 30 seconds
        window.setInterval(this.p2ppingConnections, 30000);
    },
    p2pdisconnect: function () {
        this.p2ppeer.destroy();
    },
    p2ponMessageReceived: function(msg) {
        // change Object back to Message if needed
        msg = this.p2pcastToMessage(msg);

        // add to p2p message history
        this.p2paddToMessageHistory(msg.from, msg);

        // set p2p connection to active
        var conn = this.p2pconnections.find(msg.from, 'id');
        if (conn !== null) {
            // set user to available and ping them so they know we're here asap
            if (conn.status !== hlsocial.CONNECTION_STATUS.ACTIVE) {
                conn.status = hlsocial.CONNECTION_STATUS.ACTIVE;
                conn.ping();
                this.p2prefreshTable();
            }
        }

        if (msg.type === hlsocial.MESSAGE_TYPE.CHAT) {
            this.addMessageToConversation(this.findConnectionFromP2P(msg.from).userName, { from: this.findConnectionFromP2P(msg.from).userName, sent: msg.sent, message: msg.text, mode: 'p2p', old: false });
        }

        saveToDisk(msg.dataUrl, msg.fileName);
    },
    p2ponMessageSent: function (msg) {
        // change Object back to Message if needed
        msg = this.p2pcastToMessage(msg);

        // add to message history
        this.p2paddToMessageHistory(msg.id, msg);

        if (msg.type === hlsocial.MESSAGE_TYPE.CHAT) {
            this.addMessageToConversation(this.findConnectionFromP2P(msg.id).userName, { from: this.props.settings.userName, sent: msg.sent, message: msg.text, mode: 'p2p', old: false });
        }
    },
    p2ploadConnections: function (id) {
        var connectionIds = $.jStorage.get('hl_' + id + '_connections', []);
        for (var i = 0; i < connectionIds.length; i++) {
            this.p2pconnections.push(new hlsocial.Connection(this.p2ppeer, connectionIds[i], this.p2ponMessageSent, this.p2ponMessageReceived));
        }
    },

    p2ploadConnections2: function (id) {
        var connectionIds = $.jStorage.get('hl_' + id + '_connections', []);
        for (var i = 0; i < connectionIds.length; i++) {
            this.p2p_send(new hlsocial.Message({ from: id, id: connectionIds[i], type: hlsocial.MESSAGE_TYPE.PING, text: '' }));
        }
    },
    p2paddConnection: function (id, connection, msg) {
        var conn = this.p2pconnections.find(id, 'id');
        if (conn !== null) {
            return conn;
        }

        conn = new hlsocial.Connection(this.p2ppeer, id, this.p2ponMessageSent, this.p2ponMessageReceived, connection, msg);
        this.p2pconnections.push(conn);

        // save local storage
        $.jStorage.set('hl_' + this.p2ppeer.id + '_connections', this.p2pconnections.toSimpleArray('id'));
        return conn;
    },
    p2punreadCount: function (id) {
        var count = 0;
        var conn = this.p2pconnections.find(id, 'id');
        for (var i = 0; i < conn.messages.length; i++) {
            var msg = conn.messages[i];
            if (msg.type !== hlsocial.MESSAGE_TYPE.PING) {
                if (msg.read === null) {
                    count++;
                }
            }
        }

        if (count === 0) {
            return '';
        } else {
            return count;
        }
    },
    p2psend: function (id, msg) {

        if (!id || ((typeof msg === 'undefined' || msg === null) && $('#theFile').prop('files').length > 0)) {
            return false;
        }

        msg = new hlsocial.Message({ from: this.p2ppeer.id, id: id, type: hlsocial.MESSAGE_TYPE.CHAT, text: msg });
        if ($('#theFile').prop('files').length > 0) {
            var msg = {};
            hlio.convertFileToDataUrl($('#theFile').prop('files')[0], function (fileName, dataUrl) {
                msg.dataUrl = dataUrl;
                msg.fileName = fileName;
                this.p2p_send(msg);
            });
        } else {
            return this.p2p_send(msg);
        }
    },
    p2p_send: function (msg) {

        // get the connection object, create it if it doesn't exist
        var conn = this.p2pconnections.find(msg.id, 'id');
        if (conn === null) {
            conn = this.p2paddConnection(msg.id, null, msg);
        } else {
            conn.send(msg);
        }

        return true;
    },
    p2paddToMessageHistory: function (id, msg) {
        // only add chat messages, not pings
        if (msg.type === hlsocial.MESSAGE_TYPE.CHAT) {
            var conn = this.p2pconnections.find(id, 'id');
            if (conn !== null) {
                conn.messages.push(msg);
            }
        }
    },
    p2pcastToMessage: function (obj) {
        if (obj.constructor !== hlsocial.Message) {
            return new hlsocial.Message(obj);
        }
        return obj;
    },
    p2pshowImage: function (file) {
        $('#chatLog').prepend('<img src="" alt="Sent Image">');
        var reader = new FileReader();
        reader.onloadend = function () {
            $('#chatLog img').attr('src', reader.result);
        };
        reader.readAsDataURL(file);
    },

    p2prefreshTable: function () {
        // clear available connections table
        $('#availableConnections').empty();
        // add connections that aren't offline
        for (var i = 0; i < this.p2pconnections.length; i++) {
            if (this.p2pconnections[i].status !== hlsocial.CONNECTION_STATUS.OFFLINE) {
                $('#availableConnections').append('<tr><td class="connection">' + this.p2pconnections[i].id + '</td></tr>');
            }
        }
        $('.connection').click(function () {
            $('#chatId').val($(this).html());
        });
    },

    p2paddChatLog: function (msg) {

        var userSay, type;
        if (msg.from === this.p2ppeer.id) {
            userSay = 'You say: ';
            type = 'info';
        } else {
            userSay = msg.from + ' says: ';
            type = 'primary';
        }
        $('#chatLog').prepend(
            '<div class="panel panel-' + type + '"><div class="panel-heading">' + userSay + '<span class="pull-right">' + hldatetime.formatTime(msg.sent) + '</span></div><div class="panel-body">' + msg.text + getImage(msg) + '</div></div>'
        );
        msg.markRead();
    },