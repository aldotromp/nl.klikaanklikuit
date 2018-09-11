'use strict';

const Homey = require('homey');
const util = require('homey-rfdriver').util;
const KakuDevice = require('../../lib/devices/kaku/kaku.js');

// To extend from another class change the line below to
// module.exports = RFDevice => class AKCT510Device extends MyGenericDevice(RFDevice) {
// and define MyGenericDevice like so
// module.exports = RFDevice => class MyGenericDevice extends RFDevice {
module.exports = RFDevice => class AKCT510Device extends KakuDevice(RFDevice) {

    onRFInit() {
        super.onRFInit();

        // Init your device here
    }

    assembleDeviceObject() {
		// Ignore check for group button
		return super.assembleDeviceObject(true);
	}

};
