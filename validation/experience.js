const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateExperienceInput(data) {
  let errors = {};

  // Check if undefined or null ... turn into string so I can use Validator
  data.title = !isEmpty(data.title) ? data.title : "";
  data.company = !isEmpty(data.company) ? data.company : "";
  data.from = !isEmpty(data.from) ? data.from : "";

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
