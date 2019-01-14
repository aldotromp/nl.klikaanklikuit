'use strict';

const Kaku = require('./kaku');

module.exports = RFDevice => class Blinds extends Kaku(RFDevice) {

	onRFInit() {
		super.onRFInit();
		this.sendToggleTimeout = {};
	}

	/**
	 * Catch the inverted flag to reverse the direction.
	 * 
	 * @param {object} data Object with device data to modify.
	 */
	parseIncomingData(data) {
		data = super.parseIncomingData(data);

		// Asume that every signal means up or down depending on the state and there are no other signals
		data.windowcoverings_state = Number(data.state) ? 'up' : 'down';

		// If the rotated setting is set invert the up/down axis of all incoming data
		if (this.getSetting('rotated') === '180') {
			if (data.windowcoverings_state === 'up' || data.windowcoverings_state === 'down') {
				data.windowcoverings_state = data.windowcoverings_state === 'up' ? 'down' : 'up';
			}
		}

		if (this.stateTransition && this.stateTransition === data.windowcoverings_state) {
			data.windowcoverings_state = 'idle';
		} else {
			data.direction = data.windowcoverings_state;
		}

		return data;
	}

	/**
	 * Modifies the outgoing data to take care of state changes and reverse direction settings.
	 * 
	 * @param {object} data Object with device data to modify.
	 */
	parseOutgoingData(data) {
		if (data.windowcoverings_state === 'idle') {
			if (this.stateTransition) {
				data.state = this.stateTransition === (this.getSetting('rotated') === '180' ? 'down' : 'up') ? 1 : 0;
			} else {
				this.stateTransition = this.lastDirection || 'up';
				data.windowcoverings_state = this.stateTransition;
			}
		}
		if (!this.isPairInstance && this.getSetting('rotated') === '180') {
			if (data.windowcoverings_state === 'up' || data.windowcoverings_state === 'down') {
				const virtualDirection = data.windowcoverings_state === 'up' ? 'down' : 'up';
				data = Object.assign({}, data, { windowcoverings_state: virtualDirection });
			}
		}
		if (!data.windowcoverings_state) {
			data.windowcoverings_state = data.state ? 'up' : 'down';
		} else if (data.windowcoverings_state !== 'idle') {
			data.state = data.windowcoverings_state === 'up' ? 1 : 0;
		}
		delete data.windowcoverings_state;
		return data;
	}

	/**
	 * Since the kaku devices don't send any status report back, toggle the state back to idle after 2 minutes.
	 * This works fine because no kaku blind has a duration like this.
	 * 
	 * @param {string} capability The capability to change
	 * @param {*} value The original value of the capability
	 */
	setCapabilityValue(capability, value) {
		if (
			capability === 'windowcoverings_state' &&
			this.hasCapability(capability)
		) {
			clearTimeout(this.sendToggleTimeout[capability]);
			this.stateTransition = null;
			if (value !== 'idle') {
				this.lastDirection = value;
				this.stateTransition = value;
				this.sendToggleTimeout[capability] = setTimeout(() => {
					this.stateTransition = null;
				}, 120000);
			}
		}
		return super.setCapabilityValue(capability, value);
	}
};
