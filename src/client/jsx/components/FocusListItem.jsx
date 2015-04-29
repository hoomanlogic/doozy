var FocusListItem = React.createClass({
    /*************************************************************
     * EVENT HANDLING
     *************************************************************/
    handleFocusClick: function (item) {
        if (this.props.handleFocusClick) {
            this.props.handleFocusClick(item);
        }
    },
    
    /*************************************************************
     * CALCULATIONS
     *************************************************************/
    calcFocusTitle: function (focus) {
        if (focus.kind === 'Role') {
            if (hasPossessiveNoun(focus.name)) {
                return 'You\'re ' + focus.name;
            } else {
                return 'You\'re ' + (startsWithAVowel(focus.name) ? 'an' : 'a') + ' ' + focus.name;
            }
        } else if (focus.kind === 'Path') {
            return 'You\'re on a path of ' + focus.name;
        }
    },
    
    /*************************************************************
     * RENDERING
     *************************************************************/
    render: function () {
        var data = this.props.data;
        var lastDate = new Date(data.latestEntry ? data.latestEntry.date : data.enlist);
        var lastDone = calcNaturalDays(lastDate);
        
        return (
            <li key={data.id}>
                <a onClick={this.handleFocusClick.bind(null, data)} style={{borderBottom: '1px solid #e0e0e0', paddingTop: '3px', paddingBottom: '3px'}}>
                    <div className="focus">
                        <img style={{display: 'inline', verticalAlign: 'inherit'}} src={data.iconUri} />
                        <div style={{display: 'inline-block'}}>
                            <div>{this.calcFocusTitle(data)}</div>
                            <div>{'last acted ' + lastDone}</div>
                        </div>
                    </div>
                </a>
            </li>
        );
    }
});