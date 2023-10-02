// middleware.js
const Validator = require('validatorjs');
const mongoose = require('mongoose');

//Payload Validation
const validatePayloadAgainstSchema = (model) => {
  return async function (req, res, next) {
    const payload = req.body;

    try {
      const schemaPaths = model.schema.paths;

      for (const path in schemaPaths) {
        if (schemaPaths.hasOwnProperty(path)) {
          const payloadValue = payload[path];
          const schemaType = schemaPaths[path].instance.toLowerCase();

          if (payloadValue !== undefined) {
            if (schemaType === 'objectid') {
              if (!mongoose.Types.ObjectId.isValid(payloadValue)) {
                return validationError(res, path, 'valid ObjectId');
              }
            } else if (schemaType === 'date') {
              if (!Validator.isDate(payloadValue)) {
                return validationError(res, path, 'valid date');
              }
            } else if (schemaType === 'boolean') {
              if (typeof payloadValue !== 'boolean') {
                return validationError(res, path, 'boolean');
              }
            } else if (typeof payloadValue !== schemaType) {
              return validationError(res, path, schemaType);
            }
          }
        }
      }

      next(); // If validation passes, continue to the next middleware or route handler
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

// Helper function to handle validation errors
function validationError(res, field, expectedType) {
  return res.status(400).json({
    error: `Field '${field}' should be of type '${expectedType}'`,
  });
}

const relatedBranchMiddleware = (req, res, next) => {
  let query = { isDeleted: false }
  req.mongoQuery = query;
  next();
};

module.exports = { relatedBranchMiddleware, validatePayloadAgainstSchema };
