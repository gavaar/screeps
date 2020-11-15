class EnergySourceService {
  getRoomEnergySources(room: IRoom): { [id: string]: ISource } {
    if (!room.memory.sources) Memory.sources = {};

    let sources = room.memory.sources;
    if (sources) return sources;

    sources = room.memory.sources = this.findEnergySourcesInRoom(room);
    return sources;
  }

  getNextEnergySourceInRoom(room: IRoom): string {
    const sources = this.getRoomEnergySources(room);
    const sourceId = Object.keys(sources)
      .sort((sa, sb) => { // order them by lower amount of miners
        return sources[sa].memory.miners - sources[sb].memory.miners;
      })
      .find(srcId => { // return the first that has an empty spot
        return sources[srcId].memory.minerCapacity > sources[srcId].memory.miners;
      });

    return sourceId || '';
  }

  private findEnergySourcesInRoom(room: IRoom) {
    return room.find<ISource>(FIND_SOURCES).reduce((srcMap, src) => {
      src.memory = this.setSourceMemoryConfig(src);
      srcMap[src.id] = src;
      return srcMap;
    }, {} as { [id: string]: ISource })
  }

  private setSourceMemoryConfig(src: ISource): ISourceMemory {
    const { x, y } = src.pos;
    let minerCapacity = 0;

    src.room.lookAtArea(y - 1, x - 1, y + 1, x + 1, true).forEach(pos => {
      if (pos.type === 'terrain' && (pos.terrain === 'swamp' || pos.terrain === 'plain')) {
        minerCapacity += 1;
      }
    });

    return { minerCapacity, miners: 0 };
  }
}

const energySourceService = new EnergySourceService();

export { energySourceService };