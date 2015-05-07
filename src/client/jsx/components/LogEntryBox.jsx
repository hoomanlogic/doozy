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
		root.LogEntryBox = factory(root.React);
	}
}(this, function (React) {
    'use strict';
    return React.createClass({
        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleUpvoteClick: function () {
            logEntryStore.toggleUpvote(this.props.data.userName, this.props.data.id);
        },
        
        handleCommentClick: function () {
            ui.goTo('Comment', { userName: this.props.data.userName, id: this.props.data.id });
        },
        
        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            var data = this.props.data;

            var upvoteCounter, commentCounter;
            
            if (data.upvotes && data.upvotes.length > 0) {
                upvoteCounter = (<span>{data.upvotes.length + ' ' + hlapp.formatNoun('Cheer', data.upvotes.length)}</span>);
            }
                                 
            if (data.comments && data.comments.length > 0) {
                commentCounter = (<span>{(upvoteCounter ? ' - ' : '') + data.comments.length + ' ' + hlapp.formatNoun('Comment', data.comments.length)}</span>);
            }
            
            return (
                <article key={data.id} className="log-entry-box" style={{display: 'flex', flexDirection: 'column'}}>
                    <div>
                        <header style={{display: 'flex', flexDirection: 'row'}}>
                            <div style={{minWidth: '45px', paddingRight: '5px'}}><img style={{maxHeight: '45px', padding: '2px'}} src={this.props.data.profileUri} /></div>
                            <div>
                                <div>
                                    <span style={{fontWeight: 'bold'}}>{this.props.data.knownAs}</span> {data.entry} <span style={{fontWeight: 'bold'}}>{data.actionName}</span>
                                </div>
                                <div>
                                    <small>{hlapp.calcNaturalDays(new Date(data.date)) + (data.duration ? ' for ' + new babble.Duration(data.duration * 60000).toString() : '')}</small>
                                </div>
                            </div>
                        </header>
                        <div>
                            {data.details}
                        </div>
                    </div>
                    <footer style={{display: 'flex', flexDirection: 'column'}}>
                        <div>
                             {upvoteCounter}
                             {commentCounter}
                        </div>
                        <div className="log-peanuts-actions">
                            <button type="button" style={{ paddingTop: '3px', paddingBottom: '3px' }} className="btn btn-primary" onClick={this.handleUpvoteClick}><i className="fa fa-heart"></i> Cheer
                        </button>
                            <button type="button" style={{ paddingTop: '3px', paddingBottom: '3px' }} className="btn btn-primary" onClick={this.handleCommentClick}><i className="fa fa-pencil"></i> Comment
                        </button>
                        </div>
                    </footer>
                </article>
            );
        }
    });
}));