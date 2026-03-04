import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";

const SimpleSpinningBox = (props: any) => {
    const mesh = useRef<THREE.Mesh>(null!);
    const [hovered, setHover] = useState(false);
    const [clicked, setClick] = useState(false);

    useFrame((state, delta) => {
        if (mesh.current) {
            mesh.current.rotation.x += delta;
        }
    });

    return (
        <mesh
            {...props}
            ref={mesh}
            scale={clicked ? 1.5 : 1}
            onClick={() => setClick(!clicked)}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
        >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
        </mesh>
    );
};

const ThreeScene = () => {
    return (
        <Canvas camera={{ position: [0, 0, 5] }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
            <pointLight position={[-10, -10, -10]} />

            <SimpleSpinningBox position={[-1.2, 0, 0]} />
            <SimpleSpinningBox position={[1.2, 0, 0]} />

            <Environment preset="city" />
        </Canvas>
    );
};

export default ThreeScene;
