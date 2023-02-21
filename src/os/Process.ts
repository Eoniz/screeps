import {ProcessType} from "./ProcessType";
import {Kernel} from "./Kernel";

export abstract class Process<T extends ProcessType> {

  private readonly _kernel: Kernel;

  private readonly _name: string;
  private readonly _priority: number;
  private readonly _metaData: ProcessMetaData[T];
  private readonly _parent?: string;
  private readonly _type: ProcessType;

  private _suspend: boolean;
  private _completed: boolean;
  private _ticked: boolean;

  constructor(
    serialized: SerializedProcess<T>,
    kernel: Kernel
  ) {
    this._kernel = kernel;

    this._name = serialized.name;
    this._priority = serialized.priority;
    this._metaData = serialized.metaData;
    this._suspend = serialized.suspend;
    this._parent = serialized.parent;
    this._type = serialized.type;

    this._completed = false;
    this._ticked = false;
  }

  public completed() {
    this._completed = true;
    this.resumeParent();
  }

  protected abstract preRun(): void;
  protected abstract run(): void;
  protected abstract postRun(): void;

  public tick() {
    if (this._completed) {
      return;
    }

    if (this._suspend) {
      return;
    }

    this.preRun();
    this.run();
    this.postRun();

    this._ticked = true;
  }

  public serialized() {
    return {
      name: this.name,
      type: this.type,
      parent: this.parentName,
      suspend: this.isSuspended,
      metaData: this.metaData,
      priority: this.priority
    } satisfies SerializedProcess<T>;
  }

  public fork<T extends ProcessType>(processType: T, name: string, priority: number, meta: ProcessMetaData[T]) {
    this.kernel.addProcess(processType, name, priority, meta, this.name);

    this._suspend = true;
  }

  protected log(...args: any[]) {
    console.log(`[${this.type}] [${this.name}] ${args.toString()}`);
  }

  public resume() {
    this._suspend = false;
  }

  public resumeParent() {
    this.parent?.resume();
  }

  protected get kernel() {
    return this._kernel;
  }

  protected get name() {
    return this._name;
  }

  public get priority() {
    return this._priority;
  }

  protected get metaData() {
    return this._metaData;
  }

  public get isSuspended() {
    return this._suspend;
  }

  protected get parentName() {
    return this._parent;
  }

  protected get parent(): Process<ProcessType> | null {
    if (!this.parentName) {
      return null;
    }

    return this.kernel.getProcessByName(this.parentName);
  }

  public get ticked() {
    return this._ticked;
  }

  protected get type() {
    return this._type;
  }

  public get isCompleted() {
    return this._completed;
  }

  public get room() {
    if (!this.metaData.roomName) {
      return null;
    }

    return Game.rooms[this.metaData.roomName];
  }
}
