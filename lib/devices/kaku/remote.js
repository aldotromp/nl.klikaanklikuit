'use strict';

const Kaku = require('./kaku');

module.exports = RFDevice => class Remote extends Kaku(RFDevice) {

	/**
	 * Strip the unit from the ID because a remote has multiple units.
	 * 
	 * @param {array} payload Bitarray with the payload to parse
	 */
	static payloadToData(payload) {
		const data = super.payloadToData(payload);
		if (!data) return data;

		data.id = data.address;
		return data;
	}

	/**
	 * Parse the group state.
	 * 
	 * @param {object} args 
	 * @param {object} state 
	 */
	onFlowTriggerFrameReceived(args, state) {
		if (args.unitchannel) {
			args.unit = args.unitchannel.slice(0, 2);
			args.channel = args.unitchannel.slice(2, 4);
			delete args.unitchannel;
		}
		if (args.unit === 'g') {
			args.unit = '00';
			args.group = 1;
			delete args.channel;
		} else {
			args.group = 0;
		}
		return super.onFlowTriggerFrameReceived(args, state);
	}

	// Remotes cannot be paired with the groupbutton so prevent this.
	assembleDeviceObject() {
		// Ignore check for group button
		return super.assembleDeviceObject(true);
	}
};
