
export class SourceUtils {

  public static serializeSource(source: Source): SerializedSource {
    return {
      id: source.id,
      energy: source.energy,
      energyCapacity: source.energyCapacity,
    };
  }

}
