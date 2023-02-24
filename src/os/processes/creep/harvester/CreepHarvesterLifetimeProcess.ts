import {CreepLifetimeProcess} from "../../../Process";
import {KER_CREEP_ACTION_BUILD, KER_CREEP_ACTION_DROP_RESOURCES, KER_CREEP_ACTION_HARVEST} from "../../../ProcessType";

export class CreepHarvesterLifetimeProcess extends CreepLifetimeProcess<'creep-harvester-lifetime-process'> {

  protected preRun(): void {
  }

  protected run(): void {
    if (!this.creep) {
      this.log("❌ no creep found, aborting");

      this.completed();
      return;
    }

    if (this.creep.spawning) {
      return;
    }

    if (!this.source) {
      this.log("❌ no source found, aborting");

      this.creep.suicide();
      this.completed();
      return;
    }

    this.handleLogic(this.creep, this.source);
  }

  protected postRun(): void {
  }

  private handleLogic(creep: Creep, source: Source) {
    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
      this.fork(
        KER_CREEP_ACTION_HARVEST,
        `harvest-${this.name}`,
        this.priority - 1,
        {
          creep: creep.name,
          source: source.id,
          roomName: source.room.name,
          colonyProcessName: this.metaData.colonyProcessName,
        },
      );

      return;
    }

    if (this.checkForBuilding(creep, source)) {
      return;
    }

    if (this.checkForSpawnQueue(creep, source.room)) {
      return;
    }
  }

  private checkForSpawnQueue(creep: Creep, room: Room) {
    this.log("👨‍🔬 spawn queue");
    if (!this.colony) {
      this.log("❌ no colony")
      return false;
    }

    if (!this.colony.getNextCreepToSpawn()) {
      this.log("❌ no creep in queue")

      return false;
    }

    const sortedSpawners = (
      this.colony.spawners
        .filter((a) => !!a.memory.identifier && !a.spawning)
        .sort((a, b) => creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b))
    );

    if (!sortedSpawners.length) {
      this.log("❌ no spawner found")

      return false;
    }

    const spawner = sortedSpawners[0];

    this.fork(
      KER_CREEP_ACTION_DROP_RESOURCES,
      `drop-resources-${this.name}`,
      this.priority - 1,
      {
        creep: creep.name,
        colonyProcessName: this.metaData.colonyProcessName,
        roomName: room.name,
        spawner: spawner.id,
      }
    );

    return true;
  }

  private checkForBuilding(creep: Creep, source: Source) {
    const structures = (
      source.room
        .find(FIND_CONSTRUCTION_SITES)
        .sort((a, b) => creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b))
    );

    if (structures.length) {
      const closestStructure = structures[0];

      this.fork(
        KER_CREEP_ACTION_BUILD,
        `build-${this.name}`,
        this.priority - 1,
        {
          creep: creep.name,
          roomName: source.room.name,
          structure: closestStructure.id,
          colonyProcessName: this.metaData.colonyProcessName,
        }
      );

      return true;
    }

    return false;
  }

  private get source() {
    if (!this.room) {
      this.log("❌ no room found, aborting");

      this.completed();
      return;
    }

    const sources = this.room.find(
      FIND_SOURCES,
      {
        filter: (source) => {
          return source.id === this.metaData.source;
        }
      }
    );

    return sources[0] ?? null;
  }

}
