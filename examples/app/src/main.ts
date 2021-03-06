import { Container, Environment } from "container.ts";
import { Assets, Process, Scripts } from "container.ts/lib/node/modules";
import * as process from "process";
import { argv } from "yargs";
import { ERollbarLogsEnv, Main, RollbarLogs, StatsdMetrics, WinstonLogs } from "./modules";

// Create environment instance using process environment.
const ENVIRONMENT = new Environment(process.env);

// Create container instance with name and environment.
// Populate container for dependency injection.
const CONTAINER = new Container("Main", ENVIRONMENT, argv).registerModules([
  Process,
  Assets,
  Scripts,
  Main,
  StatsdMetrics,
  WinstonLogs
]);

// Register additional modules based on environment definitions.
if (ENVIRONMENT.has(ERollbarLogsEnv.AccessToken)) {
  CONTAINER.registerModule(RollbarLogs);
}

// Signal operational.
CONTAINER.up()
  .then((count) => {
    // Modules counter.
    CONTAINER.debug(`${count} modules started`);
  })
  .catch((error) => {
    process.stderr.write(`${error}\n`);
    process.exit(1);
  });
