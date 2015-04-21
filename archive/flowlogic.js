var calculateNow = function () {

	// cannot calculate until we actually have a list of actions
	if (actionStore.updates.value === null) {
		return;
	}

	// props
	var date = this.props.date;

	// calcs
	var today = calculateOccurs(actionStore.updates.value, date);
	var currentDateTime = new Date();
	var now = {
		time: currentDateTime,
		minuteOfDay: (currentDateTime.getHours() * 60) + currentDateTime.getMinutes(),
		action: null,
		timeLeft: null
	};
	var beforeNow = null;
	var afterNow = null;

	// calculate what block/flow we're in and how many minutes left in it
	for (var i = 0; i < today.length; i++) {
		if (today[i].startAt <= now.minuteOfDay && now.minuteOfDay <= (today[i].startAt + today[i].getDuration())) {
			if (now.action !== today[i]) {
				now.action = today[i];
				now.timeLeft = (today[i].startAt + today[i].getDuration()) - now.minuteOfDay;
			}
			break;
		} else if ((today[i].startAt + today[i].getDuration()) < now.minuteOfDay) {
			if (beforeNow === null || (today[i].startAt + today[i].getDuration()) > (beforeNow.startAt + beforeNow.getDuration())) {
				beforeNow = today[i];
			}
		} else if (now.minuteOfDay < today[i].startAt) {
			if (afterNow === null || today[i].startAt < afterNow.startAt) {
				afterNow = today[i];
			}
		}
	};

	// in-between blocks / flows
	if (typeof now.action === 'undefined') {
		now.action = new Block('Free Time', []);
		if (beforeNow !== null) {
			now.action.startAt = beforeNow.startAt + beforeNow.getDuration();
		} else {
			now.action.startAt = 0;
		}
		if (afterNow !== null) {
			now.action.duration = afterNow.startAt - now.action.startAt;;
		} else {
			now.action.duration = 1440 - now.action.startAt;
		}
		now.timeLeft = (now.action.startAt + now.action.getDuration()) - now.minuteOfDay;
	}

	// set
	this.setState({ now: now });
};