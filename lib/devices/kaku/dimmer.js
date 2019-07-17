'use strict';

const Kaku = require('./kaku');
const util = require('homey-rfdriver').util;

module.exports = RFDevice => class Dimmer extends Kaku(RFDevice) {

	/**
	 * Override payloadToData from kaku to be able to extract the dimlevel.
	 * 
	 * @param {array} payload : Bitarray with the payload
	 */
	static payloadToData(payload) {
		// If no dim value is embedded in the payload, use the normal protocol
		if (payload && payload.indexOf(2) === -1) {
			return super.payloadToData(payload);
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
				// state: 1, // geen state zodat deze niet kan gaan conflicteren
				onoff: true,
				// Slice the payload, convert to number, then divide by 15 to get the value. Then round on 1 decimal.
				dim: Math.round( (util.bitArrayToNumber(payload.slice(32, 36) ) / 15) * 10) /10,
			};
			console.log('Parsed dim value', data.dim);

			data.id = `${data.address}:${data.channel}:${data.unit}`;
			return data;
		}
		return null;
	}

	/**
	 * Override dataToPayload from kaku to be able to send the dimlevel
	 * 
	 * @param {object} data: Object with the device data.
	 */
	static dataToPayload(data) {
		// If no dimlevel is present, use the normal protocol
		if (
			data &&
			data.address && data.address.length === 26 &&
			data.channel && data.channel.length === 2 &&
			data.unit && data.unit.length === 2 &&
			typeof data.group !== 'undefined' &&
			(typeof data.dim !== 'undefined' && Number(data.dim) > 0 && Number(data.dim) <= 1)
		) {
			const address = util.bitStringToBitArray(data.address);
			const channel = util.bitStringToBitArray(data.channel);
			const unit = util.bitStringToBitArray(data.unit);
			// Calculate dim value
			const dim = util.numberToBitArray(Math.round(Math.min(1, Math.max(0, data.dim)) * 15), 4);
			console.log('Created dim payload', dim);
			return address.concat(data.group ? 1 : 0, 2, channel, unit, dim);
		}
		if (Number(data.dim) === 0 && data.dim !== null) {
			data.onoff = false;
		}
		return super.dataToPayload(data);
	}

	parseOutgoingData(data) {
		try {
			if (!data.dim && data.onoff && this.hasCapability('dim')) {
				// To not miss any bits in the signal, set a dimvalue
				data.dim = this.getCapabilityValue('dim') || 0.05;
			}
		} catch (error) { console.log(error) }
		return super.parseOutgoingData(data);
	}

};
