# KlikAanKlikUit / Trust / CoCo

Adds support for KlikAanKlikUit / Trust / CoCo devices.

## What's new

### v4.1.1
Corrected doorbell structure and fixed ACDB-7000B.
Ensure correct pairing signal for sockets.

### v4.1.0
Fixed the invalid device data issue. Huge thanks to Geurt Dijker for the continously testing!

### v4.0.14
* Fixed some error translations.
* Corrected doorbell naming scheme and images to be on par with KlikAanKlikUit.
* Added some additional error handling for the protocol.

### v4.0.13
* Changed doorbell devices to have a seperate device for the gong and the button.
* This fixes a issue where the device keeps triggering itself in a flow where both the gong and the button where used.
* If you're using the button in a flow, you'll have to add the button seperately and integrate it again in the flow.

### v4.0.12
Changed AC-300, AC-1000 and AC-3500 to kakunew signal. This should fix the "invalid device data" problems for those devices.

### v4.0.11
Reverted signal fallback.

### v4.0.10
* Added ACM3500 driver.
* Changed dimmer signal, dimmer remotes should be working now.
* Fixed the issue that a doorbell would not trigger in a flow.

### v4.0.7
* Fixed issues with sockets not responding in flows.
* Added a fallback for sending the signal. The error related to device data should be fixed.
* Added a option for sensors to reset after 10 seconds.
* Added ACC-2300 socket

### v4.0.2
This update contains a rewrite using new Homey codebases for RF.
The update replaces almost 100% of the old app, so there could be some bugs.
If you experience a bug you can report it using the button in the appstore.

This update also added some more devices to the app:
* ALED-EC2206
* AMU-500
* PIR-2050
* APC3-2300R
