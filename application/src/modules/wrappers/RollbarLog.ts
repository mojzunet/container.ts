/// <reference types="node" />
import { IContainerModuleOpts, ContainerLogMessage, ELogLevel } from "container.ts";
import { Validate } from "container.ts/lib/validate";
import { Process, Log } from "container.ts/modules";

// Rollbar does not have defined types.
const ROLLBAR = require("rollbar");

export class RollbarLog extends Log {

  /** Environment variable names. */
  public static ENV = {
    /** Application log level (default info). */
    LEVEL: "LOG_LEVEL",
    /** Rollbar access token (required). */
    ACCESS_TOKEN: "ROLLBAR_ACCESS_TOKEN",
    /** Rollbar report level (default error). */
    REPORT_LEVEL: "ROLLBAR_REPORT_LEVEL",
  };

  private _process: Process;
  private _rollbar: any;

  public constructor(name: string, opts: IContainerModuleOpts) {
    super(name, opts, { _process: Process.name });

    // Get access token from environment.
    const accessToken = Validate.isString(this.environment.get(RollbarLog.ENV.ACCESS_TOKEN));
    this.debug(`${RollbarLog.ENV.ACCESS_TOKEN}="${accessToken}"`);

    // Get report level from environment or fall back on log level.
    const rawReportLevel = Validate.isString(this.environment.get(RollbarLog.ENV.REPORT_LEVEL) || "error");
    const reportLevel = this.reportLevel(rawReportLevel);
    this.debug(`${RollbarLog.ENV.REPORT_LEVEL}="${reportLevel}"`);

    // Create Rollbar instance.
    // Report level determined by module log level.
    // Handle uncaught exceptions and unhandled rejections by default.
    // Uncaught errors have 'critical' level by default.
    this._rollbar = new ROLLBAR({
      environment: this._process.nodeEnvironment,
      accessToken,
      reportLevel,
      handleUncaughtExceptions: true,
      handleUnhandledRejections: true,
      uncaughtErrorLevel: "critical",
    });
  }

  /** Rollbar handler for incoming log messages. */
  protected handleLog(log: ContainerLogMessage): void {
    const callback = this.handleError.bind(this);

    // Map log level to rollbar log methods.
    switch (log.level) {
      case ELogLevel.Emergency:
      case ELogLevel.Alert:
      case ELogLevel.Critical: {
        this._rollbar.critical(log.message, log.metadata, ...log.args, callback);
        break;
      }
      case ELogLevel.Error: {
        this._rollbar.error(log.message, log.metadata, ...log.args, callback);
        break;
      }
      case ELogLevel.Warning: {
        this._rollbar.warning(log.message, log.metadata, ...log.args, callback);
        break;
      }
      case ELogLevel.Notice:
      case ELogLevel.Informational: {
        this._rollbar.info(log.message, log.metadata, ...log.args, callback);
        break;
      }
      case ELogLevel.Debug: {
        this._rollbar.debug(log.message, log.metadata, ...log.args, callback);
        break;
      }
    }
  }

  /** Rollbar error handler callback. */
  protected handleError(error?: any): void {
    if (error != null) {
      process.stderr.write(String(error));
    }
  }

  /** Return rollbar report level. */
  protected reportLevel(value: string): string {
    const level = this.parseLevel(value);
    switch (level) {
      case ELogLevel.Emergency:
      case ELogLevel.Alert:
      case ELogLevel.Critical: {
        return "critical";
      }
      case ELogLevel.Error: {
        return "error";
      }
      case ELogLevel.Warning: {
        return "warning";
      }
      case ELogLevel.Notice:
      case ELogLevel.Informational: {
        return "info";
      }
      case ELogLevel.Debug: {
        return "debug";
      }
      default: {
        return "error";
      }
    }
  }

}