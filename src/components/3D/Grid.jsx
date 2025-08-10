import { Grid } from "@react-three/drei";
import * as THREE from "three";

const GridBase = ({ size = 20, gridBaseSize = 1 }) => {
  return <Grid args={[size, size, gridBaseSize]} position={[0, 0, 0]} />;
};

export default GridBase;
