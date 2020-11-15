import { roomService } from 'src/rooms/room.service';
import { CreepType } from './creep.interface';
import { AbstractCreep, CreepOptions } from './_creep.abstract';

class CBuilder extends AbstractCreep<ICBuilderMemory> {
  type = CreepType.Builder;

  constructor(creep: ICreep<ICBuilderMemory>, opts: CreepOptions) {
    super(creep, opts);
    this.memory.state = 'collecting';
  }

  run() {
    if (this.memory.state === 'collecting') this.collect();
    else this.build();
  }

  private getEnergyTarget(): IResource {
    if (!this.memory.target) {
      const storages = roomService.getRoomStorages(this.creep.room);
      this.memory.target = storages[storages.length - 1].id; // fullest
    }

    return Game.getObjectById<IResource>(this.memory.target);
  }

  private getBuildTarget(): IConstructionSite {
    if (!this.memory.target) {
      const sites = roomService.getConstructionSites(this.creep.room);
      this.memory.target = this.creep.pos.findClosestByPath(sites).id;
    }

    return Game.getObjectById<IConstructionSite>(this.memory.target);
  }

  private collect(): void {
    const target = this.getEnergyTarget();
    const transfer = this.creep.withdraw(target, RESOURCE_ENERGY);

    if (transfer === ERR_NOT_IN_RANGE) this.creep.moveTo(target.pos, { visualizePathStyle: {} });
    if (transfer === ERR_NOT_ENOUGH_RESOURCES) this.creep.memory.target = '';
    if (transfer === ERR_FULL) this.toggleState();
  }

  private build(): void {
    const target = this.getBuildTarget();
    const build = this.creep.build(target);

    if (build === ERR_NOT_IN_RANGE) this.creep.moveTo(target.pos, { visualizePathStyle: {} });
    if (build === ERR_NOT_ENOUGH_RESOURCES) this.toggleState();
  }

  private toggleState() {
    this.memory.target = '';
    this.memory.state = this.memory.state === 'building' ? 'collecting' : 'building';
  }
}

export { CBuilder };
