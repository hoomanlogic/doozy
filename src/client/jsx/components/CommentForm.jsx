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
		root.CommentForm = factory(root.React);
	}
}(this, function (React) {
    'use strict';
    return React.createClass({
        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        getInitialState: function () {
            return {
                comment: ''
            };
        },

        componentWillMount: function () {
            connectionStore.subscribe(this.handleConnectionStoreUpdate);
            this.handleConnectionStoreUpdate(connectionStore.updates.value);
        },
        componentWillUnmount: function () {
            connectionStore.dispose(this.handleConnectionStoreUpdate);
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleConnectionStoreUpdate: function (connections) {
            this.setState({connectionsLastUpdated: new Date().toISOString()});
        },
        
        handleClose: function () {
            ui.goTo('Log Entries', { userName: this.props.userName });
        },
        
        handlePostCommentClick: function () {
            connectionStore.addComment(this.props.userName, this.props.articleId, this.refs.comment.getDOMNode().value);
        },
        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            var userName = this.props.userName;
            
            // find existing connection
            var connections = connectionStore.updates.value;
            
            var index = -1;
            for (var i = 0; i < connections.length; i++) {
                if (connections[i].userName === userName) {
                    index = i;
                    break;
                }
            }
            
            if (index === -1 || !connections[index].logEntries) {
                return null;
            }
            var connection = connections[index];
            index = -1;
            for (var i = 0; i < connection.logEntries.length; i++) {
                if (connection.logEntries[i].id === this.props.articleId) {
                    index = i;
                    break;
                }
            }
            
            if (index === -1) {
                return null;   
            }
            
            var comments = _.sortBy(connection.logEntries[index].comments, function (item) { return item.date});
            
            
            
            return (
                <div className="comments" style={{padding: '5px'}}>
                    <div className="comments-header">
                        <button style={{paddingRight: '10px'}} type="button" className="close" onClick={this.handleClose}><span aria-hidden="true">&times;</span></button>
                        <textarea ref="comment" className="form-control" placeholder="comment to post..." />
                        <button style={{ minWidth: '65px'}} className="btn btn-default btn-primary" type="button" onClick={this.handlePostCommentClick}>Post</button>
                        
                    </div>
                    <div className="comments-content">
                        {comments.map(
                            function(item) {
                                var duration = new babble.Duration(new Date() - new Date(item.date));
                                
                                return (
                                    <div>
                                        <div><img src={item.profileUri} title={item.userName} /></div>
                                        <div>
                                            <div style={{fontWeight: 'bold'}}>{item.userName}</div>
                                            <div>{item.comment}</div>
                                            <div style={{fontStyle: 'italic', fontSize: '0.8rem'}}>{duration.toString().split(', ')[0] + ' ago'}</div>
                                        </div>
                                    </div>
                                );
                            }.bind(this)
                        )}
                    </div>
                </div>
            );
        }
    });
}));