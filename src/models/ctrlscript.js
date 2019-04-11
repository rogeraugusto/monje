const mongoose = require('../database');

const CtrlscriptSchema = new mongoose.Schema({
	status: { type: String }
});

const Ctrlscript = mongoose.model('Ctrlscript', CtrlscriptSchema);

module.exports = Ctrlscript;
