'use strict';

const Homey = require('homey');
const util = require('homey-rfdriver').util;
const DoorbellDevice = require('../../lib/devices/kaku/doorbell.js');

// To extend from another class change the line below to
// module.exports = RFDevice => class ACDB6600RCDevice extends MyGenericDevice(RFDevice) {
// and define MyGenericDevice like so
// module.exports = RFDevice => class MyGenericDevice extends RFDevice {
module.exports = RFDevice => class ACDB6600RCDevice extends DoorbellDevice(RFDevice) {

    onRFInit() {
        super.onRFInit();

        // Init your device here
    }

};
