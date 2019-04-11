const express = require('express');
const authMiddleware = require('../middlewares/auth');
const router = express.Router();

router.use(authMiddleware);

router.get('/', (req, res) => {
	let sess = req.session;
	sess.token = null;

	res.render('done')
});

module.exports = app => app.use('/done', router); 