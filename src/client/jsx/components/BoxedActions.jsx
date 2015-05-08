/** @jsx React.DOM */

// CommonJS, AMD, and Global shim
(function (root, factory) {
    'use strict';
	if (typeof exports === "object") {
		// CommonJS
		module.exports = exports = factory(
            require('react'),
            require('./ActionRow')
        );
	}
	else if (typeof define === "function" && define.amd) {
		// AMD
		define([
            'react',
            './ActionRow'
        ], factory);
	}
	else {
		// Global (browser)
		root.BoxedActions = factory(root.React, root.ActionRow);
	}
}(this, function (React, ActionRow) {
    'use strict';
    return React.createClass({
        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        getInitialState: function () {
            var boxTags = this.getBoxTags(this.props.actions);
            var boxes = this.getBoxes(boxTags, this.props.actions);

            return {
                boxes: boxes
            };
        },

        componentWillReceiveProps: function (nextProps) {
            var nextBoxTags = this.getBoxTags(nextProps.actions);
            var boxTags = [];
            for (var i = 0; i < this.state.boxes.length; i++) {
                boxTags.push(this.state.boxes[i].box);
            }
            if (nextBoxTags.sort().join(',') !== boxTags.sort().join(',') || nextProps.actions.length !== this.props.actions.length) {
                var nextBoxes = this.getBoxes(nextBoxTags, nextProps.actions);
                this.setState({ boxes: nextBoxes });
            }
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleBoxTitleClick: function (box) {
            box.expanded = !box.expanded;
            this.setState({ boxes: this.state.boxes });
        },

        /*************************************************************
         * CALCULATIONS
         *************************************************************/
        getBoxTags: function (actions) {
            // get distinct list of box tags
            var boxTags = [];
            actions.map(function(action) {
                boxTags = _.union(boxTags, _.filter(action.tags, function(tag) { return tag.slice(0,1) === '#'; }));
            });
            return boxTags;
        },
        getBoxes: function (boxTags, actions) {
            return boxTags.map( function (boxTag) {
                var boxActions = _.filter(actions, function(action) { return action.tags.indexOf(boxTag) > -1; });

                return { 
                    box: boxTag, 
                    actions: boxActions,
                    expanded: false
                };
            });  
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {

            if (this.state.boxes.length === 0) {
                return null;        
            }

            var boxesDom = null;
            boxesDom = this.state.boxes.map( function(box) {

                var boxActions = box.actions;
                boxActions = _.sortBy(boxActions, function(action){ return action.name.toLowerCase(); })

                if (boxActions.length === 0) {
                    return null;   
                }

                var list = null;
                if (box.expanded) {
                    list = (
                        <table className="table table-striped">
                            <tbody>                        
                                {boxActions.map(function(item, index) {
                                    return (
                                        <ActionRow key={item.ref || item.id} 
                                            action={item} 
                                            actionRef={item.ref} 
                                            actionId={item.id} 
                                            actionName={item.name}
                                            actionName={item.name}
                                            actionLastPerformed={item.lastPerformed} 
                                            actionNextDate={item.nextDate} />
                                    );
                                }.bind(this))}
                            </tbody>
                        </table>  
                    );
                }

                return (
                    <div key={box.box.substring(1)}>
                        <div className="table-title" onClick={this.handleBoxTitleClick.bind(null, box)}><i className={box.expanded ? 'fa fa-dropbox' : 'fa fa-cube'}></i>{box.box.substring(1)}</div>
                        {list}
                    </div> 
                );
            }.bind(this));
            // html
            return (
                <div>
                {boxesDom}
                </div>
            );
        }
    });
}));