'use strict';

const Remote = require('./remote');

module.exports = RFDevice => class RemoteValueline extends Remote(RFDevice) {

	onRFInit() {
		super.onRFInit();
		this.on('after_send', this.sendGroupSignal.bind(this));
	}

	/**
	 * Check if the signal already was debounced, if not do so and set the value.
	 * 
	 * @param {object} data 
	 */
	onData(data) {
		console.log('onData', this.debounced, Number(data.group));
		if (this.debounced) return;
		if (Number(data.group)) {
			this.debounced = true;
			clearTimeout(this.debounceTimeout);
			this.debounceTimeout = setTimeout(() => this.debounced = false, 2000);
		}
		super.onData(data);
	}

	/**
	 * Helper function to send a emulated group signal.
	 * 
	 * @param {object} data Device data to create a group signal from
	 */
	sendGroupSignal(data) {
		if (data && Number(data.group) === 1) {
			Promise.all(['00', '01'].map(unit =>
				this.send(Object.assign({}, data, { group: 0, unit }))
			))
				.then(() => this.log('Simulated group payload'));
		}
	}
};
