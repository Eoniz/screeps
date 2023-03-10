import {Process} from "../../Process";
import {KER_COL_PROCESS} from "../../ProcessType";
import {ColonyProcess} from "./ColonyProcess";
import {CreepFactory} from "../../../factories/CreepFactory";

export class ColonySpawnQueueProcess extends Process<'colony-spawn-queue'> {

  protected preRun(): void {
  }

  protected run(): void {
    let colonyProcess!: ColonyProcess;
    try {
      colonyProcess = <ColonyProcess> this.kernel.getProcess(KER_COL_PROCESS, this.metaData.colonyProcessName);
    } catch (ignored) {
      this.completed();
      return;
    }

    if (colonyProcess.isCompleted) {
      this.completed();
      return;
    }

    const nextCreepToSpawn = colonyProcess.colony.getNextCreepToSpawn();
    if (!nextCreepToSpawn) {
      this.log("Nothing to spawn");
      return;
    }


    const spawners = colonyProcess.colony.spawners.filter((_spawner) => _spawner.spawning === null);

    if (!spawners.length) {
      this.log("No spawner available for now");
      return;
    }

    const spawner = spawners[0];
    const body = CreepFactory.buildCreep(nextCreepToSpawn.type, spawner.room.energyCapacityAvailable);

    const spawnCreepResult = spawner.spawnCreep(
      body.body,
      nextCreepToSpawn.creepName,
      {
        memory: {
          type: nextCreepToSpawn.type,
          ...nextCreepToSpawn.meta
        }
      }
    );

    if (spawnCreepResult === OK) {
      this.log(`Spawning a ${nextCreepToSpawn.type} with name ${nextCreepToSpawn.creepName} and identifier ${nextCreepToSpawn.identifier}`);
      spawner.memory.identifier = nextCreepToSpawn.identifier;
      colonyProcess.colony.removeCreepFromSpawnQueue(nextCreepToSpawn.identifier);
    }
  }

  protected postRun(): void {
  }

}
