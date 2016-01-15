(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('react/addons'),
        require('components/ContentEditable'),
        require('./RelativeTime'),
        require('app/doozy'),
        require('stores/action-store'),
        require('hl-common-js/src/EventHandler')
    );
}(function (React, addons, ContentEditable, RelativeTime, doozy, actionStore, EventHandler) {
    var ActionRow = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        mixins: [addons.PureRenderMixin],
        propTypes: {
            // required
            action: React.PropTypes.object.isRequired,
            actionName: React.PropTypes.string.isRequired,

            // optional
            actionLastPerformed: React.PropTypes.string,
            actionNextDate: React.PropTypes.string,
            overrideIsDone: React.PropTypes.bool,
        },

        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        getInitialState: function () {
            return {
                windowWidth: window.innerWidth
            };
        },

        componentWillMount: function () {
            var nameChange = EventHandler.create();
            nameChange
                .map(function (event) {
                    return event.target.value;
                })
                .throttle(1000)
                .filter(function (name) {
                    return name.length > 2 && name !== this.props.actionName;
                }.bind(this))
                .distinctUntilChanged()
                .subscribe(this.handleNameChange);

            this.handlers = {
                nameChange: nameChange
            };
            window.addEventListener('resize', this.handleResize);
        },

        componentWillUnmount: function () {
            this.handlers.nameChange.dispose();
            window.removeEventListener('resize', this.handleResize);
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleCheck: function (event) {
            if (event.target.checked) {
                window.location.href = '/doozy/logentries/new/' + this.props.action.id;
            }
        },
        handleCheckTouch: function () {
            this.preventTouch = true;
        },
        handleClick: function () {
            window.location.href = '/doozy/action/' + this.props.action.id;
        },
        handleTouchStart: function () {
            this.isTap = true;
        },
        handleTouchMove: function () {
            this.isTap = false;
        },
        handleTouchEnd: function (event) {
            if (this.isTap && !this.preventTouch) {
                this.handleClick();
                event.preventDefault();
            }
            this.isTap = false;
            this.preventTouch = false;
        },
        handleNameChange: function (name) {
            actionStore.update({
                id: this.props.action.id,
                name: name
            });
        },
        handleResize: function () {
            this.setState({collapse: window.innerWidth < 600 ? true : false});
        },

        /*************************************************************
         * CALCULATIONS
         *************************************************************/
        calcIsDone: function () {
            if (typeof this.props.overrideIsDone !== 'undefined' && this.props.overrideIsDone !== null) {
                return this.props.overrideIsDone;
            }
            else {
                return this.props.actionLastPerformed !== null && (this.props.actionNextDate === null || new Date(this.props.actionNextDate) > new Date());
            }
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            var details,
                isDone,
                repeats,
                actionNameStyle;

            isDone = this.calcIsDone();

            if (isDone) {
                actionNameStyle = {
                    color: '#8e8e8e',
                    textDecoration: 'line-through'
                };
            }

            /**
             * Render icon to signify that there are details attached to this action
             */
            if (this.props.action.content && this.props.action.content.length > 0) {
                details = (
                    <span> <i className="fa fa-paperclip" title={this.props.action.content}></i></span>
                );
            }

            /**
             * Render icon to signify that the action is repetitious
             */
            if (this.props.action.recurrenceRules && this.props.action.recurrenceRules.length > 0) {
                repeats = (
                    <span> <i className="fa fa-repeat" title={doozy.getRecurrenceSummary(this.props.action.recurrenceRules)}></i></span>
                );
            }


            return (
                <tr style={{fontSize: '1.4em'}} className={'highlight-hover'} onDoubleClick={this.handleClick} onTouchStart={this.handleTouchStart} onTouchMove={this.handleTouchMove} onTouchEnd={this.handleTouchEnd}>
                    <td width="5px" style={{padding: '0 0 0 5px'}}><input style={{height: '24px', width: '24px'}} type="checkbox" onChange={this.handleCheck} onTouchStart={this.handleCheckTouch} checked={isDone} /></td>
                    <td>
                        <ContentEditable style={actionNameStyle} html={this.props.actionName} onChange={this.handlers.nameChange} />
                        {details}
                        {repeats}
                    </td>
                    <td width="150px" hidden={this.state.collapse}><RelativeTime accuracy="d" isoTime={this.props.actionLastPerformed} /></td>
                </tr>
            );
        }
    });
    return ActionRow;
}));
