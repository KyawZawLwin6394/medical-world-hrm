'use strict';
const Position = require('../models/position');
exports.createPosition = async (req, res) => {
    let data = req.body;
    try {
        let result = await Position.create(data);
        res.status(200).send({
            success: true,
            data: result,
        });
    } catch (e) {
        console.log(e)
        return res.status(500).send({ error: true, message: e.message });
    }
};

exports.listAllPositions = async (req, res) => {
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

        let result = await Position.find(query).skip(skip).limit(limit).populate('relatedDepartment');
        count = await Position.find(query).count();
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
        return res.status(500).send({ error: true, message: e.message });
    }
};

exports.getPositionDetail = async (req, res) => {
    try {
        let result = await Position.find({ _id: req.params.id }).populate('relatedDepartment');
        if (!result)
            return res.status(500).json({ error: true, message: 'No record found.' });
        res.json({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ error: true, message: error.message });
    }
};

exports.updatePosition = async (req, res, next) => {
    let data = req.body;
    try {
        let result = await Position.findOneAndUpdate({ _id: data.id }, { $set: data }, { new: true }).populate('relatedDepartment')
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ error: true, message: error.message });
    }
};

exports.deletePosition = async (req, res, next) => {
    try {
        const result = await Position.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: true },
            { new: true }
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ error: true, message: error.message });
    }
};

exports.activatePosition = async (req, res, next) => {
    try {
        const result = await Position.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: false },
            { new: true }
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ error: true, message: error.message });
    }
};
