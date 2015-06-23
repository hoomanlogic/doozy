// CommonJS, AMD, and Global shim
(function (factory) {
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
        window.ManagePreferences = factory(window.React);
    }
}(function (React) {
    'use strict';
    return React.createClass({
        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        componentWillMount: function () {
            /**
             * Subscribe to User Store to be 
             * notified of updates to the store
             */
            this.userObserver = userStore.updates
                .subscribe(this.handleUserStoreUpdate);
            
        },
        componentWillUnmount: function () {
            /**
             * Clean up objects and bindings
             */
            this.userObserver.dispose();
        },
        
        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleNotifySubscriptionClick: function () {
            if (doozyNotifications.isPushEnabled) {
              doozyNotifications.unsubscribe();
            } else {
              // Disable the button so it can't be changed while
              // we process the permission request
              //var pushButton = document.querySelector('.js-push-button');
              //pushButton.disabled = true;
              doozyNotifications.subscribe();
            }
        },
        handleCancelClick: function () {
            this.setState({ page: 'Do' });
        },
        handleSavePreferencesClick: function () {

            userStore.updatePrefs({
                email: this.refs.prefsEmail.getDOMNode().value,
                emailNotifications: this.refs.prefsEmailNotifications.getDOMNode().value,
                weekStarts: parseInt(this.refs.prefsWeekStarts.getDOMNode().value),
                location: this.refs.prefsLocation.getDOMNode().value,
                knownAs: this.refs.prefsKnownAs.getDOMNode().value
            });

            this.setState({ page: 'Do' });
        },
        
        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {

            var prefs = userStore.updates.value;
            
            /**
             * Inline Styles
             */
            var buttonStyle = {
              display: 'block',
              width: '100%',
              marginBottom: '5px',
              fontSize: '1.1rem'
            };
            
            // html
            return (
                <div style={{padding: '5px'}}>
                    <form role="form">
                        <ProfilePic uri={prefs.profileUri} />
                        <div className="form-group">
                            <label htmlFor="prefs-location">What name should others know you by?</label>
                            <input id="prefs-location" ref="prefsKnownAs" type="text" className="form-control" placeholder="eg. Smokey the Bear" defaultValue={prefs.knownAs} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="prefs-location">Where do you live?</label>
                            <input id="prefs-location" ref="prefsLocation" type="text" className="form-control" placeholder="eg. Boulder, CO" defaultValue={prefs.location} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="prefs-email">What's your email address?</label>
                            <input id="prefs-email" ref="prefsEmail" type="text" className="form-control" placeholder="" defaultValue={prefs.email} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="prefs-week-starts">Which day does your week start on?</label>
                            <select id="prefs-week-starts" ref="prefsWeekStarts" className="form-control" defaultValue={prefs.weekStarts}>
                                <option value="0">Sunday</option>
                                <option value="1">Monday</option>
                                <option value="2">Tuesday</option>
                                <option value="3">Wednesday</option>
                                <option value="4">Wednesday</option>
                                <option value="5">Friday</option>
                                <option value="6">Saturday</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="prefs-email-notifications">Receive email notifications?</label>
                            <input id="prefs-email-notifications" ref="prefsEmailNotifications" type="checkbox" className="form-control" defaultChecked={prefs.emailNotifications} />
                        </div>
                        <button type="button" className="btn btn-primary" onClick={this.handleNotifySubscriptionClick}>Subscribe</button>        
                
                        <button style={buttonStyle} type="button" className="btn btn-primary" onClick={this.handleSavePreferencesClick}>Save Changes</button>
                        <button style={buttonStyle} type="button" className="btn btn-default" onClick={this.handleCancelClick}>Cancel</button>
                    </form>
                </div>
            );
        }
    });
 }));