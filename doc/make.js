var fs = require('fs');
var namp = require("../lib/namp");

fs.readFile("./SYNTAX.md", "utf8", function (err, data) {
    if (err)
        console.error(err);
	else {
		var output = namp(data);
		fs.writeFileSync("./SYNTAX.html", output.html);

		console.log("Finished! By the way, I found this metadata:\n" + require('util').inspect(output.metadata));
	}
});