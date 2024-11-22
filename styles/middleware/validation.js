const { validationResult } = require('express-validator');

const validate = (req, res, validations) => {
  return Promise.all(validations.map(validation => validation.run(req)))
    .then(() => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      return Promise.resolve();
    });
};

module.exports = validate;
