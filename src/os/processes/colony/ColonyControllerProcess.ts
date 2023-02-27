import {Process} from "../../Process";
import {Colony, STATE_SPAWNING} from "../../../screeps/Colony";
import {KER_CREEP_UPGRADER_LIFETIME_PROCESS} from "../../ProcessType";

export class ColonyControllerProcess extends Process<'colony-controller-process'> {

  protected _colony!: Colony;
  protected _room!: Room;
  protected _controller!: StructureController;

  protected preRun(): void {
    if (!this.room) {
      this.log("No room --> aborting");

      this.completed();
      return;
    }

    this._room = this.room;

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

    const maybeController = this._room.find(
      FIND_STRUCTURES,
      {
        filter: (structure) => {
          return structure.id === this.metaData.controller;
        }
      }
    );

    if (!maybeController.length) {
      this.log(`No controller with id ${this.metaData.controller} --> aborting`);

      this.completed();
      return;
    }

    this.metaData.creeps = this.metaData.creeps.filter((creepName) => {
      const maybeCreep = Game.creeps[creepName];

      if (!maybeCreep) {
        return false;
      }

      if (maybeCreep.spawning) {
        return true;
      }

      if (maybeCreep.ticksToLive === 0) {
        return false;
      }

      return true;
    });

    this._controller = <StructureController> maybeController[0];
  }

  protected run(): void {
    this.checkSpawn();
  }

  protected postRun(): void {
  }

  private checkSpawn() {
    if (this.metaData.creeps.length >= 2) {
      return;
    }

    if (this._controller.room.name !== this._colony.coreRoom.name) {
      return;
    }

    if (!this.metaData.nextCreepName && this._colony.checkSpawningQueue(this.name) === false) {
      const name = `${this.name}-${Game.time}`;
      this.metaData.nextCreepName = name;

      this.log(`Spawning upgrader with identifier ${this.name} and name ${name}`);

      this._colony.spawnCreep(
        this.name,
        name,
        "upgrader",
        { controller: this._controller.id },
        1
      );
    }

    if (this._colony.checkSpawningQueue(this.name) === STATE_SPAWNING) {
      if (!this.metaData.nextCreepName) {
        this.metaData.nextCreepName = null;
        return;
      }

      if (this.metaData.creeps.includes(this.metaData.nextCreepName)) {
        this.metaData.nextCreepName = null;

        return;
      }

      this.metaData.creeps.push(this.metaData.nextCreepName);
      this.kernel.addProcess(
        KER_CREEP_UPGRADER_LIFETIME_PROCESS,
        `creep-lifetime-${this.metaData.nextCreepName}`,
        90,
        {
          roomName: this._controller.room.name,
          controller: this._controller.id,
          creep: this.metaData.nextCreepName,
          colonyProcessName: this.metaData.colonyProcessName,
        },
        this.name
      );

      this.metaData.nextCreepName = null;

      return;
    }
  }

}
