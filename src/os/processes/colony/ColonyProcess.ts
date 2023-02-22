import {Process} from "../../Process";
import {KER_COL_SOURCE_PROCESS, KER_COL_SPAWN_QUEUE_PROCESS} from "../../ProcessType";
import {Colony} from "../../../screeps/Colony";

export class ColonyProcess extends Process<'colony'> {

  private _colony!: Colony;

  protected preRun(): void {
    this.log("preRun() called");
  }

  protected run(): void {
    this.log("run() called");

    if (!this.room) {
      this.log("No room --> aborting");

      this.completed();
      return;
    }

    if (!this.metaData.roomName) {
      this.log("No room name --> aborting");
      this.completed();
      return;
    }

    const colony = this.kernel.memory.empire.getColony(this.metaData.roomName);

    if (!colony) {
      this.log(`No colony in kernel empire with name ${this.metaData.roomName} --> aborting`);

      this.completed();
      return;
    }

    this._colony = colony;

    this.kernel.addProcessIfNotPresent(
      KER_COL_SPAWN_QUEUE_PROCESS,
      `colony-spawn-queue-${colony.coreRoom.name}`,
      this.priority - 5,
      {
        colonyProcessName: this.name,
      },
    );

    this._colony.sources.forEach((_source) => {
      this.kernel.addProcessIfNotPresent(
        KER_COL_SOURCE_PROCESS,
        `colony-source-${_source.id}`,
        this.priority - 10,
        {
          roomName: _source.room.name,
          colonyProcessName: this.name,
          sourceId: _source.id,
        }
      );
    });
  }

  protected postRun(): void {
  }

  public get colony() {
    return this._colony;
  }
}
