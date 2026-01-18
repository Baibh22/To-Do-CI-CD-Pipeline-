function toLogObject(level, message, fields) {
  const base = {
    time: new Date().toISOString(),
    level,
    message,
  };

  const extras = fields && typeof fields === "object" ? fields : {};
  const obj = { ...base, ...extras };
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) delete obj[k];
  }
  return obj;
}

function log(level, message, fields) {
  const line = JSON.stringify(toLogObject(level, message, fields));
  if (level === "error") process.stderr.write(`${line}\n`);
  else process.stdout.write(`${line}\n`);
}

module.exports = {
  info(message, fields) {
    log("info", message, fields);
  },
  warn(message, fields) {
    log("warn", message, fields);
  },
  error(message, fields) {
    log("error", message, fields);
  },
};

