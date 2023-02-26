import { ErrorMapper } from "utils/ErrorMapper";
import {Process} from "./os/Process";
import {
  KER_COL_CONTROLLER_PROCESS,
  KER_COL_SOURCE_PROCESS,
  KER_COL_SPAWN_QUEUE_PROCESS,
  KER_CREEP_ACTION_BUILD,
  KER_CREEP_ACTION_DROP_RESOURCES,
  KER_CREEP_ACTION_HARVEST, KER_CREEP_ACTION_PULL_RESOURCE,
  KER_CREEP_ACTION_UPGRADE_CONTROLLER,
  KER_CREEP_HARVESTER_LIFETIME_PROCESS,
  KER_CREEP_UPGRADER_LIFETIME_PROCESS,
  KER_INIT_PROCESS,
  ProcessType
} from "./os/ProcessType";
import {Kernel} from "./os/Kernel";
import {Colony} from "./screeps/Colony";
import {CreepType} from "./factories/CreepFactory";

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
          You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */

  interface SerializedCreepToSpawn {
    identifier: string,
    creepName: string;
    type: CreepType;
    priority: number;
    meta: Record<string, unknown>;
  }

  interface SerializedSource {
    id: string;
    energy: number;
    energyCapacity: number;
  }

  interface SerializedRoom {
    name: string;
  }

  interface SerializedSourceContainer {
    id: string;
    sourceId: string;
  }

  interface SerializedColony {
    rooms: Array<SerializedRoom>;
    sources: Record<string, SerializedSource>;
    sourceContainers: Record<string, SerializedSourceContainer>;
    spawnQueue: Array<SerializedCreepToSpawn>;
  }

  interface SpawnMemory {
    identifier?: string;
  }

  interface MemoryKernel {
    processTable: Record<string, SerializedProcess<ProcessType>>;
    colonies: Record<string, SerializedColony>;
  }

  interface SerializedProcess<T extends ProcessType> {
    name: string;
    priority: number;
    metaData: ProcessMetaData[T];
    suspend: boolean;
    parent?: string;
    type: ProcessType;
  }

  type DefaultProcessMetaData = {
    roomName?: string;
    creep?: string;
    colonyProcessName?: string;
  }

  type ProcessMetaData = {
    [processType: string]: DefaultProcessMetaData,
    [KER_INIT_PROCESS]: DefaultProcessMetaData & {},
    [KER_COL_SPAWN_QUEUE_PROCESS]: DefaultProcessMetaData & { colonyProcessName: string; },
    [KER_COL_SOURCE_PROCESS]: DefaultProcessMetaData & {
      creeps: Array<string>;
      sourceId: string;
      colonyProcessName: string;
      nextCreepName: string | null;
    },
    [KER_CREEP_HARVESTER_LIFETIME_PROCESS]: DefaultProcessMetaData & {
      source: string;
    },
    [KER_CREEP_UPGRADER_LIFETIME_PROCESS]: DefaultProcessMetaData & {
      controller: string;
    },
    [KER_CREEP_ACTION_HARVEST]: DefaultProcessMetaData & {
      source: string;
    },
    [KER_CREEP_ACTION_BUILD]: DefaultProcessMetaData & {
      structure: string;
    },
    [KER_CREEP_ACTION_DROP_RESOURCES]: DefaultProcessMetaData & {
      target: string;
    },
    [KER_COL_CONTROLLER_PROCESS]: DefaultProcessMetaData & {
      controller: string;
      creeps: Array<string>;
      nextCreepName: string | null;
    },
    [KER_CREEP_ACTION_UPGRADE_CONTROLLER]: DefaultProcessMetaData & {
      controller: string;
    },
    [KER_CREEP_ACTION_PULL_RESOURCE]: DefaultProcessMetaData & {
      target: string,
      resource: ResourceConstant
    }
  }

  // Memory extension samples
  interface Memory {
    uuid: number;
    log: any;
    kernel: MemoryKernel;
  }

  interface CreepMemory {
    type: string;
    [K: string]: any;
  }

  // Syntax for adding proprties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      log: any;
    }
  }
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {

  const TICK_THRESHOLD = 1000;

  const kernel = new Kernel();

  let i = 0;
  while (i++ <= TICK_THRESHOLD && kernel.needsToRun()) {
    kernel.tick();
  }

  kernel.teardown();
});
