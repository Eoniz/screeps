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

    if (!this.spawner) {
      this.log("❌ no spawner found, aborting");

      this.creep.suicide();
      this.completed();
      return;
    }

    this.handleLogic(this.creep, this.spawner);
  }

  protected postRun(): void {
  }

  private handleLogic(creep: Creep, spawner: StructureSpawn) {
    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
      this.completed();
      this.resumeParent();
      return;
    }

    const transferResult = creep.transfer(spawner, RESOURCE_ENERGY);
    if (transferResult === OK) {
      this.completed();
      this.resumeParent();
      return;
    }

    if (transferResult === ERR_NOT_IN_RANGE) {
      creep.moveTo(spawner);
      return;
    }

    this.log("❌ unhandled error");
  }

  private get spawner() {
    if (!this.room) {
      this.log("❌ no room found, aborting");

      this.completed();
      return;
    }

    const sources = this.room.find(
      FIND_MY_SPAWNS,
      {
        filter: (spawner) => {
          return spawner.id === this.metaData.spawner;
        }
      }
    );

    return sources[0] ?? null;
  }
}
