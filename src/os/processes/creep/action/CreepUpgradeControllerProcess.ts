import {CreepLifetimeProcess} from "../../../Process";

export class CreepUpgradeControllerProcess extends CreepLifetimeProcess<'creep-action-upgrade-controller'> {

  protected preRun(): void {
  }

  protected run(): void {
    if (!this.creep) {
      this.log("❌ no creep found, aborting");

      this.completed();
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
      this.completed();
      this.resumeParent();
      return;
    }

    if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
      creep.moveTo(controller);
    }
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

    return <StructureController> structures[0];
  }
}
