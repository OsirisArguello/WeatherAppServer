const { status, json } = require('server/reply');

exports.read = async (ctx) => {
    const query = ctx.query.query.toLowerCase();
    const fs = require("fs");
    // Get content from file
    const contents = fs.readFileSync("./data/city.list.json");
    // Define to JSON type
    const jsonContent = JSON.parse(contents);
    // Filter results
    let result = [];
    for(const key in jsonContent) {
        if ((jsonContent[key].name.toLowerCase().startsWith(query))&&(jsonContent[key].country='AR')) {
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

