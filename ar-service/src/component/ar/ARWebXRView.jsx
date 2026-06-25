import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Canvas } from '@react-three/fiber';
import { XR, Interactive, useXRHitTest, createXRStore } from '@react-three/xr';
import * as THREE from 'three';
import { USDZExporter } from 'three/addons/exporters/USDZExporter.js';
import { FABRICS, colorizeTexture } from './arUtils';
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

// The Bed Mesh placed in AR
function ARBedMesh({ position, fabricId, baseTextureImg }) {
  const fabric = FABRICS.find(f => f.id === fabricId) || FABRICS[0];
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    if (baseTextureImg) {
      // Colorize the texture and create a Three.js Texture
      const canvas = colorizeTexture(baseTextureImg, fabric.hex, fabric.shimmer);
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(2, 2); // Adjust repeat for scale
      setTexture(tex);
    }
  }, [fabric, baseTextureImg]);

  if (!texture) return null;

  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      {/* 1.8m x 2.0m standard bed size */}
      <planeGeometry args={[1.8, 2.0, 32, 32]} />
      <meshStandardMaterial 
        map={texture} 
        roughness={0.4} 
        metalness={0.1} 
        side={THREE.DoubleSide} 
      />
    </mesh>
  );
}

export default function ARWebXRView({ activeFabricId, onClose }) {
  const [bedPosition, setBedPosition] = useState(null);
  const [baseTextureImg, setBaseTextureImg] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  // Check if device is iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  const generateAndOpenUSDZ = async () => {
    if (!baseTextureImg) return;
    setIsExporting(true);
    try {
      const fabric = FABRICS.find(f => f.id === activeFabricId) || FABRICS[0];
      const canvas = colorizeTexture(baseTextureImg, fabric.hex, fabric.shimmer);
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(2, 2);

      const geometry = new THREE.PlaneGeometry(1.8, 2.0, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.4,
        metalness: 0.1,
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(geometry, material);
      // AR Quick Look standard orientation (XY plane maps correctly usually when rotated)
      mesh.rotation.x = -Math.PI / 2;
      
      const scene = new THREE.Scene();
      scene.add(mesh);

      const exporter = new USDZExporter();
      const arraybuffer = await exporter.parse(scene);
      const blob = new Blob([arraybuffer], { type: 'model/vnd.usdz+zip' });
      // IMPORTANT: iOS requires the URL to end with .usdz to properly trigger AR Quick Look
      const url = URL.createObjectURL(blob) + '#model.usdz';

      const a = document.createElement('a');
      a.setAttribute('rel', 'ar');
      a.setAttribute('href', url);
      a.setAttribute('download', 'silkmoon-bed.usdz');
      a.appendChild(document.createElement('img')); // Required by iOS for AR links
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Cleanup
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Error generating USDZ:', error);
      alert('Không thể tạo mô hình AR cho iPhone. Vui lòng thử lại!');
    } finally {
      setIsExporting(false);
    }
  };

  // Load base texture
  useEffect(() => {
    const img = new Image();
    img.src = velvetTextureUrl;
    img.onload = () => setBaseTextureImg(img);
  }, []);

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
            ? "Bấm nút bên dưới để mở Camera AR của iOS" 
            : bedPosition 
              ? "Chăn ga đã được đặt. Di chuyển xung quanh để xem." 
              : "Quét mặt phẳng sàn/giường và chạm để đặt chăn ga"}
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur rounded-full flex items-center justify-center text-white"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Enter AR Button overlay */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap">
        {isIOS ? (
          <button
            onClick={generateAndOpenUSDZ}
            disabled={!baseTextureImg || isExporting}
            className={`bg-white text-black px-6 py-3 rounded-full font-bold uppercase tracking-wider shadow-xl shadow-black/50 transition-all ${isExporting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
          >
            {isExporting ? 'Đang tải 3D...' : 'Xem AR trên iPhone'}
          </button>
        ) : (
          <button
            onClick={() => store.enterAR()}
            className="bg-white text-black px-6 py-3 rounded-full font-bold uppercase tracking-wider shadow-xl shadow-black/50 hover:scale-105 active:scale-95 transition-all"
          >
            Bắt đầu AR Try-On (V3)
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
                fabricId={activeFabricId} 
                baseTextureImg={baseTextureImg} 
              />
            )}
          </XR>
        </Canvas>
      )}
    </div>
  );
}

ARWebXRView.propTypes = {
  activeFabricId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};
