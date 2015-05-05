/** @jsx React.DOM */

// CommonJS, AMD, and Global shim
(function (root, factory) {
    'use strict';
	if (typeof exports === "object") {
		// CommonJS
		module.exports = exports = factory(
            require('react'),
            require('../../../../../babble/src/moments'),
            require('./SendMessage')
        );
	}
	else if (typeof define === "function" && define.amd) {
		// AMD
		define([
            'react',
            '../../../../../babble/src/moments',
            './SendMessage'
        ], factory);
	}
	else {
		// Global (browser)
		root.Conversation = factory(root.React, root.babble, root.SendMessage);
	}
}(this, function (React, babble, SendMessage) {
    'use strict';
    return React.createClass({
        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        getInitialState: function () {
            return {
                isOpen: true,
                windowWidth: window.innerWidth
            };
        },

        componentDidMount: function () {
            this.firstLook = true;
            this.goToEndOfConversation();
            window.addEventListener('resize', this.handleResize);
        },
        componentDidUpdate: function () {
            this.goToEndOfConversation();

        },

        componentWillUnmount: function () {
            window.removeEventListener('resize', this.handleResize);  
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleResize: function(e) {
            this.setState({windowWidth: window.innerWidth});
        },
        onClose: function () {
            if (this.props.onClose !== null) {
                this.props.onClose();
            }
        },

        /*************************************************************
         * MISC
         *************************************************************/
        goToEndOfConversation: function () {
            /**
             * Don't do anything if there is nothing rendered due
             * to there being no active conversation open or if 
             * there are no messages in the conversation
             */
            if (_.isUndefined(this.refs.scrollWindow) || !this.props.conversation || !this.props.conversation.messages) {
              return;
            }

            /**
             * Get DOM elements for the scrollwindow and the inner conversation
             * that will be used to calculated the scrollTop property to move to
             * the end of the conversation
             */
            var $scrollWindow = $(this.refs.scrollWindow.getDOMNode());
            var $fullConversation = $(this.refs.fullConversation.getDOMNode());

            if (($fullConversation.height() - $scrollWindow.height()) === 0) {
                return; 
            }

            /**
             * Seemingly React will call ComponentDidUpdate before the DOM is done being updated
             * because height doesn't work when the inner messages for the container are initially added
             * so we wait 150 milliseconds to make sure the DOM is finished and it will scroll all the way to the bottom
             */ 
            if (this.firstLook) {
                this.firstLook = false;
                setTimeout(this.goToEndOfConversation, 150);
            } else {
                $scrollWindow.animate({
                  scrollTop: $fullConversation.height() - $scrollWindow.height()
                }, 1000);
            }
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            var conversation = this.props.conversation;

            if (conversation === null) {
                return null;    
            }

            var domMessages = null;
            var messages = _.sortBy(conversation.messages, function (a) { return a.sent.getTime() });
            _.groupBy(messages, function(item){ return item.sent + item.from });
            domMessages = 
                messages.map(function(msg, index) {
                    var left = null;
                    var right = null;
                    var section = null;

                    if (msg.from === this.props.userName) {
                        left = (
                            <div className="col-xs-10 text-right">
                                <div>{msg.text}</div>
                                <img className="message" src={msg.fileUri} />
                            </div>
                        );
                        right = (
                            <div className="col-xs-2">
                                <div className="w50 pull-right"><img className="img-responsive" src={conversation.myProfileUri} /></div>
                            </div>);
                    } else {
                        left = (
                            <div className="col-xs-2">
                                <div className="w50"><img className="img-responsive" src={conversation.profileUri} /></div>
                            </div>
                        );
                        right = (
                            <div className="col-xs-10">
                                <div>{msg.text}</div>
                                <img className="message" src={msg.fileUri} />
                            </div>
                        );
                    }

                    if (index === 0 || Math.abs(messages[index - 1].sent.getTime() - msg.sent.getTime()) > 500000) {
                        section = <div className="message-sent-grouping col-xs-12"><span className="message-sent-timestamp">{babble.moments.formatDateTime(msg.sent)}</span></div>;
                    }
                    return (
                        <div key={msg.sent.getTime().toString()} className="clearfix message-row">
                            {section}
                            {left}{right}
                        </div>
                    );
                }.bind(this));

            var containerStyle = {
                padding: '5px',
                margin: '0'
            };
                             
            // style={containerStyle} className={"conversation-container" + (this.state.isOpen ? '' : ' hidden')}

            return (
                <div style={{ padding: '5px', margin: '0', display: 'flex', flexDirection: 'column', height: (window.innerHeight - ui.getHeightBuffer()) + 'px' }}>
                    <div className="conversation-header">
                        <button type="button" className="close" onClick={this.onClose}><span aria-hidden="true">&times;</span></button>
                        <h4 className="modal-title">{this.props.conversation.name}</h4>
                    </div>
                    <div ref="scrollWindow" id="conversation-scroll" className="conversation-messages">
                        <div ref="fullConversation" id="conversation-full-height">
                            {domMessages}
                        </div>
                    </div>
                    <div className="conversation-form">
                        <SendMessage userName={this.props.conversation.id} send={this.props.send} />
                    </div>
                </div>
            );
        }
    });
}));