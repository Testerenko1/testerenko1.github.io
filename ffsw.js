
'use strict';
var _p4sPush = {
    hash: '829082c8181c46b186469a6e99d925ad',
    serverUrl: 'https://push4site.com',
    defaultIcon: '/Images/Favicons/133.png',
    subscriber_id: 0
}

var notificationSubscribeId = function (query)
{
    var subscriber_id,
    queryString, queryStringVar;

    if(query.indexOf('?') > -1) {
        queryString = query.substring(query.indexOf('?'));
        queryStringVar = queryString.split('&')[1];
        subscriber_id = decodeURIComponent(queryStringVar.split('=')[1]);
    }
    else {
        console.error('failed to extract url value');
        subscriber_id = 0;
    }
    return subscriber_id;
};


/*Function used split subsciption id from endpoint URL*/
var splitEndPointSubscription =  function (subscriptionDetails) {
    var offset = subscriptionDetails.endpoint.lastIndexOf('/');

    var endpointURL = subscriptionDetails.endpoint.substring(0, offset + 1),
    endpoint = subscriptionDetails.endpoint,
    subscriptionId;

    if(endpoint.indexOf(endpointURL) === 0) {
       return subscriptionId = endpoint.replace(endpointURL , '');
    }

    return subscriptionDetails.subscriptionId;
};



self.addEventListener('push', function(event)
{

     event.waitUntil(
        self.registration.pushManager.getSubscription()
        .then(function(subscription) {
            var subscriptionId = splitEndPointSubscription(subscription);


            if(event.data)
            {
                var payloadObject = event.data.json();

                var notificationDetails = {};

                notificationDetails.title = payloadObject.title;
                notificationDetails.message = payloadObject.message;
                notificationDetails.icon = _p4sPush.serverUrl + '/' + payloadObject.icon_url + '?notificationURL=' + encodeURIComponent(payloadObject.url) + '&subscriber_id=' + payloadObject.subscriberId;
                notificationDetails.notificationTag = payloadObject.tag;
                notificationDetails.url = payloadObject.url;
                _p4sPush.subscriber_id = payloadObject.subscriberId;
				if (typeof(payloadObject.requireInteraction) != 'undefined')
					notificationDetails.requireInteraction = payloadObject.requireInteraction;
				else
					notificationDetails.requireInteraction = true;


                var trackDeliveryURL = '';


                trackDeliveryURL = _p4sPush.serverUrl + '/Subscriber/NotificationRecieved' +
                    '?subscriberid=' + _p4sPush.subscriber_id +
                    '&NotificationId=' + notificationDetails.notificationTag;

                fetch(trackDeliveryURL).catch(function (err) {
                });

                return self.registration.showNotification(notificationDetails.title, {
                    body: notificationDetails.message,
                    icon: notificationDetails.icon,
                    requireInteraction: notificationDetails.requireInteraction,
                    tag: notificationDetails.notificationTag
                });
            }

            else {
                //p4sPushSubscriberId = pushAPI.storageUtil.getFromStorage("p4s_push_subscriber_id")
               //var deferred = GetSubscriberId(subscriptionId);



                    return fetch(_p4sPush.serverUrl + '/Subscriber/GetNewNotifications?SubscriberToken=' + subscriptionId).then(function (response) {
                        var notificationDetails = {};

                        if (response.status !== 200) {
                            throw new Error();
                        }
                        return response.json().then(function (data) {
                            var trackDeliveryURL = '';

                            if (data.error) {
                                console.error('The API returned an error.', data.error);
                                throw new Error();
                            }
                            //return data['notification'].forEach(function(data['notification'])
                            ///data['notification'] =  data['notification'];
                            //{

                                notificationDetails.title = data['notification'].title;
                                notificationDetails.message = data['notification'].message;
                                notificationDetails.icon = _p4sPush.serverUrl + '/' + data['notification'].icon_url + '?notificationURL=' + encodeURIComponent(data['notification'].url) + '&subscriber_id=' + data.subscriberId;
                                notificationDetails.notificationTag = data['notification'].tag;
                                notificationDetails.url = data['notification'].url;
                                _p4sPush.subscriber_id = data.subscriberId;
                                notificationDetails.requireInteraction = true;
                                if (data['notification'].hasOwnProperty('requireInteraction') && data['notification'].requireInteraction === false)
                                {
                                    notificationDetails.requireInteraction = false;
                                }



                                trackDeliveryURL = _p4sPush.serverUrl + '/Subscriber/NotificationRecieved' +
                                    '?subscriberid=' + _p4sPush.subscriber_id +
                                    '&NotificationId=' + notificationDetails.notificationTag;

                                fetch(trackDeliveryURL).catch(function (err) {
                                });

                                return self.registration.showNotification(notificationDetails.title, {
                                    body: notificationDetails.message,
                                    icon: notificationDetails.icon,
                                    requireInteraction: notificationDetails.requireInteraction,
                                    tag: notificationDetails.notificationTag
                                });
                            ///});

                        });
                    }).catch(function (err) {
                        var title = 'Oops! We couldn\'t fetch the notification';
                        var message = 'Sorry, due to some error the notification that was sent couldn\'t be displayed.';
                        var icon = _p4sPush.defaultIcon + '?notificationURL=' + encodeURIComponent('https://push4site.com/error-fetching-push-notifications/?hash=' + _p4sPush.hash);
                        var notificationTag = 'notification-error';

                        var logSwErrorUrl = _p4sPush.serverUrl + '/logServiceWorkerError' +
                            '?subscriptionId=' + subscriptionId +
                            '&error=' + err.toString() +
                            '&hash=' + _p4sPush.hash;

                        fetch(logSwErrorUrl);

                        return self.registration.showNotification(title, {
                            body: message,
                            icon: icon,
                            tag: notificationTag
                        });
                    });
	            }






        })
    );
});

self.addEventListener('notificationclick', function(event) {

    self.registration.pushManager.getSubscription()
    .then(function(subscription) {
        var subscriptionId = splitEndPointSubscription(subscription),
        subscriberid = notificationSubscribeId(event.notification.icon),
        clickDeliveryURL =  _p4sPush.serverUrl + '/Subscriber/NotificationClicked' +
        '?subscriberid=' + subscriberid +
        '&NotificationId=' + event.notification.tag;

        // send update to server
        fetch(clickDeliveryURL).
        catch(function(err) {
        });
    });

    event.notification.close();
    function notificationURL()
    {
        var query = event.notification.icon,
        url,
        queryStringVar,
        queryString;

        if(query.indexOf('?') > -1) {
            queryString = query.substring(query.indexOf('?'));
            queryStringVar = queryString.split('&')[0];
            url = decodeURIComponent(queryStringVar.split('=')[1]);
        }
        else {
            console.error('failed to extract url value');
            url = '';
        }
        return url;
    }


    // This looks to see if the current is already open and
    // focuses if it is
    event.waitUntil(
        clients.matchAll({
            type: "window"
        })
        .then(function(clientList) {
            for (var i = 0; i < clientList.length; i++) {
                var client = clientList[i];
                if (client.url === notificationURL() && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(notificationURL());
            }
        })
    );
});