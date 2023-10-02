'use strict';
const Department = require('../models/department');
exports.createDepartment = async (req, res) => {
    let data = req.body;
    try {
        let result = await Department.create(data);
        res.status(200).send({
            success: true,
            data: result,
        });
    } catch (e) {
        console.log(e)
        return res.status(500).send({ error: true, message: e.message });
    }
};

exports.listAllDepartments = async (req, res) => {
    let { keyword, role, limit, skip, rowsPerPage, funct, level } = req.query;
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
        if (funct) query.function = funct;
        if (level) query.level = level;
        let result = await Department.find(query).skip(skip).limit(limit).populate('reportingTo directManager assistantManager');
        count = await Department.find(query).count();
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

exports.getDepartmentDetail = async (req, res) => {
    try {
        let result = await Department.find({ _id: req.params.id }).populate('reportingTo directManager assistantManager');
        if (!result)
            return res.status(500).json({ error: true, message: 'No record found.' });
        res.json({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ error: true, message: error.message });
    }
};

exports.updateDepartment = async (req, res, next) => {
    let data = req.body;
    try {
        let result = await Department.findOneAndUpdate({ _id: data.id }, { $set: data }, { new: true }).populate('reportingTo directManager assistantManager');
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ error: true, message: error.message });
    }
};

exports.deleteDepartment = async (req, res, next) => {
    try {
        const result = await Department.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: true },
            { new: true }
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ error: true, message: error.message });
    }
};

exports.activateDepartment = async (req, res, next) => {
    try {
        const result = await Department.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: false },
            { new: true }
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ error: true, message: error.message });
    }
};

const buildHierarchy = async (departments, parentId = null) => {
    const children = departments.filter(dept => dept.reportingTo && dept.reportingTo.equals(parentId));
    const hierarchy = [];

    for (const child of children) {
        // Populate the directManager and assistantManager fields for each child
        const populatedChild = await Department.findById(child._id)
            .populate('directManager assistantManager')
            .lean()
            .exec();

        const childHierarchy = await buildHierarchy(departments, populatedChild._id);
        const childObject = {
            label: populatedChild.name,
            id: populatedChild._id,
            directManager: populatedChild.directManager ? populatedChild.directManager.givenName : '',
            assistantManager: populatedChild.assistantManager ? populatedChild.assistantManager.givenName : '',
            children: childHierarchy
        };
        hierarchy.push(childObject);
    }

    return hierarchy;
};


exports.orgChart = async (req, res) => {
    try {
        const departments = await Department.find({ isDeleted: false }).lean().exec();
        const parent = await Department.find({ isDeleted: false, topLevel: true }).populate('directManager assistantManager');
        const topLevelDepartments = await buildHierarchy(departments, parent[0]._id);

        res.json({
            label: parent[0].name,
            id: parent[0]._id,
            directManager: parent[0].directManager ? parent[0].directManager.givenName : '',
            assistantManager: parent[0].assistantManager ? parent[0].assistantManager.givenName : '',
            children: topLevelDepartments,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};





