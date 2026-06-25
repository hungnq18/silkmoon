import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Canvas } from '@react-three/fiber';
import { XR, Interactive, useXRHitTest, createXRStore } from '@react-three/xr';
import * as THREE from 'three';
import { USDZExporter } from 'three/addons/exporters/USDZExporter.js';
import { FABRICS } from './arUtils';

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
function ARBedMesh({ position, productImageUrl }) {
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    if (productImageUrl) {
      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin('anonymous');
      loader.load(
        productImageUrl,
        (tex) => {
          tex.wrapS = THREE.RepeatWrapping;
          tex.wrapT = THREE.RepeatWrapping;
          tex.repeat.set(2, 2); // Adjust repeat if necessary
          setTexture(tex);
        },
        undefined,
        (err) => console.error('Error loading texture:', err)
      );
    }
  }, [productImageUrl]);

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

export default function ARWebXRView({ activeFabricId, productImageUrl, onClose }) {
  const [bedPosition, setBedPosition] = useState(null);
  const [loadedTexture, setLoadedTexture] = useState(null);
  const [usdzUrl, setUsdzUrl] = useState(null);

  // Check if device is iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  // Load texture once for USDZ pre-generation
  useEffect(() => {
    if (productImageUrl) {
      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin('anonymous');
      loader.load(productImageUrl, (tex) => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(2, 2);
        setLoadedTexture(tex);
      });
    }
  }, [productImageUrl]);

  // Pre-generate USDZ for iOS to bypass Safari's async click block
  useEffect(() => {
    if (!isIOS || !loadedTexture) return;

    let active = true;
    let currentUrl = null;

    const generateUSDZ = async () => {
      try {
        // BoxGeometry to give it some thickness
        const geometry = new THREE.BoxGeometry(1.8, 0.2, 2.0);
        const material = new THREE.MeshStandardMaterial({
          map: loadedTexture,
          roughness: 0.4,
          metalness: 0.1,
          name: 'BedFabricMaterial'
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = 'BedMesh';
        // AR Quick Look standard orientation
        mesh.position.y = 0.1; // elevate half thickness

        const group = new THREE.Group();
        group.name = 'BedGroup';
        group.add(mesh);

        const scene = new THREE.Scene();
        scene.add(group);

        const exporter = new USDZExporter();
        const arraybuffer = await exporter.parse(scene);

        if (!active) return;

        // CRITICAL FIX: iOS AR Quick Look rejects 'Blob'. We MUST use a 'File' object 
        // with the exact '.usdz' filename extension so the OS can infer the type correctly!
        const file = new File([arraybuffer], "silkmoon-bed.usdz", { type: 'model/vnd.usdz+zip' });
        currentUrl = URL.createObjectURL(file) + '#model.usdz';
        setUsdzUrl(currentUrl);
      } catch (error) {
        console.error('Error generating USDZ:', error);
      }
    };

    generateUSDZ();

    return () => {
      active = false;
      // Do not revoke Object URL! iOS Quick Look needs time to read it out-of-process.
      // Revoking it too early causes 'Cannot open object' error.
    };
  }, [loadedTexture, isIOS]);

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
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col gap-4 whitespace-nowrap">
        {isIOS ? (
          <>
            {usdzUrl ? (
              <a
                rel="ar"
                href={usdzUrl}
                download="silkmoon-bed.usdz"
                className="bg-white text-black px-6 py-3 rounded-full font-bold uppercase tracking-wider shadow-xl shadow-black/50 hover:scale-105 active:scale-95 transition-all inline-flex items-center justify-center"
              >
                Xem AR Giường (Code)
                <img src="" alt="" style={{ display: 'none' }} />
              </a>
            ) : (
              <button
                disabled
                className="bg-white/50 text-black px-6 py-3 rounded-full font-bold uppercase tracking-wider shadow-xl shadow-black/50 cursor-not-allowed"
              >
                Đang tải 3D...
              </button>
            )}

            {/* Google Model Viewer Official USDZ Test Button */}
            <a
              rel="ar"
              href="https://modelviewer.dev/shared-assets/models/Astronaut.usdz"
              className="bg-blue-500 text-white px-6 py-3 rounded-full font-bold uppercase tracking-wider shadow-xl hover:scale-105 active:scale-95 transition-all inline-flex items-center justify-center"
            >
              Test Mẫu Phi Hành Gia
              <img src="" alt="" style={{ display: 'none' }} />
            </a>
          </>
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
                productImageUrl={productImageUrl}
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
