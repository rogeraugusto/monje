const express = require('express');
const DeviceDetector = require('node-device-detector');
const authMiddleware = require('../middlewares/auth');

const exec = require('child_process').exec;

const User = require('../models/user');
const Device = require('../models/device');
const Ips = require('../models/ips');
const Deviceip = require('../models/deviceip');
const Ctrlscript = require('../models/ctrlscript');

const router = express.Router();

router.use(authMiddleware);

function os_func() {
    this.execCommand = (cmd, callback) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }

            callback(stdout);
        });
    }
}

router.get('/', async (req, res) => {
	try {
		const user = await User.findById(req.userId);
		const devices = await Device.find({ user: req.userId });

		const sess = req.session;
		let token = sess.token;

		const detector = new DeviceDetector;

		let info = detector.detect(req.headers['user-agent']);

		let deviceIP = (req.headers['X-forwarded-for'] || '').split(',')[0] || req.client.remoteAddress;
		deviceIP = deviceIP.split('f:')

		let deviceMAC = ''

		const os = new os_func();
		let deviceInfo = [];
		let sessDevice = req.session;
		sessDevice.info = null;

		os.execCommand(` arp -n -i wlp7s0 | grep ${deviceIP[1]} | awk '{print $3}' `, returnvalue => {
		    deviceMAC = returnvalue.replace(/\n|\r/g, "");
			deviceInfo = [
				{key: 'OS',      value: info.os.name}, 
				{key: 'Version', value: (info.os.version) ? info.os.version : 'Not provided'}, 
				{key: 'Client',  value: info.client.name}, 
				{key: 'Type', 	 value: info.client.type},
				{key: 'Model', 	 value: (info.device) ? info.device.model : 'Not provided'},
				{key: 'Brand',	 value: (info.device) ? info.device.brand : 'Not provided'},
				{key: 'IP', 	 value: deviceIP[1]},
				{key: 'MAC',	 value: (deviceMAC) ? deviceMAC : 'Not provided'}
			];

			sessDevice.info = deviceInfo;

			return res.render('devices', { user, devices, token, deviceInfo });
		});

	} catch (err) {
		return res.status(400).send({ error: 'Error loading devices' }); 
	}
});

router.get('/:deviceId', async (req, res) => {
	try {
		const device = await Device.findById(req.params.deviceId).populate('user');

		return res.send({ device });
	} catch (err) {
		return res.status(400).send({ error: 'Error load device' }); 
	}
});

router.post('/', async (req, res) => {
	try {

		let result = 'ERRO';
		const ips = await Ips.find( {}, {_id: 0, ips: { $slice: 1 } } );
		let reservedIP = (ips.length > 0) ? ips[0].ips[0] : '';

		if (reservedIP != '') {

			let sessDevice = req.session;
			let infos = sessDevice.info;

			dev = infos.map(data => data.value);
			let exists = false;

			await Device.findOne(
				{ 'device.mac': dev[7] },
			    (err, doc) => { 
			        if (!err) {
			            if (doc) {
			            	exists = true;
			            }
			        }
			    }
			);
					
			if (!exists) {
				const device = await Device.create(
					{ 
						title: req.body.deviceDesc,
						device: {
							os: dev[0],
							version: dev[1],
							client: dev[2],
							type: dev[3],
							model: dev[4],
							brand: dev[5],
							mac: dev[7]
						},
						user: req.userId 
					}
				);

				let deviceID = device.id;
				const deviceip = await Deviceip.create({ 
					ip: reservedIP,
					mac: dev[7],
					device: deviceID
				});

				await Ips.updateOne( { }, { $pull: { ips: reservedIP } });
				
				result = 'OK';	
			} else {
				result = 'EXIST';	
			}
			
		}
		
		await Ctrlscript.updateOne({ },  { $set: { status: 'T' }});
		const devices = await Device.find({ user: req.userId });
		res.json({ response: result, devices });
	} catch (err) {
		return res.status(400).send({ error: 'Error creating new device' }); 
	}
});

router.delete('/:deviceId', async (req, res) => {
	try {

		let result = 'ERRO';
		let reservedIP = '';
		const deviceip = await Deviceip.findOneAndDelete({ device: req.params.deviceId }, (err, doc) => {
			if (!err) {
				reservedIP = doc;
				result = 'OK'
			} 
		});

		await Ips.updateOne( { }, { $push: { ips: reservedIP['ip'] } });
		await Device.findByIdAndRemove(req.params.deviceId);
		await Ctrlscript.updateOne({ },  { $set: { status: 'T' }});
		
		const devices = await Device.find({ user: req.userId });
		res.json({ response: result, devices });
	} catch (err) {
		return res.status(400).send({ error: 'Error delete device', err }); 
	}
});

module.exports = app => app.use('/devices', router); 