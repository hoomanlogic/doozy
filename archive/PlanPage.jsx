var PlanPage = React.createClass({
    componentDidMount: function () {
        $(document).keyup( function (e) {
            if (e.which == 37) { 
                this.previousDay();
            } else if (e.which == 39) {
                this.nextDay();
            } else if (e.which == 38) {
                this.previousMonth();
            } else if (e.which == 40) {
                this.nextMonth();
            }
        }.bind(this));  
    },
    getInitialState: function () {
        return { currentView: 'Weekly', bucket: [] };
    },
    render: function () {
        // props
        var weekStart = this.props.weekStart;
        var weather = this.props.weather;

        // calcs
        var view = null;
        if (this.state.currentView === 'Weekly') {
            view = (<WeeklyPlan weather={weather} weekStart={weekStart} />);
        } else if (this.state.currentView === 'Monthly') {
            view = (<MonthlyPlan weather={weather} weekStart={weekStart} />);
        } else if (this.state.currentView === 'Daily') {
            view = (
                <div>
                    <div style={{paddingBottom: '5px'}}>
                        <button type="button" className="btn btn-primary" onClick={this.previousDay}><i className="fa fa-minus"></i></button>
                        <div style={{display: 'inline-block', maxWidth: '100%'}}><div style={{width: '100%', textAlign: 'center'}}>{date.toDateString()}</div></div>
                        <button type="button" className="btn btn-primary pull-right" onClick={this.nextDay}><i className="fa fa-plus"></i></button>
                        <DurationStatusBar totalMinutes={now.action.getDuration()} minutesRemaining={now.timeLeft} />
                    </div>
                    <FlowView todaysActions={today} activeAction={now.action} editAction={this.props.editAction} />
                </div>
            );
        } else if (this.state.currentView === 'Projects') {
            var projects = _.where(this.props.actions, { kind: 'Project' });
            view = (
                <div>
                {projects.map(function(item, index) {
                    return (<div>{item.name}</div>);
                }.bind(this))}
                </div>
            );
        } else if (this.state.currentView === 'Action Modeler') {
            view = (
                <div>
                    <button type="button" className="btn btn-default" onClick={this.addObjective}><i className="fa fa-plus"> Project</i></button>
                    <button type="button" className="btn btn-default" onClick={this.addFlow}><i className="fa fa-plus"> Flow</i></button>
                    <button type="button" className="btn btn-default" onClick={this.addToDo}><i className="fa fa-plus"> To Do</i></button>
                    <button type="button" className="btn btn-success pull-right" onClick={this.saveActions}><i className="fa fa-save"> Save All</i></button>
                    <TreeView data={this.state.bucket} handleChange={this.handleChange} />
                </div>
            );
        }

        // html
        return (
            <div>
                <div className="action-bar">
                    <ul className="nav navbar-nav">
                        <li id="plannav1" className={this.state.currentView === 'Monthly' ? 'active' : ''}><a href="javascript:;" onClick={this.goTo.bind(null, 'Monthly')}>Monthly</a></li>
                        <li id="plannav2" className={this.state.currentView === 'Weekly' ? 'active' : ''}><a href="javascript:;" onClick={this.goTo.bind(null, 'Weekly')}>Weekly</a></li>
                        <li id="plannav3" className={this.state.currentView === 'Daily' ? 'active' : ''}><a href="javascript:;" onClick={this.goTo.bind(null, 'Daily')}>Daily</a></li>
                        <li id="plannav4" className={this.state.currentView === 'Agenda' ? 'active' : ''}><a href="javascript:;" onClick={this.goTo.bind(null, 'Agenda')}>Agenda</a></li>
                        <li id="plannav5" className={this.state.currentView === 'Projects' ? 'active' : ''}><a href="javascript:;" onClick={this.goTo.bind(null, 'Projects')}>Projects</a></li>
                        <li id="plannav6" className={this.state.currentView === 'Action Modeler' ? 'active' : ''}><a href="javascript:;" onClick={this.goTo.bind(null, 'Action Modeler')}>Action Modeler</a></li>
                    </ul>
                </div>
                {view}
            </div>
        );
    },
    goTo: function (view) {
        this.setState({ currentView: view });
    },
    handleChange: function () {
        this.setState({ bucket: this.state.bucket });
    },
    addObjective: function () {
        this.state.bucket.push(new Project('New Project'));
        this.handleChange();
    },
    addFlow: function () {
        this.state.bucket.push(new Flow('New Flow'));
        this.handleChange();
    },
    addToDo: function () {
        this.state.bucket.push(new ToDo('New To-Do'));
        this.handleChange();
    },
    saveActions: function () {
        this.props.postActions(this.state.bucket);
        this.setState({ bucket: [] });
    },
    previousDay: function () {
        this.state.date.setDate(this.state.date.getDate() - 1);
        this.setState( { date: this.state.date } );
    },
    nextDay: function () {
        this.state.date.setDate(this.state.date.getDate() + 1);
        this.setState( { date: this.state.date } );
    },
    previousMonth: function () {
        this.state.date.setMonth(this.state.date.getMonth() - 1);
        this.setState( { date: this.state.date } );
    },
    nextMonth: function () {
        this.state.date.setMonth(this.state.date.getMonth() + 1);
        this.setState( { date: this.state.date } );
    },
});