import { app } from "../src/application/app";
import { logger } from "../src/application/logging";

app.listen(3000, () => {
  logger.info("Application start");
});
