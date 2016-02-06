(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('mixins/LayeredComponentMixin'),
        require('./RelativeTime'),
        require('components/ContentEditable'),
        require('stores/host'),
        require('stores/logentry-store'),
        require('app/doozy'),
        require('babble'),
        require('hl-common-js/src/EventHandler'),
        require('jquery'),
        require('components/TagList')
    );
}(function (React, LayeredComponentMixin, RelativeTime, ContentEditable, host, logEntryStore, doozy, babble, EventHandler, $, TagList) {
    /* globals window */
    var LogEntryBox = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        mixins: [LayeredComponentMixin],

        getInitialState: function () {
            return {
                isDropDownOpen: false
            };
        },

        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
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
                $(window).on('click.Bst', this.handleOutsideClick);
            }
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleOutsideClick: function (event) {
            var $win = $(window);
            var $box = $('#dropdown-' + this.props.data.id);

            if (typeof this.refs.dropDown === 'undefined') {
                $win.off('click.Bst', this.handleOutsideClick);
                return;
            }

            // handle click outside of the dropdown
            var $toggle = $(this.refs.dropDown.getDOMNode());
            if ($box.has(event.target).length === 0 && !$toggle.is(event.target) && !$box.is(event.target)) {
                this.setState({
                    isDropDownOpen: false
                });
                $win.off('click.Bst', this.handleOutsideClick);
            }
        },
        handleDeleteClick: function () {
            logEntryStore.destroy(this.props.data);
        },
        handleEditActionClick: function () {
            this.setState({
                isDropDownOpen: false
            });
            host.go('/doozy/action/' + this.props.data.actionId);
        },
        handleEditLogEntryClick: function () {
            this.setState({
                isDropDownOpen: false
            });
            host.go('/doozy/logentry/' + this.props.data.id);
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
            var logEntry = Object.assign({}, this.props.data);
            logEntry.details = details;
            logEntryStore.update(logEntry);
        },
        handleDurationChange: function (duration) {
            var logEntry = Object.assign({}, this.props.data);
            logEntry.duration = duration;
            logEntryStore.update(logEntry);
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
            }

            var data = this.props.data;
            var options = [];

            options.push((
                <li><a className="clickable hoverable" style={styles.userOptionsItem} onClick={this.handleDeleteClick}><i className="fa fa-trash"></i> Delete Log Entry</a></li>
            ));
            options.push((
                <li><a className="clickable hoverable" style={styles.userOptionsItem} onClick={this.handleEditLogEntryClick}><i className="fa fa-pencil"></i> Edit Entry</a></li>
            ));
            if (data.actionId) {
                options.push((
                    <li><a className="clickable hoverable" style={styles.userOptionsItem} onClick={this.handleEditActionClick}><i className="fa fa-pencil"></i> Edit Action</a></li>
                ));
            }
            options.push((
                <li><a className="clickable hoverable" style={styles.userOptionsItem} onClick={this.handleEditDetailsClick}><i className="fa fa-pencil"></i> Edit Details</a></li>
            ));
            options.push((
                <li><a className="clickable hoverable" style={styles.userOptionsItem} onClick={this.handleEditDurationClick}><i className="fa fa-pencil"></i> Edit Duration</a></li>
            ));

            return (
                <div id={'dropdown-' + data.id} style={styles.userOptionsDropdown(this)}>
                    <ul style={styles.userOptionsList}>
                        {options}
                    </ul>
                </div>
            );
        },
        render: function () {
            var duration, typeOfLogEntry;
            var data = this.props.data;
            var knownAs = 'You'; // data.knownAs
            // var profilePic = <div style={{minWidth: '45px', paddingRight: '5px'}}><img style={{maxHeight: '45px', padding: '2px'}} src={this.props.data.profileUri} /></div>;

            if (data.duration) {
                duration = new babble.Duration(data.duration * 60000).toString();
            }

            if (data.actionName && data.actionName.length > 0) {
                typeOfLogEntry = ([
                    <span style={{fontWeight: 'bold'}}>
                        {knownAs}
                    </span>,
                    <span>
                        {' ' + data.entry + ' '}
                    </span>,
                    <span style={{fontWeight: 'bold'}}>
                        {data.actionName}
                    </span>
                ]);
            }
            else {
                typeOfLogEntry = ([
                    <span style={{fontWeight: 'bold'}}>{knownAs}</span>,
                    <span>{' logged an entry'}</span>
                ]);
            }
            return (
                <article key={data.id} style={styles.logEntryBox}>
                    <div>
                        <header style={{display: 'flex', flexDirection: 'row'}}>
                            <div style={{flexGrow: '1'}}>
                                <div>
                                    {typeOfLogEntry}
                                </div>
                                <small>
                                    <RelativeTime accuracy="d" isoTime={data.date} />
                                    <span>{(data.duration ? ' for ' : '')}</span>
                                    <ContentEditable ref="logduration" html={duration} onChange={this.handlers.durationChange} />
                                </small>
                            </div>
                            <TagList tags={data.tags}
                                selectedTags={data.tags} />
                            <i ref="dropDown" style={{ color: '#b2b2b2' }} className="fa fa-chevron-down" onClick={this.handleDropDownClick}></i>
                        </header>
                        <div>
                            <div style={{ padding: '5px', fontSize: '1.8em' }}>
                                <ContentEditable ref="logdetails" html={data.details} onChange={this.handlers.detailsChange} />
                            </div>
                        </div>
                    </div>
                </article>
            );
        }
    });


    /**
     * Inline Styles
     */
    var styles = {
        logEntryBox: {
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#fff',
            padding: '5px',
            borderRadius: '4px',
            marginBottom: '5px'
        },
        logEntryActions: {
            display: 'flex',
            flexDirection: 'row',
            backgroundColor: '#b2b2b2',
            borderBottomLeftRadius: '4px',
            borderBottomRightRadius: '4px'
        },
        userOptionsDropdown: function (component) {
            return {
                position: 'absolute',
                top: $(component.refs.dropDown.getDOMNode()).offset().top + 22 + 'px',
                padding: '5px',
                backgroundColor: '#fff',
                minWidth: '100%',
                borderRadius: '4px',
                border: '2px solid #e0e0e0',
                boxShadow: '0 0 10px #000000'
            };
        },
        userOptionsList: {
            listStyle: 'none',
            margin: '0',
            padding: '0'
        },
        userOptionsItem: {
            fontSize: '20px',
            display: 'block',
            padding: '3px 20px',
            clear: 'both',
            fontWeight: '400',
            lineHeight: '1.42857143',
            color: '#333',
            whiteSpace: 'nowrap'
        }
    };

    return LogEntryBox;
}));
