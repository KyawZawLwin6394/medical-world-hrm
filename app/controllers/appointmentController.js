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

exports.getAppointmentById = async (req,res) => {
    try {
        let getAppointmentByid = await Appointment.findById(req.params.id).populate("relatedEmployee")
        return res.status(200)
                  .send({
                    success: true,
                    data: getAppointmentByid
                  })
        }
    catch (error){
        return res.status(500)
                  .send({
                         error:true,
                         message:error.message
                    })
    }
}

exports.checkInAppointment = async (req,res) => {
    try{
       let { checkIn } = req.body
       let findAppointment = await Appointment.findOne({ _id: req.params.id})
          switch ( findAppointment && findAppointment.checkIn  ){
             case false:
               console.log("this is test",req.params.id) 
                await Appointment.findByIdAndUpdate(req.params.id, { checkIn: true,  checkInTime: checkIn  })
                return res.status(200).send({
                    success:true,
                    message: " User successfully checked In"
                })
            case true :
                return res.status(500).send({
                    error: true,
                    message: "User already checked In."
                })
          } 
          return res.status(500).send({
            error:true,
            message: "There is no appointment"
          })   
       
       
    }catch(error){
        return res.status(500)
                  .send({
                         error:true,
                         message:error.message
                    })
    } 
}

exports.checkOutAppointment = async (req,res) => {
    try{
        let { checkOut } = req.body
        let findAppointment = await Appointment.findOne({ _id: req.params.id})
           switch ( findAppointment && findAppointment.checkOut ){
              case false :
                 await Appointment.findByIdAndUpdate(req.params.id, { checkOut: true, checkOutTime: checkOut })
                 return res.status(200).send({
                     success:true,
                     message: " User successfully checked Out"
                 })
             case true :
                 return res.status(500).send({
                     error: true,
                     message: "User already checked Out."
                 })
           }  
           return res.status(500).send({
            error:true,
            message: "There is no appointment"
          })        
     }catch(error){
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
    let file = req.file
    console.log("file is ",file)
    let url = file.path.split("hrm")[1]
    let data = { status: true, attachFile: url }
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