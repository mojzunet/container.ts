import "rxjs/add/operator/map";
import "rxjs/add/operator/takeUntil";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import {
  ContainerModule,
  IContainerModuleConstructor,
  IContainerModuleDependencies,
} from "../../container";
import { Validate } from "../validate";
import { ChildProcess } from "./ChildProcess";
import { IProcessStatus } from "./Process";
import { Script, ScriptProcess } from "./Script";

/** Script manager target interface. */
export interface IScriptManagerTarget {
  name: string;
  /** Maximum script uptime as ISO8601 duration. */
  uptimeLimit?: string;
}

/** Script manager module interface. */
export interface IScriptManager extends ContainerModule {
  workers: Array<ScriptProcess | null>;
}

// TODO: Make abstract class instead of factory.
export class ScriptManagerFactory {

  /** Create manager classes for target scripts. */
  public static create(scripts: IScriptManagerTarget[]): IContainerModuleConstructor {

    class ScriptManager extends ContainerModule implements IScriptManager {

      /** Default module name. */
      public static readonly NAME: string = "ScriptManager";

      private _script: Script;
      private _workers: Array<ScriptProcess | null> = [];
      private _unsubscribe = new Subject<void>();

      public get dependencies(): IContainerModuleDependencies {
        return { _script: Script.name };
      }

      public get workers(): Array<ScriptProcess | null> { return this._workers; }

      public start(): void {
        scripts.map((script, index) => this.startWorker(script, index));
      }

      public stop(): void | Observable<void> {
        const observables: Array<Observable<any>> = [];
        this._unsubscribe.next();

        // Wait for worker processes to exit if connected.
        for (const worker of this._workers) {
          if ((worker != null) && worker.connected) {
            observables.push(worker.exit);
          }
        }

        if (observables.length > 0) {
          return Observable.forkJoin(...observables).map(() => undefined);
        }
      }

      protected startWorker(script: IScriptManagerTarget, index: number): void {
        const uptimeLimit = this.validUptimeLimit(script.uptimeLimit);
        const worker = this._script.fork(script.name);
        this._workers[index] = worker;

        // Handle process restarts.
        worker.exit
          .takeUntil(this._unsubscribe)
          .subscribe((code) => this.startWorker(script, index));

        // Track process uptime.
        worker.listen<IProcessStatus>(ChildProcess.EVENT.STATUS)
          .takeUntil(this._unsubscribe)
          .subscribe((status) => {
            // Restart worker process if uptime limit exceeded.
            if ((uptimeLimit != null) && (status.uptime > uptimeLimit)) {
              this.debug(`WORKER="${worker.target}" RESTART`);
              worker.kill();
            }
          });
      }

      protected validUptimeLimit(limit?: string): number | null {
        if (limit != null) {
          const duration = Validate.isDuration(limit);
          return duration.asSeconds();
        }
        return null;
      }

    }

    return ScriptManager;
  }

}