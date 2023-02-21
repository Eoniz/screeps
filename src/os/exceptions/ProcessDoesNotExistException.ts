import {KernelException} from "./KernelException";

export class ProcessDoesNotExistException extends KernelException {

  constructor(name: string, msg?: string) {
    super(`[${name}] ${msg ? msg : 'An unexpected error occured'}`);
  }

}
