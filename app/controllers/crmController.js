'use strict';
const User = require('../models/user');


exports.getEmployees = async (req, res) => {
    try {
        const employee = await User.find({ isDeleted: false, isCRM: true }, '-password').populate('profile educationCertificate workExperience CV other recommendationLetter married relatedDepartment relatedPosition')
        if (employee.length === 0) return res.status(404).send({ error: true, message: 'Not Found!' })
        return res.status(200).send({ success: true, data: employee })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ error: true, message: error.message })
    }
}

exports.getEmployeeDetail = async (req, res) => {
    try {
        const { id } = req.params
        const employee = await User.find({ _id: id, isDeleted: false, isCRM: true }, '-password').populate('profile educationCertificate workExperience CV other recommendationLetter married relatedDepartment relatedPosition')
        if (employee.length === 0) return res.status(404).send({ error: true, message: 'Not Found!' })
        return res.status(200).send({ success: true, data: employee })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ error: true, message: error.message })
    }
}