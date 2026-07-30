require("dotenv").config();
const { createApp } = require("./app");
const { getJwtSecret } = require("./config");

const PORT = process.env.PORT || 3000;
getJwtSecret();
const app = createApp();

app.listen(PORT, () => {
  console.log(`SGAI backend escuchando en http://localhost:${PORT}`);
});
