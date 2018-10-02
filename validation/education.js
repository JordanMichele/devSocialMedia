const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateEducationInput(data) {
  let errors = {};

  // Check if undefined or null ... turn into string so I can use Validator
  data.school = !isEmpty(data.school) ? data.school : "";
  data.degree = !isEmpty(data.degree) ? data.degree : "";
  data.fieldofstudy = !isEmpty(data.fieldofstudy) ? data.fieldofstudy : "";

  if (Validator.isEmpty(data.title)) {
    errors.title = "Job Title is required";
  }

  if (Validator.isEmpty(data.company)) {
    errors.company = "Company is required";
  }

  if (Validator.isEmpty(data.from)) {
    errors.from = "From date field is required";
  }

  // Return errors or valid
  return {
    errors,
    isValid: isEmpty(errors)
  };
};
