import {CreepLifetimeProcess} from "../../../Process";
import {KER_CREEP_ACTION_BUILD, KER_CREEP_ACTION_DROP_RESOURCES, KER_CREEP_ACTION_HARVEST} from "../../../ProcessType";
import * as console from "console";

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

    if (this.checkForSpawnQueue(creep, source.room)) {
      return;
    }

    if (this.checkForBuilding(creep, source)) {
      return;
    }

    if (this.checkForSourceContainer(creep, source)) {
      return;
    }
  }

  private checkForSourceContainer(creep: Creep, source: Source) {
    const availableContainers = source.pos.findInRange(
      FIND_STRUCTURES,
      1,
      {
        filter: (structure) => {
          return (
            structure.structureType === STRUCTURE_CONTAINER
            && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
          );
        }
      }
    );

    if (!availableContainers.length) {
      return false;
    }

    const container = availableContainers[0];

    this.fork(
      KER_CREEP_ACTION_DROP_RESOURCES,
      `drop-resources-${this.name}`,
      this.priority - 1,
      {
        creep: creep.name,
        colonyProcessName: this.metaData.colonyProcessName,
        roomName: source.room.name,
        target: container.id,
      }
    );

    return true;
  }

  private checkForSpawnQueue(creep: Creep, room: Room) {
    if (!this.colony) {
      this.log("❌ no colony")
      return false;
    }

    const maybeNextCreep = this.colony.getNextCreepToSpawn();
    if (!maybeNextCreep) {
      this.log("❌ no creep in queue")

      return false;
    }

    if (maybeNextCreep.priority < 90) {
      return;
    }

    const sortedSpawners = (
      this.colony.spawners
        .filter((a) => !!a.memory.identifier && !a.spawning)
        .filter((a) => creep.pos.getRangeTo(a) <= 15)
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
        target: spawner.id,
      }
    );

    return true;
  }

  private checkForBuilding(creep: Creep, source: Source) {
    const structures = (
      source.pos.findInRange(FIND_CONSTRUCTION_SITES, 3)
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
