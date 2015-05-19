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
        propTypes: {
            userName: React.PropTypes.string.isRequired,  
            articleId: React.PropTypes.number.isRequired,
        },
        
        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        componentWillMount: function () {
            logEntryStore.subscribe(this.handleLogEntryStoreUpdate);
            this.handleLogEntryStoreUpdate(logEntryStore.updates.value);
            var commentChange = EventHandler.create();
            commentChange
                .map(function (event) {
                    return event.target.value;
                })
                .throttle(1000)
                .filter(function (details) {
                    return details.trim().length > 0;//details !== this.props.data.details;
                }.bind(this))
                .distinctUntilChanged()
                .subscribe(this.handleCommentChange);

            this.handlers = {
                commentChange: commentChange
            };  
        },
        componentWillUnmount: function () {
            logEntryStore.dispose(this.handleLogEntryStoreUpdate);
            this.handlers.commentChange.dispose();
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
        
        handleCommentChange: function (comment) {
            toastr.success('Comment changed');  
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
            
            var headerStyle = {
                display: 'flex',
                flexDirection: 'row',
                marginBottom: '5px'
            };
            
            var containerStyle = {
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid #e0e0e0'
            };
            
            var commentStyle = {
                display: 'flex',
                flexDirection: 'row'
            };
            
            var imgContainerStyle = {
                marginRight: '5px'
            };

            var imgStyle = {
                maxWidth: '45px',
                maxHeight: '45px'
            };
            
            return (
                <div className="comments" style={{padding: '5px'}}>
                    <div style={headerStyle}>
                        <button style={{paddingRight: '10px'}} type="button" className="close" onClick={this.handleClose}><span aria-hidden="true">&times;</span></button>
                        <textarea ref="comment" className="form-control" placeholder="comment to post..." />
                        <button style={{ minWidth: '65px'}} className="btn btn-default btn-primary" type="button" onClick={this.handlePostCommentClick}>Post</button>
                    </div>
                    <div style={containerStyle}>
                        {comments.map(
                            function(item, index) {
                                var commentContent;
                                if (item.userId === userStore.updates.value.userId) {
                                    commentContent = (<ContentEditable html={item.comment} onChange={this.handlers.commentChange} />);
                                } else {
                                    commentContent = (<div>{item.comment}</div>);
                                }
                                return (
                                    <div style={commentStyle}>
                                        <div style={imgContainerStyle}><img src={item.profileUri} style={imgStyle} title={item.knownAs} /></div>
                                        <div>
                                            <div style={{fontWeight: 'bold'}}>{item.knownAs}</div>
                                            {commentContent}
                                            <div style={{fontStyle: 'italic', fontSize: '0.8rem'}}><RelativeTime isoTime={item.date} /></div>
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