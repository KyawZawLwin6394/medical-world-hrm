'use strict';

const PromotionRecord = require("../models/promotionrecord");
const multer = require("multer");
const fs = require("fs");

let storage = multer.diskStorage({
  destination : function (req, file , callback) {
     fs.mkdir()
  }
})

exports.createPromotionRecord = async (req,res) => {
     let data = req.body;
     let file = req.files;
     console.log("file is "+JSON.stringify(data))
     try {
          let result = await PromotionRecord.create(data);
          res
          .status(200)
          .send({
               success:true,
               data: result
          });
          
     } catch (error) {
          console.log(error);
          return res
                 .status(500)
                 .send({
                    error: true,
                    message:error.message
                 })
          
     }
}

exports.listAllPromotionRecord = async (req,res,next) => {
          let { keyword, role, limit, skip, rowsPerPage } = req.query
          let count = 0
          let page = 0
          try {
            limit = +limit <= 100 ? +limit : 10
            skip = +skip || 0
            let query = {  },
              regexKeyword
            role ? (query['role'] = role.toUpperCase()) : ''
            keyword && /\w/.test(keyword)
              ? (regexKeyword = new RegExp(keyword, 'i'))
              : ''
            regexKeyword ? (query['name'] = regexKeyword) : ''
        
            let result = await PromotionRecord.find(query)
              .skip(skip)
              .limit(limit)
              .populate(
                'oldPosition newPosition employee'
              )
            count = await PromotionRecord.find(query).count()
            const division = count / (rowsPerPage || limit)
            page = Math.ceil(division)
        
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

exports.getPromotionDetail = async (req, res) => {
     try {
         let result = await PromotionRecord.find({ _id: req.params.id }).populate('employee oldPosition newPosition');
         if (!result)
             return res.status(500).json({ error: true, message: 'No record found.' });
         res.json({ success: true, data: result });
     } catch (error) {
         return res.status(500).send({ error: true, message: error.message });
     }
 };
 

exports.updatePromotionRecord = async (req,res,next)=> {
     let data = req.body;
      try {
        let result = await PromotionRecord.findOneAndUpdate(
          { _id : req.params.id },
          { $set : data}
        );
        res
        .status(200)
        .send({
          success:true,
          data:result
        })
          
      } catch (error) {
          return res
                 .status(500)
                 .send({
                    error:true,
                    message:error.message
                 })
      }
}

exports.deletePromotionRecord = async (req,res,next) => {
        try {
          let result = await PromotionRecord.findByIdAndDelete(req.params.id);
          res
          .status(200)
          .send({
               success:true,
               data:{
                    isDeleted:true
               }
          });
        } catch (error) {
          return res
                 .status(500)
                 .send({
                    error:true,
                    message:error.message
                 });
        }
}