const cors = require('cors');
const path = require('path');
const os = require('os');
const cronitor = require('cronitor')('bb06d5c8745f45f2a9fc62755b7414ea');
const createIndexs = require('./dbIndexes').createIndex
const express = require('express'),
  bodyParser = require('body-parser'),
  cron = require('node-cron'),
  mongoose = require('mongoose'),
  config = require('./config/db'),
  app = express(),
  server = require('http').Server(app),
  port = 9000;
app.use(cors({ origin: '*' }));

//mongoose.set('useCreateIndex', true) // to remove -> DeprecationWarning: collection.ensureIndex is deprecated. Use createIndex instead.

// mongoose instance connection url connection
if (mongoose.connection.readyState != 1) {
  mongoose.set('strictQuery', false);
  mongoose.Promise = global.Promise;
  mongoose.connect(config.db, { useNewUrlParser: true, retryWrites: false, useUnifiedTopology: true });

  const db = mongoose.connection;

  db.on('error', (err) => {
    console.log(err)
  });

  db.once('open', function () {
    console.log('Database is connected');
  });
  module.exports = db;
}
mongoose.plugin((schema) => {
  schema.options.usePushEach = true;
});

//static files
app.use('/static', express.static(path.join(__dirname, 'uploads')));
//http://localhost:9000/static/hrm/employee/cv/CV-downloadBec1691998848972.png

// Bring in our dependencies
require('./config/express')(app, config);

const interfaces = os.networkInterfaces();
const addresses = interfaces['Ethernet'] || interfaces['en0'] || interfaces['Wi-Fi'] || []; // Adjust the interface name for your system
const ipv4Addresses = addresses.filter(address => address.family === 'IPv4');

server.listen(port, () => {

  if (ipv4Addresses.length > 0) {
    const currentIPv4 = ipv4Addresses[0].address;
    console.log('Current IPv4 address:', currentIPv4);
  } else {
    console.log('No IPv4 addresses found');
    const interfaceNames = Object.keys(interfaces);
    console.log('Available network interface names:', interfaceNames);
  }
  console.log('We are live on port: ', port);
});

module.exports = server;

// cronitor.wraps(cron);
// cronitor.schedule('AccountBalanceClosingAndOpening', '55 23 * * *', async function () {
//   console.log('Managing AccountBalance for every Accounting Accs!');
//   const isLastDay = await userUtil.getLatestDay();
//   if (isLastDay === true) {
//     await userUtil.createAccountBalance();
//     await userUtil.fixedAssetTransaction();
//   } else {
//     console.log('Today is not the right day for the scheduled task!');
//   }
// });

// cron.schedule('55 23 * * *', () => {
//   (async () => {
//     const isLastDay = await userUtil.getLatestDay();
//     if (isLastDay === true) {
//       await userUtil.createAccountBalance();
//     } else {
//       console.log('Today is not the right day for the scheduled task!');
//     }
//   })();
// });

