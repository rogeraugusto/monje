const mongoose = require('../database');

const DeviceipSchema = new mongoose.Schema({
	ip: {
	   	type: String,
	   	required: true
	},
	mac: {
	   	type: String,
	   	required: true
	},
	device: {
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'Device',
		required: true
	}
});

const Deviceip = mongoose.model('Deviceip', DeviceipSchema);

module.exports = Deviceip;
