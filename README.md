# 3D Geometry Builder - Development Outline

## App Overview

A 3D geometric shape building application that allows users to create, manipulate, and customize basic geometric primitives in an intuitive browser-based environment with real-time editing capabilities.

## Core Architecture

### Technology Stack

- **Frontend**: React + Three.js (via @react-three/fiber)
- **3D Engine**: Three.js with @react-three/drei utilities
- **State Management**: React hooks (useState, useReducer) + Zustand
- **Interactions**: @use-gesture/react for drag operations
- **Storage**: Local state (in-memory for Claude artifacts)

### Key Components

1. **3D Scene Manager** - Handles camera, lighting, rendering
2. **Shape System** - Core geometric primitives with transform handles
3. **Shape Picker Panel** - Available shape types and properties
4. **Grid System** - Snap-to-grid building surface with configurable spacing
5. **Transform Controls** - Real-time editing handles for position, scale, rotation
6. **Property Panel** - Color picker, dimension inputs, material settings
7. **Save/Load System** - Project persistence and sharing

---

## Shape System

### Supported Primitives

- **Rectangle/Cube** - Adjustable width, height, depth
- **Cylinder** - Adjustable radius, height, radial segments
- **Cone** - Adjustable radius, height, radial segments
- **Sphere** - Adjustable radius, width/height segments
- **Triangle Prism** - Adjustable base width, height, depth
- **Pyramid** - Adjustable base size, height

### Shape Properties

Each shape supports:

- **Position**: X, Y, Z coordinates with grid snapping
- **Dimensions**: Shape-specific size parameters
- **Rotation**: Euler angles (X, Y, Z) with snap angles
- **Color**: Full color picker with material properties
- **Material**: Basic materials (matte, glossy, metallic)

---

## Feature Development Checklist

### 🟢 BASIC FEATURES (Foundation)

_Essential functionality for a working prototype_

#### Core Shape Mechanics

- [ ] **Basic shape primitives** (rectangle, cylinder, sphere)
- [ ] **Grid-based snapping system** (configurable grid size)
- [ ] **Click-to-place shape system**
- [ ] **Shape selection** (click to select, visual feedback)
- [ ] **Delete shape functionality** (delete key or context menu)
- [ ] **Basic materials and colors**

#### UI Essentials

- [ ] **Shape picker panel** (choose shape type)
- [ ] **Basic color picker** (HSV color wheel)
- [ ] **Clear all button**
- [ ] **Camera controls** ✅ _OrbitControls already implemented_
- [ ] **Grid helper visualization**

#### Transform System

- [ ] **Position handles** (drag to move on grid)
- [ ] **Scale handles** (corner/edge drag to resize)
- [ ] **Basic rotation** (90-degree snaps)

---

### 🟡 MVP FEATURES (Minimum Viable Product)

_Features needed for a usable geometry builder_

#### Enhanced Editing

- [ ] **Precise grid snapping** (multiple grid sizes: 0.5, 1, 2 units)
- [ ] **Rotation handles** (visual rotation gizmos)
- [ ] **Dimension input fields** (numerical precision)
- [ ] **Hover preview** (ghost shape shows where piece will be placed)
- [ ] **Undo/Redo system** (command pattern)
- [ ] **Multi-selection** (select multiple shapes)

#### Advanced Shapes

- [ ] **All primitive types** (rectangle, cylinder, cone, sphere, triangle, pyramid)
- [ ] **Shape variants** (hollow cylinders, different triangle types)
- [ ] **Custom segments** (adjustable cylinder/sphere resolution)

#### User Experience

- [ ] **Context menus** (right-click for shape options)
- [ ] **Copy/paste/duplicate** (with offset positioning)
- [ ] **Keyboard shortcuts** (G for move, S for scale, R for rotate)
- [ ] **Layer system** (organize shapes in groups)
- [ ] **Property panel** (detailed shape configuration)

#### Save/Load System

- [ ] **Save scene to JSON**
- [ ] **Load scene from JSON**
- [ ] **Export to image** (screenshot functionality)
- [ ] **Scene naming system**

---

### 🔵 ADVANCED FEATURES (Full-Featured App)

_Professional-grade features for power users_

#### Advanced Transform Tools

- [ ] **Free-form rotation** (unrestricted angles with visual feedback)
- [ ] **Proportional scaling** (maintain aspect ratios)
- [ ] **Pivot point adjustment** (custom rotation/scale centers)
- [ ] **Transform constraints** (lock axes during operations)
- [ ] **Snap to other objects** (align with existing shapes)
- [ ] **Transform gizmos** (professional 3D manipulation handles)

#### Smart Building Assistance

- [ ] **Auto-align tools** (snap to edges, centers, corners)
- [ ] **Measurement tools** (distance indicators, rulers)
- [ ] **Construction guides** (temporary helper lines/planes)
- [ ] **Symmetry tools** (mirror operations)
- [ ] **Array/pattern tools** (duplicate in patterns)

#### Advanced Materials & Rendering

- [ ] **Material library** (wood, metal, glass, plastic textures)
- [ ] **Custom textures** (image-based materials)
- [ ] **Lighting controls** (multiple light sources)
- [ ] **Shadow settings** (soft shadows, ambient occlusion)
- [ ] **Render quality options** (performance vs quality)

#### Professional Tools

- [ ] **Measurement annotations** (dimension display on shapes)
- [ ] **Cross-section view** (cut planes for complex scenes)
- [ ] **Orthographic views** (top, front, side projections)
- [ ] **Blueprint mode** (technical drawing style)
- [ ] **Animation timeline** (simple keyframe animation)

#### Export & Sharing

- [ ] **3D model export** (GLTF, OBJ formats)
- [ ] **High-quality renders** (ray-traced images)
- [ ] **360° scene export** (interactive web viewer)
- [ ] **Share via URL** (cloud-based scene sharing)
- [ ] **Collaboration tools** (real-time multi-user editing)

#### Performance & Quality

- [ ] **Level-of-detail (LOD) system** (optimize for complex scenes)
- [ ] **Instanced rendering** (efficient duplicate shapes)
- [ ] **Frustum culling** (only render visible objects)
- [ ] **Mobile optimization** (touch-friendly interface)
- [ ] **Offline mode** (PWA capabilities)

---

## Development Phases

### Phase 1: Foundation (1-2 weeks)

Complete all **Basic Features** to have a working prototype where users can place, select, and modify basic geometric shapes.

### Phase 2: MVP (2-4 weeks)

Add **MVP Features** to create a usable geometry builder with advanced editing, save/load, and expanded shape library.

### Phase 3: Advanced (4-8 weeks)

Implement **Advanced Features** based on user feedback and priorities. Focus on transform tools and professional features.

### Phase 4: Polish & Scale (Ongoing)

Performance optimization, mobile support, collaboration features, and advanced rendering.

---

## Technical Implementation Notes

### Shape Data Structure

```javascript
{
  id: "unique-id",
  type: "rectangle", // rectangle, cylinder, sphere, cone, triangle, pyramid
  position: [x, y, z],
  rotation: [x, y, z], // Euler angles in radians
  scale: [x, y, z], // Non-uniform scaling
  dimensions: {
    // Shape-specific properties
    width: 2,
    height: 1,
    depth: 3,
    // For cylinders: radius, height, radialSegments
    // For spheres: radius, widthSegments, heightSegments
  },
  material: {
    color: "#ff0000",
    type: "standard", // basic, standard, physical
    roughness: 0.5,
    metalness: 0.0,
    opacity: 1.0
  },
  selected: false,
  visible: true
}
```

### Grid System

```javascript
const GRID_SIZES = [0.25, 0.5, 1, 2, 5]; // Available grid spacings
const DEFAULT_GRID_SIZE = 1;

function snapToGrid(position, gridSize) {
  return [
    Math.round(position[0] / gridSize) * gridSize,
    Math.round(position[1] / gridSize) * gridSize,
    Math.round(position[2] / gridSize) * gridSize,
  ];
}
```

### Transform Handle System

- **Position**: XYZ arrow gizmos for movement
- **Scale**: Corner/edge handles for resizing
- **Rotation**: Ring gizmos around each axis
- **Unified**: Combined transform tool (like Blender)

### Performance Considerations

- Use instanced rendering for identical shapes
- Implement LOD for complex geometries
- Use simplified collision shapes for interaction
- Optimize material sharing between similar shapes
- Consider using workers for heavy calculations

---

## Success Metrics

- **Basic**: User can create simple structures (house, tower, furniture)
- **MVP**: User can build complex architectural models with precision
- **Advanced**: User can create professional-quality 3D scenes with custom materials and lighting

Start with the Basic Features checklist and work your way up. Each tier builds upon the previous one, ensuring a solid foundation for your 3D geometry builder!

## File Structure

```
src/
├── components/
│   ├── 3D/
│   │   ├── Shape.jsx
│   │   ├── Scene.jsx
│   │   ├── Grid.jsx
│   │   ├── TransformControls.jsx
│   │   └── Lights.jsx
│   ├── UI/
│   │   ├── ShapePicker.jsx
│   │   ├── PropertyPanel.jsx
│   │   ├── ColorPicker.jsx
│   │   ├── Toolbar.jsx
│   │   └── SaveLoad.jsx
│   └── Layout/
│       ├── Header.jsx
│       └── Sidebar.jsx
├── store/
│   ├── useShapeStore.js
│   ├── useUIStore.js
│   └── index.js
├── utils/
│   ├── shapeUtils.js
│   ├── gridUtils.js
│   ├── transformUtils.js
│   └── constants.js
└── App.jsx
```
