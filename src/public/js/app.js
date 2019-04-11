const base_url  = 'http://10.1.82.1:3000';
let sessToken = '';
app = {
	init: token => {
		sessToken = token;

		$('#modalDevice').on('shown.bs.modal', function () {
		  $('#erroCadDevice .alert').remove();
		  $('#edDeviceDesc').focus()
		})	
	},
	loadDevicesTable: (devices) => {
		$("#tableDevices tbody tr").remove()
		if (devices.length > 0){			
			$.each(devices, (e, i) => {
				let d = new Date(i.createdAt);
				let date =("0" + d.getDate()).slice(-2) + "/" + ("0"+(d.getMonth()+1)).slice(-2) + "/" + d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2)

				$("#tableDevices tbody").append([
	                  	'<tr>',
	                    	`<td>${i.title}</td>`,	
	                    	`<td align="center">${i.device.mac}</td>`,	
	                    	`<td align="center">${date}</td>`,	
	                    	`<td align="center"><a href="#" class="btn btn-danger btn-xs" onclick="app.deleteDevice(\'${i._id}\')"><i class="fa fa-trash"></i></a</td>`,	
	                  	'</tr>'
	              	].join(''));
			});
		} else {
			$("#tableDevices tbody").append([
	              	'<tr><td align="center" colspan="4">No devices registered</td></tr>'
	          	].join(''));
		}
	},
	saveDevice: () => {
		let deviceDesc =  $("#edDeviceDesc").val();
		if (deviceDesc == '') {
			$("#edDeviceDesc").focus();
		} else {
	        $.ajax({
	          url: `${base_url}/devices`,
	          dataType: "JSON",
	          data: { deviceDesc },
	          type: "POST",
	          headers: {"Authorization": sessToken},
	          success: data => {
	          	if (data.response == 'OK') {
	          		let devices = data.devices;
	          		$('#modalDevice').modal('hide');
	          		$("#edDeviceDesc").val('');
	          		app.loadDevicesTable(devices);

					$('body').loading({ message: 'Authenticating...' });					
					setTimeout(() => { 
						$('body').loading('stop'); 
	          			window.location.replace("http://10.1.82.1:3000/done"); 
					}, 5000);
	          	} else if (data.response == 'EXIST') {
					$('#erroCadDevice').append(
						`<div class="alert alert-danger" role="alert">
						  <strong>Alert!</strong> Device already registered.
						</div>`
					);
	          	}
	          }
	        });	
		}
	},
	deleteDevice: (id) => {
        $.ajax({
          url: `${base_url}/devices/${id}`,
          dataType: "JSON",
          type: 'DELETE',
          headers: {"Authorization": sessToken},
          success: data => {
          	if (data.response == 'OK') {
          		let devices = data.devices;
          		app.loadDevicesTable(devices);
          	}
          }
        });
	}
}