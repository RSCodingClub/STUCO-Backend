var scoreUtils = require(__dirname + "/../scoreutils");

module.exports = function(app) {
    app.get('/', function(req, res) {
        // res.send('<html><head><meta name="google-site-verification" content="pirFkTJj7EcnzaStY6ttuG-hHJ2NVceKqBA1Y0lgSRw" /></head></html>');
		res.send("Hello World!");
    });
}
