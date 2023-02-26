import {CreepLifetimeProcess} from "../../../Process";
import {KER_CREEP_ACTION_HARVEST, KER_CREEP_ACTION_PULL_RESOURCE} from "../../../ProcessType";

export class CreepUpgraderLifetimeProcess extends CreepLifetimeProcess<'creep-upgrader-lifetime-process'> {

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

    if (!this.controller) {
      this.log("❌ no controller found, aborting");

      this.creep.suicide();
      this.completed();
      return;
    }

    this.handleLogic(this.creep, this.controller);
  }

  protected postRun(): void {
  }

  private handleLogic(creep: Creep, controller: StructureController) {
    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {

      const containers = (
        controller.room.find(
          FIND_STRUCTURES,
          {
            filter: (structure) => {
              return (
                structure.structureType === STRUCTURE_CONTAINER
                && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0
              );
            }
          }
        ).sort((a, b) => {
          return creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b);
        })
      );

      console.log("✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨");
      console.log(JSON.stringify(
        containers.map((c) => ({ distance: creep.pos.getRangeTo(c), id: c.id }))
      ));

      if (containers.length) {
        this.fork(
          KER_CREEP_ACTION_PULL_RESOURCE,
          `pull-resource-${this.name}`,
          this.priority - 1,
          {
            creep: creep.name,
            target: containers[0].id,
            resource: RESOURCE_ENERGY,
            colonyProcessName: this.metaData.colonyProcessName,
            roomName: controller.room.name,
          }
        );

        return;
      }

      const source = creep.pos.findClosestByPath(FIND_SOURCES);

      if (!source) {
        return;
      }

      this.fork(
        KER_CREEP_ACTION_HARVEST,
        `harvest-${this.name}`,
        this.priority - 1,
        {
          creep: creep.name,
          source: source.id,
          roomName: controller.room.name,
          colonyProcessName: this.metaData.colonyProcessName
        }
      );

      return;
    }

    if (this.checkForUpgrade(creep, controller)) {
      return;
    }
  }

  private checkForUpgrade(creep: Creep, controller: StructureController) {
    if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
      creep.moveTo(controller);
    }

    return true;
  }

  private get controller(): StructureController | null {
    if (!this.room) {
      return null;
    }

    const structures = this.room.find(
      FIND_STRUCTURES,
      {
        filter: (structure) => {
          return structure.id === this.metaData.controller
        }
      }
    );

    if (!structures.length) {
      return null;
    }

    return <StructureController>structures[0];
  }
}
