import { roomService } from '@rooms/room.service';
import { CreepType } from './creep.interface';
import { AbstractCreep, CreepOptions } from './_creep.abstract';

class CCollector extends AbstractCreep<ICCollectorMemory> {
  type = CreepType.Collector;

  get energyStore() {
    return this.creep.store
  }

  constructor(creep: ICreep<ICCollectorMemory>, opts: CreepOptions) {
    super(creep, opts);
    if (!this.memory.state) this.memory.state = 'collecting';
  }

  run() {
    if (this.memory.state === 'collecting') this.collect();
    else this.transfer();

    this.beforeDestroy();
  }

  private getStructureTarget(): ISpawn | IContainer {
    if (!this.memory.target) {
      const emptiestStorage = roomService.getRoomStorages(this.creep.room)[0];
      this.memory.target = emptiestStorage.id;
    }

    return Game.getObjectById<ISpawn | IContainer>(this.memory.target);
  }

  private getEnergyTarget(): IResource {
    if (!this.memory.target) {
      this.memory.target = roomService.getDroppedResources(this.creep.room)[0].id;
    }

    return Game.getObjectById<IResource>(this.memory.target);
  }

  private collect(): void {
    const target = this.getEnergyTarget();
    const transfer = this.creep.pickup(target);

    if (transfer === ERR_NOT_IN_RANGE) this.creep.moveTo(target.pos, { visualizePathStyle: {} });
    if (transfer === ERR_FULL) this.toggleState();
  }

  private transfer(): void {
    const target = this.getStructureTarget();
    const transfer = this.creep.transfer(target, RESOURCE_ENERGY);

    if (transfer === ERR_NOT_IN_RANGE) this.creep.moveTo(target.pos, { visualizePathStyle: {} });
    if (transfer === ERR_FULL) this.creep.memory.target = '';

    if (!this.creep.store.getUsedCapacity()) this.toggleState();
  }

  private toggleState() {
    this.memory.target = '';
    this.memory.state = (this.memory.state === 'transferring' ? 'collecting' : 'transferring');
  }

  private beforeDestroy() {
    if (this.creep.ticksToLive === 1) {
      this.creep.room.memory.currentCreeps[this.type] -= 1;
      delete Memory.creeps[this.name];
    }
  }
}

export { CCollector };
