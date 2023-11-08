const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const config = require('../../config/db');
const Excel = require('exceljs');
const User = require('../models/user');
const workbook = new Excel.Workbook();
const moment = require('moment-timezone');



const months = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

async function attendanceExcelImport(filePath) {
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet(1);
  const data = [];

  const rows = worksheet.getRows(1, worksheet.actualRowCount);
  for (const row of rows) {
    if (row.getCell(2).value, 'here') {
      let treatmentName = row.getCell(7).value;
      try {
        const employeeName = row.getCell(4).value
       // const no = row.getCell(0).value
        const employeeNo = row.getCell(2).value
        const filtered = employeeName ? employeeName.split(' (MDW)')[0] : ''
        const relatedUser = await User.findOne({ 
          givenName: filtered //employeeName
        });
       // console.log("employee Names "+employeeName)
        if (relatedUser) {
          // console.log(relatedUser)
          const rowData = {
            relatedUser: relatedUser?._id,
            clockIn: row.getCell(10).value,
            clockOut: row.getCell(11).value,
            date: row.getCell(6).value,
            type: 'Attend',
            attendType: 'Week Day',
            source: 'Excel',
            isPaid: true,
            relatedDepartment: relatedUser.relatedDepartment
          };
          data.push(rowData); 
        //   console.log("employee Number "+employeeNo)
        // //  console.log("Numb "+no)
        //   console.log("employee Name "+relatedUser.givenName)
        }
        // else if (relatedUser && row.getCell(10).value === '') {
        //   console.log('undefined')
        //   const rowData = {
        //     relatedUser: relatedUser?._id,
        //     clockIn: row.getCell(10).value,
        //     clockOut: row.getCell(11).value,
        //     date: row.getCell(6).value,
        //     type: 'Dismiss',
        //     source: 'Excel',
        //     isPaid: false,
        //     relatedDepartment: relatedUser.relatedDepartment
        //   };
        //   data.push(rowData);
        // }
      } catch (error) {
        console.error("Error processing row:", error);
      }
    }
  }

  return data;
}

async function filterRequestAndResponse(reArr, reBody) {
  if (reArr.length > 0) {
    const result = {};
    reArr.map((req) => {
      result[req] = reBody[req];
    })
    return result;
  }
  return;
}

async function bcryptHash(password) {
  const hashedPassword = await bcrypt.hash(password, 10)
  return hashedPassword
}

async function bcryptCompare(plain, hash) {
  const result = await bcrypt.compare(plain, hash)
  return result
}

async function getDatesByMonth(month) {
  if (!months.includes(month)) return undefined;

  const monthIndex = months.indexOf(month);
  const year = new Date().getFullYear();

  // Create moment objects in the 'Asia/Rangoon' timezone
  const startDate = moment.tz([year, monthIndex], 'Asia/Rangoon');
  const endDate = startDate.clone().endOf('month');
  console.log("")
  // Convert to ISO string format
  return { $gte: startDate.toISOString(), $lte: endDate.toISOString() };
}



module.exports = { bcryptHash, bcryptCompare, filterRequestAndResponse, attendanceExcelImport, getDatesByMonth };
