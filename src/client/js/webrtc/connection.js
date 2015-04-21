(function (exports) {
    'use strict';

    exports.CONNECTION_STATUS = { OFFLINE: 0, ACTIVE: 1, INACTIVE: 2 };

    exports.Connection = (function () {
        function Connection(peer, id, onMessageSent, onMessageReceived, conn, msg) {
            this.me = peer;
            this.id = id;
            this.messages = [];
            this.onMessageReceived = onMessageReceived;
            this.onMessageSent = onMessageSent;
            this.status = namespace.CONNECTION_STATUS.OFFLINE;
            this.connection = null;
            if (typeof conn !== 'undefined' && conn !== null) {
                console.log('Passed in connection');
                this.connection = conn;
                this.connection.on('data', onMessageReceived);

            } else {
                console.log('Creating a connection');
                if (msg) {
                    this.createConnection(msg);
                } else {
                    this.createConnection();
                }
            }
        }

        Connection.prototype.send = function (msg) {
            // convert a simple string text to a chat message
            if (typeof msg === 'string') {
                console.log('Converted text to msg');
                msg = new namespace.Message({from: this.me.id, id: this.id, type: namespace.MESSAGE_TYPE.CHAT, text: msg});
            }

            
            if (this.connection === null || this.connection.open === false) {
                // establish connection first, pass in msg so it sends when we're connected
                console.log('Creating connection during send');
                this.createConnection(msg);
                return;
            }

            // send message
            console.log('Sending ' + msg.type);
            console.log(this);
            console.log(this.connection.open);
            this.connection.send({ from: msg.from, id: msg.id, type: msg.type, text: msg.text, sent: msg.sent, dataUrl: msg.dataUrl, fileName: msg.fileName });
            this.onMessageSent(msg);
        };

        Connection.prototype.createConnection = function (msg) {
            this.connection = this.me.connect(this.id);
            this.connection.on('data', this.onMessageReceived);

            var that = this;
            this.connection.on('open', function () {
                if (msg) {
                    console.log('Sending from createConnection');
                    that.send(msg);
                }
            });
            this.connection.on('error', function () {
                console.log('Error from createConnection');
            });
        };

        Connection.prototype.ping = function () {
            console.log('Pinging ' + this.id);
            var msg = new namespace.Message({ from: this.me.id, id: this.id, type: namespace.MESSAGE_TYPE.PING, text: '' });
            this.send(msg);
        };

        return Connection;

    })();

}(typeof exports === 'undefined' ? this['hlsocial'] = {}: exports));