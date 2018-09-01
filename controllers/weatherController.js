const { status, json } = require('server/reply');
var request = require('request-promise');
//API KEY  d5b8ee96f02a1b0a71810eaacc5dc820

var openweathermap = {

    city: null,

    getForecast: function() {
        return request({
            "method": "GET",
            "uri": "http://api.openweathermap.org/data/2.5/forecast/daily",
            "qs": {
                "id": openweathermap.city,
                "units": "metric",
                "cnt": 5,
                "appid": "d5b8ee96f02a1b0a71810eaacc5dc820"
            },
            "json": true
        });
    },

    getFiveDaysForecast: function() {
        return request({
            "method": "GET",
            "uri": "http://api.openweathermap.org/data/2.5/forecast",
            "qs": {
                "id": openweathermap.city,
                "units": "metric",
                "appid": "d5b8ee96f02a1b0a71810eaacc5dc820"
            },
            "json": true
        });
    },

    getCurrentWeather: function() {
        return request({
            "method": "GET",
            "uri": "http://api.openweathermap.org/data/2.5/weather",
            "qs": {
                "id": openweathermap.city,
                "units": "metric",
                "appid": "d5b8ee96f02a1b0a71810eaacc5dc820"
            },
            "json": true
        });
    },

    getData: async function executeParallelAsyncTasks () {
        const [ forecast ] = await Promise.all([ this.getFiveDaysForecast() ]);
        return this.filterForecast(forecast);
    },

    filterCurrentWeather: function (currentWeather, weatherResponse) {
        let weather = {};
        weather['temp_min'] = currentWeather.main.temp_min;
        weather['temp_max'] = currentWeather.main.temp_max;
        weather['weather'] = currentWeather.weather[0].description;
        weatherResponse.push(weather);
    },

    filterForecast: function (forecast) {
        let data = {};
        let values;
        let weatherValue = {};
        for (let i in forecast.list) {
            let date = new Date(forecast.list[i].dt*1000);
            if (date.getHours() == 12) {
                let key = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();
                weatherValue = this.getWeatherData(forecast.list[i]);
                values = key in data ? data[key] : {};
                values.day = weatherValue;
                data[key] = values;
            } else if (date.getHours() == 0) {
                // Le resto uno porque la hora 0:00 la toma como si fuera el día siguiente
                let key = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+(date.getDate()-1);
                weatherValue = this.getWeatherData(forecast.list[i]);
                values = key in data ? data[key] : {};
                values.night = weatherValue;
                data[key] = values;
            }
        }
        return data;
    },

    getWeatherData: function (forecast) {
        let weatherValue = {};
        weatherValue.temperature = (forecast.main.temp_min + forecast.main.temp_min) / 2;
        weatherValue.weather = forecast.weather[0].description;
        return weatherValue;
    }
};

exports.read = async (ctx) => {
    const city = ctx.params.city;
    openweathermap.city = city;
    return openweathermap.getData();
};

