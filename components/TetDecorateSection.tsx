
import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { Layout, Plus, Trash2, RotateCw, Box, Sparkles, RefreshCcw, Hand, PackagePlus, MousePointer2, ChevronRight, ChevronLeft } from 'lucide-react';
import { playSound } from '../services/audioService';

interface DecoratedItem3D {
  id: string;
  type: string;
  mesh: THREE.Group;
  position: THREE.Vector3;
  rotation: number;
  scale: number;
}

const ITEMS_CONFIG = [
  { type: 'banhchung', label: 'Bánh Chưng', icon: '🍱' },
  { type: 'duahau', label: 'Dưa Hấu', icon: '🍉' },
  { type: 'mangcau', label: 'Mãng Cầu', icon: '🍐' },
  { type: 'sung', label: 'Trái Sung', icon: '🍒' },
  { type: 'dudu', label: 'Đu Đủ', icon: '🍈' },
  { type: 'xoai', label: 'Trái Xoài', icon: '🥭' },
  { type: 'binhtra', label: 'Bình Trà', icon: '🫖' },
  { type: 'vang', label: 'Thỏi Vàng', icon: '🪙' },
  { type: 'hoadao', label: 'Hoa Đào', icon: '🌸' },
  { type: 'hoamai', label: 'Hoa Mai', icon: '🌼' },
  { type: 'longden', label: 'Lồng Đèn', icon: '🏮' },
];

const TetDecorateSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [items, setItems] = useState<DecoratedItem3D[]>([]);
  const [draggingFromUI, setDraggingFromUI] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const selectionRingRef = useRef<THREE.Mesh | null>(null);
  const previewMeshRef = useRef<THREE.Group | null>(null);
  
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  
  const isDraggingInScene = useRef(false);
  const isOrbiting = useRef(false);
  const offset = useRef(new THREE.Vector3());
  const intersection = useRef(new THREE.Vector3());
  const previousMouse = useRef({ x: 0, y: 0 });
  
  const cameraOrbit = useRef({ phi: Math.PI / 3, theta: Math.PI / 4, radius: 30 });
  const targetOrbit = useRef({ phi: Math.PI / 3, theta: Math.PI / 4, radius: 30 });

  const TABLE_HEIGHT = 1.8;

  const addHitbox = (group: THREE.Group, size: [number, number, number], pos: [number, number, number] = [0, 0, 0]) => {
    const geo = new THREE.BoxGeometry(...size);
    const mat = new THREE.MeshBasicMaterial({ visible: false });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...pos);
    group.add(mesh);
  };

  const createModel = (type: string) => {
    const group = new THREE.Group();
    const standardMat = (color: number) => new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
    
    switch (type) {
      case 'mangcau': {
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 16), standardMat(0x4d7c0f));
        body.scale.set(1, 1.2, 1);
        group.add(body);
        for(let i=0; i<20; i++) {
          const bump = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), standardMat(0x3f6212));
          const phi = Math.random() * Math.PI * 2;
          const theta = Math.random() * Math.PI;
          bump.position.setFromSphericalCoords(0.75, theta, phi);
          group.add(bump);
        }
        addHitbox(group, [1.8, 2.2, 1.8]);
        break;
      }
      case 'sung': {
        for(let i=0; i<8; i++) {
          const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), standardMat(0x166534));
          fruit.position.set((Math.random()-0.5)*0.8, (Math.random()-0.5)*0.8, (Math.random()-0.5)*0.8);
          group.add(fruit);
        }
        addHitbox(group, [1.5, 1.5, 1.5]);
        break;
      }
      case 'dudu': {
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, 2.2, 16), standardMat(0xca8a04));
        body.rotation.z = Math.PI/2;
        group.add(body);
        addHitbox(group, [2.5, 1.5, 1.5]);
        break;
      }
      case 'xoai': {
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.7, 24, 24), standardMat(0xfacc15));
        body.scale.set(1.4, 0.9, 0.8);
        group.add(body);
        addHitbox(group, [2, 1.2, 1.2]);
        break;
      }
      case 'binhtra': {
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 1.2, 20), new THREE.MeshStandardMaterial({ color: 0xfffef0, roughness: 0.2, metalness: 0.1 }));
        group.add(body);
        const lid = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 8, 0, Math.PI*2, 0, Math.PI/2), body.material);
        lid.position.y = 0.6;
        group.add(lid);
        const handle = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.08, 12, 24, Math.PI), body.material);
        handle.position.x = -0.6;
        handle.rotation.z = Math.PI/2;
        group.add(handle);
        addHitbox(group, [2, 1.5, 1.5]);
        break;
      }
      case 'banhchung': {
        const box = new THREE.Mesh(new THREE.BoxGeometry(2, 0.8, 2), standardMat(0x166534));
        group.add(box);
        const sMat = new THREE.MeshStandardMaterial({ color: 0xfefce8 });
        const s1 = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.04, 0.1), sMat); s1.position.y = 0.41; group.add(s1);
        const s2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.04, 2.05), sMat); s2.position.y = 0.41; group.add(s2);
        addHitbox(group, [2.2, 1, 2.2], [0, 0.4, 0]);
        break;
      }
      case 'duahau': {
        const geo = new THREE.SphereGeometry(1, 32, 32); geo.scale(1.2, 0.9, 0.9);
        const mesh = new THREE.Mesh(geo, standardMat(0x064e3b));
        group.add(mesh);
        addHitbox(group, [2.5, 1.8, 1.8]);
        break;
      }
      case 'vang': {
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.4, 0.4, 4), new THREE.MeshStandardMaterial({ color: 0xfde047, metalness: 0.9, roughness: 0.1 }));
        body.rotation.y = Math.PI / 4; group.add(body);
        const top = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), body.material);
        top.position.y = 0.2; top.scale.set(1.5, 0.8, 1); group.add(top);
        addHitbox(group, [1.4, 0.8, 1.4]);
        break;
      }
      case 'hoadao':
      case 'hoamai': {
        const color = type === 'hoadao' ? 0xff69b4 : 0xfacc15;
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.08, 4, 8), standardMat(0x2d1b0f));
        group.add(stem);
        for (let i = 0; i < 20; i++) {
          const flower = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.2 }));
          flower.position.set((Math.random() - 0.5) * 1.8, Math.random() * 3.5 - 1, (Math.random() - 0.5) * 1.8);
          group.add(flower);
        }
        addHitbox(group, [2.5, 4.5, 2.5], [0, 1.5, 0]);
        break;
      }
      case 'longden': {
        const body = new THREE.Mesh(
          new THREE.CylinderGeometry(0.7, 0.7, 1.8, 16), 
          new THREE.MeshStandardMaterial({ 
            color: 0xef4444, 
            roughness: 0.3, 
            emissive: 0xef4444, 
            emissiveIntensity: 1.5 
          })
        );
        group.add(body);
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.15, 16), new THREE.MeshStandardMaterial({ color: 0xca8a04, metalness: 0.8 }));
        cap.position.y = 0.9; group.add(cap.clone()); cap.position.y = -0.9; group.add(cap);
        
        // Add actual light source inside the lantern
        const light = new THREE.PointLight(0xff2200, 30, 15);
        light.position.set(0, 0, 0);
        light.castShadow = true;
        light.shadow.bias = -0.005;
        group.add(light);
        
        addHitbox(group, [1.6, 2.2, 1.6]);
        break;
      }
    }
    group.traverse(obj => { if (obj instanceof THREE.Mesh) { obj.castShadow = true; obj.receiveShadow = true; } });
    return group;
  };

  const addItemToScene = (type: string, position: THREE.Vector3) => {
    if (!sceneRef.current) return;
    const meshGroup = createModel(type);
    const id = `item-${Math.random().toString(36).substr(2, 9)}`;
    meshGroup.name = id;
    meshGroup.userData = { id, type };
    
    const isOnTable = Math.abs(position.x) < 7 && Math.abs(position.z) < 5;
    meshGroup.position.copy(position);
    meshGroup.position.y = isOnTable ? TABLE_HEIGHT : 0;
    
    sceneRef.current.add(meshGroup);
    setItems(prev => [...prev, { id, type, mesh: meshGroup, position: meshGroup.position.clone(), rotation: 0, scale: 1 }]);
    setSelectedId(id);
    playSound('click');
  };

  const updateTransform = (prop: 'scale' | 'rotate', delta: number) => {
    if (!selectedId) return;
    setItems(prev => prev.map(item => {
      if (item.id === selectedId) {
        if (prop === 'scale') {
          const newScale = Math.max(0.3, Math.min(5, item.mesh.scale.x + delta));
          item.mesh.scale.set(newScale, newScale, newScale);
          return { ...item, scale: newScale };
        } else {
          item.mesh.rotation.y += delta;
          return { ...item, rotation: item.mesh.rotation.y };
        }
      }
      return item;
    }));
    playSound('click');
  };

  const initThree = useCallback(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050101);
    scene.fog = new THREE.Fog(0x050101, 20, 100);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(1.6, 1.7, 32),
      new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.visible = false;
    scene.add(ring);
    selectionRingRef.current = ring;

    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const mainLight = new THREE.DirectionalLight(0xfff4d6, 0.8);
    mainLight.position.set(15, 25, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.set(2048, 2048);
    scene.add(mainLight);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: 0x0a0101, roughness: 1 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const tableGroup = new THREE.Group();
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(14, TABLE_HEIGHT, 10), new THREE.MeshStandardMaterial({ color: 0x2d0505, roughness: 0.3, metalness: 0.1 }));
    tableTop.position.y = TABLE_HEIGHT / 2;
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    tableGroup.add(tableTop);
    scene.add(tableGroup);

    const pGeo = new THREE.BufferGeometry();
    const pCount = 300;
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount*3; i++) pPos[i] = (Math.random()-0.5)*100;
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xfacc15, size: 0.08, transparent: true, opacity: 0.3 });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = performance.now() * 0.001;

      cameraOrbit.current.phi += (targetOrbit.current.phi - cameraOrbit.current.phi) * 0.1;
      cameraOrbit.current.theta += (targetOrbit.current.theta - cameraOrbit.current.theta) * 0.1;
      cameraOrbit.current.radius += (targetOrbit.current.radius - cameraOrbit.current.radius) * 0.1;

      const r = cameraOrbit.current.radius;
      camera.position.x = r * Math.sin(cameraOrbit.current.phi) * Math.cos(cameraOrbit.current.theta);
      camera.position.y = r * Math.cos(cameraOrbit.current.phi);
      camera.position.z = r * Math.sin(cameraOrbit.current.phi) * Math.sin(cameraOrbit.current.theta);
      camera.lookAt(0, 1.2, 0);

      particles.rotation.y += 0.0005;
      
      // Flickering effect for all lanterns in scene
      scene.traverse((obj) => {
        if (obj instanceof THREE.PointLight && obj.parent?.userData.type === 'longden') {
          obj.intensity = 25 + Math.sin(time * 10 + Math.random()) * 5;
        }
      });

      if (ring.visible) ring.rotation.z += 0.01;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const updateMouse = (e: any) => {
      const clientX = e.clientX || e.touches?.[0]?.clientX;
      const clientY = e.clientY || e.touches?.[0]?.clientY;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handleDown = (e: any) => {
      updateMouse(e);
      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects(scene.children, true);
      let hit = null;
      for (const i of intersects) {
        let curr = i.object;
        while (curr.parent) { if (curr.userData.id) { hit = curr as THREE.Group; break; } curr = curr.parent; }
        if (hit) break;
      }

      if (hit) {
        setSelectedId(hit.userData.id);
        isDraggingInScene.current = true;
        if (raycaster.current.ray.intersectPlane(dragPlane.current, intersection.current)) {
          offset.current.copy(intersection.current).sub(hit.position);
        }
        ring.visible = true; ring.position.copy(hit.position); ring.position.y += 0.05;
        playSound('click');
      } else {
        setSelectedId(null); ring.visible = false;
        isOrbiting.current = true;
        previousMouse.current = { x: e.clientX || e.touches?.[0]?.clientX, y: e.clientY || e.touches?.[0]?.clientY };
      }
    };

    const handleMove = (e: any) => {
      updateMouse(e);
      const clientX = e.clientX || e.touches?.[0]?.clientX;
      const clientY = e.clientY || e.touches?.[0]?.clientY;
      raycaster.current.setFromCamera(mouse.current, camera);

      if (isDraggingInScene.current && selectedId) {
        if (raycaster.current.ray.intersectPlane(dragPlane.current, intersection.current)) {
          const item = itemsRef.current.find(i => i.id === selectedId);
          if (item) {
            const newPos = intersection.current.clone().sub(offset.current);
            const isOnTable = Math.abs(newPos.x) < 7 && Math.abs(newPos.z) < 5;
            item.mesh.position.set(newPos.x, isOnTable ? TABLE_HEIGHT : 0, newPos.z);
            ring.position.copy(item.mesh.position);
            ring.position.y += 0.05;
          }
        }
      } else if (isOrbiting.current) {
        const dx = clientX - previousMouse.current.x;
        const dy = clientY - previousMouse.current.y;
        targetOrbit.current.theta -= dx * 0.008;
        targetOrbit.current.phi = Math.max(0.2, Math.min(Math.PI / 2.1, targetOrbit.current.phi - dy * 0.008));
        previousMouse.current = { x: clientX, y: clientY };
      }
    };

    const handleUp = () => { isDraggingInScene.current = false; isOrbiting.current = false; };
    const handleWheel = (e: WheelEvent) => { e.preventDefault(); targetOrbit.current.radius = Math.max(15, Math.min(70, targetOrbit.current.radius + e.deltaY * 0.04)); };

    renderer.domElement.addEventListener('mousedown', handleDown);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    renderer.domElement.addEventListener('touchstart', handleDown);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleUp);
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      renderer.dispose();
    };
  }, []);

  const itemsRef = useRef<DecoratedItem3D[]>([]);
  useEffect(() => { itemsRef.current = items; }, [items]);
  useEffect(() => { initThree(); }, [initThree]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!rendererRef.current || !cameraRef.current || !sceneRef.current || !draggingFromUI) return;
    const rect = rendererRef.current.domElement.getBoundingClientRect();
    mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.current.setFromCamera(mouse.current, cameraRef.current);
    if (raycaster.current.ray.intersectPlane(dragPlane.current, intersection.current)) {
      if (!previewMeshRef.current) {
        const preview = createModel(draggingFromUI);
        preview.children.forEach(c => { if (c instanceof THREE.Mesh) { (c.material as any).transparent = true; (c.material as any).opacity = 0.4; } });
        sceneRef.current.add(preview);
        previewMeshRef.current = preview;
      }
      const isOnTable = Math.abs(intersection.current.x) < 7 && Math.abs(intersection.current.z) < 5;
      previewMeshRef.current.position.set(intersection.current.x, isOnTable ? TABLE_HEIGHT : 0, intersection.current.z);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggingFromUI || !previewMeshRef.current) return;
    addItemToScene(draggingFromUI, previewMeshRef.current.position.clone());
    sceneRef.current?.remove(previewMeshRef.current);
    previewMeshRef.current = null;
    setDraggingFromUI(null);
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-[#050101] overflow-hidden select-none z-0">
      <div 
        ref={containerRef} 
        className="w-full h-full" 
        onDragOver={onDragOver}
        onDrop={onDrop}
      />

      <div className={`fixed top-1/2 -translate-y-1/2 left-6 z-50 transition-all duration-500 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-[calc(100%+24px)]'}`}>
        <div className="bg-red-950/80 backdrop-blur-2xl p-6 rounded-[3rem] border border-yellow-500/30 shadow-[0_30px_90px_rgba(0,0,0,0.8)] w-72 max-h-[80vh] flex flex-col">
          <h3 className="text-[10px] font-black text-yellow-500 mb-6 flex items-center gap-2 uppercase tracking-widest">
            <Box size={14} className="text-yellow-400" /> Đồ lễ ngày Tết
          </h3>
          <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-2 custom-scrollbar">
            {ITEMS_CONFIG.map(item => (
              <div
                key={item.type}
                draggable
                onDragStart={() => setDraggingFromUI(item.type)}
                className="bg-red-900/40 hover:bg-yellow-500 group p-4 rounded-3xl border border-yellow-500/10 flex flex-col items-center gap-2 transition-all cursor-grab active:cursor-grabbing"
              >
                <span className="text-4xl group-hover:scale-110 transition-transform drop-shadow-md">{item.icon}</span>
                <span className="text-[9px] font-black uppercase text-yellow-200/60 group-hover:text-red-950 tracking-tighter text-center">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`fixed top-1/2 -translate-y-1/2 z-50 p-4 bg-red-950/80 backdrop-blur-md rounded-full border border-yellow-500/30 text-yellow-400 shadow-xl transition-all ${isSidebarOpen ? 'left-[300px]' : 'left-6'}`}
      >
        {isSidebarOpen ? <ChevronLeft size={24}/> : <ChevronRight size={24}/>}
      </button>

      <div className="fixed top-24 left-1/2 -translate-x-1/2 pointer-events-none text-center space-y-1">
        <h2 className="text-4xl lg:text-6xl font-cursive text-yellow-400 drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)]">Bày Mâm Ngũ Quả</h2>
        <p className="text-red-200 opacity-60 italic text-sm tracking-widest uppercase font-bold">Thêm Đèn Lồng để thắp sáng không gian Tết</p>
      </div>

      {selectedId && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 animate-slideUp">
           <div className="bg-red-950/90 backdrop-blur-3xl p-5 rounded-[3.5rem] border border-yellow-500/30 shadow-[0_30px_100px_rgba(0,0,0,1)] flex items-center gap-8">
              <div className="flex items-center gap-4 border-r border-white/10 pr-8">
                 <ControlBtn icon={<Plus size={20}/>} onClick={() => updateTransform('scale', 0.1)} label="To" />
                 <ControlBtn icon={<div className="font-black text-xl">−</div>} onClick={() => updateTransform('scale', -0.1)} label="Nhỏ" />
              </div>
              <div className="flex items-center gap-4 border-r border-white/10 pr-8">
                 <ControlBtn icon={<RotateCw size={20}/>} onClick={() => updateTransform('rotate', Math.PI/10)} label="Xoay" />
              </div>
              <button 
                onClick={() => {
                  const item = items.find(i => i.id === selectedId);
                  if (item && sceneRef.current) {
                    sceneRef.current.remove(item.mesh);
                    setItems(prev => prev.filter(i => i.id !== selectedId));
                    setSelectedId(null);
                    playSound('rustle');
                  }
                }} 
                className="flex flex-col items-center gap-1 group/del"
              >
                <div className="w-12 h-12 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-all shadow-lg">
                  <Trash2 size={20} />
                </div>
                <span className="text-[9px] font-black uppercase text-red-400 tracking-widest">Gỡ bỏ</span>
              </button>
           </div>
        </div>
      )}

      <div className="fixed bottom-12 right-10 flex flex-col gap-3">
        <button 
          onClick={() => { targetOrbit.current = { phi: Math.PI / 3, theta: Math.PI / 4, radius: 30 }; playSound('click'); }}
          className="bg-black/60 p-4 rounded-full border border-yellow-500/20 text-yellow-500 hover:bg-yellow-500 hover:text-red-950 transition-all shadow-2xl"
          title="Đặt lại camera"
        >
          <RefreshCcw size={20} />
        </button>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(234, 179, 8, 0.2); border-radius: 10px; }
        @keyframes slideUp {
          from { transform: translate(-50%, 40px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        .animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
      `}</style>
    </div>
  );
};

const ControlBtn: React.FC<{icon: React.ReactNode, onClick: () => void, label: string}> = ({icon, onClick, label}) => (
  <button onClick={(e) => { e.stopPropagation(); onClick(); }} className="flex flex-col items-center gap-1 group">
    <div className="w-12 h-12 bg-yellow-500 text-red-950 rounded-full flex items-center justify-center transition-all shadow-lg hover:scale-110 active:scale-90 border border-yellow-600">
      {icon}
    </div>
    <span className="text-[9px] font-black uppercase text-yellow-500/70 tracking-widest">{label}</span>
  </button>
);

export default TetDecorateSection;
