# Web serialport simulator 

A web serialport assistant

## Dependence

* nodejs
* Python

## Usege

* Build 

  ```Bash
  npm run i-all && npm run build
  ```

* run

  ```bash
  npm run start -- -p /dev/tty.usbserial-A906QX95 -b 9600
  ```

* Parameter:

  -p:serialport name

  -b:baudRate

  will use config ,if not parameter given

  For other config (dataBits,parity,stopBits) see /config/config.*.js



