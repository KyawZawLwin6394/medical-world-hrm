'use strict'
const Payroll = require('../models/payroll');
const Attendance = require('../models/attendance');
const Employee = require('../models/user');
const UserUtil = require('../lib/userUtil');
const Leave = require('../models/leave');
const leave = require('../models/leave');

exports.createPayroll = async (req, res) => {
  let data = req.body;
  console.log("Payroll is "+JSON.stringify(data))
  try {
  const payroll = await Payroll.find({ relatedUser: data.relatedUser, relatedDepartment: data.relatedDepartment, month: data.month });
  // if (!payroll.length) await PayRoll.create({ entitledSalary: Math.round(attendedSalary.salary - (dismissedSalary.salary || 0)), 
  //                            relatedUser: emp, 
  //                            relatedDepartment: dep, 
  //                            totalAttendance: totalAttendance, 
  //                            attendedSalary: Math.round(attendedSalary.salary), 
  //                            dismissedSalary: Math.round(dismissedSalary.salary), 
  //                            paidDays: paidCount, 
  //                            unpaidDays: dismissedDays.length, 
  //                            month: month 
  //                           });
    if(!payroll.length){
      let result = await Payroll.create(data);
      res.status(200).send({
      success: true,
      data: result,
      });
    }
    
  } catch (e) {
    console.log(e)
    return res.status(500).send({ error: true, message: e.message });
  }
};

exports.listAllPayrolls = async (req, res) => {
  let { keyword, role, limit, skip, rowsPerPage, month, relatedDepartment } = req.query;
  let count = 0;
  let page = 0;
  let totalPaidAmount = 0;
  try {
    limit = +limit <= 100 ? +limit : 10;
    skip = +skip || 0;
    let query = { isDeleted: false },
      regexKeyword;
    role ? (query['role'] = role.toUpperCase()) : '';
    keyword && /\w/.test(keyword)
      ? (regexKeyword = new RegExp(keyword, 'i'))
      : '';
    regexKeyword ? (query['name'] = regexKeyword) : '';
    if (relatedDepartment) query.relatedDepartment = relatedDepartment
    if (month) query.month = month
    console.log(query)
    let result = await Payroll.find(query).skip(skip).limit(limit).populate({
      path: 'relatedUser',
      model: 'Users',
      populate: [
        {
          path: 'relatedPosition',
          model: 'Positions'
        },
        {
          path: 'relatedDepartment',
          model: 'Departments'
        }
      ]
    })
    for(let i=0; i<result.length; i++){
       totalPaidAmount += result[i].entitledSalary;
    }
    count = await Payroll.find(query).count();
    const division = count / (rowsPerPage || limit);
    page = Math.ceil(division);
    console.log("dfa is "+result)
    res.status(200).send({
      success: true,
      count: count,
      _metadata: {
        current_page: skip / limit + 1,
        per_page: limit,
        page_count: page,
        totalPaidAmount: totalPaidAmount,
        total_count: count,
      },
      data: result,
    });
  } catch (e) {
    return res.status(500).send({ error: true, message: e.message });
  }
};

exports.mobileGetPayroll = async (req, res) => {
  try {
    const { month, emp } = req.query;
    let query = { isDeleted: false }
    if (month) query.month = month
    if (emp) query.relatedUser = emp
    console.log(query)
    const result = await Payroll.find(query).populate({
      path: 'relatedUser',
      model: 'Users',
      populate: [
        {
          path: 'relatedPosition',
          model: 'Positions'
        },
        {
          path: 'relatedDepartment',
          model: 'Departments'
        }
      ]
    })
    console.log(result)
    if (!result) return res.status(200).send({ error: true, message: 'Not Found!' })
    return res.status(200).send({ success: true, data: result })
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message })
  }
}

exports.getPayrollDetail = async (req, res) => {
  try {
    let result = await Payroll.find({ _id: req.params.id }).populate({
      path: 'relatedUser',
      model: 'Users',
      populate: [
        {
          path: 'relatedPosition',
          model: 'Positions'
        },
        {
          path: 'relatedDepartment',
          model: 'Departments'
        }
      ]
    })
    if (!result)
      return res.status(500).json({ error: true, message: 'No record found.' });
    res.json({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message });
  }
};

exports.payExtra = async (req, res) => {
  try {
    const data = { ...req.body, isExtra: true }
    const update = await Payroll.findOneAndUpdate({ _id: data.id }, data, { new: true }).populate({
      path: 'relatedUser',
      model: 'Users',
      populate: [
        {
          path: 'relatedPosition',
          model: 'Positions'
        },
        {
          path: 'relatedDepartment',
          model: 'Departments'
        }
      ]
    })
    return res.status(200).send({ success: true, data: update });
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message });
  }
}

exports.updatePayroll = async (req, res, next) => {
  let data = req.body;
  try {
    let result = await Payroll.findOneAndUpdate({ _id: data.id }, { $set: data }, { new: true }).populate({
      path: 'relatedUser',
      model: 'Users',
      populate: [
        {
          path: 'relatedPosition',
          model: 'Positions'
        },
        {
          path: 'relatedDepartment',
          model: 'Departments'
        }
      ]
    })
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message });
  }
};

exports.deletePayroll = async (req, res, next) => {
  try {
    const result = await Payroll.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true }
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message });
  }
};

exports.activatePayroll = async (req, res, next) => {
  try {
    const result = await Payroll.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true }
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message });
  }
};

exports.calculatePayroll = async (req, res) => {
  try {
    const { month, relatedDepartment } = req.query;
    const payload = {
      relatedDepartment: relatedDepartment ?? undefined,
    };
   // console.log("montha and realted Department is "+month+" "+relatedDepartment)
    let insertPayload = []
    const employeeResult = await Employee.find(payload).populate('relatedDepartment').populate({
      path: 'relatedPosition',
      model: 'Positions'
    });
   // console.log(month)
    if (employeeResult.length === 0) return res.status(404).send({ error: true, message: 'Employee Result Not Found!' })
    //preparing startDate and endDate

    const datePayload = await UserUtil.getDatesByMonth(month)

    for (const i of employeeResult) {
      const totalDays = new Date(datePayload.$lte).getUTCDate();

      const attendanceDays = await Attendance.find({ relatedUser: i._id, date: datePayload }).count()
      const leaves = await Leave.find({ relatedUser: i._id, isCalculated: true, status: 'Approved' })
      //filter paid and unpaid
      const paid = leaves.filter(item => item.isPaid === true)
      const unpaid = leaves.filter(item => item.isPaid === false)
      //calculate totalLeaves
      const paidLeaves = paid.reduce((accumulator, current) => current.leaveTaken + accumulator, 0)
      const unpaidLeaves = unpaid.reduce((accumulator, current) => current.leaveTaken + accumulator, 0)

      const entitledSalary = (i.relatedPosition.basicSalary * (attendanceDays - unpaidLeaves)) / totalDays
      insertPayload.push({ relatedUser: i._id, totalAttendance: attendanceDays, paidLeaves: paidLeaves, unpaidLeaves: unpaidLeaves, relatedDepartment: i.relatedDepartment._id, entitledSalary: Math.round(entitledSalary), month: month })
    };

    const PayrollInsert = await Payroll.insertMany(insertPayload)
    const payrollIDS = PayrollInsert.map(doc => doc._id);
    const payrollRes = await Payroll.find({ _id: { $in: payrollIDS } }).populate({
      path: 'relatedUser',
      model: 'Users',
      populate: [
        {
          path: 'relatedPosition',
          model: 'Positions'
        },
        {
          path: 'relatedDepartment',
          model: 'Departments'
        }
      ]
    })
    return res.status(200).send({ success: true, data: payrollRes })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ error: true, message: error.message })
  }
}