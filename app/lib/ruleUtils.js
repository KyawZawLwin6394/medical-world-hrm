'use strict';
const moment = require('moment-timezone');
const config = require('../../config/db')

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function convertAndDisplayTZ(utcDate) {
    return moment.utc(utcDate).tz(config.timeZone).format('D-M-Y');
}

function convertToWeekDayNames(utcDate) {
    return moment.utc(utcDate).tz(config.timeZone).format('ddd');
}

function attendanceInputDate(utcDate) {
    return moment.utc(utcDate).tz(config.timeZone).format('YYYY-MM-DD');
}

function checkEmployeeAttendance(inputTimeStr, lateTimeStr, secLateTimeStr, halfDayTimeStr, salaryPerDay) {
    const [inputHours, inputMinutes] = inputTimeStr.split(":").map(Number);
    let salary = salaryPerDay;

    if (isLate(inputHours, inputMinutes, halfDayTimeStr)) {
        salary -= salaryPerDay / 2;
        console.log("The employee is late for Half Day.", inputTimeStr);
    } else if (isLate(inputHours, inputMinutes, secLateTimeStr)) {
        const penalty = (salaryPerDay * 1.7) / 100;
        salary -= penalty;
        console.log("The employee is late for Second Late.", inputTimeStr);
    } else if (isLate(inputHours, inputMinutes, lateTimeStr)) {
        const penalty = (salaryPerDay * 1) / 100;
        salary -= penalty;
        console.log("The employee is late for Late.", inputTimeStr);
    } else {
        console.log("The employee is on time or early.", inputTimeStr);
    }

    return salary;
}


function isLate(inputHours, inputMinutes, thresholdTimeStr) {
    const [thresholdHours, thresholdMinutes] = thresholdTimeStr.split(":").map(Number);
    return inputHours > thresholdHours || (inputHours === thresholdHours && inputMinutes > thresholdMinutes);
}

exports.calculatePayroll = (attendances, salaryPerDay, workingDays) => {
    try {
        const paid = attendances.filter(item => item.isPaid === true) //including Attend and Dismiss
        const entitledSalary = paid.reduce((accumulator, day) => {
            const dayName = convertToWeekDayNames(day.date)
            console.log(dayName)
            if (day.clockIn && workingDays.includes(dayName)) {
                const result = checkEmployeeAttendance(day.clockIn, "09:30", "10:00", "11:00", salaryPerDay)
                //console.log(result, 'salary', dayName)
                return accumulator + result
            } else if (workingDays.includes(dayName) === false || day.attendType === 'Day Off') {
                return accumulator + salaryPerDay
            } else if (workingDays.includes(dayName) === true && day.clockIn === '') {
                return accumulator
            }

        }, 0)
        console.log(entitledSalary)
        return ({ success: true, salary: entitledSalary })
    } catch (error) {
        return ({ success: false, message: error.message })
    }

}
exports.checkVarType = (varType1, varType2) => {
    if (varType1.toLowerCase() !== varType2.toLowerCase()) return { success: false, message: 'Condition Types are not the same!' }
    return { success: true }
}

exports.prepareConditionValue = (condition1, condition2) => {
    const conditions = ['date']
    const filterCondition = conditions.filter(item => item === condition1.varType)
    if (filterCondition.length !== 1) return ({ success: false, message: 'Condition Preparation Not Found!' })
    if (filterCondition[0] === 'date') {
        const firstDate = new Date(condition1.value)
        const secDate = new Date(condition2.value)
        return (
            {
                success: true,
                condition1Value: firstDate,
                condition2Value: secDate
            }
        )
    }
}

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
