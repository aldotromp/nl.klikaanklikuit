'use strict';

const Remote = require('./remote');
const util = require('homey-rfdriver').util;

module.exports = RFDevice => class WallSwitch extends Remote(RFDevice) {

	onRFInit() {
		super.onRFInit();

		// Obtain the buttoncount, otherwise assume that there is only one button.
		this.options.buttonCount = this.options.buttonCount || 1;
	}

	/**
	 * Catch the data and modify the data if the switch is mounted rotated.
	 * 
	 * @param {object} data Parsed payload data which should be modified.
	 */
	parseIncomingData(data) {
		if (Number(data.group)) {
			return null;
		}
		let baseUnitInt = this.baseUnitInt;
		if (this.isPairInstance && isNaN(baseUnitInt)) {
			baseUnitInt = this.calcBase(data.unit);
		}
		let buttonIndex = parseInt(data.unit, 2) - baseUnitInt;
		if (buttonIndex < 0 || buttonIndex >= this.options.buttonCount) {
			return null;
		}
		if (this.options.buttonCount > 1 && !this.isPairInstance && this.getSetting('rotated') === '180') {
			buttonIndex = Math.abs(buttonIndex - (this.options.buttonCount - 1));
		}
		data.buttonIndex = buttonIndex;
		return super.parseIncomingData(data);
	}


	/**
	 * Parse the data before creating a payload. When the button is rotated in Homey, this modifies the payload to the orignal values.
	 * 
	 * @param {object} data 
	 */
	parseOutgoingData(data) {
		if (data.buttonIndex) {
			let buttonIndex = data.buttonIndex;
			if (this.options.buttonCount > 1 && !this.isPairInstance && this.getSetting('rotated') === '180') {
				buttonIndex = Math.abs(buttonIndex - (this.options.buttonCount - 1));
			}
			data.unit = (this.baseUnitInt + buttonIndex).toString(2).padStart(2, 0);
			delete data.buttonIndex;
		}
		return super.parseOutgoingData(data);
	}

	/**
	 * Helper function to to obtain the base unit value.
	 */
	get baseUnitInt() {
		if (!this._cacheBaseUnit || this.isPairInstance) {
			this._cacheBaseUnit = this.calcBase(this.getData().unit);
		}
		return this._cacheBaseUnit;
	}

	/**
	 * Helper function to to generate the base unit value.
	 */
	calcBase(unit) {
		const unitInt = parseInt(unit, 2);
		return unitInt - (unitInt % (this.options.buttonCount));
	}


	onFlowTriggerFrameReceived(args, state) {
		if (args.unit) {
			args.buttonIndex = parseInt(args.unit, 2) % this.options.buttonCount;
			delete args.unit;
		}
		return super.onFlowTriggerFrameReceived(args, state);
	}
};
