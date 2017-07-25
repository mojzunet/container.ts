import {
  IContainerModuleOpts,
  IContainerModuleDepends,
  ContainerModule,
  ContainerLogMessage,
  ELogLevel,
} from "../../container";
import { Validate } from "../../lib/validate";

export abstract class Log extends ContainerModule {

  /** Environment variable names. */
  public static ENV = {
    /** Application log level (default info). */
    LEVEL: "LOG_LEVEL",
  };

  private _level: ELogLevel;

  protected get level(): ELogLevel { return this._level; }

  public constructor(name: string, opts: IContainerModuleOpts, depends?: IContainerModuleDepends) {
    super(name, opts, depends);

    // Get log level from environment or fall back on default.
    const rawLevel = Validate.isString(this.environment.get(Log.ENV.LEVEL) || "info");
    this._level = this.parseLevel(rawLevel);
    this.debug(`${Log.ENV.LEVEL}="${ELogLevel[this.level]}"`);

    // Subscribe to container log messages filtered by level.
    this.container.filterLogs(this.level)
      .subscribe((log) => this.handleLog(log));
  }

  /** Abstract handler for incoming log messages. */
  protected abstract handleLog(log: ContainerLogMessage): void;

  /** Convert environment log level string to level index, defaults to warning. */
  protected parseLevel(level?: string): ELogLevel {
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
