'use strict';

const util = require('homey-rfdriver').util;
const DefaultDevice = require('../DefaultDevice');

/**
 * 					433 Kaku signal description			
 * 
 *	Example payload : 01110001110100101001100110010000 (32 bits)
 * 
 *	01110001110100101001100110		0		1		00		01
 *	---- address (26 bit) ----		group	state	channel	unit
 * 	
 */

module.exports = RFDevice => class Kaku extends DefaultDevice(RFDevice) {

	onRFInit() {
		super.onRFInit();
		this.clearFromEmptySendObject = ['onoff', 'dim'];
	}

	/**
	 * Modify the data before it's going to Homey.
	 * 
	 * @param {object} data  Object with device data to modify.
	 */
	onData(data) {
		// Check if the group bit is 1. If it is, we want only change the group state and not the channel.
		// This is due the channel for group always beinig 00, but a device can be paired on another.
		if (data && data.group) {
			this.lastFrame.group = data.group;
		} else {
			this.lastFrame = data;
		}

		// Call super.onData() for the generic functionality
		data = super.onData(data);
	}

	/**
	 * Function to generate data which is used to pair a device through the program option.
	 */
	static generateData() {
		const data = {
			address: util.generateRandomBitString(26),
			group: 0,
			channel: util.generateRandomBitString(2),
			unit: util.generateRandomBitString(2),
			state: 0,
			onoff: false,
		};
		data.id = `${data.address}:${data.channel}:${data.unit}`;
		return data;
	}

	/**
	 * Function to parse the received payload to usable device data.
	 * This follows the described protocol.
	 * 
	 * @param {*} payload Bitarray which contains the payload and is parsed to device data.
	 */
	static payloadToData(payload) {
		if (payload.length >= 32) {
			const data = {
				address: util.bitArrayToString(payload.slice(0, 26)),
				group: payload[26],
				state: payload[27],
				onoff: Boolean(Number(payload[27])),
				channel: util.bitArrayToString(payload.slice(28, 30)),
				unit: util.bitArrayToString(payload.slice(30, 32))
			};
            data.id = `${data.address}:${data.channel}:${data.unit}`;
            // console.log('data', data);
			return data;
		}
		return null;
	}

	/**
	 * Function to convert device data to a payload which then can be send through RFdriver.
	 * 
	 * @param {*} data Object containing device data which should be used to create the payload.
	 */
	static dataToPayload(data) {
		// test for kaku signal
		if (
			data &&
			data.address && (data.address.length === 26) &&
			data.channel && (data.channel.length === 2) &&
			data.unit && (data.unit.length === 2) &&
			typeof data.group !== 'undefined' &&
			typeof data.state !== 'undefined'
		) {
			const address = util.bitStringToBitArray(data.address);
			const channel = util.bitStringToBitArray(data.channel);
			const unit = util.bitStringToBitArray(data.unit);
			return address.concat(
				Number(data.group),
				Number(typeof data.onoff === 'boolean' ? data.onoff : data.state), // Dit gaat dus niet altijd goed en resulteert niet in een consistente payload.
				// Number(data.state),
				channel,
				unit
			);
		}
		// No valid data so return null.
		return null;
	}
};