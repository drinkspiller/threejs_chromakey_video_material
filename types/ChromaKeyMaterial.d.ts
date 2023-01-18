export {ChromaKeyMaterial as default};
declare class ChromaKeyMaterial extends THREE.ShaderMaterial {
  /**
   *
   * @param {string} url Image or video to load into material's texture
   * @param {ColorRepresentation} keyColor
   * @param {number} width
   * @param {number} height
   * @param {number} similarity
   * @param {number} smoothness
   * @param {number} spill
   */
  constructor(
      url: string, keyColor: ColorRepresentation, width: number, height: number,
      similarity?: number, smoothness?: number, spill?: number);
  url: string;
  isVideo: boolean;
  video: HTMLVideoElement;
  texture: THREE.Texture|THREE.VideoTexture;
  playVideo(): void;
  pauseVideo(): void;
}
import * as THREE from 'three';
import {ColorRepresentation} from 'three/src/utils';
// # sourceMappingURL=ChromaKeyMaterial.d.ts.map
