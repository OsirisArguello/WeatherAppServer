const { status, json } = require('server/reply');
var request = require('request-promise');


var openweathermap = {
    city: null,

    getForecast: function() {
        return request({
            "method": "GET",
            "uri": "https://samples.openweathermap.org/data/2.5/forecast",
            "qs": {
                "id": openweathermap.city,
                "appid": "524901&appid=b6907d289e10d714a6e88b30761fae22"
            },
            "json": true
        });
    }
}

exports.read = async (ctx) => {
    const city = ctx.params.city;
    openweathermap.city = city;
    return openweathermap.getForecast();
};

