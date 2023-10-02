'use strict';
const Leave = require('../models/leave');
const Attachment = require('../models/attachment');
const Employee = require('../models/user');
const Attendance = require('../models/attendance');

exports.createLeave = async (req, res) => {
    let data = req.body;
    let files = req.files;
    let attachmentIDS = [];

    try {
        if (files['attach']) {
            console.log('here')
            for (const item of files.attach) {
                let imgPath = item.path.split('hrm')[1];
                const attachData = {
                    fileName: item.originalname,
                    imgUrl: imgPath,
                    image: imgPath.split('\\')[2]
                };
                const newAttachment = new Attachment(attachData);
                const attachResult = await newAttachment.save();
                attachmentIDS.push(attachResult._id.toString())
            }
            data = { ...data, attach: attachmentIDS };
        }

        console.log(data, 'data')
        let result = await Leave.create(data);
        res.status(200).send({
            success: true,
            data: result,
        });
    } catch (e) {
        console.log(e)
        return res.status(500).send({ error: true, message: e.message });
    }
};

exports.listAllLeaves = async (req, res) => {
    let { keyword, role, limit, skip, rowsPerPage } = req.query;
    let count = 0;
    let page = 0;
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

        const result = await Leave.find(query).skip(skip).limit(limit).populate('attach').populate({
            path: 'relatedUser',
            model: 'Users',
            populate: [
                {
                    path: 'relatedDepartment',
                    model: 'Departments'
                },
                {
                    path: 'relatedPosition',
                    model: 'Positions'
                }
            ]
        });

        count = await Leave.find(query).count();
        const division = count / (rowsPerPage || limit);
        page = Math.ceil(division);

        res.status(200).send({
            success: true,
            count: count,
            _metadata: {
                current_page: skip / limit + 1,
                per_page: limit,
                page_count: page,
                total_count: count,
            },
            data: result,
        });
    } catch (e) {
        console.log(e)
        return res.status(500).send({ error: true, message: e.message });
    }
};

exports.getLeaveDetail = async (req, res) => {
    try {
        let result = await Leave.find({ _id: req.params.id }).populate('attach').populate({
            path: 'relatedUser',
            model: 'Users',
            populate: [
                {
                    path: 'relatedDepartment',
                    model: 'Departments'
                },
                {
                    path: 'relatedPosition',
                    model: 'Positions'
                }
            ]
        });;
        if (!result)
            return res.status(500).json({ error: true, message: 'No record found.' });
        res.json({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ error: true, message: error.message });
    }
};

exports.updateLeave = async (req, res, next) => {
    let data = req.body;
    let files = req.files;
    let attachmentIDS = [];
    try {
        if (files && files['attach']) {
            console.log('here')
            for (const item of files.attach) {
                let imgPath = item.path.split('hrm')[1];
                const attachData = {
                    fileName: item.originalname,
                    imgUrl: imgPath,
                    image: imgPath.split('\\')[2]
                };
                const newAttachment = new Attachment(attachData);
                const attachResult = await newAttachment.save();
                attachmentIDS.push(attachResult._id.toString())
            }
            data = { ...data, attach: attachmentIDS };
        }

        console.log(data, 'data')
        let result = await Leave.findOneAndUpdate({ _id: data.id }, { $set: data }, { new: true }).populate('attach').populate({
            path: 'relatedUser',
            model: 'Users',
            populate: [
                {
                    path: 'relatedDepartment',
                    model: 'Departments'
                },
                {
                    path: 'relatedPosition',
                    model: 'Positions'
                }
            ]
        });
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).send({ error: true, message: error.message });
    }
};

exports.editStatus = async (req, res) => {
    try {
        let data = req.body;
        const { employeeID, Ltype, status, startDate, endDate, leaveAllowed, isPaid } = req.body;
        const employeePayload = {}
        const checkIsCalculated = await Leave.findOne({ _id: data.id })
        if (checkIsCalculated.isCalculated === true) return res.status(500).send({ error: true, message: 'Already Calculated!' })
        if (leaveAllowed === 0 && status === 'Approved') return res.status(500).send({ error: true, message: 'No more leaves are allowed for this leave type!' })
        if (status === 'Approved') {
            console.log('Calculated')
            //Time Difference
            const employee = await Employee.findOne({ _id: employeeID })
            const timeDifference = Date.parse(endDate) - Date.parse(startDate)
            const daysDifference = (timeDifference / (1000 * 3600 * 24)) + 1
            //Preparing Payload
            employeePayload[Ltype] = leaveAllowed - daysDifference
            console.log(employeePayload, leaveAllowed, daysDifference)
            const employeeUpdate = await Employee.findOneAndUpdate({ _id: employeeID }, { $set: employeePayload }, { new: true })
            data = { ...data, isCalculated: true }
            for (let i = 0; i < daysDifference; i++) {
                const currentDate = new Date(startDate)
                currentDate.setDate(currentDate.getDate() + i)
                const AttendanceResult = await Attendance.create({
                    type: 'Dismiss',
                    source: 'Leave',
                    isPaid: isPaid,
                    date: currentDate,
                    relatedUser: employeeID,
                    relatedDepartment: employee.relatedDepartment
                })
            }
        }
        const result = await Leave.findOneAndUpdate({ _id: data.id }, { $set: data }, { new: true }).populate('attach').populate({
            path: 'relatedUser',
            model: 'Users',
            populate: [
                {
                    path: 'relatedDepartment',
                    model: 'Departments'
                },
                {
                    path: 'relatedPosition',
                    model: 'Positions'
                }
            ]
        });
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ error: true, message: error.message });
    }
}

exports.deleteLeave = async (req, res, next) => {
    try {
        const result = await Leave.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: true },
            { new: true }
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ error: true, message: error.message });
    }
};

exports.activateLeave = async (req, res, next) => {
    try {
        const result = await Leave.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: false },
            { new: true }
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ error: true, message: error.message });
    }
};

exports.getCode = async (req, res) => {
    try {
        let today = new Date().toISOString()
        const latestDocument = await Leave.find({}).sort({ seq: -1 }).limit(1).exec();
        console.log(latestDocument, 'latestDocument')
        if (latestDocument.length === 0 || latestDocument[0].seq === undefined) {
            return res.status(200).send({ seq: 1, code: "LC-" + today.split('T')[0].replace(/-/g, '') + "-1" })
        }

        if (latestDocument.length > 0 && latestDocument[0].seq)
            return res.status(200).send({ code: "LC-" + today.split('T')[0].replace(/-/g, '') + "-" + (latestDocument[0].seq + 1), seq: (latestDocument[0].seq + 1) })
    } catch (error) {
        return res.status(200).send({ error: true, message: error.message })
    }
}
