import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'

// Standard LEGO-like colors
export const BRICK_COLORS = {
    RED: '#CC0000',
    BLUE: '#0055BF',
    YELLOW: '#FFD700',
    GREEN: '#237841',
    BLACK: '#05131D',
    WHITE: '#FFFFFF',
    ORANGE: '#FE8A18',
    BROWN: '#583927',
    GRAY: '#9BA19D',
    DARK_GRAY: '#6C6E68',
    PURPLE: '#81007B',
    LIME: '#D7F000',
    PINK: '#FC97AC',
    TAN: '#E4CD9E',
}

const useBrickStore = create((set) => ({
    bricks: [],
    // New state for brick being placed
    placingBrick: null,

    startPlacingBrick: (config) => set({
        placingBrick: {
            ...config,
            // id: uuidv4(),
        }
    }),

    confirmPlacement: (position) => set((state) => ({
        bricks: [...state.bricks, { ...state.placingBrick, position }],
        // placingBrick: null
    })),

    cancelPlacement: () => set({ placingBrick: null }),

    addBrick: (brick) => set((state) => ({
        bricks: [...state.bricks, {
            id: uuidv4(),
            position: brick.position || [0, 5, 0],
            color: brick.color || BRICK_COLORS.RED,
            width: brick.width || 2,
            length: brick.length || 4,
        }]
    })),

    removeBrick: (id) => set((state) => ({
        bricks: state.bricks.filter(brick => brick.id !== id)
    })),
}))

export default useBrickStore