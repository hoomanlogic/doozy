var ActionRow = React.createClass({
    mixins: [React.addons.PureRenderMixin],
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
                return name.length > 2 && name !== this.props.action.name;
            }.bind(this))
            .distinctUntilChanged()
            .subscribe(this.handleNameChange);
       
        this.handlers = {
            nameChange: nameChange
        };
    },
    componentDidMount: function() {
        window.addEventListener('resize', this.handleResize);
    },
    
    componentWillUnmount: function () {
        this.handlers.nameChange.dispose();
        window.removeEventListener('resize', this.handleResize);
    },
    
    /*************************************************************
     * HELPERS
     *************************************************************/
    naturalDays: function (date) {
        if (!date) {
            return '';   
        }
        var date1 = new Date(date.toLocaleDateString());
        var date2 = new Date((new Date()).toLocaleDateString());
        var timeDiff = Math.abs(date2.getTime() - date1.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return hldatetime.daysOfWeek[date1.getDay()];
        } else {
            return diffDays + ' day' + (diffDays > 1 ? 's' : '') + ' ago';
        }
    },
    
    /*************************************************************
     * EVENT HANDLING
     *************************************************************/
    handleCheck: function(event) {
        if (ui.logAction && event.target.checked) {
            ui.logAction(this.props.action);
        } else {
            var result = prompt('Are you sure?');
            if (result && result.slice(0,1).toLowerCase() === 'y') {
                actionStore.toggle(this.props.action);
            }
        }
    },
    handleCheckTouch: function () {
        this.preventTouch = true;
    },
    handleClick: function(event) {
        ui.editAction(this.props.action);
    },
    handleTouchStart: function(event) {
        this.isTap = true;
    },
    handleTouchMove: function(event) {
        this.isTap = false;
    },
    handleTouchEnd: function(event) {
        if (this.isTap && !this.preventTouch) {
            this.handleClick();
            event.preventDefault();
        }
        this.isTap = false;
        this.preventTouch = false;
    },
    handleNameChange: function (name) {
        actionStore.update({ actionRef: this.props.actionRef, state: { name: name } });
    },
    handleResize: function(e) {
        this.setState({windowWidth: window.innerWidth});
    },
    
    /*************************************************************
     * RENDERING
     *************************************************************/
    render: function () {
        var checked = this.props.actionRetire !== null || (this.props.actionLastPerformed !== null && (this.props.actionNextDate === null || this.props.actionNextDate > new Date()));
        
        var title = '';
        
        var details = null;
        var repeats = null;
        
        if (this.props.action.content && this.props.action.content.length > 0) {
            details = <span> <i className="fa fa-paperclip" title={this.props.action.content}></i></span>;
        }
        if (this.props.action.recurrenceRules && this.props.action.recurrenceRules.length > 0) {
            repeats = <span> <i className="fa fa-repeat" title={getRecurrenceSummary(this.props.action.recurrenceRules)}></i></span>;
        }
        
        var minutesTally = 0;
        if (this.props.action.logEntries === void 0) {
            title = this.props.actionLastPerformed;
        } else {
            var performedCount = 0;
            var earliestDate = null;
            var latestDate = null;
            for (var i = 0; i < this.props.action.logEntries.length; i++) {
                var duration = this.props.action.logEntries[i].duration || 0;
                minutesTally += duration;
                if (this.props.action.logEntries[i].entry === 'performed') {
                    earliestDate = earliestDate === null ? this.props.action.logEntries[i].date : (earliestDate > this.props.action.logEntries[i].date ? this.props.action.logEntries[i].date : earliestDate);
                    latestDate = latestDate === null ? this.props.action.logEntries[i].date : (latestDate < this.props.action.logEntries[i].date ? this.props.action.logEntries[i].date : latestDate);
                }
                title += this.props.action.logEntries[i].entry + (duration ? (' for ' + duration + 'm ') : '') + ' on ' + 
                    this.props.action.logEntries[i].date.toLocaleDateString() + ' (' + this.naturalDays(this.props.action.logEntries[i].date) + ') ' +
                    (this.props.action.logEntries[i].details ? ': ' + this.props.action.logEntries[i].details : '') + 
                    '\n';   
            }
            if (minutesTally) {
                var numWeeks = hldatetime.dayDiff(earliestDate, latestDate) / 7;
                title = 'Average minutes per week: ' + String(minutesTally / numWeeks) + '\n\n' + title;
            }
        }
        
        return (
            <tr className={'highlight-hover' + (checked ? ' done' : '')} onDoubleClick={this.handleClick} onTouchStart={this.handleTouchStart} onTouchMove={this.handleTouchMove} onTouchEnd={this.handleTouchEnd}>
                <td width="5px" style={{padding: '0 0 0 5px'}}><input style={{height: '18px', width: '18px'}} type="checkbox" onChange={this.handleCheck} onTouchStart={this.handleCheckTouch} checked={checked} /></td>
                <td>
                    <ContentEditable html={this.props.actionName} onChange={this.handlers.nameChange} />
                    {details}
                    {repeats}
                </td>
                <td hidden={this.state.windowWidth < 600 ? true : false} title={title}>{this.props.actionLastPerformed ? this.naturalDays(this.props.actionLastPerformed) : ''}</td>
            </tr>
        );
    },
});