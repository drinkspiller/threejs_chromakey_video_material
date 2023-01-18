import {GUI} from 'dat.gui';
import {fromEvent} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import videoFile from 'url:../assets/mixkit-a-woman-talking-on-the-phone-on-a-green-screen-24388-medium.mp4';
import imageFile from 'url:../assets/mixkit-a-woman-talking-on-the-phone-on-a-green-screen-24388-medium.png';

import ChromaKeyMaterial from '../js/ChromaKeyMaterial';


export class App {
  private ambientLight: THREE.AmbientLight =
    new THREE.AmbientLight(0xffffff, .3);
  private camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera();
  private plane!: THREE.Mesh;
  private directionalLight = new THREE.DirectionalLight();
  private gui!: GUI;
  private renderer: THREE.WebGLRenderer =
    new THREE.WebGLRenderer({antialias: true, alpha: true});
  private orbitControls: OrbitControls = new OrbitControls(
      this.camera,
      this.renderer.domElement,
  );
  private queryString = new URLSearchParams(window.location.search);
  private scene: THREE.Scene = new THREE.Scene();
  // @ts-ignore Used to avoid lint error "Only a void function can be called
  // with the 'new' keyword." since the types bundled with package specify it
  // returns type `Stats` instead of `void`.
  private stats: Stats = new Stats();
  private static _singleton: App = new App();

  static get app() {
    return this._singleton;
  }

  private animate() {
    this.render();
    this.stats.update();

    requestAnimationFrame(() => this.animate());
  }

  configureCamera() {
    this.camera.fov = 75;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.near = 0.1;
    this.camera.far = 1000;
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 0.67;

    this.camera.rotation.x = 0;
    this.camera.rotation.y = 0;
    this.camera.rotation.z = 0;

    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.camera.updateProjectionMatrix();

    const cameraPositionFolder = this.gui.addFolder('Camera Position');
    cameraPositionFolder.add(this.camera.position, 'x', -1, 1, 0.01).listen();
    cameraPositionFolder.add(this.camera.position, 'y', -1, 1, 0.01).listen();
    cameraPositionFolder.add(this.camera.position, 'z', -1, 1, 0.01).listen();
    cameraPositionFolder.open();

    const cameraRotationFolder = this.gui.addFolder('Camera Rotation');
    cameraRotationFolder.add(this.camera.rotation, 'x', -50, 50, 0.01).listen();
    cameraRotationFolder.add(this.camera.rotation, 'y', -50, 50, 0.01).listen();
    cameraRotationFolder.add(this.camera.rotation, 'z', -50, 50, 0.01).listen();
    cameraRotationFolder.open();
  }

  configureDev() {
    this.gui = new GUI();
    document.body.appendChild(this.stats.dom);

    const gridHelper = new THREE.GridHelper(5, undefined, 'yellow', 'gray');
    // this.scene.add(gridHelper);

    const orbitControlsFolder = this.gui.addFolder('Orbit Controls');
    const orbitControlOptions = {
      enabled: true,
    };
    this.orbitControls.enabled = orbitControlOptions.enabled;
    orbitControlsFolder.add(orbitControlOptions, 'enabled')
        .onChange((isEnabled) => {
          this.orbitControls.enabled = isEnabled;
        });
    orbitControlsFolder.open();

    const functionsObject = {
      playVideo: () => {
        (this.plane.material as ChromaKeyMaterial).playVideo();
      },
      pauseVideo: () => {
        (this.plane.material as ChromaKeyMaterial).pauseVideo();
      },
    };
    const functionsFolder = this.gui.addFolder('Functions');
    functionsFolder.add(functionsObject, 'playVideo');
    functionsFolder.add(functionsObject, 'pauseVideo');
    functionsFolder.open();
  }

  configureEventListeners() {
    fromEvent(window, 'resize')
        .pipe(debounceTime(75))
        .subscribe(() => this.updateResizedWindow());
  }

  configureLights() {
    this.directionalLight.color = new THREE.Color(0xffffff);
    this.directionalLight.intensity = 1;
    this.directionalLight.position.set(2, 2, 2);

    this.scene.add(this.directionalLight, this.ambientLight);

    const directionalLightHelper = new THREE.DirectionalLightHelper(
        this.directionalLight,
        1,
    );
    // this.scene.add(directionalLightHelper);

    const directionalLightFolder = this.gui.addFolder('Directional Light');
    directionalLightFolder.add(this.directionalLight.position, 'x', 0, 50, 0.01)
        .listen();
    directionalLightFolder.add(this.directionalLight.position, 'y', 0, 50, 0.01)
        .listen();
    directionalLightFolder.add(this.directionalLight.position, 'z', 0, 50, 0.01)
        .listen();
    directionalLightFolder.add(this.directionalLight, 'intensity', 0, 5, 0.01)
        .listen();
    directionalLightFolder.open();
  }

  configureMesh() {
    const heightAspectRatio = 9 / 16;
    const geometry: THREE.BufferGeometry =
        new THREE.PlaneGeometry(1, heightAspectRatio);

    // Use `imageFile` instead of `videoFile` to key a static image instead of a
    // video.
    const greenScreenMaterial = new ChromaKeyMaterial(
        videoFile, 0x19ae31, 1920, 1080, 0.159, 0.082, 0.214);
    this.plane = new THREE.Mesh(geometry, greenScreenMaterial);
    this.plane.position.y = -.2;
    this.scene.add(this.plane);

    const wireframe = new THREE.WireframeGeometry(geometry);
    const line = new THREE.LineSegments(
        wireframe, new THREE.LineBasicMaterial({color: 0xff0000}));
    this.plane.add(line);

    const chromakeyMaterialFolder = this.gui.addFolder('Chroma Key');
    chromakeyMaterialFolder
        .add(greenScreenMaterial.uniforms.similarity, 'value', 0, 1, .001)
        .name('Similarity');
    chromakeyMaterialFolder
        .add(greenScreenMaterial.uniforms.smoothness, 'value', 0, 1, .001)
        .name('Smoothness');
    chromakeyMaterialFolder
        .add(greenScreenMaterial.uniforms.spill, 'value', 0, 1, .001)
        .name('Spill');
    chromakeyMaterialFolder.open();
  }

  configureRenderer() {
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
  }

  init() {
    this.configureDev();
    this.configureCamera();
    this.configureMesh();
    this.configureLights();
    this.configureRenderer();
    this.configureEventListeners();

    this.animate();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  updateResizedWindow() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.render();
  }
}
