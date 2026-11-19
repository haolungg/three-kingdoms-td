import type { ISpatialHashGrid, SpatialEntity, Vec2 } from './types';

/**
 * 基于整型坐标哈希的二维空间网格，用于塔防高频索敌与范围技能判定
 */
export class SpatialHashGrid<T extends SpatialEntity> implements ISpatialHashGrid<T> {
  public readonly cellSize: number;
  private readonly invCellSize: number;
  private readonly cells = new Map<number, T[]>();

  constructor(cellSize = 64) {
    if (cellSize <= 0) {
      throw new RangeError('cellSize must be greater than 0');
    }
    this.cellSize = cellSize;
    this.invCellSize = 1 / cellSize;
  }

  private hashCell(cx: number, cy: number): number {
    // 位运算打包整型键，避免每帧 500+ 实体更新产生高频字符串 GC
    return ((cx + 32768) << 16) | ((cy + 32768) & 0xffff);
  }

  public clear(): void {
    this.cells.clear();
  }

  public insert(entity: T): void {
    const r = Math.max(0, entity.radius);
    const minX = Math.floor((entity.pos.x - r) * this.invCellSize);
    const maxX = Math.floor((entity.pos.x + r) * this.invCellSize);
    const minY = Math.floor((entity.pos.y - r) * this.invCellSize);
    const maxY = Math.floor((entity.pos.y + r) * this.invCellSize);

    for (let cx = minX; cx <= maxX; cx++) {
      for (let cy = minY; cy <= maxY; cy++) {
        const key = this.hashCell(cx, cy);
        let bucket = this.cells.get(key);
        if (!bucket) {
          bucket = [];
          this.cells.set(key, bucket);
        }
        bucket.push(entity);
      }
    }
  }

  public queryRadius(center: Vec2, radius: number): T[] {
    const results: T[] = [];
    const visited = new Set<string>();
    const r = Math.max(0, radius);

    const minX = Math.floor((center.x - r) * this.invCellSize);
    const maxX = Math.floor((center.x + r) * this.invCellSize);
    const minY = Math.floor((center.y - r) * this.invCellSize);
    const maxY = Math.floor((center.y + r) * this.invCellSize);

    for (let cx = minX; cx <= maxX; cx++) {
      for (let cy = minY; cy <= maxY; cy++) {
        const bucket = this.cells.get(this.hashCell(cx, cy));
        if (!bucket) continue;

        for (let i = 0; i < bucket.length; i++) {
          const entity = bucket[i];
          if (visited.has(entity.id)) continue;

          const dx = entity.pos.x - center.x;
          const dy = entity.pos.y - center.y;
          const hitRadius = r + Math.max(0, entity.radius);

          if (dx * dx + dy * dy <= hitRadius * hitRadius) {
            visited.add(entity.id);
            results.push(entity);
          }
        }
      }
    }

    return results;
  }

  public queryNearest(center: Vec2, radius: number): T | null {
    const candidates = this.queryRadius(center, radius);
    let nearest: T | null = null;
    let minDistSq = Infinity;

    for (let i = 0; i < candidates.length; i++) {
      const entity = candidates[i];
      const dx = entity.pos.x - center.x;
      const dy = entity.pos.y - center.y;
      const distSq = dx * dx + dy * dy;

      if (distSq < minDistSq) {
        minDistSq = distSq;
        nearest = entity;
      }
    }

    return nearest;
  }
}
