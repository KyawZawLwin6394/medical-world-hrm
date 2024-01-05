const Appointment = require("../models/appointment")

exports.listAllAppointments = async (req,res,next ) => {
    try{
       let query = { isDeleted:false }
       let { skip, 
             keyword,
             rowPerPage,
             fromDate, 
             toDate, 
             relatedUser, 
             customerName, 
             phone, 
             status 
            } = req.query
       let count

       skip = skip || 0
       customerName ?  query["customerName"] = customerName : ""
       phone ? query["phone"] =  phone : ""
       status ? query["status"] =  status : null
       fromDate && toDate ? query["date"] = { $gte:new Date(fromDate), $lte: new Date(toDate)} 
                       : fromDate ? query["date"] = { $gte:new Date(fromDate)} 
                       : toDate ? query["date"] = { $lte: new Date(toDate)} 
                       : ""
       relatedUser ? query["relatedUser"] = relatedUser : ""
       console.log("query",query)
       let data = await Appointment
                        .find(query)
                        .populate("relatedEmployee")
                        .skip(skip)
       count = await Appointment.find(query).count
       return res.status(200)
                 .send({
                    success: true,
                    data : data,
                    meta_data:{
                        count: count,
                        rowPerPage : rowPerPage
                    }
                 })
    }
    catch(error){
        return res.status(500)
                  .send({
                    error: true,
                    message: error.message
                  })
    }
}

exports.createAppointment = async (req,res,next) => {
    try{
        let data = req.body
        let createAppointment = await Appointment.create(data)
        return res.status(200)
                  .send({
                    success: true,
                    data: "Appointment is successfully created"
                  })  

    }
    catch(error){
        return res.status(500)
                  .send({
                         error:true,
                         message:error.message
                    })
    }
}