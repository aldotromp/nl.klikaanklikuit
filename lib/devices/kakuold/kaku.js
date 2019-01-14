'use strict';

const DefaultDevice = require('../DefaultDevice');
const util = require('homey-rfdriver').util;

const globalIdList = new Set();

/**
 * 			433 Kaku signal description			
 * 
 *	Example payload : 011110011101 (12 bits)
 * 
 *	011110		01		11		01
 *	address		unit	channel	state
 * 	
 */

module.exports = RFDevice => class Kaku extends DefaultDevice(RFDevice) {

	onRFInit() {
		if (!this.isPairInstance) {
			globalIdList.add(this.getData().id);
		}
		this.clearFromEmptySendObject = ['onoff'];
		return super.onRFInit();
	}

	/**
	 * Helper function to parse the codewheels from the pairing wizard to device data.
	 * @param {*} codewheelIndexes 
	 */
	static codewheelsToData(codewheelIndexes) {
		if (codewheelIndexes.length === 2) {
			const address = codewheelIndexes[0]
				.toString(2)
				.padStart(4, 0)
				.split('')
				.reverse()
				.join('');
			const unitWithChannel = codewheelIndexes[1]
				.toString(2)
				.padStart(4, 0)
				.split('')
				.reverse()
				.join('');
			const data = {
				address: address,
				channel: unitWithChannel.substr(2, 2),
				unit: unitWithChannel.substr(0, 2),
				undef: [0, 1, 1],
				state: 0,
			};
			data.id = `${data.address}:${data.channel}:${data.unit}`;
			return data;
		} else if (codewheelIndexes.length === 1) {
			const data = {
				address: Math.floor(codewheelIndexes[0] / 3)
					.toString(2)
					.padStart(4, 0)
					.split('')
					.reverse()
					.join(''),
				channel: '00',
				unit: Math.floor(codewheelIndexes[0] % 3)
					.toString(2)
					.padStart(2, 0)
					.split('')
					.reverse()
					.join(''),
				undef: [0, 1, 1],
				state: 0,
			};
			data.id = `${data.address}:${data.channel}:${data.unit}`;
			return data;
		}
		return null;
	}

	/**
	 * Function to generate data which is used to pair a device through the program option.
	 * After creating the data, parse it to codewheels to show in the pairing wizard.
	 */
	static generateData() {
		const data = {
			address: util.generateRandomBitString(4),
			channel: util.generateRandomBitString(2),
			unit: util.generateRandomBitString(2),
			undef: [0, 1, 1],
			state: 0,
		};
		data.id = `${data.address}:${data.channel}:${data.unit}`;
		if (globalIdList.has(data.id) && globalIdList.size < 200) {
			return this.generateData();
		}
		data.codewheelIndexes = [
			parseInt(data.address, 2),
			parseInt(data.channel + data.unit, 2),
		];
		return data;
	}

	/**
	 * Function to parse the received payload to usable device data.
	 * This follows the described protocol.
	 * 
	 * @param {array} payload Bitarray which contains the payload and is parsed to device data.
	 */
	static payloadToData(payload) { // Convert received data to usable variables
		if (
			payload &&
			payload.length === 12 &&
			(
				payload.indexOf(2) === -1 ||
				(
					payload.slice(0, 4).indexOf(2) === -1 &&
					payload.slice(4, 8).indexOf(0) === -1 &&
					payload.slice(4, 8).indexOf(1) === -1 &&
					payload.slice(8, 12).indexOf(2) === -1
				)
			)
		) {
			const data = {
				address: util.bitArrayToString(payload.slice(0, 4)),
				channel: util.bitArrayToString(payload.slice(6, 8)),
				unit: util.bitArrayToString(payload.slice(4, 6)),
				group: 0,
				undef: payload.slice(8, 11),
				state: payload[11],
				onoff: Boolean(Number(payload[11]))
			};
			if (data.channel === '22') {
				data.channel = '00';
				data.unit = '00';
				data.group = 1;
			}
			data.id = `${data.address}:${data.channel}:${data.unit}`;
			return data;
		}
		return null;
	}

	/**
	 * Function to convert device data to a payload which then can be send through RFdriver.
	 * 
	 * @param {object} data Object containing device data which should be used to create the payload.
	 */
	static dataToPayload(data) {
		if (this.validateData(data)) {
			const address = util.bitStringToBitArray(data.address);
			const channel = Number(data.group) ? [2, 2] : data.channel.split('').map(Number);
			const unit = Number(data.group) ? [2, 2] : data.unit.split('').map(Number);
			return address.concat(
				unit,
				channel,
				data.undef,
				Number(typeof data.onoff === 'boolean' ? data.onoff : data.state)
			);
		}
		// No valid data so return null.
		return null;
	}

	/**
	 * Function to precise check the signal and generate a detailed error if something does not match.
	 * 
	 * @param {object} data 
	 */
	static validateData(data) {
		let error = false;
		let errorMessages = {}
		if (data) {
			if (data.address.length !== 4) { error = true; errorMessages.address = 'Wrong address size'; }
			if (data.channel.length !==2) { error = true; errorMessages.channel = 'Wrong channel size'; }
			if (data.unit.length !== 2) { error = true; errorMessages.unit = 'Wrong unit size'; }
			if (data.undef.length !== 3) { error = true; errorMessages.unit = 'Wrong undef size'; }
			if (data.state === 'undefined') { error = true; errorMessages.unit = 'State undefined'; }
		}
		if (error) {
			console.log(errorMessages);
			return false;
		} else {
			console.log('valid kakuold signal');
			return true;
		}
	}
};