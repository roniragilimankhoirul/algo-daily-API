import { app } from "../src/application/app.js";
import { logger } from "../src/application/logging.js";

app.listen(3000, () => {
  logger.info("Application start");
});
