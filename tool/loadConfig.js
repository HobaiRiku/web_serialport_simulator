const fs = require("fs");

let config_default = eval(
  fs.readFileSync(process.cwd()+"/config/config.default.js", { encoding: "utf8" })
);
let config_local = eval(
  fs.readFileSync(process.cwd()+"/config/config.local.js", { encoding: "utf8" })
);
let config_prod = eval(
  fs.readFileSync(process.cwd()+"/config/config.prod.js", { encoding: "utf8" })
);
let config_test = eval(
  fs.readFileSync(process.cwd()+"/config/config.test.js", { encoding: "utf8" })
);
module.exports = function(config_name) {
  if (config_name == "local")
    return Object.assign(config_default, config_local);
  if (config_name == "prod") return Object.assign(config_default, config_prod);
  if (config_name == "test") return Object.assign(config_default, config_test);
  return config_default;
};
