const Appointment = require("../models/appointment")

exports.listAllAppointments = async (req,res,next ) => {
    try{
       let query = { isDeleted:false }
       let { skip, 
             keyword,
             rowPerPage,
             fromDate, 
             toDate, 
             relatedEmployee, 
             customerName, 
             phone, 
             status 
            } = req.query
       console.log(relatedEmployee)
       skip = skip || 0
       customerName ?  query["customerName"] = customerName : ""
       phone ? query["phone"] =  phone : ""
       status ? query["status"] =  status : null
       fromDate && toDate ? query["date"] = { $gte:new Date(fromDate), $lte: new Date(toDate)} 
                       : fromDate ? query["date"] = { $gte:new Date(fromDate)} 
                       : toDate ? query["date"] = { $lte: new Date(toDate)} 
                       : ""
       relatedEmployee ? query["relatedEmployee"] = relatedEmployee : ""
       console.log("query",query)
       let data = await Appointment
                        .find(query)
                        .populate("relatedEmployee")
                        .skip(skip)
       let count = await Appointment.find(query).count()
       return res.status(200)
                 .send({
                    success: true,
                    data : data,
                    meta_data:{
                        total_count: count,
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

exports.updateAppointment = async (req,res) => {
    try {
      let data = req.body
      await Appointment.findByIdAndUpdate(req.params.id, data)
      return res.status(200)
                .send({
                    success:true,
                    message: "Successfully Edited"
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

exports.updateReportAppointment = async (req,res) => {
    try { 
    let { report } = req.body
    let data = { status: true }
    report ? data.report = report : null
    let appointData = await Appointment.findByIdAndUpdate(req.params.id,
                                        data
                                       )
    return res.status(200)
              .send({
                success: true,
                message: "Successfully Reported"
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

exports.deleteAppointment = async (req,res,next) => {
    await Appointment.findByIdAndUpdate(req.params.id,
                                          {
                                            isDeleted: true
                                          })
    return res.status(200)
              .send({
                success: true,
                message: "Successfully Deleted"
              })
}