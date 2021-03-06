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
        return this.filterForecast3(forecast);
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
            if (date.getHours() < 12) {
                let key = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();
                weatherValue = this.getWeatherData(forecast.list[i]);
                values = key in data ? data[key] : {};
                values.day = weatherValue;
                data[key] = values;
            } else if (date.getHours() >= 12) {
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

    filterForecast2: function (forecast) {
        let data = {};
        for (let i in forecast.list) {
            let keyDate = forecast.list[i].dt_txt.split(' ')[0];
            let keyHour = forecast.list[i].dt_txt.split(' ')[1].split(':')[0];
            if (data[keyDate] === undefined) {
                console.log("AGREGO "+ keyDate)
                data[keyDate] = [];
            }
            console.log("HORA "+ keyHour);
            //data[keyDate].push(keyHour);
            data[keyDate].push(this.getWeatherData(forecast.list[i], keyHour));
        }
        return data;
    },

    filterForecast3: function (forecast) {
        let data = {};
        let currentDate = undefined;
        for (let i in forecast.list) {
            let keyDate = forecast.list[i].dt_txt.split(' ')[0];
            let keyHour = forecast.list[i].dt_txt.split(' ')[1].split(':')[0];
            if (currentDate === undefined) {
                currentDate = keyDate;
            }
            if (data[keyDate] === undefined) {
                data[keyDate] = {};
            }
            if (keyHour < 12) {
                if(data[keyDate].day === undefined) {
                    data[keyDate].day = {};
                }
                data[keyDate].day.icon = forecast.list[i].weather[0].icon.replace(/.$/,"d");
                let temp = data[keyDate].day.temperature === undefined ? 0 : data[keyDate].day.temperature;
                let count = data[keyDate].day.size === undefined ? 0 : data[keyDate].day.size;
                temp += (forecast.list[i].main.temp_min + forecast.list[i].main.temp_max) / 2;
                count++;
                data[keyDate].day.temperature = temp;
                data[keyDate].day.size = count;
            } else {
                if(data[keyDate].night === undefined) {
                    data[keyDate].night = {};
                }

                data[keyDate].night.icon = forecast.list[i].weather[0].icon.replace(/.$/,"n");
                let temp = data[keyDate].night.temperature === undefined ? 0 : data[keyDate].night.temperature;
                let count = data[keyDate].night.size === undefined ? 0 : data[keyDate].night.size;
                temp += (forecast.list[i].main.temp_min + forecast.list[i].main.temp_max) / 2;
                count++;
                data[keyDate].night.temperature = temp;
                data[keyDate].night.size = count;
            }
            if (currentDate !== keyDate || (i == (forecast.list.length - 1))) {
                if (data[currentDate].day !== undefined) {
                    data[currentDate].day.temperature = (data[currentDate].day.temperature / data[currentDate].day.size).toFixed(2);
                    delete data[currentDate].day.size;
                }
                data[currentDate].night.temperature = (data[currentDate].night.temperature / data[currentDate].night.size).toFixed(2);
                delete data[currentDate].night.size;
                if (i != (forecast.list.length - 1)) {
                    currentDate = keyDate;
                    data[currentDate] = {};
                }
            }
        }
        let myArray = [];
        let today = undefined;
        let dates = Object.keys(data);
        for (let i = 0; i < 5; i++) {
            myArray[i] = {};
            myArray[i].date = dates[i];
            if (data[myArray[i].date].day !== undefined) {
                myArray[i].day = {};
                myArray[i].day.temperature = data[myArray[i].date].day.temperature;
                myArray[i].day.icon = data[myArray[i].date].day.icon;
            }
            myArray[i].night = {};
            myArray[i].night.temperature = data[myArray[i].date].night.temperature;
            myArray[i].night.icon = data[myArray[i].date].night.icon;
        }
        return myArray;
    },

    getWeatherData: function (forecast, hour) {
        let weatherValue = {};
        weatherValue.hour = hour;
        weatherValue.temperature = (forecast.main.temp_min + forecast.main.temp_max) / 2;
        weatherValue.weather = forecast.weather[0].description;
        return weatherValue;
    },

    getLondonWeather: function () {
        let data = [];
        let date = new Date();
        for (let i = 0; i < 5; i++) {
            let keyDate = date.toISOString().slice(0,10).replace(/-/g,"-");;
            let arrayDate = {};
            let day = {};
            let night= {};
            data[i] = [];
            arrayDate.date = keyDate;
            day.temperature = "12.1";
            day.icon = "50d";
            night.temperature = "2.1";
            night.icon = "50n";
            arrayDate.day = day;
            arrayDate.night = night;
            data[i] = arrayDate;
            date.setDate(date.getDate() + 1);
        }
        return data;
    },

    getCancunWeather: function () {
        let data = [];
        let date = new Date();
        for (let i = 0; i < 5; i++) {
            let keyDate = date.toISOString().slice(0,10).replace(/-/g,"-");;
            data[i] = {};
            data[i].date = keyDate;
            data[i].day = {};
            data[i].night = {};
            data[i].day.temperature = "12.1";
            data[i].night.temperature = "2.1";
            date.setDate(date.getDate() + 1);
        }
        date = new Date();
        let keyDate = date.toISOString().slice(0,10).replace(/-/g,"-");;
        data[0].day.icon = "01d";
        data[0].night.icon = "01n";
        date.setDate(date.getDate() + 1);
        keyDate = date.toISOString().slice(0,10).replace(/-/g,"-");;
        data[1].day.icon = "02d";
        data[1].night.icon = "02n";
        date.setDate(date.getDate() + 1);
        keyDate = date.toISOString().slice(0,10).replace(/-/g,"-");;
        data[2].day.icon = "03d";
        data[2].night.icon = "03n";
        date.setDate(date.getDate() + 1);
        keyDate = date.toISOString().slice(0,10).replace(/-/g,"-");;
        data[3].day.icon = "04d";
        data[3].night.icon = "04n";
        date.setDate(date.getDate() + 1);
        keyDate = date.toISOString().slice(0,10).replace(/-/g,"-");;
        data[4].day.icon = "09d";
        data[4].night.icon = "09n";
        date.setDate(date.getDate() + 1);

        return data;
    },

    getHabanaWeather: function () {
        let data = [];
        let date = new Date();
        for (let i = 0; i < 5; i++) {
            let keyDate = date.toISOString().slice(0,10).replace(/-/g,"-");;
            data[i] = {};
            data[i].date = keyDate;
            data[i].day = {};
            data[i].night = {};
            data[i].day.temperature = "12.1";
            data[i].night.temperature = "2.1";
            date.setDate(date.getDate() + 1);
        }
        date = new Date();
        let keyDate = date.toISOString().slice(0,10).replace(/-/g,"-");;
        data[0].day.icon = "10d";
        data[0].night.icon = "10n";
        date.setDate(date.getDate() + 1);
        keyDate = date.toISOString().slice(0,10).replace(/-/g,"-");;
        data[1].day.icon = "11d";
        data[1].night.icon = "11n";
        date.setDate(date.getDate() + 1);
        keyDate = date.toISOString().slice(0,10).replace(/-/g,"-");;
        data[2].day.icon = "13d";
        data[2].night.icon = "13n";
        date.setDate(date.getDate() + 1);
        keyDate = date.toISOString().slice(0,10).replace(/-/g,"-");;
        data[3].day.icon = "50d";
        data[3].night.icon = "50n";
        date.setDate(date.getDate() + 1);
        keyDate = date.toISOString().slice(0,10).replace(/-/g,"-");;
        data[4].day.icon = "09d";
        data[4].night.icon = "09n";
        date.setDate(date.getDate() + 1);

        return data;
    }

};

exports.read = async (ctx) => {
    const city = ctx.params.city;
    console.log("Obteniendo información del clima de la ciudad "+city);
    openweathermap.city = city;
    switch (city) {
        case "1":
            return openweathermap.getLondonWeather();
            break;
        case "2":
            return openweathermap.getCancunWeather();
            break;
        case "3":
            return openweathermap.getHabanaWeather();
            break;
        case "4":
            return openweathermap.getLondonWeather();
            break;
        default:
            return openweathermap.getData();
    }
};

