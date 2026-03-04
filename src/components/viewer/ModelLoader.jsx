import { useGLTF, Center, Bounds } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useGerberTexture } from "../../hooks/useGerberTexture";

// ─────────────────────────────────────────────────────────────
// Board mesh detection
//
// Altium STEP exports use mat_0 for the PCB substrate with a
// distinctive dark-green colour.  We match by colour distance
// so it's resilient to slight export variations.
// ─────────────────────────────────────────────────────────────
const BOARD_GREEN = new THREE.Color(0.018, 0.188, 0.032);

function findBoardMeshes(scene) {
  const meshes = [];
  scene.traverse((child) => {
    if (!child.isMesh) return;
    const mat = child.material;
    if (!mat?.color) return;

    const dist = Math.sqrt(
      (mat.color.r - BOARD_GREEN.r) ** 2 +
        (mat.color.g - BOARD_GREEN.g) ** 2 +
        (mat.color.b - BOARD_GREEN.b) ** 2,
    );
    if (dist < 0.15) meshes.push(child);
  });
  return meshes;
}

// ─────────────────────────────────────────────────────────────
// Planar UV generation
//
// Auto-detects the board's flat plane by finding the thinnest
// bounding-box axis (= board thickness).  Projects the other
// two axes onto [0,1] UV coordinates so the Gerber texture maps
// cleanly onto the top/bottom faces.
//
// Axis mapping convention:
//   Altium PCB X → STEP X → glTF X   (U axis)
//   Altium PCB Y → STEP Y → glTF Z   (V axis)
//   Altium PCB Z → STEP Z → glTF Y   (board thickness)
// ─────────────────────────────────────────────────────────────
function generatePlanarUVs(mesh) {
  const geometry = mesh.geometry;
  const position = geometry.attributes.position;

  geometry.computeBoundingBox();
  const { min, max } = geometry.boundingBox;
  const size = new THREE.Vector3().subVectors(max, min);

  // Detect the thinnest axis — that's the board thickness.
  // Use the other two axes for the UV projection.
  let getU, getV, rangeU, rangeV, minU, minV;

  if (size.y <= size.x && size.y <= size.z) {
    // Y is thinnest → board lies on XZ plane (typical for Y-up glTF)
    getU = (i) => position.getX(i);
    getV = (i) => position.getZ(i);
    rangeU = size.x || 1;
    rangeV = size.z || 1;
    minU = min.x;
    minV = min.z;
  } else if (size.z <= size.x && size.z <= size.y) {
    // Z is thinnest → board lies on XY plane
    getU = (i) => position.getX(i);
    getV = (i) => position.getY(i);
    rangeU = size.x || 1;
    rangeV = size.y || 1;
    minU = min.x;
    minV = min.y;
  } else {
    // X is thinnest → board lies on YZ plane
    getU = (i) => position.getZ(i);
    getV = (i) => position.getY(i);
    rangeU = size.z || 1;
    rangeV = size.y || 1;
    minU = min.z;
    minV = min.y;
  }

  const uvs = new Float32Array(position.count * 2);

  for (let i = 0; i < position.count; i++) {
    uvs[i * 2] = (getU(i) - minU) / rangeU;
    // STEP→glTF converts Altium Y → glTF −Z, so the Z axis is
    // inverted relative to the Gerber coordinate system.  A raw
    // normalisation maps minZ (= high Gerber Y) → V 0 → canvas
    // top, which is correct.
    uvs[i * 2 + 1] = (getV(i) - minV) / rangeV;
  }

  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
}

// ─────────────────────────────────────────────────────────────
// Apply a Gerber CanvasTexture to all board meshes.
// ─────────────────────────────────────────────────────────────
function applyTextureToBoard(meshes, texture) {
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    metalness: 0.15,
    roughness: 0.65,
    side: THREE.DoubleSide,
  });

  for (const mesh of meshes) {
    generatePlanarUVs(mesh);
    mesh.material = material;
  }
}

// ─────────────────────────────────────────────────────────────
// ModelLoader component
// ─────────────────────────────────────────────────────────────
export default function ModelLoader({ path, gerberFiles, onLoad }) {
  const { scene: original } = useGLTF(path);
  const { textures } = useGerberTexture(gerberFiles);
  const originalMatsRef = useRef(new Map());

  // Clone so we never mutate the cached GLTF scene (useGLTF
  // returns the same reference on subsequent calls).
  // Include `path` in deps to force a fresh clone even when
  // useGLTF returns a cached scene reference.
  const { clone, scaleFactor } = useMemo(() => {
    const c = original.clone(true);
    // Deep-clone materials so texture changes don't bleed into the cache
    c.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material = child.material.clone();
      }
    });
    // Reset any stale transforms from a previous mount
    c.scale.set(1, 1, 1);
    c.position.set(0, 0, 0);
    c.updateMatrixWorld(true);

    // Altium exports STEP models in metres – a 42 mm PCB is only
    // 0.042 units.  Normalise so the longest axis ≈ 5 units.
    const box = new THREE.Box3().setFromObject(c);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    return { clone: c, scaleFactor: maxDim > 0 ? 5 / maxDim : 1 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [original, path]);

  // Snapshot the original board materials so we can restore them
  // when switching modules (before the new gerber texture loads).
  useEffect(() => {
    const mats = new Map();
    const boardMeshes = findBoardMeshes(clone);
    for (const mesh of boardMeshes) {
      mats.set(mesh.uuid, mesh.material.clone());
    }
    originalMatsRef.current = mats;
  }, [clone]);

  // Apply Gerber texture to the board mesh when ready, or
  // restore the default green material while a new texture loads.
  useEffect(() => {
    const boardMeshes = findBoardMeshes(clone);
    if (boardMeshes.length === 0) return;

    if (textures?.top) {
      applyTextureToBoard(boardMeshes, textures.top);
    } else {
      // Restore original materials — prevents the previous module's
      // gerber from lingering on the new model during load.
      for (const mesh of boardMeshes) {
        const orig = originalMatsRef.current.get(mesh.uuid);
        if (orig) mesh.material = orig.clone();
      }
    }
  }, [clone, textures]);

  useEffect(() => {
    onLoad?.();
  }, [clone]);

  return (
    <Bounds fit clip damping={3} margin={1.2}>
      <Center>
        <primitive object={clone} scale={scaleFactor} />
      </Center>
    </Bounds>
  );
}
