const { status, json } = require('server/reply');

exports.read = async (ctx) => {
    const query = ctx.query.query.toLowerCase();
    console.log("Obteniendo ciudades que comienzan con "+query);
    const fs = require("fs");
    // Get content from file
    const contents = fs.readFileSync("./data/city.list.json");
    // Define to JSON type
    let jsonContent = JSON.parse(contents);

    // Agrego ciudades hardcodeadas para testeo de escenarios
    jsonContent.push({"id": 1, "name": "Londres", "country": "AR", "coord": {"lon": 37.666668, "lat": 55.683334}});
    jsonContent.push({"id": 2, "name": "Berna", "country": "AR", "coord": {"lon": 37.666668, "lat": 55.683334}});
    jsonContent.push({"id": 3, "name": "Cancún", "country": "AR", "coord": {"lon": 37.666668, "lat": 55.683334}});
    jsonContent.push({"id": 4, "name": "La Habana", "country": "AR", "coord": {"lon": 37.666668, "lat": 55.683334}});
    // Filter results
    let result = [];
    for(const key in jsonContent) {
        if ((jsonContent[key].name.toLowerCase().startsWith(query))&&(jsonContent[key].country=='AR')) {
            result.push(jsonContent[key]);
        }
    }
    // Sorting
    result.sort(function (a, b) {
        return ((a.name === b.name) ? 0 : ((a.name > b.name) ? 1 : -1));
    });
    ctx => header({'Content-Type': 'application/json'});
    return result;
};

