module.exports = app => {

	app.get(['/', '/generate_204', '/hotspot-detect', '/ncsi.txt'], function(req, res) {
	  res.redirect('http://10.1.82.1:3000/login')
	});

}