(function(factory) {
    module.exports = exports = factory(
        require('../../js/stores/UserStore')
    );
}(function(userStore) {

    var API_KEY = 'AIzaSyCJI_tjIhwGCyiyXlPxMtEL2L3CR7ocMU0'; // '379697648331-f7b2qooh3g6d787l0c1n6s66jh6us2u1.apps.googleusercontent.com';
    var GCM_ENDPOINT = 'https://android.googleapis.com/gcm/send';

    var curlCommandDiv = document.querySelector('.js-curl-command');
    var isPushEnabled = false;

    // This method handles the removal of subscriptionId
    // in Chrome 44 by concatenating the subscription Id
    // to the subscription endpoint
    function endpointWorkaround(pushSubscription) {
        // Make sure we only mess with GCM
        if (pushSubscription.endpoint.indexOf('https://android.googleapis.com/gcm/send') !== 0) {
            return pushSubscription.endpoint;
        }

        var mergedEndpoint = pushSubscription.endpoint;
        // Chrome 42 + 43 will not have the subscriptionId attached
        // to the endpoint.
        if (pushSubscription.subscriptionId &&
            pushSubscription.endpoint.indexOf(pushSubscription.subscriptionId) === -1) {
            // Handle version 42 where you have separate subId and Endpoint
            mergedEndpoint = pushSubscription.endpoint + '/' +
                pushSubscription.subscriptionId;
        }
        return mergedEndpoint;
    }

    function sendSubscriptionToServer(subscription) {
        // TODO: Send the subscription.endpoint
        // to your server and save it to send a
        // push message at a later date
        //
        // For compatibly of Chrome 43, get the endpoint via
        // endpointWorkaround(subscription)
        //console.log('TODO: Implement sendSubscriptionToServer()');
        console.log(subscription.endpoint);

        var mergedEndpoint = endpointWorkaround(subscription);

        // This is just for demo purposes / an easy to test by
        // generating the appropriate cURL command
        showCurlCommand(mergedEndpoint);
    }

    // NOTE: This code is only suitable for GCM endpoints,
    // When another browser has a working version, alter
    // this to send a PUSH request directly to the endpoint
    function showCurlCommand(mergedEndpoint) {
        // The curl command to trigger a push message straight from GCM
        if (mergedEndpoint.indexOf(GCM_ENDPOINT) !== 0) {
            console.log('This browser isn\'t currently ' +
                'supported for this demo');
            return;
        }

        var endpointSections = mergedEndpoint.split('/');
        var subscriptionId = endpointSections[endpointSections.length - 1];

        if (userStore.updates.value.gcmEndpoint !== subscriptionId) {
            userStore.updatePrefs({
                gcmEndpoint: subscriptionId
            });
        }

        var curlCommand = 'curl --header "Authorization: key=' + API_KEY +
            '" --header Content-Type:"application/json" ' + GCM_ENDPOINT +
            ' -d "{\\"registration_ids\\":[\\"' + subscriptionId + '\\"]}"';

        console.log(curlCommand);
    }

        // Once the service worker is registered set the initial state
    function initialiseState () {
        // Are Notifications supported in the service worker?
        if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
            console.log('Notifications aren\'t supported.');
            return;
        }

        // Check the current Notification permission.
        // If its denied, it's a permanent block until the
        // user changes the permission
        if (Notification.permission === 'denied') {
            console.log('The user has blocked notifications.');
            return;
        }

        // Check if push messaging is supported
        if (!('PushManager' in window)) {
            console.log('Push messaging isn\'t supported.');
            return;
        }

        // We need the service worker registration to check for a subscription
        navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
            // Do we already have a push message subscription?
            serviceWorkerRegistration.pushManager.getSubscription()
                .then(function(subscription) {

                    if (!subscription) {
                        // We aren’t subscribed to push, so set UI
                        // to allow the user to enable push
                        return;
                    }

                    // Keep your server in sync with the latest subscription
                    sendSubscriptionToServer(subscription);
                })
                .catch(function(err) {
                    console.log('Error during getSubscription()', err);
                });
        });
    };

    function unsubscribe() {

        navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
            // To unsubscribe from push messaging, you need get the
            // subcription object, which you can call unsubscribe() on.
            serviceWorkerRegistration.pushManager.getSubscription().then(
                function(pushSubscription) {
                    // Check we have a subscription to unsubscribe
                    if (!pushSubscription) {
                        // No subscription object, so set the state
                        // to allow the user to subscribe to push
                        isPushEnabled = false;
                        return;
                    }

                    // TODO: Make a request to your server to remove
                    // the users data from your data store so you
                    // don't attempt to send them push messages anymore

                    // We have a subcription, so call unsubscribe on it
                    pushSubscription.unsubscribe().then(function(successful) {
                        isPushEnabled = false;
                    }).catch(function(e) {
                        // We failed to unsubscribe, this can lead to
                        // an unusual state, so may be best to remove
                        // the subscription id from your data store and
                        // inform the user that you disabled push

                        console.log('Unsubscription error: ', e);
                    });
                }).catch(function(e) {
                console.log('Error thrown while unsubscribing from ' +
                    'push messaging.', e);
            });
        });
    }

    function subscribe() {
        navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
            serviceWorkerRegistration.pushManager.subscribe({
                    userVisibleOnly: true
                })
                .then(function(subscription) {
                    // The subscription was successful
                    isPushEnabled = true;

                    // TODO: Send the subscription subscription.endpoint
                    // to your server and save it to send a push message
                    // at a later date
                    return sendSubscriptionToServer(subscription);
                })
                .catch(function(e) {
                    if (Notification.permission === 'denied') {
                        // The user denied the notification permission which
                        // means we failed to subscribe and the user will need
                        // to manually change the notification permission to
                        // subscribe to push messages
                        console.log('Permission for Notifications was denied');
                    } else {
                        // A problem occurred with the subscription, this can
                        // often be down to an issue or lack of the gcm_sender_id
                        // and / or gcm_user_visible_only
                        console.log('Unable to subscribe to push.', e);
                    }
                });
        });
    }

    return {
        isPushEnabled: isPushEnabled,
        subscribe: subscribe,
        unsubscribe: unsubscribe
    };

}));
