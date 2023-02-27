import {Process} from "../../Process";
import {ColonyProcess} from "./ColonyProcess";
import {KER_COL_PROCESS, KER_CREEP_HARVESTER_LIFETIME_PROCESS} from "../../ProcessType";
import {Colony, STATE_SPAWNING} from "../../../screeps/Colony";
import * as console from "console";

export class ColonySourceProcess extends Process<'colony-source-process'> {

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

    const colony = colonyProcess.colony;

    if (!colony) {
      this.completed();
      return;
    }

    const source = colony.source(this.metaData.sourceId);

    if (!source) {
      this.completed();
      return;
    }

    this.metaData.creeps = this.metaData.creeps.filter((creepName) => {
      const maybeCreep = Game.creeps[creepName];

      if (!maybeCreep) {
        return false;
      }

      if (maybeCreep.spawning) {
        return true;
      }

      if (maybeCreep.ticksToLive === 0) {
        return false;
      }

      return true;
    });

    this.checkContainer(colony, source);
    this.checkSpawn(colony, source);
  }

  protected postRun(): void {
  }

  private checkSpawn(colony: Colony, source: Source) {
    if (this.metaData.creeps.length >= 2) {
      // No spawn when source having at least 2 creeps
      return;
    }

    if (source.pos.roomName !== colony.coreRoom.name) {
      return;
    }

    if (!this.metaData.nextCreepName && colony.checkSpawningQueue(this.name) === false) {
      const name = `${this.name}-${Game.time}`;
      this.metaData.nextCreepName = name;

      this.log(`Spawning harvester with identifier ${this.name} and name ${name}`);

      colony.spawnCreep(
        this.name,
        name,
        "harvester",
        { source: source.id },
        1
      );
    }

    if (colony.checkSpawningQueue(this.name) === STATE_SPAWNING) {
      if (!this.metaData.nextCreepName) {
        this.metaData.nextCreepName = null;
        return;
      }

      if (this.metaData.creeps.includes(this.metaData.nextCreepName)) {
        this.log("metaData already contains next creep name");
        this.metaData.nextCreepName = null;

        return;
      }

      this.log(`Adding ${this.metaData.nextCreepName} to metaData creeps`);

      this.metaData.creeps.push(this.metaData.nextCreepName);
      this.kernel.addProcess(
        KER_CREEP_HARVESTER_LIFETIME_PROCESS,
        `creep-lifetime-${this.metaData.nextCreepName}`,
        Math.max(50, 90 - (this.metaData.creeps.length * 10)),
        {
          roomName: source.room.name,
          source: source.id,
          creep: this.metaData.nextCreepName,
          colonyProcessName: this.metaData.colonyProcessName,
        },
        this.name
      );

      this.metaData.nextCreepName = null;

      return;
    }

  }

  private checkContainer(colony: Colony, source: Source) {
    if (!source) {
      return;
    }

    const container = colony.sourceContainer(source.id);
    if (container) {
      return;
    }

    const area = source.room.lookForAtArea(
      LOOK_TERRAIN,
      source.pos.y - 1,
      source.pos.x - 1,
      source.pos.y + 1,
      source.pos.x + 1,
    );

    const positions: Array<RoomPosition> = [];

    for (let y = source.pos.y - 1; y <= source.pos.y + 1; y++) {
      for (let x = source.pos.x - 1; x <= source.pos.x + 1; x++) {
        if (y === source.pos.y && x === source.pos.x) {
          continue;
        }

        if (
          area[y][x].length
          && ['plain', 'swamp'].includes(area[y][x][0].toString())
        ) {
          positions.push(new RoomPosition(x, y, source.room.name));
        }
      }
    }

    if (!positions.length) {
      this.log("No positions");
      return;
    }

    for (const position of positions) {
      position.createConstructionSite(STRUCTURE_CONTAINER);
    }
  }

}
