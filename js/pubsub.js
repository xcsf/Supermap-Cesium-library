define(function () {
    let TEST_ENV = 'http://localhost:8080'
    let PROD_ENV = ''

    let origin = TEST_ENV
    window.addEventListener("message", function (e) {
        if (e.origin === origin) {
            let topic = e.data.action;
            publish(topic,e.data.data);
        }
    });
    let topics = new Object()
    let subUid = -1;
    function publish(topic,data) {
        if (!topics[topic]) return false
        let subscribers = topics[topic],
            len = subscribers ? subscribers.length : 0;
        while (len--) {
            subscribers[len].func(data);
        }
        return this;
    }
    function subscribe(topic, func) {
        if (!topics[topic]) {
            topics[topic] = [];
        }
        let token = (++subUid).toString();
        topics[topic].push({
            token: token,
            func: func
        });
        return token;
    }
    function postMessage(action, data) {
        window.parent.postMessage({ action, data }, origin);
    }
    return {
        subscribe,
        postMessage
    }
})