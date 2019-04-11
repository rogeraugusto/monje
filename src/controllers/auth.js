const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authConfig = require('../config/auth');

const User = require('../models/user');

function generateToken(params = {}) {
	return jwt.sign(params, authConfig.secret, {
		expiresIn: 86400
	})
}

module.exports = app => {

	app.post('/register', async (req, res) => {

		const { email } = req.body;

		try {

			if (await User.findOne({ email }))
				return res.status(400).send({ error: 'User already exists' });

			const user = await User.create(req.body);

			user.password = undefined;

			return res.send({ 
				user, 
				token: generateToken({ id: user.id }) 
			});
			
		} catch (err) {
			return res.status(400).send({ error: 'Registration failed' });
		}
	});

	app.get('/login', (req, res) => {
		
		let sess = req.session;
		sess.token = null;
		res.render('login', { authError: '' });
	});

	app.post('/login', async (req, res) => {

		let sess = req.session;
		sess.token = null;

		const { email, password } = req.body;

		const user = await User.findOne({ email }).select('+password');

		if (!user) {
			res.render('login', { authError: 'User not found' });
			return;
		}

		if (!await bcrypt.compare(password, user.password)) {
			res.render('login', { authError: 'Invalid password' });
			return; 
		}

		user.password = undefined;
		let genToken = generateToken({ id: user.id });
		sess.token = `Bearer ${genToken}`;

		res.redirect('/devices');
	});

}
