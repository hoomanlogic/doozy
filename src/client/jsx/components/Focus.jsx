var Focus = React.createClass({
    render: function () {
        var item = this.props.data;
        
        var classNames = 'focus';
        var focus = null;
        var verbage = null;
        
        var startsWithAVowel = function (word) {
            if (['a','e','i','o','u'].contains(word[0].toLowerCase())) {
                return true;
            } else {
                return false;
            }
        };
        
        var hasPossessiveNoun = function (words) {
            if (words.indexOf('\'s ') > 0) {
                return true;
            } else {
                return false;
            }
        };
        
        if (item.kind === 'Role') {
    
            if (hasPossessiveNoun(item.name)) {
                verbage = 'You\'re ' + item.name;
            } else {
                verbage = 'You\'re ' + (startsWithAVowel(item.name) ? 'an' : 'a') + ' ' + item.name;
            }
            
        } else if (item.kind === 'Path') {
            verbage = 'You\'re on a path of ' + item.name;
        }
        
        var lastDate = new Date(item.latestEntry ? item.latestEntry.date : item.enlist);
        var lastDone = this.naturalDays(lastDate);
        
        focus = (
            <a onClick={this.handleFocusClicked.bind(null, item)} style={{borderBottom: '1px solid #e0e0e0', paddingTop: '3px', paddingBottom: '3px'}}>
                <div className="focus">
                    <img style={{display: 'inline', verticalAlign: 'inherit'}} src={item.iconUri} />
                    <div style={{display: 'inline-block'}}>
                        <div>{verbage}</div>
                        <div>{'last acted ' + lastDone}</div>
                    </div>
                </div>
            </a>
        );

        return (
            <li key={item.id}>
                {focus}
            </li>
        );
    },
    handleFocusClicked: function (item) {
        if (this.props.handleFocusClicked) {
            this.props.handleFocusClicked(item);
        }
    },
    naturalDays: function (date) {
        if (!date) {
            return '';   
        }
        var date1 = new Date(date.toLocaleDateString());
        var date2 = new Date((new Date()).toLocaleDateString());
        var timeDiff = Math.abs(date2.getTime() - date1.getTime());
        var diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));
        if (diffDays === 0) {
            return 'today';
        } else if (diffDays === 1) {
            return 'yesterday';
        } else {
            return diffDays + ' day' + (diffDays > 1 ? 's' : '') + ' ago';
        }
        
    }
});