var fs = require('fs');
var namp = require("../lib/marked");

fs.readFile("doc/SYNTAX.md", "utf8", function (err, data) {
    if (err)
        console.error(err);
	else {
		var output = namp(data);
		fs.writeFileSync("doc/SYNTAX.html", output.html);

		console.log("Finished! By the way, I found this metadata:\n" + require('util').inspect(output.metadata));
	}
});