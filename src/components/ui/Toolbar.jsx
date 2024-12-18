import { useState } from 'react';
import useBrickStore, { BRICK_COLORS } from '../../stores/brickStore';
import { Undo2, Redo2, Trash2 } from 'lucide-react';

// Side Panel Component
const SidePanel = () => {
    const [brickConfig, setBrickConfig] = useState({
        width: 2,
        length: 4,
        color: BRICK_COLORS.RED
    });

    const startPlacingBrick = useBrickStore((state) => state.startPlacingBrick);
    const placingBrick = useBrickStore((state) => state.placingBrick);
    const cancelPlacement = useBrickStore((state) => state.cancelPlacement);

    const handleSliderChange = (e) => {
        const { name, value } = e.target;
        setBrickConfig(prev => ({
            ...prev,
            [name]: parseFloat(value)
        }));
    };

    const handleConfirm = () => {
        // If we're already placing a brick, cancel it
        if (placingBrick) {
            cancelPlacement();
        }
        // Start placing new brick
        startPlacingBrick(brickConfig);
    };

    return (
        <div className="absolute left-4 top-4 bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg w-64">
            <div className="space-y-6">
                {/* Sliders */}
                {[
                    { name: 'width', label: 'Width', min: 1, max: 8 },
                    { name: 'length', label: 'Length', min: 1, max: 8 }
                ].map(({ name, label, min, max }) => (
                    <div key={name} className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-sm font-medium text-gray-700">{label}</label>
                            <span className="text-sm text-gray-500">{brickConfig[name]}</span>
                        </div>
                        <input
                            type="range"
                            name={name}
                            min={min}
                            max={max}
                            step="1"
                            value={brickConfig[name]}
                            onChange={handleSliderChange}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                ))}

                {/* Rotate Toggle */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Rotate</label>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 rounded border-gray-300"
                        />
                    </div>
                </div>

                {/* Color Picker */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Color</label>
                    <div className="grid grid-cols-4 gap-2">
                        {Object.entries(BRICK_COLORS).map(([name, color]) => (
                            <button
                                key={name}
                                onClick={() => setBrickConfig(prev => ({ ...prev, color }))}
                                className={`w-8 h-8 rounded-md hover:scale-110 transition-transform ${brickConfig.color === color ? 'ring-2 ring-blue-500' : ''
                                    }`}
                                style={{ backgroundColor: color }}
                                aria-label={name.toLowerCase().replace('_', ' ')}
                            />
                        ))}
                    </div>
                </div>

                {/* Confirm Button */}
                <button
                    onClick={handleConfirm}
                    className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${placingBrick ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                >
                    {placingBrick ? 'Cancel Placement' : 'Place Brick'}
                </button>
            </div>
        </div>
    );
};

// Bottom Toolbar Component
const BottomToolbar = () => {
    return (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
            <div className="flex gap-4">
                <button className="p-2 hover:bg-gray-100 rounded-md" aria-label="Undo">
                    <Undo2 className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-md" aria-label="Redo">
                    <Redo2 className="w-5 h-5" />
                </button>
                <div className="w-px bg-gray-200" /> {/* Divider */}
                <button className="p-2 hover:bg-gray-100 rounded-md" aria-label="Delete">
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

// Main Controls Component
const LegoControls = () => {
    return (
        <div className='absolute z-50'>
            <SidePanel />
            <BottomToolbar />
        </div>
    );
};

export default LegoControls;