const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateEducationInput(data) {
  let errors = {};

  // Check if undefined or null ... turn into string so I can use Validator
  data.school = !isEmpty(data.school) ? data.school : "";
  data.degree = !isEmpty(data.degree) ? data.degree : "";
  data.fieldofstudy = !isEmpty(data.fieldofstudy) ? data.fieldofstudy : "";
  data.from = !isEmpty(data.from) ? data.from : "";

  if (Validator.isEmpty(data.school)) {
    errors.school = "School field is required";
  }

  if (Validator.isEmpty(data.degree)) {
    errors.company = "Degree field is required";
  }

  if (Validator.isEmpty(data.from)) {
    errors.from = "From date field is required";
  }

  if (Validator.isEmpty(data.fieldofstudy)) {
    errors.fieldofstudy = "Field of study field is required";
  }

  // Return errors or valid
  return {
    errors,
    isValid: isEmpty(errors)
  };
};
