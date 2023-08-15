const validate = (schema, request) => {
  const result = schema.validate(request);
  if (result) {
    throw result.error;
  } else {
    return result.value;
  }
};

module.exports = { validate };
