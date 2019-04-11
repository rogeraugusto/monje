const mongoose = require('../database');

const IpsSchema = new mongoose.Schema({
	ips: [String]
});

const Ips = mongoose.model('Ips', IpsSchema);

module.exports = Ips;
