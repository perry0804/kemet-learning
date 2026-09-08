'use client';
import { useEffect, useRef, useState } from 'react';
import type * as Three from 'three';
import { RotateCcw, Plus, Minus, Maximize2, Move3D } from 'lucide-react';
import {
  ZONES,
  GODS,
  COLORS,
  FACTION_COLORS,
  zone,
  type Game,
  type MoveOption,
  tile,
} from '@/lib/game';
import mapData from '../data/map.json';
const W = 16,
  H = 14.6;
const point = (id: string) => {
  const z = zone(id);
  return [(z.x - 0.5) * W, (z.y - 0.5) * H] as const;
};
export default function TabletopScene({
  game,
  selected,
  targets,
  onZone,
  focus = 0,
}: {
  game: Game;
  selected: string | null;
  targets: MoveOption[];
  onZone: (id: string) => void;
  focus?: number;
}) {
  const host = useRef<HTMLDivElement>(null),
    props = useRef({ game, selected, targets, onZone }),
    api = useRef<{
      update: () => void;
      reset: () => void;
      top: () => void;
      zoom: (n: number) => void;
    } | null>(null),
    [error, setError] = useState(false),
    [loaded, setLoaded] = useState(false),
    [hover, setHover] = useState<{ name: string; x: number; y: number } | null>(
      null,
    );
  props.current = { game, selected, targets, onZone };
  useEffect(() => {
    let gone = false,
      dispose = () => {};
    async function init() {
      try {
        const T = await import('three'),
          { OrbitControls } =
            await import('three/addons/controls/OrbitControls.js');
        if (gone || !host.current) return;
        const container = host.current,
          scene = new T.Scene(),
          camera = new T.PerspectiveCamera(37, 1, 0.1, 100);
        camera.position.set(10, 18, 18);
        const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = T.PCFSoftShadowMap;
        renderer.setClearColor(0, 0);
        renderer.domElement.tabIndex = 0;
        renderer.domElement.setAttribute(
          'aria-label',
          '圣域实体地图沙盘，拖动旋转，点击棋子和目标地区',
        );
        container.appendChild(renderer.domElement);
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enablePan = true;
        controls.target.set(0, 0, 0);
        controls.minDistance = 12;
        controls.maxDistance = 33;
        controls.minPolarAngle = 0.15;
        controls.maxPolarAngle = 1.3;
        controls.update();
        scene.add(new T.HemisphereLight(0xfff4dc, 0x597477, 2.8));
        const light = new T.DirectionalLight(0xfff6df, 3);
        light.position.set(-6, 18, 8);
        light.castShadow = true;
        light.shadow.mapSize.set(1024, 1024);
        Object.assign(light.shadow.camera, {
          left: -12,
          right: 12,
          top: 12,
          bottom: -12,
          near: 0.1,
          far: 40,
        });
        light.shadow.bias = -0.001;
        scene.add(light);
        const geo = new T.BoxGeometry(W + 0.16, 0.32, H + 0.16),
          mat = new T.MeshStandardMaterial({ color: 0xb7a078, roughness: 0.9 }),
          slab = new T.Mesh(geo, mat);
        slab.position.y = -0.2;
        slab.castShadow = true;
        slab.receiveShadow = true;
        scene.add(slab);
        const ground = new T.Mesh(
          new T.PlaneGeometry(60, 60),
          new T.ShadowMaterial({ opacity: 0.13 }),
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.37;
        ground.receiveShadow = true;
        scene.add(ground);
        const tx = await new T.TextureLoader().loadAsync(
          '/assets/board-photo.png',
        );
        if (gone) {
          tx.dispose();
          renderer.dispose();
          return;
        }
        tx.colorSpace = T.SRGBColorSpace;
        tx.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        const h = mapData.homography,
          hom = new T.Matrix3();
        hom.set(
          h[0][0] / mapData.imageWidth,
          h[0][1] / mapData.imageWidth,
          h[0][2] / mapData.imageWidth,
          h[1][0] / mapData.imageHeight,
          h[1][1] / mapData.imageHeight,
          h[1][2] / mapData.imageHeight,
          h[2][0],
          h[2][1],
          h[2][2],
        );
        const printed = new T.Mesh(
          new T.PlaneGeometry(W, H),
          new T.ShaderMaterial({
            uniforms: { picture: { value: tx }, projective: { value: hom } },
            vertexShader:
              'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
            fragmentShader:
              'uniform sampler2D picture;uniform mat3 projective;varying vec2 vUv;void main(){vec3 p=projective*vec3(vUv.x,1.0-vUv.y,1.0);vec2 uv=p.xy/p.z;gl_FragColor=texture2D(picture,vec2(uv.x,1.0-uv.y));\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}',
          }),
        );
        printed.rotation.x = -Math.PI / 2;
        printed.position.y = -0.026;
        scene.add(printed);
        const shadowLayer = new T.Mesh(
          new T.PlaneGeometry(W, H),
          new T.ShadowMaterial({ opacity: 0.22 }),
        );
        shadowLayer.rotation.x = -Math.PI / 2;
        shadowLayer.position.y = 0.008;
        shadowLayer.receiveShadow = true;
        scene.add(shadowLayer);
        const pieces = new T.Group();
        scene.add(pieces);
        let hitObjects: Three.Object3D[] = [];
        let textures: Three.Texture[] = [];
        const clearPieces = () => {
          pieces.traverse((o) => {
            const mesh = o as Three.Mesh;
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) {
              (Array.isArray(mesh.material)
                ? mesh.material
                : [mesh.material]
              ).forEach((m) => m.dispose());
            }
          });
          textures.forEach((t) => t.dispose());
          textures = [];
          pieces.clear();
          hitObjects = [];
        };
        function add(
          g: Three.BufferGeometry,
          color: string | number,
          x: number,
          y: number,
          z: number,
          id: string,
        ) {
          const m = new T.Mesh(
            g,
            new T.MeshStandardMaterial({
              color,
              roughness: 0.55,
              metalness: 0.14,
            }),
          );
          m.position.set(x, y, z);
          m.castShadow = true;
          m.receiveShadow = true;
          m.userData.zone = id;
          pieces.add(m);
          hitObjects.push(m);
          return m;
        }
        function label(
          text: string,
          x: number,
          y: number,
          z: number,
          bg: string,
        ) {
          const canvas = document.createElement('canvas');
          canvas.width = 160;
          canvas.height = 72;
          const c = canvas.getContext('2d')!;
          c.fillStyle = bg;
          c.beginPath();
          c.roundRect(2, 2, 156, 68, 19);
          c.fill();
          c.strokeStyle = '#f8edca';
          c.lineWidth = 3;
          c.stroke();
          c.fillStyle = '#fff7e1';
          c.font = 'bold 37px sans-serif';
          c.textAlign = 'center';
          c.textBaseline = 'middle';
          c.fillText(text, 80, 37);
          const texture = new T.CanvasTexture(canvas);
          texture.colorSpace = T.SRGBColorSpace;
          textures.push(texture);
          const sprite = new T.Sprite(
            new T.SpriteMaterial({ map: texture, depthTest: false }),
          );
          sprite.position.set(x, y, z);
          sprite.scale.set(0.86, 0.39, 1);
          sprite.renderOrder = 10;
          pieces.add(sprite);
        }
        function ring(id: string, color: number, radius: number, opacity = 1) {
          const [x, z] = point(id);
          const m = new T.Mesh(
            new T.RingGeometry(radius, radius + 0.045, 48),
            new T.MeshBasicMaterial({
              color,
              transparent: true,
              opacity,
              side: T.DoubleSide,
              depthWrite: false,
            }),
          );
          m.rotation.x = -Math.PI / 2;
          m.position.set(x, 0.03, z);
          pieces.add(m);
        }
        function update() {
          clearPieces();
          const { game: s, selected, targets } = props.current;
          for (const z of ZONES) {
            const [x, zz] = point(z.id);
            const m = new T.Mesh(
              new T.CircleGeometry(z.type === 'district' ? 0.64 : 0.6, 16),
              new T.MeshBasicMaterial({
                transparent: true,
                opacity: 0.001,
                depthWrite: false,
                side: T.DoubleSide,
              }),
            );
            m.rotation.x = -Math.PI / 2;
            m.position.set(x, 0.04, zz);
            m.userData.zone = z.id;
            pieces.add(m);
            hitObjects.push(m);
          }
          for (const p of s.players) {
            for (const py of p.pyramids) {
              if (!py.level) continue;
              const [x, z] = point(py.zone);
              for (let l = 0; l < py.level; l++) {
                const width = 0.69 - l * 0.12;
                add(
                  new T.BoxGeometry(width, 0.16, width),
                  '#ded0ac',
                  x - 0.32,
                  0.1 + l * 0.16,
                  z - 0.28,
                  py.zone,
                );
              }
              const gem = new T.Mesh(
                new T.OctahedronGeometry(0.13),
                new T.MeshStandardMaterial({
                  color: {
                    红: '#be4c36',
                    蓝: '#328ab8',
                    白: '#f0e9d2',
                    黑: '#233c38',
                    琥珀: '#d79833',
                  }[py.color!],
                  metalness: 0.3,
                  roughness: 0.35,
                }),
              );
              gem.position.set(x - 0.32, 0.2 + py.level * 0.16, z - 0.28);
              gem.userData.zone = py.zone;
              pieces.add(gem);
              hitObjects.push(gem);
            }
          }
          for (const a of s.armies) {
            const [x, z] = point(a.zone),
              p = s.players[a.owner],
              color = FACTION_COLORS[p.god],
              other = s.armies.some((b) => b.id !== a.id && b.zone === a.zone);
            const xx =
              x +
              (other
                ? a.owner === s.pending?.attackerOwner
                  ? -0.32
                  : 0.35
                : 0.16);
            const zz = z + 0.17;
            if (a.kind === 'god') {
              add(
                new T.CylinderGeometry(0.25, 0.32, 0.17, 24),
                color,
                xx,
                0.15,
                zz,
                a.zone,
              );
              add(
                new T.ConeGeometry(0.22, 0.63, 8),
                color,
                xx,
                0.5,
                zz,
                a.zone,
              );
              add(
                new T.SphereGeometry(0.16, 12, 8),
                '#dfc38a',
                xx,
                0.91,
                zz,
                a.zone,
              );
              const halo = add(
                new T.TorusGeometry(0.24, 0.034, 7, 28),
                '#d7ae5d',
                xx,
                1.03,
                zz,
                a.zone,
              );
              halo.rotation.x = 0.2;
              label(`神 ${a.n}`, xx, 1.5, zz, color);
            } else {
              for (let n = 0; n < a.n; n++) {
                const dx = ((n % 3) - 1) * 0.21,
                  dz = Math.floor(n / 3) * 0.24;
                add(
                  new T.CylinderGeometry(0.075, 0.12, 0.11, 12),
                  color,
                  xx + dx,
                  0.095,
                  zz + dz,
                  a.zone,
                );
                add(
                  new T.ConeGeometry(0.083, 0.24, 10),
                  color,
                  xx + dx,
                  0.26,
                  zz + dz,
                  a.zone,
                );
                add(
                  new T.SphereGeometry(0.065, 10, 8),
                  '#d5b77e',
                  xx + dx,
                  0.415,
                  zz + dz,
                  a.zone,
                );
              }
              label(String(a.n), xx, 0.96, zz + 0.08, color);
            }
            if (a.creature) {
              add(
                new T.CylinderGeometry(0.19, 0.2, 0.14, 16),
                '#c7b383',
                xx + 0.53,
                0.17,
                zz,
                a.zone,
              );
              add(
                new T.DodecahedronGeometry(0.19),
                '#8e8766',
                xx + 0.53,
                0.4,
                zz,
                a.zone,
              );
              label('兽', xx + 0.53, 0.83, zz, '#726447');
            }
            if (a.servants.length)
              add(
                new T.OctahedronGeometry(0.16),
                '#e2aa48',
                xx - 0.55,
                0.28,
                zz,
                a.zone,
              );
          }
          targets.forEach((t) => ring(t.target, 0x6fe1b7, 0.58, 0.92));
          if (selected) ring(selected, 0xffd070, 0.7);
          renderer.render(scene, camera);
        }
        function render() {
          renderer.render(scene, camera);
        }
        const resize = new ResizeObserver(() => {
          const w = container.clientWidth,
            h = container.clientHeight;
          renderer.setSize(w, h);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          render();
        });
        resize.observe(container);
        controls.addEventListener('change', render);
        const ray = new T.Raycaster(),
          pointer = new T.Vector2();
        let down = { x: 0, y: 0 };
        const intersect = (e: PointerEvent) => {
          const b = renderer.domElement.getBoundingClientRect();
          pointer.set(
            ((e.clientX - b.left) / b.width) * 2 - 1,
            (-(e.clientY - b.top) / b.height) * 2 + 1,
          );
          ray.setFromCamera(pointer, camera);
          return ray
            .intersectObjects(hitObjects, false)
            .find((h) => h.object.userData.zone)?.object.userData.zone as
            | string
            | undefined;
        };
        const start = (e: PointerEvent) => {
          down = { x: e.clientX, y: e.clientY };
        };
        const click = (e: PointerEvent) => {
          if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 7) return;
          const id = intersect(e);
          if (id) props.current.onZone(id);
        };
        const hover = (e: PointerEvent) => {
          if (e.buttons) {
            setHover(null);
            return;
          }
          const id = intersect(e),
            b = container.getBoundingClientRect();
          setHover(
            id
              ? {
                  name: zone(id).name,
                  x: Math.min(e.clientX - b.left + 12, b.width - 170),
                  y: e.clientY - b.top - 35,
                }
              : null,
          );
        };
        const leave = () => setHover(null);
        renderer.domElement.addEventListener('pointerdown', start);
        renderer.domElement.addEventListener('pointerup', click);
        renderer.domElement.addEventListener('pointermove', hover);
        renderer.domElement.addEventListener('pointerleave', leave);
        api.current = {
          update,
          reset: () => {
            camera.position.set(10, 18, 18);
            controls.target.set(0, 0, 0);
            controls.update();
            render();
          },
          top: () => {
            camera.position.set(0, 24, 0.5);
            controls.target.set(0, 0, 0);
            controls.update();
            render();
          },
          zoom: (n) => {
            camera.position.multiplyScalar(n);
            controls.update();
            render();
          },
        };
        update();
        setLoaded(true);
        dispose = () => {
          resize.disconnect();
          controls.dispose();
          renderer.domElement.removeEventListener('pointerdown', start);
          renderer.domElement.removeEventListener('pointerup', click);
          renderer.domElement.removeEventListener('pointermove', hover);
          renderer.domElement.removeEventListener('pointerleave', leave);
          clearPieces();
          scene.traverse((o) => {
            const m = o as Three.Mesh;
            if (m.geometry) m.geometry.dispose();
            if (m.material)
              (Array.isArray(m.material) ? m.material : [m.material]).forEach(
                (m) => m.dispose(),
              );
          });
          tx.dispose();
          renderer.dispose();
          renderer.domElement.remove();
          api.current = null;
        };
      } catch {
        if (!gone) setError(true);
      }
    }
    void init();
    return () => {
      gone = true;
      dispose();
    };
  }, []);
  useEffect(() => {
    api.current?.update();
  }, [game, selected, targets]);
  useEffect(() => {
    api.current?.reset();
  }, [focus]);
  return (
    <div className="game-scene">
      <div className="tabletop-canvas" ref={host} />
      {!loaded && !error ? (
        <div className="scene-loading">
          <Move3D />
          <span>正在布置游戏桌…</span>
        </div>
      ) : null}
      {error ? (
        <div className="board-fallback">
          <h2>当前设备使用俯视操作</h2>
          <p>可点击地区名称继续对局。</p>
          <div>
            {ZONES.map((z) => (
              <button
                key={z.id}
                className={
                  targets.some((t) => t.target === z.id) ? 'reachable' : ''
                }
                onClick={() => onZone(z.id)}
              >
                {z.name}
                {game.armies
                  .filter((a) => a.zone === z.id)
                  .map((a) => ` · ${a.n}兵`)}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {hover ? (
        <span className="scene-hover" style={{ left: hover.x, top: hover.y }}>
          {hover.name}
        </span>
      ) : null}
      <div className="table-view-controls">
        <button onClick={() => api.current?.zoom(0.85)} aria-label="放大">
          <Plus size={17} />
        </button>
        <button onClick={() => api.current?.zoom(1.15)} aria-label="缩小">
          <Minus size={17} />
        </button>
        <button onClick={() => api.current?.top()} title="俯视">
          <Maximize2 size={17} />
        </button>
        <button onClick={() => api.current?.reset()} title="恢复视角">
          <RotateCcw size={17} />
        </button>
      </div>
      <p className="table-instruction">
        拖动旋转 · 滚轮缩放 · 点棋子选中，再选择行动
      </p>
    </div>
  );
}
