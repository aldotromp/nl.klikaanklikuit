'use strict';

const Remote = require('./remote');
const util = require('homey-rfdriver').util;

module.exports = RFDevice => class DimmingRemote extends Remote(RFDevice) {

	onRFInit() {
		super.onRFInit();
		this.clearFromEmptySendObject = ['dim', 'dimup', 'isdim'];
	}

	/**
	 * Additional payloadToData to extract and calculate the dim value from the payload.
	 * 
	 * @param {array} payload Bitarray containing the payload to parse.ho
	 */
	static payloadToData(payload) {
		// check if the signal is the normal signal, if so use the normal functions.
		if (payload && payload.length === 32 && payload.indexOf(2) === -1) {
			const data = super.payloadToData(payload);
			if (!data) return data;

			data.isdim = false;
			data.id = data.address;

			return data;
		} else if (
			payload &&
			payload.length === 36 &&
			payload.slice(0, 26).indexOf(2) === -1 &&
			payload.slice(28, 36).indexOf(2) === -1 &&
			payload[27] === 2
		) {
			const data = {
				address: util.bitArrayToString(payload.slice(0, 26)),
				group: payload[26],
				channel: util.bitArrayToString(payload.slice(28, 30)),
				unit: util.bitArrayToString(payload.slice(30, 32)),
				state: 1,
				dim: util.bitArrayToNumber(payload.slice(32, 36)) / 15,
				isdim: true,
			};

			data.id = data.address;

			return data;
		}
		return null;
	}

	/**
	 * Create a payload with the dim value embedded in it.
	 * 
	 * @param {object} data Object with device data to create a payload from.
	 */
	static dataToPayload(data) {
		if (
			data &&
			data.address && data.address.length === 26 &&
			data.channel && data.channel.length === 2 &&
			data.unit && data.unit.length === 2 &&
			typeof data.group !== 'undefined' &&
			(
				(typeof data.state !== 'undefined' && Number(data.state) !== 2) ||
				(typeof data.dim !== 'undefined' && Number(data.dim) >= 0 && Number(data.dim) <= 1) ||
				(data.dim === 'up' || data.dim === 'down')
			)
		) {
			const address = util.bitStringToBitArray(data.address);
			const channel = util.bitStringToBitArray(data.channel);
			const unit = util.bitStringToBitArray(data.unit);
			// Calculate dim value
			if (data.dim) {
				let dim;
				if (typeof data.dim === 'string') {
					dim = data.dim === 'up' ? [1, 1, 1, 1] : [0, 0, 0, 0];
				} else {
					dim = util.numberToBitArray(Math.round(Math.min(1, Math.max(0, data.dim)) * 15), 4);
				}
				return address.concat(data.group ? 1 : 0, 2, channel, unit, dim);
			}
			return address.concat(Number(data.group), Number(data.state), channel, unit);
		}
		return null;
	}

	/**
	 * Obtain the stored dim value and use it to calculate the dim action.
	 * 
	 * @param {object} data Device data to modify.
	 */
	parseIncomingData(data) {
		data = super.parseIncomingData(data);

		if (data.hasOwnProperty('dim')) {
			const currDim = this.getStoreValue('dim');
			if (currDim !== null && !isNaN(currDim)) {
				if (currDim < data.dim || data.dim === 1) {
					data.dimup = true;
				} else if (currDim > data.dim || data.dim === 0) {
					data.dimup = false;
				}
			} else {
				data.dimup = data.dim >= 0.5;
			}
		}
		return data;
	}

	/**
	 * When data is received, place the dim value in the device store.
	 * 
	 * @param {object} data Device data to modify.
	 */
	onData(data) {
		if (typeof data.dimup === 'boolean') {
			this.setStoreValue('dim', data.dim);
		}
		super.onData(data);
	}

	onFlowTriggerFrameReceived(args, state) {
		if (args.state === 'dimup' || args.state === 'dimdown') {
			args.dimup = args.state === 'dimup';
			args.isdim = true;
			delete args.state;
		} else {
			args.isdim = false;
		}
		return super.onFlowTriggerFrameReceived(args, state);
	}
};
