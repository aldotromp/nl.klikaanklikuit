'use strict';

const Kaku = require('./kaku');

module.exports = RFDevice => class Sensor extends Kaku(RFDevice) {

	onRFInit() {
		super.onRFInit();

		// Variables for timeout on the sensor
		this.sendToggleTimeout = {};
		this.toggleCapabilityValue = {};
	}

	/**
	 * Function to set the sensor capability based on the state boolean.
	 * 
	 * @param {object} data: Data from RFdriver 
	 */
	parseIncomingData(data) {
		data = super.parseIncomingData(data);

		this.getCapabilities().forEach(capabilityId => {
			if (!data.hasOwnProperty(capabilityId)) {
				data[capabilityId] = Boolean(Number(data.state));
			}
		});
		return data;
	}

	/**
	 * Function to set the sensor capability to state before building a payload
	 * 
	 * @param {object} data: Data to RFdriver 
	 */
	parseOutgoingData(data) {
		this.getCapabilities().forEach(capabilityId => {
			if (data.hasOwnProperty(capabilityId)) {
				data.state = data[capabilityId] ? 1 : 0;
			}
		});
		return data;
	}

	assembleDeviceObject() {
		// Ignore check for group button
		return super.assembleDeviceObject(true);
	}
};
