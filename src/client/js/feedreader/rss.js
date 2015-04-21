//#region Field Level Variables
var serverpath = 'ws://www.lifehubz.com:8181/feedia'; // FOR PRODUCTION MODE
//var serverpath = 'ws://localhost:9191/feedia'; // FOR DEBUG MODE
var myFeeds;
var currentFeed;
//#endregion

//#region Initialize NewsFeed Client
function loadNewsFeedClient() {
    // For Feed Container Resizing 
    hookResize();

    // For Keyboard Navigation
    hookKeyboardEvents();

    // Hook Nav-Toggle Bar Click
    $("#lh-toggle-nav").click(function (e) {
        toggleNav();
    });

    // Hook Toolbar-Toggle Bar Click
    $("#lh-toggle-toolbar").click(function (e) {
        toggleToolbar();
    });

    // Hook Login Click
    $("#lh-login-button").click(function (e) {
        debug('Connecting to WebSocket');
        connect(serverpath);
    });

    // Hook Login Click
    $("#lh-logout-button").click(function (e) {
        status = "not connected";
        ws.close();
        clearEntries();
        clearFeeds();
        myFeeds = null;
        currentFeed = null;
        audioSettings = null;
        myAudioSources = new Array();
    });

    $("#lh-addfeed-button").click(function () {
        addFeedDialog();
    });

    $('#lh-showvideo').click(function (e) {
        showVideo();
    });
}
//#endregion

////#region Websocket Initalization\Connection
//var ws;

//var status = "not connected";

//function connect(host) {
//    // create WebSocket object
//    debug("Connecting to " + host + " ...");
//    try {
//        status = "connecting";
//        ws = new WebSocket(host, "msg"); // create the web socket
//    } catch (err) {
//        debug(err, 'error');
//    }
//    // hook onopen event
//    ws.onopen = function () {
//        debug("Connected... ", 'success'); // we are in! :D
//        status = "connected";
//        login($("#lh-login-username").val(), $("#lh-login-password").val());
//    };
//    //hook onclose event
//    ws.onclose = function () {
//        debug("Socket closed!", 'error'); // the socket was closed (this could be an error or simply that there is no server)
//        $("#lh-login").removeClass("loggedin");
//        if (status == "connecting") {
//            msgDialog("There was a problem connecting to the server");
//        }
//        if (status == "connected") {
//            msgDialog("The connection to the server was lost");

//        }
//        status = "not connected";

//        //TODO: eventually it will be more intelligent and not require having to clear just to avoid adding the same feeds to the list
//        // but for now, just clear it all
//        clearEntries();
//        clearFeeds();
//        myFeeds = null;
//        currentFeed = null;
//        audioSettings = null;
//        myAudioSources = new Array();
//    };
//    //hook onmessage event
//    ws.onmessage = function (evt) {
//        debug(evt.data, 'response'); // we got some data - show it omg!!
//        // convert the stringified json to an object
//        var json = evt.data;
//        var obj;
//        try {
//            obj = JSON.parse(json); //ok!
//        }
//        catch (e) {
//            alert(e);
//        }

//        if ('Success' in obj && 'Message' in obj && 'ResponseType' in obj) {
//            if (obj.Success == false) {
//                msgDialog(obj.Message);
//                return;
//            }
//            switch (obj.ResponseType) {
//                case "login":
//                    debug('logged in!');
//                    $("#lh-login").addClass("loggedin");
//                    myFeeds = obj.Feeds;
//                    for (var i1 = 0; i1 < obj.Feeds.length; i1++) {
//                        addFeed(obj.Feeds[i1]);
//                    }
//                    break;

//                case "getEntries":
//                    loadEntries(obj.FeedId, obj.Entries, obj.LatestUpdate);
//                    break;

//                case "updateEntries":
//                    insertNewEntries(obj.FeedId, obj.Entries, obj.LatestUpdate);
//                    break;

//                case "addFeedSubscription":
//                    myFeeds.push(obj.Feed);
//                    addFeed(obj.Feed);
//                    if (obj.NewFeedWasAdded) {
//                        obj.Feed.LatestUpdate = "1/1/1899 00:00:00";
//                        obj.Feed.Entries = new Array();
//                        msgDialog("Sorry, this feed is new to us. Please be patient while we gather the entries for this new feed. You will be automatically updated with the entries when they have become available.");
//                    }
//                    break;

//                default:
//                    if (obj.Message != "")
//                        msgDialog(obj.Message);
//            }
//        }
//    };
//};

//// function to send data on the web socket
//function ws_send(str) {
//    try {
//        ws.send(str);
//    } catch (err) {
//        debug(err, 'error');
//    }
//}
////#endregion

//#region Websocket Calls
function login(username, password) {
    ws_send("{ requestType: 'login', args: { username: '" + username + "', password: '" + password + "' } }");
    $("#lh-login-password").val(null);
}

function addFeedSubscription(url, name) {
    var response = new Object();
    response.requestType = "addFeedSubscription";
    response.args = new Object();
    response.args.url = url;
    response.args.name = name;

    // JSON available, and ready for use.
    ws_send(JSON.stringify(response));
}

function getEntries(feedId) {
    var response = new Object();
    response.args = new Object();
    response.args.feedId = feedId;

    if ('Entries' in getFeed(feedId)) {
        // send an update check for current feed but load up current entries in the meantime
        loadEntries(feedId);
        response.requestType = "updateEntries";
        response.args.LatestUpdate = currentFeed.LatestUpdate;
        ws_send(JSON.stringify(response));
    }
    else {
        response.requestType = "getEntries";
        ws_send(JSON.stringify(response));
    }
}

function setReadStatus(entryId, read) {
    getEntry(entryId).IsRead = read;
    ws_send("{ requestType: 'setReadStatus', args: { entryId: '" + entryId + "', read: '" + read + "' } }");
}

function setSavedStatus(entryId, saved) {
    getEntry(entryId).IsSaved = saved;
    ws_send("{ requestType: 'setSavedStatus', args: { entryId: '" + entryId + "', saved: '" + saved + "' } }");
}

function setCurrentPosition() {
    ws_send("{ requestType: 'setCurrentPosition', args: { entryId: '" + audioSettings.entryId + "', currentPosition: '" + audioSettings.currentPosition + "' } }");
}

function setThumbUp(entryId) {
    var entry = getEntry(entryId);
    entry.ThumbUp = true;
    entry.ThumbDown = false;
    ws_send("{ requestType: 'setThumbUp', args: { entryId: '" + entryId + "' } }");
}

function setThumbDown(entryId) {
    var entry = getEntry(entryId);
    entry.ThumbUp = false;
    entry.ThumbDown = true;
    ws_send("{ requestType: 'setThumbDown', args: { entryId: '" + entryId + "' } }");
}

function setNoThumb(entryId) {
    var entry = getEntry(entryId);
    entry.ThumbUp = false;
    entry.ThumbDown = false;
    ws_send("{ requestType: 'setNoThumb', args: { entryId: '" + entryId + "' } }");
}
//#endregion

//#region Zoom Functionality
var currentZoom = parseFloat(1);

function zoomIn() {
    // HACK: weird bug causes currentZoom to be 1.5999999999999999 instead of 1.6 when adding 0.2 to 1.4
    // it seems that every time I add/subtract I lose .0000000000000005 in the process
    if (currentZoom <= 4.8)
        currentZoom = Math.round((currentZoom + 0.2) * Math.pow(10, 1)) / Math.pow(10, 1);
    else if (currentZoom >= 5 && currentZoom < 10)
        currentZoom = Math.round((currentZoom + 1) * Math.pow(10, 1)) / Math.pow(10, 1);
    $("#lh-entries-zoom").css('zoom', currentZoom);
}

function zoomOut() {
    // HACK: weird bug causes currentZoom to be 1.5999999999999999 instead of 1.6 when adding 0.2 to 1.4
    // it seems that every time I add/subtract I lose .0000000000000005 in the process
    if (currentZoom >= 0.8 && currentZoom < 6)
        currentZoom = Math.round((currentZoom - 0.2) * Math.pow(10, 1)) / Math.pow(10, 1);
    else if (currentZoom >= 6)
        currentZoom = Math.round((currentZoom - 1) * Math.pow(10, 1)) / Math.pow(10, 1);
    $("#lh-entries-zoom").css('zoom', currentZoom);
}
//#endregion

//#region Entry Navigation
function hookKeyboardEvents() {
    $(document).keypress(function (e) {
        // if a dialog is open, the dialog eats the keypress
        if ($('#lh-dialog-overlay').length > 0) {
            if (destroyDialogOnKeyPress) {
                destroyDialogShell();
            }
            return;
        }

        // shortcuts optimized for a media center remote
        if (e.keyCode == 42) //*
        {
            toggleNav();
        }
        else if (e.keyCode == 48) //0
        {
            zoomOut();
        }
        else if (e.keyCode == 35) //#
        {
            zoomIn();
        }

        if (e.keyCode == 45 || e.keyCode == 44 || e.keyCode == 112) {
            // previous entry (do not expand)
            goToPreviousEntry();
        }
        else if (e.keyCode == 61 || e.keyCode == 46 || e.keyCode == 110) {
            // next entry ( do not expand)
            goToNextEntry();
        }
        else if (e.keyCode == 32 || e.keyCode == 13) {
            e.preventDefault();
            // if current entry is collapsed, expand, 
            // if next entry is out of view, scroll
            // else select next entry and expand it
            expandCurrentOrNext();
        }
    });
}

function goToPreviousEntry() {
    var entryId = getPreviousEntryId();
    if (entryId == null)
        return;
    selectEntry(entryId);
    keepSelectedItemInView();
}

function goToNextEntry() {
    var entryId = getNextEntryId();
    if (entryId == null)
        return;
    selectEntry(entryId);
    keepSelectedItemInView();
}

function expandCurrentOrNext() {
    var useStepperScroll = false;
    var entryId = getCurrentEntryId();
    if (entryId == null) {
        entryId = getNextEntryId();
        if (entryId == null)
            return;
        entryClicked(entryId);
    }
    else {
        if (isCollapsed(entryId)) {
            entryClicked(entryId);
        }
        else {
            entryId = getNextEntryId();
            if (entryId == null)
                return;

            // check if our current expanded is out of the bounds
            if (isEntryInView(entryId)) {
                entryClicked(entryId);
            }
            else {
                useStepperScroll = true;
                var scrollHeight = $('#lh-entries-container').height();
                var currentHeight = $("#lh-entries-container").scrollTop();
                $("#lh-entries-container").scrollTop(currentHeight + scrollHeight - (scrollHeight / 10));
            }
        }
    }
    // prevent space-bar scroll and manually scroll to selected entry
    if (useStepperScroll == false) {
        scrollToSelected();
    }
}

function isEntryInView(entryId) {
    return $("#entry-container-" + entryId).position().top < $('#lh-entries-container').height();
}

function getScrollCalculationAdjuster() {
    var adjuster = 1;
    if (currentZoom == 1.2)
        adjuster = 0;
    else if (currentZoom == 1.4)
        adjuster = 1;
    else if (currentZoom == 1.6)
        adjuster = 2;
    else if (currentZoom == 1.8)
        adjuster = 2;
    else if (currentZoom == 2)
        adjuster = 4;
    else if (currentZoom == 2.2)
        adjuster = 4;
    else if (currentZoom == 2.4)
        adjuster = 5;
    else if (currentZoom == 2.6)
        adjuster = 5;
    else if (currentZoom == 2.8)
        adjuster = 6;
    else if (currentZoom == 3)
        adjuster = 10;
    else if (currentZoom == 3.2)
        adjuster = 10;
    else if (currentZoom == 3.4)
        adjuster = 12;
    else if (currentZoom == 3.6)
        adjuster = 12;
    else if (currentZoom == 3.8)
        adjuster = 11;
    else if (currentZoom == 4.0)
        adjuster = 15
    else if (currentZoom == 4.2)
        adjuster = 18;
    else if (currentZoom == 4.4)
        adjuster = 18;
    else if (currentZoom == 4.6)
        adjuster = 19;
    else if (currentZoom == 4.8)
        adjuster = 20;
    else if (currentZoom == 5.0)
        adjuster = 24;
    else if (currentZoom == 6.0)
        adjuster = 36;
    else if (currentZoom == 7.0)
        adjuster = 54;
    else if (currentZoom == 8.0)
        adjuster = 65;
    else if (currentZoom == 9.0)
        adjuster = 80;
    else if (currentZoom == 10.0)
        adjuster = 99;
    return adjuster;
}

function scrollToSelected() {
    var scrollToHeight = 0;
    var adjuster = getScrollCalculationAdjuster();

    var $curr = $(".is-selected");
    while ($curr.prev().length > 0) {
        $curr = $curr.prev();
        scrollToHeight = scrollToHeight + Math.round($curr.height() * currentZoom) + adjuster;
    }
    $("#lh-entries-container").scrollTop(scrollToHeight);
}

function isEntryInViewPrevious(entryId) {
    return $("#entry-container-" + entryId).position().top < 0;
}

function keepSelectedItemInView() {
    if (isEntryInView(getCurrentEntryId())) {
        if (isEntryInViewPrevious(getCurrentEntryId()) == true) {
            scrollToSelected();
        }
        return
    }

    var scrollToHeight = 0;
    var $curr = $(".is-selected");
    scrollToHeight = scrollToHeight + Math.round($curr.height() * currentZoom) + getScrollCalculationAdjuster();
    while ($curr.prev().length > 0) {
        $curr = $curr.prev();
        scrollToHeight = scrollToHeight + Math.round($curr.height() * currentZoom) + getScrollCalculationAdjuster();
    }
    $("#lh-entries-container").scrollTop(scrollToHeight - $("#lh-entries-container").height());
}

function selectEntry(entryId) {
    // remove selection from all entries
    $(".entry").removeClass("is-selected");
    // set selected for this entry
    $("#entry-container-" + entryId).addClass("is-selected");
    // set focus to the selected entry
    $("#entry-container-" + entryId).focus();
}

function expandEntry(entryId) {
    // determine if clicked entry is collapsed
    var isCollapsed = $("#entry-" + entryId).hasClass("content-collapsed");

    // collapse all entries
    $(".entry-main").addClass("content-collapsed");
    $(".entry").addClass("entry-collapsed");
    $(".entry").removeClass("entry-expanded");
    // expand clicked entry if it was collapsed
    if (isCollapsed) {
        $("#entry-" + entryId).removeClass("content-collapsed");
        $("#entry-container-" + entryId).removeClass("entry-collapsed").addClass("entry-expanded");
    }
}

function markEntryAsRead(entryId) {
    if ($("#entry-container-" + entryId).hasClass("read") == false) {
        $("#entry-container-" + entryId).addClass("read");
        setReadStatus(entryId, true);
    }
}

function isCollapsed(entryId) {
    return $("#entry-" + entryId).hasClass("content-collapsed");
}

function getPreviousEntryId() {
    var json = $(".is-selected").prev().children(".entry-border").children(".entry-info").html();
    if (json == null)
        json = $(".entry-info").last().html();
    if (json == null)
        return null;
    var obj = eval("(" + json + ")");
    return obj.entryId;
}

function getNextEntryId() {
    var json = $(".is-selected").next().children(".entry-border").children(".entry-info").html();
    if (json == null)
        json = $(".entry-info").first().html();
    if (json == null)
        return null;
    var obj = eval("(" + json + ")");
    return obj.entryId;
}

function getCurrentEntryId() {
    var json = $(".is-selected .entry-info").html();
    if (json == null)
        return null;
    var obj = eval("(" + json + ")");
    return obj.entryId;
}
//#endregion

//#region Audio Feeds
var audioSettings; // settings/properties for currently loaded audio feed
var myAudioSources = new Array(); // settings/properties for all the available audio feeds

function getAudioSource(entryId) {
    for (var x = 0; x < myAudioSources.length; x++) {
        var obj = myAudioSources[x];
        if (obj.entryId == entryId) {
            return obj;
        }
    }
    return null;
}

function addAudioSource(entryId, url, title, date, iterator, contenturl, contenttype, currentPosition) {
    if (getAudioSource(entryId) == null) {
        myAudioSources.push({ entryId: entryId, url: url, title: title, date: date, iterator: iterator, contenturl: contenturl, contenttype: contenttype, currentPosition: currentPosition });
    }
}

function setupPlayer(x) {
    // get audio element
    var audio = document.getElementById('audioplayer');

    var checkObj = getAudioSource(x);

    // if the same src is hitting play\pause, just toggle play\pause
    if (audioSettings != null && audioSettings != 'undefined' && checkObj.contenturl == audioSettings.contenturl) {
        if (audio.paused == true) {
            audio.play();
        }
        else {
            audio.pause();
        }
        return;
    }

    // display the audio player now that it's set up with a src
    $('#audioplayer').css('display', 'block');

    // save previous settings first before changing to another audio src
    if (audioSettings != null && audioSettings != 'undefined') {
        audioSettings.currentPosition = audio.currentTime;
        setCurrentPosition();
    }

    // reset other controls to paused
    $('.playpause').removeClass('playing').addClass('paused');

    audioSettings = checkObj;

    if (audioSettings.contenttype == "video/x-m4v" || audioSettings.contenttype == "video/mp4")
        $("#lh-showvideo").css("display", "block");
    else
        $("#lh-showvideo").css("display", "none");

    audio.src = audioSettings.contenturl;

    //audio.currentTime = currentPosition;
    $('#audioplayer').bind('loadeddata', function (e) {
        audio.currentTime = audioSettings.currentPosition;
    });
    $('#audioplayer').bind('pause', function (e) {

        var element = $('#info-' + audioSettings.entryId);
        if (element != null) {
            $('#audioplayer-' + audioSettings.iterator + '.playpause').removeClass('playing').addClass('paused');
        }

        audioSettings.currentPosition = e.target.currentTime;
        setCurrentPosition();
    });
    $('#audioplayer').bind('canplay', function (e) {
        e.target.play();
    });
    $('#audioplayer').bind('play', function (e) {
        var element = $('#info-' + audioSettings.entryId);
        if (element != null) {
            $('#audioplayer-' + audioSettings.iterator + '.playpause').removeClass('paused').addClass('playing');
        }
    });

}
//#endregion

//#region Feeds
// loads a feed into the navigation area
function addFeed(obj) {
    var url = "'" + obj.Url + "'";
    var name = "'" + obj.Feedname + "'";
    var str = '<div class="feed-item" onclick="getEntries(' + obj.FeedId + ');">' + obj.Feedname + '</div>';
    $('#lh-feeds').append(str);
}

// clears all the existing feeds in the list
function clearFeeds() {
    $('#lh-feeds').html('');
}

function getFeed(feedId) {
    if (myFeeds == null || myFeeds == 'undefined' || myFeeds.length == 0)
        return null;
    for (var x = 0; x < myFeeds.length; x++) {
        var obj = myFeeds[x];
        if (obj.FeedId == feedId) {
            return obj;
        }
    }
}
//#endregion

//#region Entries
function addEntry(item, tofront) {
    // set default value for tofront
    if (tofront == null || tofront == 'undefined')
        tofront = false;

    var content = "";
    var audioContent = "";

    if (item.ContentType == "audio/mpeg" || item.ContentType == "audio/mp3" || item.ContentType == "audio/x-m4a" || item.ContentType == "x-audio/mp3" || item.ContentType == "video/x-m4v" || item.ContentType == "video/mp4") {
        if (item.CurrentPosition == 'undefined' || item.CurrentPosition == null)
            item.CurrentPosition = 0.0;
        var thisAudioSetting = getAudioSource(item.FeedEntryId);
        var playpausestatus = " paused";

        if (audioSettings != null && thisAudioSetting != null && audioSettings.entryId == thisAudioSetting.entryId) {
            playpausestatus = " playing";
        }

        audioContent = "<div id='audioplayer-" + item.FeedEntryId + "' class='playpause" + playpausestatus + "' onclick='setupPlayer(" + item.FeedEntryId + "); stopPropagation($.event.fix(event || window.event));'></div>";

        addAudioSource(item.FeedEntryId, currentFeed.Url, item.Title, item.PublishDate, item.FeedEntryId, item.ContentUrl, item.ContentType, item.CurrentPosition);
    }
    content = item.Content;

    // set element id variables with single quotes for string appending
    var id = "'entry-" + item.FeedEntryId + "'";
    var containerid = "'entry-container-" + item.FeedEntryId + "'";

    var readClass = "";
    if (item.IsRead == true)
        readClass = " read";
    var savedClass = " entry-nostar";
    if (item.IsSaved == true)
        savedClass = " entry-star";
    var thumbClass = " entry-nothumb";
    if (item.ThumbUp == true)
        thumbClass = " entry-thumbup";
    if (item.ThumbDown == true)
        thumbClass = " entry-thumbdown";

    var rating = '<div id="entry-thumb-' + item.FeedEntryId + '" class="thumb' + thumbClass + '" onclick="toggleThumb(this, ' + item.FeedEntryId + '); stopPropagation($.event.fix(event || window.event));"></div>';

    var thirdicon = rating;
    if (audioContent != "")
        thirdicon = audioContent;

    // build the entry html
    var str = '<div id="entry-container-' + item.FeedEntryId + '" class="entry' + readClass + '">';
    str = str + '<div class="entry-border">';
    str = str + '<div id="info-' + item.FeedEntryId + '" class="entry-info" style="display: none;">{ entryId: ' + item.FeedEntryId + ' }</div>';
    str = str + '<div class="collapsed" onclick="entryClicked(' + item.FeedEntryId + ');"><div class="entry-title">' + item.Title + '</div>' + thirdicon + '<div id="entry-star-' + item.FeedEntryId + '" class="star' + savedClass + '" onclick="toggleStar(this, ' + item.FeedEntryId + '); stopPropagation($.event.fix(event || window.event));"></div><a href="' + item.Url + '" target="_blank" rel="bookmark" class="entry-link" onclick="stopPropagation($.event.fix(event || window.event));" title="Read Full Article"></a></div>';
    str = str + '<div id="entry-' + item.FeedEntryId + '" class="entry-main content-collapsed"><br>' + item.InterestPrediction + '<br>' + item.InterestPrediction2 + '<br>' + content + '</div>';
    str = str + '</div>';
    str = str + '</div>';

    // append the entry html
    if (tofront)
        $('#lh-entries-zoom').prepend(str);
    else
        $('#lh-entries-zoom').append(str);
}

// clears all the existing entries in the list
function clearEntries() {
    $('#lh-entries-zoom').html('');
}


function insertNewEntries(feedId, entries, latestUpdate) {
    var feed = getFeed(feedId);
    feed.LatestUpdate = latestUpdate;
    // reverse arrays for appending to it in the correct order (newest to oldest)
    feed.Entries.reverse();
    entries.reverse();
    var isCurrentFeed = (currentFeed == feed);
    for (var i = 0; i < entries.length; i++) {

        // check if it's already in the list, just in case
        var exists = false;
        for (var x = 0; x < feed.Entries.length; x++) {
            if (feed.Entries[x].FeedEntryId == entries[i].FeedEntryId) {
                exists = true;
                break;
            }
        }

        // add it if it doesn't exist
        if (!exists) {
            feed.Entries.push(entries[i])
            if (isCurrentFeed)
                addEntry(entries[i], true);
        }
    }
    // put them back in the right order
    feed.Entries.reverse();
    entries.reverse();
}

function loadEntries(feedId, entries, latestUpdate) {
    // clear existing entries from view
    clearEntries();

    // set as the current feed
    currentFeed = getFeed(feedId);

    if (latestUpdate != null && latestUpdate != 'undefined')
        currentFeed.LatestUpdate = latestUpdate;

    // set the entries if the property hasn't been set yet
    if (!('Entries' in currentFeed))
        currentFeed.Entries = entries;

    // set the title
    $('#lh-title').html('<a target="_blank" href="' + currentFeed.Url + '">' + currentFeed.Feedname + ' <span class="chevron">&#0187;</span></a>');

    // add the entries
    for (var i2 = 0; i2 < currentFeed.Entries.length; i2++) {
        addEntry(currentFeed.Entries[i2]);
    }
}

function getEntry(entryId) {
    if (currentFeed == null || currentFeed == 'undefined' || currentFeed == 0)
        return null;
    if (!('Entries' in currentFeed))
        return null;
    for (var x = 0; x < currentFeed.Entries.length; x++) {
        var obj = currentFeed.Entries[x];
        if (obj.FeedEntryId == entryId) {
            return obj;
        }
    }
}
//#endregion

//#region Window Resizing
function hookResize() {
    setContainerHeight();
    $(window).resize(onWindowResize);
}

function onWindowResize() {
    setContainerHeight();
    setDialogSizePos();
}

function setContainerHeight() {
    $('#lh-entries-container').css('height', function () {
        return $(window).height() - 73;
    });
}

function setOverlaySizePos() {
    if ($('#lh-dialog-overlay').length > 0) {
        // get the screen height and width    
        var maskHeight = $(document).height();
        var maskWidth = $(window).width();

        // assign values to the overlay and dialog box  
        $('#lh-dialog-overlay').css({ height: maskHeight, width: maskWidth }).show();
    }
}

function setDialogSizePos() {
    if ($('#lh-dialog-overlay').length > 0) {
        // get the screen height and width    
        var maskHeight = $(document).height();
        var maskWidth = $(window).width();

        // calculate the values for center alignment  
        var dialogTop = (maskHeight / 3) - ($('#lh-dialog-box').height());
        var dialogLeft = (maskWidth / 2) - ($('#lh-dialog-box').width() / 2);

        // assign values to the overlay and dialog box  
        $('#lh-dialog-box').css({ top: dialogTop, left: dialogLeft }).show();
    }
}
//#endregion

//#region UI Entry Event Handling
// toggles the content of an entry between collapsed and expanded
function entryClicked(entryId) {

    // select this entry, 
    selectEntry(entryId);

    // expand this entry
    expandEntry(entryId);

    // mark as read (if not already read)
    markEntryAsRead(entryId);
}

// toggles the star icon between starred and unstarred
function toggleStar(sender, entryId) {

    if ($(sender).hasClass("entry-nostar") == true) {
        $(sender).removeClass("entry-nostar").addClass("entry-star");
        setSavedStatus(entryId, true);
    }
    else {
        $(sender).removeClass("entry-star").addClass("entry-nostar");
        setSavedStatus(entryId, false);
    }

}

// toggles the thumb icon between starred and unstarred
function toggleThumb(sender, entryId) {

    if ($(sender).hasClass("entry-nothumb") == true) {
        $(sender).removeClass("entry-nothumb").addClass("entry-thumbup");
        setThumbUp(entryId);
    }
    else if ($(sender).hasClass("entry-thumbup") == true) {
        $(sender).removeClass("entry-thumbup").addClass("entry-thumbdown");
        setThumbDown(entryId);
    }
    else {
        $(sender).removeClass("entry-thumbdown").addClass("entry-nothumb");
        setNoThumb(entryId);
    }

}

// toggles the navigation bar between collapsed and expanded
function toggleNav() {
    var ele = document.getElementById('lh-nav');
    if (ele.style.display == "none") {
        ele.style.display = "block";
        $('#lh-toggle-nav').addClass("togglenav-expanded").removeClass("togglenav-hidden");
    }
    else {
        ele.style.display = "none";
        $('#lh-toggle-nav').addClass("togglenav-hidden").removeClass("togglenav-expanded");
    }

    ele = document.getElementById('lh-articles');
    if (ele.style.marginLeft == "0px") {
        ele.style.marginLeft = "260px";
    }
    else {
        ele.style.marginLeft = "0px";
    }
}

// toggles the toolbar bar between collapsed and expanded
function toggleToolbar() {
    var hide = true;

    if ($("#lh-toolbar").hasClass("hidden"))
        hide = false;

    if (hide) {
        $("#lh-toolbar").addClass("hidden");
        $("#lh-main").addClass("notoolbar");
        $("#lh-toggle-toolbar").removeClass("toggletoolbar-expanded").addClass("toggletoolbar-hidden");
        $("#lh-toggle-toolbar").title("display toolbar");
    }
    else {
        $("#lh-toolbar").removeClass("hidden");
        $("#lh-main").removeClass("notoolbar");
        $("#lh-toggle-toolbar").removeClass("toggletoolbar-hidden").addClass("toggletoolbar-expanded");
        $("#lh-toggle-toolbar").title("hide toolbar");
    }
}
//#endregion

//#region Helper Methods
// used to prevent event bubbling
function stopPropagation(e) {
    e.stopPropagation();
}
//#endregion

//#region Dialogs
var destroyDialogOnKeyPress = true;

function msgDialog(message) {
    createOverlay();
    createDialogShell();
    destroyDialogOnKeyPress = true;
    $(".lh-dialog-content").append("<div id='lh-dialog-message'></div>").append("<input class='dialogbutton lh-inputctrl rounded' title='OK' value='OK' />");
    $('#lh-dialog-overlay, #lh-dialog-box, .dialogbutton').click(function () {
        destroyDialogShell();
        destroyOverlay();
    });

    $("#lh-dialog-message").html(message);
}

function addFeedDialog() {
    createOverlay();
    createDialogShell();
    destroyDialogOnKeyPress = false;
    $(".lh-dialog-content").append("<table id='lh-addfeed-layout'></table>").children("table").append("<tbody></tbody>").children("tbody").append("<tr></tr>").children("tr").append("<td class='column1'></td>").children("td").append("<div>Name:</div>").parent().append("<td class='column2'></td>").children("td").last().append("<input id='lh-addfeed-name' class='rounded lh-inputctrl' type='text' title='Enter a name for your new feed subscription' />");
    $(".lh-dialog-content table tbody").append("<tr></tr>").children("tr").last().append("<td class='column1'></td>").children("td").append("<div>Url:</div>").parent().append("<td class='column2'></td>").children("td").last().append("<input id='lh-addfeed-url' class='rounded lh-inputctrl' type='text' title='Enter the url for your new feed subscription' />");
    $(".lh-dialog-content").append("<div id='lh-addfeed-buttoncontainer' class='centeredrow'><input id='lh-addfeed-ok' class='lh-inputctrl rounded' title='OK' value='OK' /><input id='lh-addfeed-cancel' class='lh-inputctrl rounded' title='Cancel' value='Cancel' /></div>");

    $('#lh-dialog-overlay, #lh-addfeed-cancel').click(function () {
        destroyDialogShell();
        destroyOverlay();
    });

    $('#lh-dialog-overlay, #lh-addfeed-ok').click(function () {
        if ($("#lh-addfeed-url").val() != "" && $("#lh-addfeed-name").val() != "") {
            addFeedSubscription($("#lh-addfeed-url").val(), $("#lh-addfeed-name").val());
        }
        destroyDialogShell();
        destroyOverlay();
    });
}

function createOverlay() {
    destroyOverlay();

    $("#lh-index").append("<div id='lh-dialog-overlay'></div>");

    setOverlaySizePos();
}

function createDialogShell() {
    // make sure existing dialog is destroyed first if one exists
    destroyDialogShell();

    $("#lh-index").append("<div id='lh-dialog-box'></div>").children("#lh-dialog-box").append("<div class='lh-dialog-content'></div>");

    setDialogSizePos();
}

function destroyOverlay() {
    $('#lh-dialog-overlay').remove();
}

function destroyDialogShell() {
    $('#lh-dialog-box').remove();
}
//#endregion

//#region Video Dialog
function showVideo() {

    // create shade effect
    createOverlay();
    $('#lh-index').append('<video id="videoPlayer" controls="" autoplay="" style="margin: auto; position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 10000" name="media"></video>');

    // get audio element
    var audio = document.getElementById('audioplayer');
    var video = document.getElementById('videoPlayer');

    // return to audio-only if overlay is clicked
    $('#lh-dialog-overlay').click(function () {
        if (audio.src != video.src)
            audio.src = video.src;
        video.pause();
        audio.currentTime = video.currentTime;
        audio.play();

        $('#audioplayer').css("display", "block");
        $('#lh-showvideo').css("display", "block");
        destroyOverlay();
        $('#videoPlayer').remove();
    });

    // pause the audio player
    audio.pause();
    //        if (audio.src != video.src) {
    // set the source of the video player
    video.src = audio.src;
    // pick up where audio left off
    $('#videoPlayer').bind('loadeddata', function (e) {
        var audio = document.getElementById('audioplayer');
        e.target.currentTime = audio.currentTime;
    });
    // play when ready
    $('#videoPlayer').bind('canplay', function (e) {
        e.target.play();
    });
    $('#audioplayer').css("display", "none");
    $('#lh-showvideo').css("display", "none");
}
//#endregion

//#region Debugging
function debug(msg, type) {
    //$("#lh-banner").text(msg);
    //alert(msg);
};
//#endregion
