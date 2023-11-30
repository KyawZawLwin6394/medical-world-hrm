'use strict';
const moment = require('moment-timezone');
const config = require('../../config/db');
const Setting = require('../models/setting');

const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);
const convertAndDisplayTZ = utcDate => moment.utc(utcDate).tz(config.timeZone).format('D-M-Y');
const convertToWeekDayNames = utcDate => moment.utc(utcDate).tz(config.timeZone).format("ddd");
const attendanceInputDate = utcDate => moment.utc(utcDate).tz(config.timeZone).format('YYYY-MM-DD');

const calculatePenalty = (name, settings, salaryPerDay) => settings[name].pAmount > 0 ? settings[name].pAmount : (settings[name].pPercent * salaryPerDay) / 100;

const checkEmployeeAttendance = (inputTimeStr, settings, salaryPerDay) => {
    let i =1
    const [inputHours, inputMinutes] = inputTimeStr.split(":")//.map(Number);//
     console.log("this is checkEmplo",i)
    let salary = salaryPerDay;
    if (isLate(inputHours, inputMinutes, settings.fnlpenalty.pTime))
       {
        salary -= calculatePenalty('fnlpenalty', settings, salaryPerDay);
       } 
    else if (isLate(inputHours, inputMinutes, settings.thdpenalty.pTime)) 
       {
        salary -= calculatePenalty('thdpenalty', settings, salaryPerDay);
       }
    else if (isLate(inputHours, inputMinutes, settings.secpenalty.pTime)) 
       {
        salary -= calculatePenalty('secpenalty', settings, salaryPerDay);
       }
    else if (isLate(inputHours, inputMinutes, settings.fstpenalty.pTime)) 
       {
        salary -= calculatePenalty('fstpenalty', settings, salaryPerDay);
       }
    else 
       {
        console.log("The employee is on time or early.", inputTimeStr);
       }
    // console.log("aloiedf "+salary)
    i++
    return salary;
};

const isLate = (inputHours, inputMinutes, thresholdTimeStr) => {
    const [thresholdHours, thresholdMinutes] = thresholdTimeStr.split(":");//.map(Number);
    return inputHours > thresholdHours || (inputHours === thresholdHours && inputMinutes > thresholdMinutes);
};

exports.calculatePayroll = async (attendances, salaryPerDay, workingDays) => {
    try {
        let totalSalary ;
        const settings = await Setting.findById('651a47a7e259234bf081204c');
        if (!settings) return { error: true, message: 'Settings Not Found!' };
        const entitledSalary = attendances.filter(item => item.isPaid).reduce((acc, day) => {
                const dayName = convertToWeekDayNames(day.date);
                
                // if( workingDays.includes(dayName)) {
                //     acc +=1
                //     console.log("salur "+acc)
                // }
                
                // if(day.clockIn && workingDays.includes(dayName)){
                //     totalSalary = acc + checkEmployeeAttendance(day.clockIn, settings, salaryPerDay);
                //     console.log("onda sal",oneDaySalary)
                // }
                // else if(!workingDays.includes(dayName) || day.attendType === 'Day Off'){
                //      totalSalary += salaryPerDay
                //      console.log("total Salry",totalSalary)
                // }
                
                return acc + (
                    (day.clockIn && workingDays.includes(dayName))
                        ? (checkEmployeeAttendance(day.clockIn, settings, salaryPerDay))
                        : (!workingDays.includes(dayName) || day.attendType === 'Day Off')
                            ? salaryPerDay
                            // : (workingDays.includes(dayName) && !day.clockIn)
                            //     ? acc
                           : 0
                );
            }, 0);
           console.log("salary is "+ entitledSalary)
        return { success: true, salary: entitledSalary };
    } catch (error) {
        return { success: false, message: error.message };
    }
};



exports.checkVarType = (varType1, varType2) => ({
    success: varType1.toLowerCase() === varType2.toLowerCase(),
    message: 'Condition Types are not the same!'
});

exports.prepareConditionValue = (condition1, condition2) => {
    const conditions = ['date'];
    const filterCondition = conditions.filter(item => item === condition1.varType);
    if (filterCondition.length !== 1) return { success: false, message: 'Condition Preparation Not Found!' };
    if (filterCondition[0] === 'date') {
        const firstDate = new Date(condition1.value);
        const secDate = new Date(condition2.value);
        return { success: true, condition1Value: firstDate, condition2Value: secDate };
    }
};

exports.checkOperators = (param1, param2, operator) => {
    let success = false;
    switch (operator) {
        case 'gte':
            success = param1 >= param2;
            break;
        case 'lte':
            success = param1 <= param2;
            break;
        case 'gt':
            success = param1 > param2;
            break;
        case 'lt':
            success = param1 < param2;
            break;
        case 'e':
            success = param1 === param2;
            break;
    }
    return { success };
};
