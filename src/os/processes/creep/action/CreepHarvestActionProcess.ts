import {CreepLifetimeProcess} from "../../../Process";

export class CreepHarvestActionProcess extends CreepLifetimeProcess<'creep-action-harvest'> {

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
    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === creep.store.getCapacity(RESOURCE_ENERGY)) {
      this.completed();
      this.resumeParent();
      return;
    }

    if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
      creep.moveTo(source);
    }
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
