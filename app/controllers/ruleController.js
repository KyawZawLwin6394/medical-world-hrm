'use strict';
const Rules = require('../models/rule');
const RuleUtil = require('../lib/ruleUtils');

exports.ruleCalculation = async (ruleNames) => {
    const getAllRules = await Rules.find({ name: { $in: ruleNames } })
    for (const rule of getAllRules) {
        //Check condition
        const checkRule = RuleUtil.checkVarType(rule.condition[0].varType, rule.condition[1].varType)
        if (checkRule.success !== true) return ({ success: false, message: checkRule.message })

        //Prepare Condition
        const prepareCondition = RuleUtil.prepareConditionValue(rule.condition[0], rule.condition[1])
        if (prepareCondition.success !== true) return ({ success: false, message: prepareCondition.message })

        //check Operator
        const checkOperator = RuleUtil.checkOperators(prepareCondition.condition1Value, prepareCondition.condition2Value, rule.operator)
        if (checkOperator) {
            //start the logic
            
        }
    }
}