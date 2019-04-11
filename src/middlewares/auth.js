const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');

module.exports = (req, res, next) => {

	let sess = req.session;
	const authHeader = sess.token; 

	if (!authHeader) {
		res.render('login', { authError: 'No token provided' });
		return;
	}

	const parts = authHeader.split(' ');

	if (!parts.length === 2) {
		res.render('login', { authError: 'Token error' });
		return;
	}

	const [ scheme, token ] = parts;

	if (!/^Bearer$/i.test(scheme)) {
		res.render('login', { authError: 'Token malformatted' });
		return;
	}

	jwt.verify(token, authConfig.secret, (err, decoded) => {
		if (err) res.render('login', { authError: 'Token invalid' });

		req.userId = decoded.id;
		return next();
	});

};
