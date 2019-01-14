'use strict';

const Sensor = require('./sensor');

module.exports = RFDevice => class Doorbell extends Sensor(RFDevice) {

	/**
	 * Function to set the doorbell capability based on the state boolean.
	 * 
	 * @param {object} data: Data from RFdriver.
	 */
	parseOutgoingData(data) {
		this.getCapabilities().forEach(capabilityId => {
			if (data.hasOwnProperty(capabilityId)) {
				data.state = data[capabilityId] ? 0 : 1;
			}
		});
		return data;
	}

	/**
	 * If state is a number, return directly
	 * @param {object} data Object with device data.
	 */
	triggerFlowsOnData(data) {
		if (!Number(data.state)) {
			return;
		}
		super.triggerFlowsOnData(data);
	}

};
