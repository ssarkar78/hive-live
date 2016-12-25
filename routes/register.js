/**
 * Created by ssarkar on 18-03-2016.
 */
var request = require("request");
exports.verifyUserPhone = (function () {
    var pinMap = {};
    function prepareAndSendRequestForPin(phone) {
        var pin = Math.round(Math.random()*10000);
        var options = {
            method: 'POST',
            url: 'http://api.pushchamp.com/send/',
            headers: {
                'cache-control': 'no-cache',
                'content-type': 'application/json',
                token: '6PtFPsyPASknRcU3UJnwpmT4Hxq9j89C2WAwbFfd'
            },
            body: {
                template_vars: {code: pin},
                address: {sms: {mobile:phone}},
                template_name: 'TWOOSH',
                name: 'TWOOSH'
            },
            json: true
        };

        request(options, function (error, response, body) {
            if (error)
                throw new Error(error);
            console.log(body);
            pinMap[phone]=pin;
        });
    }

    return {
        createPin: function (phone) {
            console.log('generating pin..')
            prepareAndSendRequestForPin(phone);
        },
        isPinCorrect: function (phone,pin) {
            console.log(pinMap);
            return true;//pinMap[phone]==pin;
        }
    }


})();
