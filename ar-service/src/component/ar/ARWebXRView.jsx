import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Canvas } from '@react-three/fiber';
import { XR, Interactive, useXRHitTest, createXRStore } from '@react-three/xr';
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import '@google/model-viewer';
import { FABRICS } from './arUtils';
import velvetTextureUrl from '../../assets/velvet.png';

const store = createXRStore();

// The Reticle (target cursor) to show where the user is aiming in AR
function Reticle({ onSelect }) {
  const reticleRef = useRef();

  // useXRHitTest runs every frame to find surfaces
  useXRHitTest((hitMatrix, hit) => {
    if (reticleRef.current) {
      reticleRef.current.visible = true;
      reticleRef.current.matrix.fromArray(hitMatrix);
    }
  });

  return (
    <Interactive onSelect={onSelect}>
      <mesh
        ref={reticleRef}
        matrixAutoUpdate={false}
        visible={false}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.1, 0.15, 32]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </Interactive>
  );
}

// ── Hybrid 2.5D Relief Mesh Generator ───────────────────────
function generateReliefGeometry() {
  const geo = new THREE.PlaneGeometry(1.8, 2.0, 64, 64);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    let z = 0.25; // Base mattress thickness

    // 1. Drape edges smoothly
    const drapeX = Math.max(0, (Math.abs(x) - 0.75) / 0.15); 
    const drapeYFoot = Math.max(0, (-y - 0.85) / 0.15);
    const drapeYHead = Math.max(0, (y - 0.9) / 0.1);

    const drapeFactor = Math.min(1.0, Math.max(drapeX, drapeYFoot, drapeYHead));
    const smoothDrape = drapeFactor * drapeFactor * (3 - 2 * drapeFactor); // smoothstep
    z -= smoothDrape * 0.25; // drop down to floor

    // 2. Add Pillow Bumps at headboard
    const distL = Math.sqrt((x + 0.4)**2 + (y - 0.7)**2);
    const distR = Math.sqrt((x - 0.4)**2 + (y - 0.7)**2);
    const pillowR = 0.35;
    const pillowH = 0.15;

    if (distL < pillowR) {
       z += Math.cos((distL/pillowR) * Math.PI/2) * pillowH;
    }
    if (distR < pillowR) {
       z += Math.cos((distR/pillowR) * Math.PI/2) * pillowH;
    }

    pos.setZ(i, z);
  }
  geo.computeVertexNormals();
  return geo;
}

// The Bed Mesh placed in AR (Android)
function ARBedMesh({ position, loadedTexture }) {
  if (!loadedTexture) return null;

  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <primitive object={generateReliefGeometry()} attach="geometry" />
        <meshStandardMaterial 
          map={loadedTexture} 
          roughness={0.6} 
          metalness={0.1} 
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

export default function ARWebXRView({ activeFabricId, productImageUrl, onClose }) {
  const [bedPosition, setBedPosition] = useState(null);
  const [loadedTexture, setLoadedTexture] = useState(null);
  const [usdzUrl, setUsdzUrl] = useState(null);
  const [usdzError, setUsdzError] = useState(null);

  // Check if device is iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  // Load texture once for USDZ pre-generation
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    
    const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
    const proxyUrl = productImageUrl 
      ? `${backendUrl}/api/v1/ar/proxy-image?url=${encodeURIComponent(productImageUrl)}` 
      : velvetTextureUrl;
    
    loader.load(
      proxyUrl, 
      (tex) => {
        // We stretch the real image exactly once over the plane (no repeating)
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        // FlipY might be needed for PlaneGeometry UVs
        tex.flipY = true; 
        setLoadedTexture(tex);
      },
      undefined,
      (err) => {
        console.error('Fatal: Velvet texture failed', err);
        setUsdzError(`Lỗi nghiêm trọng: Không thể tải ảnh bề mặt.`);
      }
    );
  }, []);

  // Pre-generate GLB for model-viewer to bypass Safari's async click block
  useEffect(() => {
    if (!isIOS || !loadedTexture) return;

    let active = true;

    const generateGLB = async () => {
      try {
        const group = new THREE.Group();
        group.name = 'HybridReliefBedGroup';

        const geometry = generateReliefGeometry();
        const material = new THREE.MeshStandardMaterial({
          map: loadedTexture,
          roughness: 0.6,
          metalness: 0.1,
          side: THREE.DoubleSide,
          name: 'RealProductMaterial'
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = 'HybridReliefBedMesh';
        // Rotate flat and elevate slightly
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.y = 0.05;

        group.add(mesh);

        const scene = new THREE.Scene();
        scene.add(group);

        const exporter = new GLTFExporter();
        exporter.parse(
          scene,
          (glbArrayBuffer) => {
            if (!active) return;
            const blob = new Blob([glbArrayBuffer], { type: 'model/gltf-binary' });
            const url = URL.createObjectURL(blob);
            setUsdzUrl(url); // Storing GLB URL in usdzUrl state for simplicity
          },
          (error) => {
            console.error('Error generating GLB:', error);
            if (active) setUsdzError('Lỗi tạo mô hình 3D');
          },
          { binary: true }
        );
      } catch (error) {
        console.error('Error in generateGLB:', error);
        if (active) {
          setUsdzError(error.message || 'Lỗi không xác định');
        }
      }
    };

    generateGLB();

    return () => {
      active = false;
    };
  }, [loadedTexture, isIOS, activeFabricId]);

  const placeBed = (e) => {
    if (e.intersection) {
      // Place bed at intersection point
      setBedPosition(e.intersection.object.position.clone());
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black">
      {/* Overlay UI */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10">
        <div className="bg-black/50 text-white px-4 py-2 rounded-full text-sm backdrop-blur">
          {isIOS 
            ? "Hướng Camera xuống mặt sàn trống để đặt Mô hình 3D" 
            : bedPosition 
              ? "Đã đặt Mô hình 3D. Hãy đi vòng quanh để xem chi tiết." 
              : "Quét mặt phẳng sàn nhà và chạm để đặt Mô hình 3D"}
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur rounded-full flex items-center justify-center text-white"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Enter AR Button overlay */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col gap-4 whitespace-nowrap">
        {isIOS ? (
          <>
            {usdzUrl ? (
              <>
                <button
                  onClick={() => {
                    const mv = document.querySelector('#hidden-model-viewer');
                    if (mv) mv.activateAR();
                  }}
                  className="bg-white text-black px-6 py-3 rounded-full font-bold uppercase tracking-wider shadow-xl shadow-black/50 hover:scale-105 active:scale-95 transition-all inline-flex items-center justify-center"
                >
                  Xem Mô Hình 3D (iOS)
                </button>
                <model-viewer
                  id="hidden-model-viewer"
                  src={usdzUrl}
                  ar
                  ar-modes="quick-look"
                  ar-placement="floor"
                  ar-scale="auto"
                  style={{ display: 'none' }}
                ></model-viewer>
              </>
            ) : usdzError ? (
              <button
                disabled
                className="bg-red-500/80 text-white px-6 py-3 rounded-full font-bold shadow-xl cursor-not-allowed text-xs max-w-[80vw] break-words"
              >
                Lỗi: {usdzError}
              </button>
            ) : (
              <button
                disabled
                className="bg-white/50 text-black px-6 py-3 rounded-full font-bold uppercase tracking-wider shadow-xl shadow-black/50 cursor-not-allowed"
              >
                Đang dựng 3D...
              </button>
            )}
          </>
        ) : (
          <button
            onClick={() => store.enterAR()}
            className="bg-white text-black px-6 py-3 rounded-full font-bold uppercase tracking-wider shadow-xl shadow-black/50 hover:scale-105 active:scale-95 transition-all"
          >
            Xem Mô Hình 3D (Android)
          </button>
        )}
      </div>

      {/* WebXR Canvas - Only render if not iOS to save resources */}
      {!isIOS && (
        <Canvas>
          <XR store={store}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
            
            {!bedPosition && <Reticle onSelect={placeBed} />}
            
            {bedPosition && (
              <ARBedMesh 
                position={bedPosition} 
                loadedTexture={loadedTexture} 
              />
            )}
          </XR>
        </Canvas>
      )}
    </div>
  );
}

ARWebXRView.propTypes = {
  activeFabricId: PropTypes.string,
  productImageUrl: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};
