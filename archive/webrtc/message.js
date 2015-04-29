var hl = hl || {};
hlsocial = hlsocial || {};

(function (namespace, $) {
    'use strict';

    var Message = (function () {
        function Message(obj) {
            // minimum required: from, id, type, text
            this.from = obj.from;
            this.id = obj.id;
            this.type = obj.type;
            this.text = obj.text;

            //defaults
            this.direction = namespace.MESSAGE_DIRECTION.OUTGOING;
            this.sent = Date();
            this.read = null;
            this.dataUrl = null;
            this.fileName = null;

            // optional
            if (typeof obj.dataUrl !== 'undefined' && obj.dataUrl !== null) {
                this.dataUrl = obj.dataUrl;
            }
            if (typeof obj.fileName !== 'undefined' && obj.fileName !== null) {
                this.fileName = obj.fileName;
            }
            if (typeof obj.direction !== 'undefined' && obj.direction !== null) {
                this.direction = obj.direction;
            }
            if (typeof obj.sent !== 'undefined' && obj.sent !== null) {
                this.sent = obj.sent;
            }
            if (typeof obj.read !== 'undefined' && obj.read !== null) {
                this.read = obj.read;
            }
            
        }

        Message.prototype.markRead = function () {
            if (!this.read) {
                this.read = Date();
            }
        };

        return Message;

    })();

    //attach the classes and enums to the namespace
    namespace.Message = Message;
    namespace.MESSAGE_TYPE = { PING: 0, CHAT: 1 };
    namespace.MESSAGE_DIRECTION = { INCOMING: 0, OUTGOING: 1 };

})(hlsocial, $);