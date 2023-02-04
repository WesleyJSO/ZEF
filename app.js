const setApp = require("./src/index.js");

setApp
  .then((app) =>
    app.listen(9999, () => console.info("app running on port 9999"))
  )
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
