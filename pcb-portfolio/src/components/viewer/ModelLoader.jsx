import { useGLTF, Center, Bounds } from "@react-three/drei";
import { useEffect, useMemo } from "react";
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
    if (dist < 0.1) meshes.push(child);
  });
  return meshes;
}

// ─────────────────────────────────────────────────────────────
// Planar UV generation
//
// Projects vertex X,Z onto [0,1] so the Gerber texture maps
// flat onto the board's top/bottom faces.  Edge faces get
// slightly stretched UVs but the board is so thin (~1.6 mm)
// that this is invisible.
// ─────────────────────────────────────────────────────────────
function generatePlanarUVs(mesh) {
  const geometry = mesh.geometry;
  const position = geometry.attributes.position;

  geometry.computeBoundingBox();
  const { min, max } = geometry.boundingBox;

  const rangeX = max.x - min.x || 1;
  const rangeZ = max.z - min.z || 1;

  const uvs = new Float32Array(position.count * 2);

  for (let i = 0; i < position.count; i++) {
    uvs[i * 2] = (position.getX(i) - min.x) / rangeX;
    // Flip V so the texture is right-side-up when viewed from above
    uvs[i * 2 + 1] = 1.0 - (position.getZ(i) - min.z) / rangeZ;
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

  // Clone so we never mutate the cached GLTF scene (useGLTF
  // returns the same reference on subsequent calls).
  const { clone, scaleFactor } = useMemo(() => {
    const c = original.clone(true);
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
  }, [original]);

  // Apply Gerber texture to the board mesh when ready.
  // This fires after the model is already visible (progressive enhancement).
  useEffect(() => {
    if (!textures?.top) return;

    const boardMeshes = findBoardMeshes(clone);
    if (boardMeshes.length > 0) {
      applyTextureToBoard(boardMeshes, textures.top);
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
