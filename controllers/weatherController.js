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
        const [ currentWeather, forecast ] = await Promise.all([ this.getCurrentWeather(), this.getFiveDaysForecast() ]);
        let weatherResponse = [];
        this.filterCurrentWeather(currentWeather, weatherResponse);
        return this.filterForecast(forecast, weatherResponse);
        //return weatherResponse;
    },

    filterCurrentWeather: function (currentWeather, weatherResponse) {
        let weather = {};
        weather['temp_min'] = currentWeather.main.temp_min;
        weather['temp_max'] = currentWeather.main.temp_max;
        weather['weather'] = currentWeather.weather[0].description;
        weatherResponse.push(weather);
    },

    filterForecast: function (forecast, weatherResponse) {
        let data = {};
        let values;
        let weatherValue = {};
        for (let i in forecast.list) {
            let time = forecast.list[i].dt;
            let date = new Date(forecast.list[i].dt*1000);
            let key = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();
            if (date.getHours() == 12) {
                console.log('ADD DAY '+date);
                weatherValue.temp_min = forecast.list[i].main.temp_min;
                weatherValue.temp_max = forecast.list[i].main.temp_min;
                weatherValue.weather = forecast.list[i].weather[0].description;
                if (key in data) {
                    console.log('EXISTE');
                    values = data[key];
                } else {
                    console.log('NO EXISTE');
                    values = {};
                }
                values.day = weatherValue;
                data[key] = values;
            } else if (date.getHours() == 0) {
                console.log('ADD NIGHT '+date);
                weatherValue.temp_min = forecast.list[i].main.temp_min;
                weatherValue.temp_max = forecast.list[i].main.temp_min;
                weatherValue.weather = forecast.list[i].weather[0].description;
                if (key in data) {
                    console.log('EXISTE');
                    values = data[key];
                } else {
                    console.log('NO EXISTE');
                    values = {};
                }
                values.night = weatherValue;
                data[key] = values;
            }
        }
        console.log(data);
        return data;
    },

    formatDate: function (timestamp) {

    }
};

exports.read = async (ctx) => {
    const city = ctx.params.city;
    openweathermap.city = city;
    return openweathermap.getData();
};

