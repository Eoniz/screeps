import {CreepLifetimeProcess} from "../../../Process";

export class CreepDropResourceActionProcess extends CreepLifetimeProcess<'creep-drop-resources'> {

  protected preRun(): void {
  }

  protected run(): void {
    if (!this.creep) {
      this.completed();
      return;
    }

    if (this.creep.spawning) {
      return;
    }

    if (!this.target) {
      this.log("❌ no target found, aborting");

      this.completed();
      return;
    }

    this.handleLogic(this.creep, this.target);
  }

  protected postRun(): void {
  }

  private handleLogic(creep: Creep, targetStructure: Structure) {
    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
      this.completed();
      this.resumeParent();
      return;
    }

    const transferResult = creep.transfer(targetStructure, RESOURCE_ENERGY);
    if (transferResult === OK) {
      this.completed();
      this.resumeParent();
      return;
    }

    if (transferResult === ERR_NOT_IN_RANGE) {
      creep.moveTo(targetStructure);
      return;
    }

    this.log("❌ unhandled error");
  }

  private get target() {
    if (!this.room) {
      this.log("❌ no room found, aborting");

      this.completed();
      return;
    }

    const maybeTarget = Game.getObjectById(<Id<Structure>> this.metaData.target);

    return maybeTarget ?? null;
  }
}
