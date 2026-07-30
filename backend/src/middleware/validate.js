function validate(schema, property = "body") {
  return (req, res, next) => {
    const result = schema.safeParse(req[property]);
    if (!result.success) {
      return res.status(400).json({
        error: "Datos de entrada inválidos.",
        details: result.error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })),
      });
    }
    req[property] = result.data;
    return next();
  };
}

module.exports = { validate };
