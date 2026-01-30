
import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { Rotate3d, ZoomIn, Sparkles, X, Heart, Clock, User, ArrowDown, ZoomOut } from 'lucide-react';
import { playSound } from '../services/audioService';
import { Wish } from '../types';

const WISH_POOL = [
  "Chúc mừng năm mới Bính Ngọ! Chúc bạn vạn sự như ý, tỉ sự như mơ, triệu triệu bất ngờ, không chờ cũng tới!",
  "Mã đáo thành công! Năm mới chúc bạn sức khỏe dồi dào, công danh rạng rỡ, tiền vào như nước, tiền ra nhỏ giọt.",
  "Xuân vạn phúc, lộc đầy nhà! Chúc gia đình bạn luôn sum vầy, ấm áp, tiếng cười rộn rã khắp gian nhà.",
  "Học hành tấn tới, thi cử đỗ cao! Chúc các bạn sĩ tử một năm Bính Ngọ vượt vũ môn hóa rồng thành công rực rỡ.",
  "An khang thịnh vượng, vạn sự cát tường! Chúc bạn luôn giữ vững niềm tin, vượt qua mọi thử thách.",
  "Tân xuân như ý, vạn phúc tựa vân lai! Chúc bạn một năm mới rực rỡ và tràn đầy năng lượng tích cực.",
  "Phát tài phát lộc, tiền vô xồng xộc, tiền ra từ từ! Sức khỏe có dư, công danh tấn tới.",
  "Chúc bạn năm mới 2026: Đau đầu vì giàu, mệt mỏi vì học giỏi, buồn phiền vì nhiều tiền!",
  "Cung chúc tân xuân phước vĩnh cửu - Chúc trong gia quyến được an khương.",
  "Năm Bính Ngọ, chúc bạn phi nước đại tới thành công, mọi dự định đều cán đích rực rỡ!",
  "Xuân sang hy vọng, ấm áp tình thân. Chúc bạn luôn nở nụ cười tươi tắn như hoa mai đầu ngõ.",
  "Vạn sự hanh thông, triệu điều may mắn. Chúc bạn hái được nhiều lộc lá trong năm mới này."
];

const MIN_DIST_BETWEEN_ENVELOPES = 3.5; 
const INITIAL_ENVELOPES_COUNT = 16;

const LuckyMoneySection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [activeWish, setActiveWish] = useState<Wish | null>(null);
  const [hoveredEnvId, setHoveredEnvId] = useState<string | null>(null);
  
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const treeGroupRef = useRef<THREE.Group | null>(null);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const envelopesMap = useRef<Map<string, THREE.Group>>(new Map());
  const branchSlots = useRef<{ pos: THREE.Vector3, depth: number }[]>([]);

  const isDragging = useRef(false);
  const pulledEnvelopeId = useRef<string | null>(null);
  const pullStartY = useRef(0);
  const currentPullOffset = useRef(0);
  const previousMouse = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0.1, y: 0 });
  const currentRotation = useRef({ x: 0.1, y: 0 });
  
  const zoom = useRef(35);
  const targetZoom = useRef(35);

  const createFlowerCluster = (pos: THREE.Vector3) => {
    const cluster = new THREE.Group();
    const count = 3 + Math.floor(Math.random() * 4);
    const colors = [0xff69b4, 0xffc0cb, 0xff1493];
    
    for (let i = 0; i < count; i++) {
      const size = 0.08 + Math.random() * 0.15;
      const geom = new THREE.SphereGeometry(size, 6, 6);
      const color = colors[Math.floor(Math.random() * colors.length)];
      const mat = new THREE.MeshStandardMaterial({ 
        color, 
        emissive: color, 
        emissiveIntensity: 0.2,
        roughness: 0.9
      });
      const flower = new THREE.Mesh(geom, mat);
      flower.position.set((Math.random()-0.5)*0.4, (Math.random()-0.5)*0.4, (Math.random()-0.5)*0.4);
      cluster.add(flower);
    }
    cluster.position.copy(pos);
    return cluster;
  };

  const createEnvelopeMesh = (wish: Wish) => {
    const group = new THREE.Group();
    group.name = wish.id;

    const randScale = 0.8 + Math.random() * 0.4;
    const stringLen = 1.0 + Math.random() * 1.5;
    
    const stringGeom = new THREE.CylinderGeometry(0.01, 0.01, stringLen, 6);
    const stringMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, metalness: 0.8, roughness: 0.2 });
    const string = new THREE.Mesh(stringGeom, stringMat);
    string.position.y = -stringLen / 2;
    group.add(string);

    const bodyGeom = new THREE.BoxGeometry(0.7 * randScale, 1.2 * randScale, 0.08);
    const bodyMat = new THREE.MeshStandardMaterial({ 
      color: 0xef4444, 
      emissive: 0x660000,
      emissiveIntensity: 0.1,
      roughness: 0.6 
    });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.y = -stringLen - (0.6 * randScale);
    body.rotation.z = (Math.random() - 0.5) * 0.15;
    group.add(body);

    const borderGeom = new THREE.BoxGeometry(0.76 * randScale, 1.26 * randScale, 0.06);
    const borderMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, metalness: 0.9, roughness: 0.1 });
    const border = new THREE.Mesh(borderGeom, borderMat);
    border.position.copy(body.position);
    border.rotation.copy(body.rotation);
    border.position.z = -0.01;
    group.add(border);

    const hitboxGeom = new THREE.BoxGeometry(1.5 * randScale, 3.5 * randScale, 1.0);
    const hitbox = new THREE.Mesh(hitboxGeom, new THREE.MeshBasicMaterial({ visible: false }));
    hitbox.position.y = body.position.y + 0.3;
    hitbox.userData = { isEnvelope: true, wishId: wish.id };
    group.add(hitbox);

    const glowGeom = new THREE.BoxGeometry(0.8 * randScale, 1.3 * randScale, 0.1);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0 });
    const glow = new THREE.Mesh(glowGeom, glowMat);
    glow.position.copy(body.position);
    glow.rotation.copy(body.rotation);
    glow.name = 'glow';
    group.add(glow);

    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 70px "Dancing Script", cursive';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText("Lộc", 64, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);
    const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }));
    label.scale.set(1.1 * randScale, 1.1 * randScale, 1);
    label.position.set(0, body.position.y, 0.06);
    group.add(label);

    group.userData = { 
        originalY: 0, 
        phase: Math.random() * Math.PI * 2,
        swingSpeed: 0.6 + Math.random() * 0.8
    };

    return group;
  };

  const spawnNewWish = useCallback((existingWishes: Wish[]) => {
    const candidates = branchSlots.current
      .map((_, i) => i)
      .sort(() => Math.random() - 0.5);

    let bestSlotIdx = -1;
    for (const idx of candidates) {
      const pos = branchSlots.current[idx].pos;
      let isTooCluttered = false;
      
      for (const w of existingWishes) {
        const otherPos = branchSlots.current[w.posIndex].pos;
        if (pos.distanceTo(otherPos) < MIN_DIST_BETWEEN_ENVELOPES) {
          isTooCluttered = true;
          break;
        }
      }
      
      if (!isTooCluttered) {
        bestSlotIdx = idx;
        break;
      }
    }
    
    if (bestSlotIdx === -1) {
        const unused = candidates.filter(i => !existingWishes.some(w => w.posIndex === i));
        bestSlotIdx = unused.length > 0 ? unused[0] : candidates[0];
    }
    
    const randomText = WISH_POOL[Math.floor(Math.random() * WISH_POOL.length)];
    return {
      id: `wish-${Math.random().toString(36).substr(2, 9)}`,
      text: randomText,
      sender: 'Ông Đồ AI',
      envelopeId: `env-${Math.random()}`,
      timestamp: Date.now(),
      posIndex: bestSlotIdx,
      ownerId: 'system'
    } as Wish;
  }, []);

  const initScene = useCallback(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    // Camera căn giữa tầm nhìn cây
    camera.position.set(0, 1.5, zoom.current);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const pointLight = new THREE.PointLight(0xfff4d6, 5, 120);
    pointLight.position.set(10, 20, 20);
    scene.add(pointLight);

    const treeGroup = new THREE.Group();
    // Vị trí y của cây để tán trên nằm đúng chính giữa
    treeGroup.position.y = -7.5;
    treeGroupRef.current = treeGroup;
    scene.add(treeGroup);

    const build = (parent: THREE.Group, len: number, rad: number, depth: number) => {
      if (depth > 5) return;
      const branch = new THREE.Group();
      const geom = new THREE.CylinderGeometry(rad * 0.7, rad, len, 8);
      const mat = new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.98 });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.y = len / 2;
      branch.add(mesh);

      if (depth >= 1) {
        for (let i = 0; i < depth + 2; i++) {
          branch.add(createFlowerCluster(new THREE.Vector3((Math.random()-0.5)*1.5, Math.random()*len, (Math.random()-0.5)*1.5)));
        }
      }

      // CHỈ lấy các tán lá trên cùng (depth 4 và 5) để treo lộc
      if (depth >= 4) {
        const worldPos = new THREE.Vector3();
        branch.getWorldPosition(worldPos);
        const offset = new THREE.Vector3(
          (Math.random()-0.5)*4.5, 
          Math.random()*2, // Treo ở ngọn cành
          (Math.random()-0.5)*4.5
        );
        branchSlots.current.push({ pos: worldPos.add(offset), depth });
      }

      if (depth < 5) {
        const count = depth === 0 ? 5 : 2;
        for (let i = 0; i < count; i++) {
          const sub = build(branch, len * 0.8, rad * 0.7, depth + 1);
          if (sub) {
            sub.position.y = len * 0.95;
            sub.rotation.z = (Math.random() - 0.5) * 1.8;
            sub.rotation.y = (Math.PI * 2 / count) * i;
            branch.add(sub);
          }
        }
      }
      parent.add(branch);
      return branch;
    };

    build(treeGroup, 8.0, 0.9, 0);

    const initialWishes: Wish[] = [];
    for (let i = 0; i < INITIAL_ENVELOPES_COUNT; i++) {
        const w = spawnNewWish(initialWishes);
        if (w) initialWishes.push(w);
    }
    setWishes(initialWishes);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = performance.now() * 0.001;

      currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.06;
      currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * 0.06;
      zoom.current += (targetZoom.current - zoom.current) * 0.08;
      
      if (treeGroupRef.current) {
        treeGroupRef.current.rotation.y = currentRotation.current.y;
        treeGroupRef.current.rotation.x = currentRotation.current.x;
      }
      
      if (cameraRef.current) {
        cameraRef.current.position.z = zoom.current;
      }

      envelopesMap.current.forEach((mesh, id) => {
        if (id !== pulledEnvelopeId.current) {
          const { phase, swingSpeed } = mesh.userData;
          mesh.rotation.z = Math.sin(time * swingSpeed + phase) * 0.22;
          mesh.rotation.x = Math.cos(time * swingSpeed * 0.7 + phase) * 0.12;
          mesh.position.y = mesh.userData.originalY;
        } else {
          mesh.position.y = mesh.userData.originalY - currentPullOffset.current;
          mesh.rotation.z *= 0.6;
          mesh.rotation.x *= 0.6;
        }

        const glow = mesh.getObjectByName('glow') as THREE.Mesh;
        if (id === hoveredEnvIdRef.current) {
          mesh.scale.lerp(new THREE.Vector3(1.15, 1.15, 1.15), 0.2);
          if (glow && glow.material instanceof THREE.MeshBasicMaterial) glow.material.opacity = 0.6;
        } else {
          mesh.scale.lerp(new THREE.Vector3(1, 1, 1), 0.2);
          if (glow && glow.material instanceof THREE.MeshBasicMaterial) glow.material.opacity = 0;
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    const el = renderer.domElement;

    const onMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const rect = el.getBoundingClientRect();
      mouse.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      if (pulledEnvelopeId.current) {
        const deltaY = clientY - pullStartY.current;
        if (deltaY > 0) {
            currentPullOffset.current = Math.min(8, deltaY * 0.06);
        }
      } else if (isDragging.current) {
        targetRotation.current.y += (clientX - previousMouse.current.x) * 0.008;
        targetRotation.current.x = Math.max(-0.4, Math.min(0.4, targetRotation.current.x + (clientY - previousMouse.current.y) * 0.008));
        previousMouse.current = { x: clientX, y: clientY };
      }

      raycaster.current.setFromCamera(mouse.current, cameraRef.current!);
      const intersects = raycaster.current.intersectObjects(scene.children, true);
      const env = intersects.find(i => i.object.userData.isEnvelope);
      setHoveredEnvId(env ? env.object.userData.wishId : null);
      el.style.cursor = env ? 'pointer' : (isDragging.current ? 'grabbing' : 'grab');
    };

    const onDown = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      raycaster.current.setFromCamera(mouse.current, cameraRef.current!);
      const intersects = raycaster.current.intersectObjects(scene.children, true);
      const env = intersects.find(i => i.object.userData.isEnvelope);

      if (env) {
        pulledEnvelopeId.current = env.object.userData.wishId;
        pullStartY.current = clientY;
        currentPullOffset.current = 0;
        playSound('click');
      } else {
        isDragging.current = true;
        previousMouse.current = { x: clientX, y: clientY };
      }
    };

    const onUp = () => {
      if (pulledEnvelopeId.current) {
        if (currentPullOffset.current > 2.5) {
            const wish = wishesRef.current.find(w => w.id === pulledEnvelopeId.current);
            if (wish) {
                setActiveWish(wish);
                playSound('victory');
            }
        }
        pulledEnvelopeId.current = null;
        currentPullOffset.current = 0;
      }
      isDragging.current = false;
    };

    const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        targetZoom.current = Math.max(15, Math.min(65, targetZoom.current + e.deltaY * 0.035));
    };

    el.addEventListener('mousedown', onDown);
    el.addEventListener('touchstart', onDown);
    el.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);

    return () => {
      renderer.dispose();
      el.removeEventListener('mousedown', onDown);
      el.removeEventListener('touchstart', onDown);
      el.removeEventListener('wheel', onWheel);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
    };
  }, []);

  const wishesRef = useRef<Wish[]>([]);
  const hoveredEnvIdRef = useRef<string | null>(null);
  useEffect(() => { wishesRef.current = wishes; }, [wishes]);
  useEffect(() => { hoveredEnvIdRef.current = hoveredEnvId; }, [hoveredEnvId]);

  useEffect(() => { initScene(); }, [initScene]);

  useEffect(() => {
    if (!treeGroupRef.current || branchSlots.current.length === 0) return;
    
    envelopesMap.current.forEach((mesh, id) => {
      if (!wishes.find(w => w.id === id)) {
        treeGroupRef.current?.remove(mesh);
        envelopesMap.current.delete(id);
      }
    });

    wishes.forEach(wish => {
      if (!envelopesMap.current.has(wish.id)) {
        const mesh = createEnvelopeMesh(wish);
        const slot = branchSlots.current[wish.posIndex % branchSlots.current.length];
        const localPos = treeGroupRef.current!.worldToLocal(slot.pos.clone());
        
        mesh.position.copy(localPos);
        mesh.userData.originalY = mesh.position.y;
        
        treeGroupRef.current!.add(mesh);
        envelopesMap.current.set(wish.id, mesh);
      }
    });
  }, [wishes]);

  const handleCollectLộc = () => {
    if (!activeWish) return;
    const currentId = activeWish.id;
    setActiveWish(null);
    
    setWishes(prev => {
        const filtered = prev.filter(w => w.id !== currentId);
        const next = spawnNewWish(filtered);
        return next ? [...filtered, next] : filtered;
    });
    playSound('rustle');
  };

  return (
    <div className="w-full h-screen relative bg-gradient-to-b from-[#4a0404] to-[#0a0000] overflow-hidden selection:bg-none">
      <div ref={containerRef} className="w-full h-full" />

      {/* Ánh sáng điểm căn giữa cây đào */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_45%,rgba(234,179,8,0.2)_0%,transparent_85%)]" />

      <div className="absolute top-24 left-10 z-20 pointer-events-none space-y-4">
        <div className="space-y-1">
          <h2 className="text-5xl lg:text-[5rem] font-cursive text-yellow-400 drop-shadow-[0_8px_40px_rgba(0,0,0,0.9)] animate-title-float">Hái Lộc Ngọn Đào</h2>
          <p className="text-red-100 opacity-80 italic text-xl ml-4 font-light">Những phong bao may mắn treo cao đón nắng xuân</p>
        </div>
        <div className="flex flex-col gap-2">
            <Badge icon={<ArrowDown size={14} className="animate-bounce text-yellow-400"/>} text="Kéo mạnh bao lì xì để hái lộc" />
            <Badge icon={<Rotate3d size={14}/>} text="Xoay cây tìm lộc giấu trên tán cao" />
            <Badge icon={<ZoomIn size={14} className="text-yellow-400"/>} text="Cuộn chuột để soi rõ lì xì" />
        </div>
      </div>

      <div className="absolute bottom-10 right-10 z-20 flex flex-col gap-3 animate-fadeIn">
        <button 
            onClick={() => { targetZoom.current = Math.max(15, targetZoom.current - 10); playSound('click'); }}
            className="p-4 bg-red-950/80 backdrop-blur-3xl rounded-full border border-yellow-500/40 text-yellow-400 hover:scale-110 active:scale-90 transition-all shadow-xl"
            title="Phóng to"
        >
            <ZoomIn size={24} />
        </button>
        <button 
            onClick={() => { targetZoom.current = Math.min(65, targetZoom.current + 10); playSound('click'); }}
            className="p-4 bg-red-950/80 backdrop-blur-3xl rounded-full border border-yellow-500/40 text-yellow-400 hover:scale-110 active:scale-90 transition-all shadow-xl"
            title="Thu nhỏ"
        >
            <ZoomOut size={24} />
        </button>
      </div>

      {activeWish && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fadeIn" onClick={() => setActiveWish(null)}>
          <div className="bg-[#fefce8] border-[10px] border-red-800 rounded-[3rem] w-full max-w-sm p-8 shadow-[0_0_120px_rgba(234,179,8,0.5)] animate-popOut relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setActiveWish(null)} className="absolute top-6 right-6 text-red-800 hover:scale-125 transition-transform"><X size={32}/></button>
            <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-950 rounded-full flex items-center justify-center mx-auto shadow-xl border-4 border-yellow-500 transform -rotate-6">
                  <Heart className="text-yellow-400 fill-yellow-400" size={48}/>
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-cursive text-red-800">Lộc Xuân Đại Cát</h3>
                  <div className="h-1.5 w-20 bg-red-200 mx-auto rounded-full" />
                </div>
                <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100 max-h-[300px] overflow-y-auto custom-scrollbar shadow-inner">
                    <p className="text-xl lg:text-2xl text-red-950 leading-relaxed italic font-bold">"{activeWish.text}"</p>
                </div>
                <div className="text-red-800/60 font-black uppercase text-[10px] tracking-[0.2em] space-y-1">
                    <p className="flex items-center justify-center gap-2"><User size={14} className="text-red-700"/> {activeWish.sender}</p>
                    <p className="flex items-center justify-center gap-2"><Clock size={14} className="text-red-700"/> Xuân Bính Ngọ 2026</p>
                </div>
                <div className="pt-2">
                    <button onClick={handleCollectLộc} className="w-full bg-gradient-to-b from-red-700 to-red-950 text-yellow-400 py-4 rounded-[1.5rem] font-black text-xl hover:brightness-110 shadow-xl active:scale-95 transition-all border-b-6 border-red-950 uppercase">Nhận Lộc May</button>
                </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes popOut { 
          from { transform: scale(0.6) translateY(80px); opacity: 0; } 
          to { transform: scale(1) translateY(0); opacity: 1; } 
        }
        .animate-popOut { animation: popOut 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #991b1b; border-radius: 12px; }
      `}</style>
    </div>
  );
};

const Badge: React.FC<{icon: React.ReactNode, text: string}> = ({icon, text}) => (
  <div className="flex items-center gap-3 bg-red-950/70 backdrop-blur-3xl px-5 py-2.5 rounded-full text-xs font-black text-yellow-500/95 border border-yellow-500/20 shadow-xl">
    {icon} {text}
  </div>
);

export default LuckyMoneySection;
