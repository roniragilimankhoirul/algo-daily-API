import { app } from "./src/application/app.js";
import { logger } from "./src/application/logging.js";

const port = process.env.PORT || 8080;

app.listen(8080, () => {
  logger.info("Application start");
});
