'use strict';

const Sensor = require('./sensor');
const util = require('homey-rfdriver').util;

module.exports = RFDevice => class Doorbell extends Sensor(RFDevice) {

	parseOutgoingData(data) {
		this.getCapabilities().forEach(capabilityId => {
			if (data.hasOwnProperty(capabilityId)) {
				data.state = data[capabilityId] ? 0 : 1;
			}
		});
		return data;
	}

	triggerFlowsOnData(data) {
		if (!Number(data.state)) {
			return;
		}
		super.triggerFlowsOnData(data);
	}

};
