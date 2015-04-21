    editTarget: function (target) {
        this.refs.addedittarget.edit(target);
    },
    addTarget: function () {
        var target = { tagName: '', kind: null, goal: null, timeline: null };
        this.refs.addedittarget.add(target);
    },