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
            logEntryStore.subscribe(this.handleLogEntryStoreUpdate);
            this.handleLogEntryStoreUpdate(logEntryStore.updates.value);
        },
        componentWillUnmount: function () {
            logEntryStore.dispose(this.handleLogEntryStoreUpdate);
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleLogEntryStoreUpdate: function (connections) {
            this.setState({logEntriesLastUpdated: new Date().toISOString()});
        },
        
        handleClose: function () {
            ui.goTo('Log Entries', { userName: this.props.userName });
        },
        
        handlePostCommentClick: function () {
            var comment = this.refs.comment.getDOMNode().value || '';
            comment = comment.trim();
            if (comment.length > 0) {
                logEntryStore.addComment(this.props.userName, this.props.articleId, comment);
            }
            this.refs.comment.getDOMNode().value = '';
        },
        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            var userName = this.props.userName;
            
            // find existing connection
            var connections = connectionStore.updates.value;
                        // find log entries for this user
            var logEntry = _.find( logEntryStore.updates.value, { id: this.props.articleId } );
            
            if (!logEntry) {
                return null;
            }
            
            var comments = _.sortBy(logEntry.comments, function (item) { return item.date; });
            
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
                                        <div><img src={item.profileUri} title={item.knownAs} /></div>
                                        <div>
                                            <div style={{fontWeight: 'bold'}}>{item.knownAs}</div>
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