import { ContainerLogMessage, ELogLevel, IModuleOptions, Module } from "../../container";
import { isString } from "../validate";

/** Logs environment variable names. */
export enum ELogsEnv {
  /** Application logs level (default warning). */
  Level = "LOGS_LEVEL"
}

/** Abstract container logs handler module. */
export abstract class Logs extends Module {
  /** Default module name. */
  public static readonly moduleName: string = "Logs";

  /**
   * Parsed application logs level.
   * Get log level from environment, defaults to warning.
   */
  protected readonly envLogsLevel = this.logsParseLevel(isString(this.environment.get(ELogsEnv.Level, "warning")));

  public constructor(options: IModuleOptions) {
    super(options);

    // Debug environment variables.
    this.debug(`${ELogsEnv.Level}="${ELogLevel[this.envLogsLevel]}"`);

    // Subscribe to container log messages filtered by level.
    this.container.filterLogs(this.envLogsLevel).subscribe((log) => this.logsOnMessage(log));
  }

  /** Abstract handler for incoming log messages. */
  protected abstract logsOnMessage(log: ContainerLogMessage): void;

  /** Convert environment log level string to level index, defaults to warning. */
  protected logsParseLevel(level?: string): ELogLevel {
    switch ((level || "").toLowerCase()) {
      case "emerg":
      case "emergency": {
        return ELogLevel.Emergency;
      }
      case "alert": {
        return ELogLevel.Alert;
      }
      case "crit":
      case "critical": {
        return ELogLevel.Critical;
      }
      case "err":
      case "error": {
        return ELogLevel.Error;
      }
      case "warn":
      case "warning": {
        return ELogLevel.Warning;
      }
      case "notice": {
        return ELogLevel.Notice;
      }
      case "info":
      case "information":
      case "informational": {
        return ELogLevel.Informational;
      }
      case "debug": {
        return ELogLevel.Debug;
      }
      default: {
        return ELogLevel.Warning;
      }
    }
  }
}