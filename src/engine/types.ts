export interface Vec2 {
  x: number;
  y: number;
}

export type TileEffectType = 'NONE' | 'FIRE' | 'BLOCKED' | 'INTIMIDATED';

export interface WindState {
  direction: Vec2; // 诸葛亮【借东风】全局风向矢量
  strength: number;
  remainingTicks: number;
}

export interface TileStatus {
  gridX: number;
  gridY: number;
  effect: TileEffectType;
  burnIntensity: number; // 周瑜【火烧赤壁】火海强度，随风向矢量扩散
  remainingTicks: number;
  isPassable: boolean; // 张飞【当阳断桥】动态阻挡标记
}

export interface SpatialEntity {
  id: string;
  pos: Vec2;
  radius: number;
  hp: number;
  isBoss?: boolean;
}

export interface ISpatialHashGrid<T extends SpatialEntity> {
  readonly cellSize: number;
  clear(): void;
  insert(entity: T): void;
  queryRadius(center: Vec2, radius: number): T[];
}

export interface IFlowField {
  recompute(grid: TileStatus[][], goal: Vec2): void;
  sampleDirection(pos: Vec2): Vec2;
}

export type SkillState = 'IDLE' | 'CASTING' | 'ACTIVE' | 'COOLDOWN';

export interface IGeneralSkillFSM {
  readonly generalId: 'ZHUGE_LIANG' | 'ZHOU_YU' | 'ZHANG_FEI';
  state: SkillState;
  tick(dt: number, wind: WindState, tiles: TileStatus[][], flowField: IFlowField): void;
}
