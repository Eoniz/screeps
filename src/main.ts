import { ErrorMapper } from "utils/ErrorMapper";
import {CreepType} from "./game/creep/CreepType";
import {CreepFactory} from "./game/factory/CreepFactory";
import {provideBuilderController, provideHarvesterController, provideUpgraderController} from "./game/creep/ResourceLocator";
import {CreepTypeVisitor} from "./game/creep/CreepTypeVisitor";

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
          You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
  // Memory extension samples
  interface Memory {
    uuid: number;
    log: any;
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

const harvesterController = provideHarvesterController();
const upgraderController = provideUpgraderController();
const builderController = provideBuilderController();

const CREEPS: Map<CreepType, number> = new Map();

CREEPS.set(CreepType.HARVESTER, 5);
CREEPS.set(CreepType.UPGRADER, 5);
CREEPS.set(CreepType.BUILDER, 5);

const handleCreepSpawning = () => {
  if (!Game.spawns['Spawn1'].spawning) {
    handleSpawn();
    return;
  }

  const spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
  Game.spawns['Spawn1'].room.visual.text(
    '🛠️' + spawningCreep.memory.role,
    Game.spawns['Spawn1'].pos.x + 1,
    Game.spawns['Spawn1'].pos.y,
    {align: 'left', opacity: 0.8}
  );
}

const handleSpawn = () => {
  const creepsToCreate: Map<CreepType, number> = new Map();

  for (const [creepType, limit] of CREEPS) {
    if (creepsToCreate.has(creepType)) {
      creepsToCreate.set(creepType, 0);
    }

    const existingCreeps = Object.values(Game.creeps).filter((creep) => creep.memory.role === creepType.kind);
    const numberToCreate = limit - existingCreeps.length;
    creepsToCreate.set(creepType, numberToCreate);
  }

  if (!creepsToCreate.size) {
    return;
  }

  const highest = (
    [...creepsToCreate.entries()]
      .reduce((prev, curr) => prev[1] > curr[1] ? prev : curr)
  );

  console.log(
    'Create queue: ',
    [...creepsToCreate.entries()]
      .map(([creepType, numberToCreate]) => `${creepType.kind}: ${numberToCreate}`).join(' | ')
  );

  const creepType = highest[0];

  const creepToBuild = CreepFactory.build(creepType);

  Game.spawns['Spawn1'].spawnCreep(
    creepToBuild.actions,
    creepToBuild.name,
    creepToBuild.opts,
  );
}

const handleGameTick = () => {
  const creepGameTickVisitor: CreepTypeVisitor<(creep: Creep) => void> = {
    builder: () => {
      return (creep: Creep) => {
        builderController.gameTick(creep);
      };
    },
    upgrader: () => {
      return (creep: Creep) => {
        upgraderController.gameTick(creep);
      };
    },
    harvester: () => {
      return (creep: Creep) => {
        harvesterController.gameTick(creep);
      }
    }
  }

  for (const [name, creep] of Object.entries(Game.creeps)) {
    const creepType = CreepType.fromType(creep.memory.role);
    const gameTick = creepType.accept(creepGameTickVisitor);
    gameTick(creep);
  }
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time}`);

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

  handleCreepSpawning();
  handleGameTick();
});
