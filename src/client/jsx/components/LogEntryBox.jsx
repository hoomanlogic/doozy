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
        mixins: [LayeredComponentMixin],
        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        getInitialState: function () {
            return {
                isDropDownOpen: false  
            };
        },
        
        componentWillMount: function () {
            var detailsChange = EventHandler.create();
            detailsChange
                .map(function (event) {
                    return event.target.value;
                })
                .throttle(1000)
                .filter(function (details) {
                    return details !== this.props.data.details;
                }.bind(this))
                .distinctUntilChanged()
                .subscribe(this.handleDetailsChange);
            
            var durationChange = EventHandler.create();
            durationChange
                .throttle(2000)
                .distinctUntilChanged()
                .map(function (event) {
                    var duration = 0;
                    var durationParseResult = babble.get('durations').translate(event.target.value);
                    if (durationParseResult.tokens.length > 0) {
                        duration = durationParseResult.tokens[0].value.toMinutes();
                    }
                
                    return duration;
                })
                .filter(function (duration) {
                    return duration !== this.props.data.duration;
                }.bind(this))
                .subscribe(this.handleDurationChange);

            this.handlers = {
                detailsChange: detailsChange,
                durationChange: durationChange
            };  
        },
        componentWillUnmount: function () {
            this.handlers.detailsChange.dispose();
            this.handlers.durationChange.dispose();
        },
        
        componentDidUpdate: function () {
            if (this.state.isDropDownOpen) {
                
                var component = this;
                var $win = $(window);
                var $box = $('#dropdown-' + this.props.data.id);
                var $toggle = $(this.refs.dropDown.getDOMNode());

                var handler = function(event) {	
                    // handle click outside of the dropdown
                    if ($box.has(event.target).length == 0 && !$toggle.is(event.target) && !$box.is(event.target)) {
                        component.setState({
                            isDropDownOpen: false
                        });
                        $win.off("click.Bst", handler);
                    }
                };

                $win.on("click.Bst", handler);  
            }
        },
        
        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleUpvoteClick: function () {
            logEntryStore.toggleUpvote(this.props.data.userName, this.props.data.id);
        },
        
        handleCommentClick: function () {
            ui.goTo('Comment', { userName: this.props.data.userName, id: this.props.data.id });
        },
        
        handleDeleteClick: function () {
            logEntryStore.destroy(this.props.data);
        },
        handleEditActionClick: function () {
            this.setState({
                isDropDownOpen: false
            });
            ui.editAction(actionStore.getActionById(this.props.data.actionId));
        },
        handleEditDetailsClick: function () {
            this.refs.logdetails.getDOMNode().focus();
            this.setState({
                isDropDownOpen: false
            });
        },
        handleEditDurationClick: function () {
            this.refs.logduration.getDOMNode().focus();
            this.setState({
                isDropDownOpen: false
            });
        },
        handleDetailsChange: function (details) {
            this.props.data.details = details;
            logEntryStore.update(this.props.data);
        },
        handleDurationChange: function (duration) {
            this.props.data.duration = duration;
            logEntryStore.update(this.props.data);
        },
        handleDropDownClick: function () {
            this.setState({
                isDropDownOpen: !this.state.isDropDownOpen
            });
        },
        
        /*************************************************************
         * RENDERING
         *************************************************************/
        renderLayer: function () {
            
            if (!this.state.isDropDownOpen) {
                return null;
            };
            
            var style = {
                position: 'absolute',
                top: $(this.refs.dropDown.getDOMNode()).offset().top + 22 + 'px',
                padding: '5px',
                backgroundColor: '#fff',
                minWidth: '100%',
                borderRadius: '4px',
                border: '2px solid #e0e0e0',
                boxShadow: '0 0 10px #000000'
            };
            
            var listStyle = {
                listStyle: 'none',
                margin: '0',
                padding: '0'
            };
            
            var options = [];
            
            var aStyle = {
                fontSize: '20px',
                display: 'block',
                padding: '3px 20px',
                clear: 'both',
                fontWeight: '400',
                lineHeight: '1.42857143',
                color: '#333',
                whiteSpace: 'nowrap'
            }
            
            if (userStore.updates.value.userId === this.props.data.userId) {
                options.push((
                    <li><a className="clickable hoverable" style={aStyle} onClick={this.handleDeleteClick}><i className="fa fa-trash"></i> Delete Log Entry</a></li>
                ));
                options.push((
                    <li><a className="clickable hoverable" style={aStyle} onClick={this.handleEditActionClick}><i className="fa fa-pencil"></i> Edit Action</a></li>
                ));
                options.push((
                    <li><a className="clickable hoverable" style={aStyle} onClick={this.handleEditDetailsClick}><i className="fa fa-pencil"></i> Edit Details</a></li>
                ));
                options.push((
                    <li><a className="clickable hoverable" style={aStyle} onClick={this.handleEditDurationClick}><i className="fa fa-pencil"></i> Edit Duration</a></li>
                ));
            }
            
            if (options.length === 0) {
                return null;   
            }
            var data = this.props.data;
            
            return (
                <div id={"dropdown-" + data.id} style={style}>
                    <ul style={listStyle}>
                        {options}
                    </ul>
                </div>    
            );
        },
        render: function () {
            var data = this.props.data;

            var upvoteCounter, commentCounter;
            
            if (data.upvotes && data.upvotes.length > 0) {
                upvoteCounter = (<span>{data.upvotes.length + ' ' + doozy.formatNoun('Cheer', data.upvotes.length)}</span>);
            }
                                 
            if (data.comments && data.comments.length > 0) {
                commentCounter = (<span className="clickable" onClick={this.handleCommentClick}>{(upvoteCounter ? ' - ' : '') + data.comments.length + ' ' + doozy.formatNoun('Comment', data.comments.length)}</span>);
            }
            
            /**
             * Inline Styles
             */
            var logEntryBoxStle = {
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#fff',
                padding: '5px',
                borderRadius: '4px',
                marginBottom: '5px'
            }
            
            var logEntryActionsStyle = {
                display: 'flex',
                flexDirection: 'row',
                backgroundColor: '#b2b2b2',
                borderBottomLeftRadius: '4px',
                borderBottomRightRadius: '4px'
            }
            
            var cheerButtonStyle = {
                borderRadius: '0',
                flexGrow: '1',
                paddingTop: '3px', 
                paddingBottom: '3px', 
                color: '#fff', 
                backgroundImage: 'none', 
                backgroundColor: '#444', 
                borderColor: '#222', 
                fontWeight: 'bold', 
                outlineColor: 'rgb(40, 40, 40)',
                
                borderBottomLeftRadius: '4px'
            };
            
            var heartColorStyle = {
                color: 'rgb(250, 133, 133)'
            };
            
            var commentButtonStyle = {
                borderRadius: '0',
                flexGrow: '1',
                paddingTop: '3px', 
                paddingBottom: '3px', 
                color: '#fff', 
                backgroundImage: 'none', 
                backgroundColor: '#444', 
                borderColor: '#222', 
                fontWeight: 'bold', 
                outlineColor: 'rgb(40, 40, 40)',
                
                borderLeft: '0',
                borderBottomRightRadius: '4px'
            };
            
            var pencilColorStyle = {
                color: '#e2ff63'
            };
            
            var duration;
            if (data.duration) {
                duration = new babble.Duration(data.duration * 60000).toString();   
            }
            
            return (
                <article key={data.id} style={logEntryBoxStle}>
                    <div>
                        <header style={{display: 'flex', flexDirection: 'row'}}>
                            <div style={{minWidth: '45px', paddingRight: '5px'}}><img style={{maxHeight: '45px', padding: '2px'}} src={this.props.data.profileUri} /></div>
                            <div style={{flexGrow: '1'}}>
                                <div>
                                    <span style={{fontWeight: 'bold'}}>{this.props.data.knownAs}</span> {data.entry} <span style={{fontWeight: 'bold'}}>{data.actionName}</span>
                                </div>
                                <div>
                                    <small>
                                        <RelativeTime accuracy="d" isoTime={data.date} />
                                        <span>{(data.duration ? ' for ' : '')}</span>
                                        <ContentEditable ref="logduration" html={duration} onChange={this.handlers.durationChange} />
                                    </small>
                                </div>
                            </div>
                            <i ref="dropDown" style={{ color: '#b2b2b2' }} className="fa fa-chevron-down" onClick={this.handleDropDownClick}></i>
                        </header>
                        <div style={{ padding: '5px' }}>
                            <ContentEditable ref="logdetails" html={data.details} onChange={this.handlers.detailsChange} />
                        </div>
                    </div>
                    <footer style={{display: 'flex', flexDirection: 'column'}}>
                        <div>
                             {upvoteCounter}
                             {commentCounter}
                        </div>
                        <div style={logEntryActionsStyle}>
                            <button type="button" className="btn" style={cheerButtonStyle} onClick={this.handleUpvoteClick}><i className="fa fa-heart" style={heartColorStyle}></i> Cheer
                        </button>
                            <button type="button" className="btn" style={commentButtonStyle} onClick={this.handleCommentClick}><i className="fa fa-pencil" style={pencilColorStyle}></i> Comment
                        </button>
                        </div>
                    </footer>
                </article>
            );
        }
    });
}));