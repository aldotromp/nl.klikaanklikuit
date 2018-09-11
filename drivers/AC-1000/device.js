'use strict';

const Homey = require('homey');
const util = require('homey-rfdriver').util;
const KakuDevice = require('../../lib/devices/kaku/kaku.js');

// To extend from another class change the line below to
// module.exports = RFDevice => class AC1000Device extends MyGenericDevice(RFDevice) {
// and define MyGenericDevice like so
// module.exports = RFDevice => class MyGenericDevice extends RFDevice {
module.exports = RFDevice => class AC1000Device extends KakuDevice(RFDevice) {

    onRFInit() {
        super.onRFInit();

        // Init your device here
    }

};
