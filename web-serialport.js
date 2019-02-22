//dependencies
const loadConfig = require('./tool/loadConfig')
let config_name = process.env.NODE_ENV
const config = loadConfig(config_name)
const open = require('open')
require('./tool/arrUtil')
const uuid = require('uuid/v1')

//arguments
const minimist = require('minimist')
let  args = minimist(process.argv.slice(2));
if(args.p){
  config.serialPortName = args.p
}
if(args.b){
  config.baudRate = args.b
}
//http server
const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');

let info = {
  httpPort: "",
  serialPortName: config.serialPortName,
  baudRate: config.baudRate,
  dataBits: config.dataBits,
  parity: config.parity,
  stopBits: config.stopBits
}
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());

app.use('/', express.static(path.resolve(__dirname, './ui/dist/')));
app.get('/', (req, res) => {
  const html = fs.readFileSync(path.resolve(__dirname, './ui/dist/index.html'), 'utf-8');
  res.send(html);
})

app.get('/api/info', (req, res) => {
  res.json(info)
})

//serial port
const SerialPort = require("serialport")
let serialPort = new SerialPort(
  config.serialPortName, {
    baudRate: config.baudRate,
    dataBits: config.dataBits,
    parity: config.parity,
    stopBits: config.stopBits,
    flowControl: false,
  },
  function (error) {
    if (error) {
      console.log(new Date() + ':' + "打开端口" + config.serialPortName + "错误：" + error);
      process.exit(1);
    } else {
      console.log(new Date() + ':' + "打开串口端口" + config.serialPortName + "成功,等待数据发送");
      http.listen(config.httpPort?config.httpPort:0,function (error) {
        if(error) {
          console.error(error)
          process.exit(1);
        }
        info.httpPort=config.httpPort?config.httpPort:http.address().port
        console.log(new Date() + ":" + "web服务启动:0.0.0.0:", info.httpPort);
        if(config_name!=='local') open("http://localhost:" + info.httpPort + '');
      });
    }
  });
//data receive in
serialPort.on('data',function(data){
  let msg = {
    id:uuid(),
    date:new Date(),
    data:intArrToHexString(data)
  }
  io.emit('data',msg)
})
//data post out 
app.post('/api/data',function(req,res){
  let serial_data_arr =[]
  try {
    let data = req.body.data.split(' ')
      for(let one of data){
        if(isHex(one))
          serial_data_arr.push(parseInt(one,16));
          else throw new Error('sent fail: data must be hex format')
      } 
  } catch (error) {
     return  res.status(200).json({message:error.message})
  }
  let data_send = new Buffer.from(serial_data_arr)
  serialPort.write(data_send,function (error) {
    if (error){
      console.log(new Date() + ':' + '数据发送出错');
      res.status(200).send(error)
    } 
    else {
      if(config_name=='local')  console.log(new Date() + ':' + '数据发送成功:',data_send);
        res.status(201).send()
    }
});

})


//assist func
function intToHexString(int_number) {
    return (int_number).toString(16).length > 1 ? (int_number).toString(16).toUpperCase() : '0' + (int_number).toString(16).toUpperCase();
}

function intArrToHexString(arr) {
    let arr_do = [];
    arr_do = arr;
    let result = '';
    for (let one of arr_do) {
        result = result + intToHexString(one) + ' ';
    }
    return result;
}
function isHex(str){
  if(typeof(str)!='string') return false
  for(let char of str){
    if(char>='0'&&char<='9'||char>='a'&&char<='f'||char>='A'&&char<='F')
    continue
    else return false
  }
  return true
}