const { status, json } = require('server/reply');

exports.read = async (ctx) => {
    const query = ctx.query.query.toLowerCase();
    const fs = require("fs");
    console.log("\n *STARTING* \n");
    // Get content from file
    const contents = fs.readFileSync("./data/city.list.json");
    // Define to JSON type
    const jsonContent = JSON.parse(contents);
    let result = [];
    for(const key in jsonContent) {
        if (jsonContent[key].name.toLowerCase().includes(query)) {
            result.push(jsonContent[key]);
        }
    }
    ctx => header({'Content-Type': 'application/json'});
    return result;
};

