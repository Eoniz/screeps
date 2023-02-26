import {CreepLifetimeProcess} from "../../../Process";

export class CreepPullResourceActionProcess extends CreepLifetimeProcess<'creep-action-pull-resource'> {

  protected preRun(): void {
  }

  protected run(): void {
    if (!this.creep) {
      this.log("❌ no creep found, aborting");

      this.completed();
      return;
    }

    const target = this.getTarget<Structure | Creep>();

    if (!target) {
      this.log("❌ no target found, aborting");

      this.creep.suicide();
      this.completed();
      return;
    }

    this.handleLogic(this.creep, target);
  }

  protected postRun(): void {
  }

  private handleLogic(creep: Creep, target: Structure | Creep) {
    if (creep.store.getFreeCapacity(this.metaData.resource) === 0) {
      this.completed();
      this.resumeParent();
      return;
    }

    if (this.isStructureContainer(target)) {
      if (target.store.getUsedCapacity(this.metaData.resource) === 0) {
        this.completed();
        this.resumeParent();
        return;
      }

      if (creep.withdraw(target, this.metaData.resource) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target);
        return;
      }
    }

    if (this.isCreep(target)) {
      if (target.transfer(creep, this.metaData.resource) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target);

        return;
      }
    }

    this.completed();
  }



  private isCreep(maybeCreep: any): maybeCreep is Creep {
    return Boolean(maybeCreep.harvest);
  }

  private isStructureContainer(maybeStructure: any): maybeStructure is StructureContainer {
    return Boolean(maybeStructure.structureType) && Boolean(maybeStructure.store);
  }

  private getTarget<T>() {
    return <T> Game.getObjectById(<Id<any>> this.metaData.target) ?? null;
  }

}
