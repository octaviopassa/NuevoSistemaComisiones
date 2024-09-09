Meteor.callSync = (method, params) => {
	return new Promise((resolve, reject) => {
		Meteor.call(method, params, (err, res) => {
			if (err) {
				return reject(err);
			}
			resolve(res);
		});
	});
};