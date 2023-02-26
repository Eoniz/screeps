import {
  KER_COL_CONTROLLER_PROCESS,
  KER_COL_PROCESS,
  KER_COL_SOURCE_PROCESS,
  KER_COL_SPAWN_QUEUE_PROCESS,
  KER_CREEP_ACTION_BUILD,
  KER_CREEP_ACTION_DROP_RESOURCES,
  KER_CREEP_ACTION_HARVEST, KER_CREEP_ACTION_PULL_RESOURCE, KER_CREEP_ACTION_UPGRADE_CONTROLLER,
  KER_CREEP_HARVESTER_LIFETIME_PROCESS, KER_CREEP_UPGRADER_LIFETIME_PROCESS,
  KER_INIT_PROCESS,
  ProcessType
} from "./ProcessType";
import {InitProcess} from "./processes/system/InitProcess";
import {Process} from "./Process";
import {ProcessDoesNotExistException} from "./exceptions/ProcessDoesNotExistException";
import {ColonyProcess} from "./processes/colony/ColonyProcess";
import {Empire} from "../screeps/Empire";
import {ColonySpawnQueueProcess} from "./processes/colony/ColonySpawnQueueProcess";
import {ColonySourceProcess} from "./processes/colony/ColonySourceProcess";
import {CreepHarvesterLifetimeProcess} from "./processes/creep/harvester/CreepHarvesterLifetimeProcess";
import {CreepHarvestActionProcess} from "./processes/creep/action/CreepHarvestActionProcess";
import {CreepBuildActionProcess} from "./processes/creep/action/CreepBuildActionProcess";
import {CreepDropResourceActionProcess} from "./processes/creep/action/CreepDropResourceActionProcess";
import {ColonyControllerProcess} from "./processes/colony/ColonyControllerProcess";
import {CreepUpgraderLifetimeProcess} from "./processes/creep/upgrader/CreepUpgraderLifetimeProcess";
import {CreepUpgradeControllerProcess} from "./processes/creep/action/CreepUpgradeControllerProcess";
import {CreepPullResourceActionProcess} from "./processes/creep/action/CreepPullResourceActionProcess";

const processTypes: Record<ProcessType, new (...args: any[]) => Process<ProcessType>> = {
  [KER_INIT_PROCESS]: InitProcess,
  [KER_COL_PROCESS]: ColonyProcess,
  [KER_COL_SPAWN_QUEUE_PROCESS]: ColonySpawnQueueProcess,
  [KER_COL_SOURCE_PROCESS]: ColonySourceProcess,
  [KER_CREEP_HARVESTER_LIFETIME_PROCESS]: CreepHarvesterLifetimeProcess,
  [KER_CREEP_ACTION_HARVEST]: CreepHarvestActionProcess,
  [KER_CREEP_ACTION_BUILD]: CreepBuildActionProcess,
  [KER_CREEP_ACTION_DROP_RESOURCES]: CreepDropResourceActionProcess,
  [KER_COL_CONTROLLER_PROCESS]: ColonyControllerProcess,
  [KER_CREEP_UPGRADER_LIFETIME_PROCESS]: CreepUpgraderLifetimeProcess,
  [KER_CREEP_ACTION_UPGRADE_CONTROLLER]: CreepUpgradeControllerProcess,
  [KER_CREEP_ACTION_PULL_RESOURCE]: CreepPullResourceActionProcess,
}

export class Kernel {

  private _processTable: Record<string, Process<ProcessType>> = {};
  private _memory!: { empire: Empire };

  constructor() {
    if (!Memory.kernel) {
      Memory.kernel = {
        processTable: {},
        colonies: {},
      };
    }

    this.loadProcessTable();

    this.addProcess(KER_INIT_PROCESS, 'init-process', 99, {});

    console.log("[main] 🛠️ Initialized kernel");
    console.log(`[main] ${Object.values(this._processTable).length} processes to run`);
  }

  private loadProcessTable() {
    Object.entries(Memory.kernel.processTable)
      .forEach(([processName, serializedProcess]) => {
        if (serializedProcess.type in processTypes) {
          this._processTable[processName] = new processTypes[serializedProcess.type](serializedProcess, this);
        } else {
          console.log(`❌ Unable to load process ${processName} (${serializedProcess.type}) --> not in corresponding table`);
        }
      });
  }

  private getProcessToRun() {
    return (
      Object.values(this._processTable)
        .filter((process) => {
          if (process.isCompleted) {
            return false;
          }

          if (process.isSuspended) {
            return false;
          }

          if (process.ticked) {
            return false;
          }

          return true;
        })
    );
  }

  private getHighestProrityProcess() {
    const filteredProcesses = this.getProcessToRun();

    const sortedProccesses = (
      filteredProcesses
        .sort((a, b) => b.priority - a.priority)
    );

    return sortedProccesses.shift();
  }

  public addProcessIfNotPresent<T extends ProcessType>(
    processType: T,
    name: string,
    priority: number,
    meta: ProcessMetaData[T],
    parent?: string
  ) {
    if (this.hasProcess(name)) {
      return;
    }

    this.addProcess(
      processType,
      name,
      priority,
      meta,
      parent
    );
  }

  public addProcess<T extends ProcessType>(
    processType: T,
    name: string,
    priority: number,
    meta: ProcessMetaData[T],
    parent?: string
  ) {
    const process = new processTypes[processType](
      {
        name: name,
        priority: priority,
        metaData: meta,
        suspend: false,
        parent: parent,
        type: processType,
      },
      this
    );

    this._processTable[name] = process;
  }

  public hasProcess(name: string) {
    return name in this._processTable;
  }

  public getProcessByName(name: string) {
    if (this.hasProcess(name)) {
      return this._processTable[name];
    }

    throw new ProcessDoesNotExistException(name);
  }

  public getProcess(type: ProcessType, name: string) {
    const process = this.getProcessByName(name);
    if (process.type !== type) {
      throw new ProcessDoesNotExistException(name);
    }

    return process;
  }

  public removeProcess(name: string) {
    if (!this.hasProcess(name)) {
      return;
    }

    const process = this.getProcessByName(name);
    process.completed();
  }

  public tick() {
    const process = this.getHighestProrityProcess();

    if (!process) {
      return;
    }

    process.tick();
  }

  public needsToRun() {
    return this.getProcessToRun().length > 0;
  }

  public loadMemory() {
    this._memory = {
      empire: new Empire(),
    }
  }

  public teardown() {
    const processes: Record<string, SerializedProcess<ProcessType>> = {};
    Object.entries(this._processTable)
      .forEach(([processName, process]) => {
        if (!process.isCompleted) {
          processes[processName] = process.serialized();
        }
      });

    Memory.kernel.processTable = processes;
  }

  public get memory() {
    return this._memory;
  }

}
