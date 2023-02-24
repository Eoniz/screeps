import {CreepLifetimeProcess} from "../../../Process";
import {createProgram} from "@typescript-eslint/typescript-estree";

export class CreepBuildActionProcess extends CreepLifetimeProcess<'creep-action-build'> {

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

    if (!this.structure) {
      this.log("❌ no structure found, aborting");

      this.completed();
      return;
    }

    this.handleLogic(this.creep, this.structure);
  }

  protected postRun(): void {
  }

  private handleLogic(creep: Creep, structure: ConstructionSite<BuildableStructureConstant>) {
    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
      this.completed();
      this.resumeParent();
      return;
    }

    const buildResult = creep.build(structure);

    if (buildResult === OK) {
      return;
    }

    if (buildResult === ERR_NOT_IN_RANGE) {
      creep.moveTo(structure);
      return;
    }

    this.log("❌ unhandled error");
    this.completed();
  }

  public get structure() {
    if (!this.room) {
      this.log("❌ no room found, aborting");

      this.completed();
      return;
    }

    const maybeStructure = this.room.find(
      FIND_CONSTRUCTION_SITES,
      {
        filter: (structure) => {
          return structure.id === this.metaData.structure
        }
      }
    );

    return maybeStructure[0] ?? null;
  }
}
