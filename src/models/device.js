const mongoose = require('../database');

const DeviceSchema = new mongoose.Schema({
	title: {
	   	type: String,
	   	required: true
	},
	device: {
		os: { type: String },
		version: { type: String },
		client: { type: String },
		type: { type: String },
		model: { type: String },
		brand: { type: String },
		mac: { type: String, required: true }
	},
	user: {
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'User',
		required: true
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});

const Device = mongoose.model('Device', DeviceSchema);

module.exports = Device;
