import { ErrorMapper } from "utils/ErrorMapper";
import {Process} from "./os/Process";
import {KER_INIT_PROCESS, ProcessType} from "./os/ProcessType";
import {Kernel} from "./os/Kernel";
import {Colony} from "./screeps/Colony";

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
          You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */

  interface MemoryKernel {
    processTable: Record<string, SerializedProcess<ProcessType>>;
    colonies: Record<string, Colony>;
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
  }

  type ProcessMetaData = {
    [processType: string]: DefaultProcessMetaData,
    [KER_INIT_PROCESS]: DefaultProcessMetaData & {},
  }

  // Memory extension samples
  interface Memory {
    uuid: number;
    log: any;
    kernel: MemoryKernel;
  }

  interface CreepMemory {
    role: string;
    id: number;
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
