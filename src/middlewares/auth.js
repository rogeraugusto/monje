const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');

module.exports = (req, res, next) => {

	let sess = req.session;
	const authHeader = sess.token; //req.headers.authorization;

	if (!authHeader) {
		res.render('login', { authError: 'No token provided' });
		return;
	}

	// Quebra o token pra identificar se existe o início dele, Bearer
	// Testa se tem duas partes

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

		// Após todas as validações no token, passa o id do usuário que foi usado pra gerar o token
		// devolta pra aplicação, pra ser usado em qualquer controller
		req.userId = decoded.id;
		return next();
	});

};
