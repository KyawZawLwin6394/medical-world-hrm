'use strict'
const Attendance = require('../models/attendance');
const UserUtil = require('../lib/userUtil');
const path = require('path');
const Employee = require('../models/user');
const RuleUtil = require('../lib/ruleUtils');
const PayRoll = require('../models/payroll');
const Setting = require('../models/setting');
const Config = require('../../config/db');
const months = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


exports.createAttendance = async (req, res) => {
  let data = req.body
  try {
    let result = await Attendance.create(data)
    res.status(200).send({
      success: true,
      data: result
    })
  } catch (e) {
    console.log(e)
    return res.status(500).send({ error: true, message: e.message })
  }
}

exports.listAllAttendances = async (req, res) => {
  let { keyword, role, limit, skip, rowsPerPage, } = req.query
  let count = 0
  let page = 0
  try {
    limit = +limit <= 100 ? +limit : 10
    skip = +skip || 0
    let query = { isDeleted: false },
      regexKeyword
    role ? (query['role'] = role.toUpperCase()) : ''
    keyword && /\w/.test(keyword)
      ? (regexKeyword = new RegExp(keyword, 'i'))
      : ''
    regexKeyword ? (query['name'] = regexKeyword) : ''
    let result = await Attendance.find(query)
      .skip(skip)
      .limit(limit)
      .populate('relatedDepartment relatedUser')
    count = await Attendance.find(query).count()
    const division = count / (rowsPerPage || limit)
    page = Math.ceil(division)
    let unpaid = await Attendance.find(query).count()
    res.status(200).send({
      success: true,
      count: count,
      unpaidCount: unpaid,
      _metadata: {
        current_page: skip / limit + 1,
        per_page: limit,
        page_count: page,
        total_count: count
      },
      data: result
    })
  } catch (e) {
    return res.status(500).send({ error: true, message: e.message })
  }
}

exports.getAttendanceDetail = async (req, res) => {
  try {
    let result = await Attendance.find({ _id: req.params.id }).populate(
      'relatedDepartment relatedUser'
    )
    if (!result)
      return res.status(500).json({ error: true, message: 'No record found.' })
    res.json({ success: true, data: result })
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message })
  }
}

exports.updateAttendance = async (req, res, next) => {
  let data = req.body
  try {
    let result = await Attendance.findOneAndUpdate(
      { _id: data.id },
      { $set: data },
      { new: true }
    ).populate('relatedDepartment relatedUser')
    return res.status(200).send({ success: true, data: result })
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message })
  }
}

exports.deleteAttendance = async (req, res, next) => {
  try {
    const result = await Attendance.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true }
    )
    return res
      .status(200)
      .send({ success: true, data: { isDeleted: result.isDeleted } })
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message })
  }
}

exports.activateAttendance = async (req, res, next) => {
  try {
    const result = await Attendance.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true }
    )
    return res
      .status(200)
      .send({ success: true, data: { isDeleted: result.isDeleted } })
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message })
  }
}

exports.excelImport = async (req, res) => {
  try {
    const files = req.files
    if (!files.attendanceImport) return res.status(404).send({ error: true, message: 'File Not Found!' })
    console.log(files.attendanceImport)
    for (const i of files.attendanceImport) {
      const subpath = path.join('app', 'controllers');  // Construct the subpath using the platform's path separator
      const newPath = __dirname.replace(subpath, '');
      const dest = path.join(newPath, i.path)
      const data = await UserUtil.attendanceExcelImport(dest)
      await Attendance.insertMany(data).then((response) => {
        return res.status(200).send({
          success: true, data: response
        })
      })
        .catch(error => {
          return res.status(500).send({ error: true, message: error })
        })
    }
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message })
  }
}

exports.attendanceDetail = async (req, res) => {
  let { keyword, role, limit, skip, rowsPerPage, emp, dep, month } = req.query
  let count = 0
  let page = 0
  try {
    limit = +limit <= 100 ? +limit : 10
    skip = +skip || 0
    let query = { isDeleted: false },
      regexKeyword
    role ? (query['role'] = role.toUpperCase()) : ''
    keyword && /\w/.test(keyword)
      ? (regexKeyword = new RegExp(keyword, 'i'))
      : ''
    regexKeyword ? (query['name'] = regexKeyword) : ''
    if (emp && dep) query = { ...query, relatedUser: emp, relatedDepartment: dep }
    if (month) {
      const result = await UserUtil.getDatesByMonth(month)
      query.date = result
    }
    let result = await Attendance.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ date: 1 })
      .populate('relatedDepartment relatedUser')
    count = await Attendance.find(query).count()
    const division = count / (rowsPerPage || limit)
    page = Math.ceil(division)
    const unpaid = result.filter(item => item.isPaid === false)
    res.status(200).send({
      success: true,
      count: count,
      _metadata: {
        current_page: skip / limit + 1,
        per_page: limit,
        page_count: page,
        total_count: count
      },
      data: result
    })
  } catch (e) {
    return res.status(500).send({ error: true, message: e.message })
  }
}

exports.calculatePayroll = async (req, res) => {
  try {
    const { dep, emp, basicSalary, month, saveStatus } = req.body;
    //total days for this month

    if (dep && emp && basicSalary && month) {
      const datePayload = await UserUtil.getDatesByMonth(month)
      const totalDays = new Date(datePayload.$lte).getUTCDate();
      const dates = await UserUtil.getDatesByMonth(month) //get gte and lte
      const result = await Attendance.find({ relatedDepartment: dep, relatedUser: emp, date: dates })
        .sort({ date: 1 })
        .populate('relatedDepartment relatedUser')

      if (result.length === 0) return res.status(200).send({
        error: true,
        message: 'Not Found!',
        data: {
          attendedSalary: 0,
          dismissedSalary: 0,
          entitledSalary: 0,
          totalAttendance: 0,
          paid: 0,
          unpaid: 0
        }
      })

      const totalAttendance = result.length
      const salaryPerDay = basicSalary / totalDays
      const getWorkingDays = await Employee.findOne({ _id: emp }).populate('relatedPosition')
      const workingDays = getWorkingDays.relatedPosition.workingDay
      console.log(workingDays, 'working days')
      const attendedDays = result.filter(item => item.isPaid === true && item.type === 'Attend')
      const attendedSalary = RuleUtil.calculatePayroll(attendedDays, salaryPerDay, workingDays)
      if (attendedSalary.success === false) return res.status(200).send({ error: true, message: attendedSalary.message })

      const dimissDays = result.filter(item => item.isPaid === false && item.type === 'Dismiss')

      const dismissedSalary = RuleUtil.calculatePayroll(dimissDays, salaryPerDay, workingDays)
      if (dismissedSalary.success === false) return res.status(200).send({ error: true, message: dismissedSalary.message })

      const paidCount = totalAttendance - dimissDays.length
      if (saveStatus === true) {
        // check if payroll exists
        const payroll = await PayRoll.find({ relatedUser: emp, relatedDepartment: dep, month: month })
        if (payroll.length === 0) {
          const payrollCreate = await PayRoll.create({
            entitledSalary: Math.round(attendedSalary.salary - (dismissedSalary.salary || 0)),
            relatedUser: emp,
            relatedDepartment: dep,
            totalAttendance: totalAttendance,
            attendedSalary: Math.round(attendedSalary.salary),
            dismissedSalary: Math.round(dismissedSalary.salary),
            paidDays: paidCount,
            unpaidDays: dimissDays.length,
            month: month
          })
          console.log(payrollCreate)
        }

      }
      return res.status(200).send({
        success: true, data: {
          attendedSalary: Math.round(attendedSalary.salary),
          dismissedSalary: Math.round(dismissedSalary.salary),
          entitledSalary: Math.round(attendedSalary.salary - (dismissedSalary.salary || 0)),
          totalAttendance: totalAttendance,
          paid: paidCount,
          unpaid: dimissDays.length
        }
      })
    } else return res.status(200).send({ error: true, message: 'Department, Employee, Month and BasicSalary is needed!' })
  } catch (error) {
    console.log(error)
    return res.status(200).send({ error: true, message: error.message })
  }
}

exports.mobileAttendanceLists = async (req, res) => {
  try {
    const { relatedEmployee } = req.query

    const response = []
    for (const month of months) {
      if (!months.includes(month)) return undefined;

      const monthIndex = months.indexOf(month);
      const startDate = new Date(Date.UTC(new Date().getFullYear(), monthIndex, 1));
      const endDate = new Date(Date.UTC(new Date().getFullYear(), monthIndex + 1, 0, 23, 59, 59, 999));
      const findAttendance = await Attendance.find({ date: { $gte: startDate.toISOString(), $lte: endDate.toISOString() }, relatedUser: relatedEmployee }).populate('relatedUser relatedDepartment')
      const totalAttendance = findAttendance.length
      const totalDays = new Date(endDate).getUTCDate();
      const attended = (totalAttendance * 100) / totalDays
      response.push({ month: month, attended: Math.round(attended), missed: Math.round(100 - attended), attendedDays: totalAttendance, missedDays: totalDays - totalAttendance })
    }
    return res.status(200).send({ success: true, data: response })
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message })
  }

}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const earthRadius = 6371000; // Earth's radius in meters

  // Convert latitude and longitude from degrees to radians
  const radLat1 = (lat1 * Math.PI) / 180;
  const radLon1 = (lon1 * Math.PI) / 180;
  const radLat2 = (lat2 * Math.PI) / 180;
  const radLon2 = (lon2 * Math.PI) / 180;

  // Haversine formula
  const dLat = radLat2 - radLat1;
  const dLon = radLon2 - radLon1;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Calculate the distance in meters
  const distance = earthRadius * c;

  return distance;
}

//

exports.mobileCheckIn = async (req, res) => {
  try {
    const { targetLat, targetLon, relatedEmployee, relatedDepartment, clockIn, date } = req.body
    console.log(Config.settingID, 'id')
    const getSetting = await Setting.findOne({ _id: Config.settingID })
    if (getSetting === undefined) return res.status(200).send({ error: true, message: 'Setting Not Found!' })
    if (getSetting.referenceLat && getSetting.referenceLon) {
      const distance = calculateDistance(getSetting.referenceLat, getSetting.referenceLon, targetLat, targetLon);
      if (distance <= 100) {
        const result = await Attendance.create({
          relatedUser: relatedEmployee,
          relatedDepartment: relatedDepartment,
          date: date,
          clockIn: clockIn,
          isPaid: true,
          type: 'Attend',
          source: 'Field'
        })
        return res.status(200).send({ success: true, message: 'Within 100 meter', data: result })
      } else {
        return res.status(200).send({ error: true, message: `Out of Bound for this Address:${getSetting.refAddress}, Please Try Again!` })
      }
    }
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message })
  }
}

exports.mobileCheckOut = async (req, res) => {
  try {
    const { referenceLat, referenceLon, targetLat, targetLon, attendaceID, clockOut } = req.body
    const getSetting = await Setting.findOne({ _id: Config.settingID })
    if (getSetting === undefined) return res.status(200).send({ error: true, message: 'Setting Not Found!' })
    if (getSetting === undefined) return res.status(200).send({ error: true, message: 'Setting Not Found!' })
    if (getSetting.referenceLat && getSetting.referenceLon) {
      const distance = calculateDistance(referenceLat, referenceLon, targetLat, targetLon);
      if (distance <= 100) {
        const result = await Attendance.findOneAndUpdate({ _id: attendaceID }, { clockOut: clockOut }, { new: true }).populate('relatedUser relatedDepartment')
        return res.status(200).send({ success: true, message: 'Within 100 meter', data: result })
      } else {
        return res.status(200).send({ error: true, message: `Out of Bound for this Address:${getSetting.refAddress}, Please Try Again!` })
      }
    }

  } catch (error) {
    return res.status(500).send({ error: true, message: error.message })
  }
}

exports.mobileAttendanceDetail = async (req, res) => {
  const { month, relatedEmployee } = req.body;
  if (!months.includes(month)) return undefined;
  const monthIndex = months.indexOf(month);
  const startDate = new Date(Date.UTC(new Date().getFullYear(), monthIndex, 1));
  const endDate = new Date(Date.UTC(new Date().getFullYear(), monthIndex + 1, 0, 23, 59, 59, 999));
  const employeeResult = await Employee.find({ _id: relatedEmployee }).select('casualLeaves medicalLeaves vacationLeaves maternityLeaveMale maternityLeaveFemale')
  const attendanceResult = await Attendance.find({ date: { $gte: startDate.toISOString(), $lte: endDate.toISOString() }, relatedUser: relatedEmployee })
  return res.status(200).send({ success: true, employee: employeeResult[0], data: attendanceResult })
}