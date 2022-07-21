
var BC = BC || {};

// Character scaling
BC.SCALING = 0.2;
BC.BULLET_OFFSET = 35;

BC.TILE_SIZE = 32;

// Map size
BC.MAP_SIZE = {
    height: BC.TILE_SIZE * 25,
    width: BC.TILE_SIZE * 25
};

//game state
BC.GAME_STATE = {
    HOME: 0,
    PLAY: 1,
    OVER: 2
};

//keys
BC.KEYS = [];

//level
BC.LEVEL = {
    STAGE1: 1,
    STAGE2: 2,
};

//score
BC.SCORE = 0;

//sound
BC.SOUND = true;

//unit tag
BC.UNIT_TAG = {
    ENEMY_BULLET: 900,
    PLAYER_BULLET: 901,
    ENEMY: 1000,
    PLAYER: 1000
};

//container
BC.CONTAINER = {
    ENEMIES:[],
    ENEMY_BULLETS:[],
    PLAYER_BULLETS:[],
    WALLS: []
};

//bullet speed and directions
BC.BULLET_SPEED = BC.TILE_SIZE * 6;

// Rotation
BC.ROTATION = {
    LEFT: 270.0,
    RIGHT: 90.0,
    UP: 0.0,
    DOWN: 180.0
};

BC.DIRECTION = {
    LEFT: {
        x: -BC.BULLET_SPEED,
        y: 0,
        offset_x: -BC.BULLET_OFFSET,
        offset_y: 0,
        rotation: BC.ROTATION.LEFT
    },
    RIGHT: {
        x: BC.BULLET_SPEED,
        y: 0,
        offset_x: BC.BULLET_OFFSET,
        offset_y: 0,
        rotation: BC.ROTATION.RIGHT
    },
    UP: {
        x: 0,
        y: BC.BULLET_SPEED,
        offset_x: 0,
        offset_y: BC.BULLET_OFFSET,
        rotation: BC.ROTATION.UP
    },
    DOWN: {
        x: 0,
        y: -BC.BULLET_SPEED,
        offset_x: 0,
        offset_y: -BC.BULLET_OFFSET,
        rotation: BC.ROTATION.DOWN
    }
};

//bullet type
BC.BULLET_TYPE = {
    PLAYER: 1,
    ENEMY: 2
};

// the counter of active enemies
BC.ACTIVE_ENEMIES = 0;

// max concurrent enemies
BC.MAX_ENEMIES = 7;

BC.EnemyType = [
    {
        type: 0,
        hullPath: "battlecity/sprites/color_c/Hull_02.png",
        gunPath: "battlecity/sprites/color_c/Gun_03.png",
        MaxHP: 2,
        scoreValue: 35,
        moveSpeed: BC.TILE_SIZE * 3,
        fireRate: 3.5,
    },
    {
        type: 1,
        hullPath: "battlecity/sprites/color_d/Hull_06.png",
        gunPath: "battlecity/sprites/color_d/Gun_08.png",
        MaxHP: 3,
        scoreValue: 50,
        moveSpeed: BC.TILE_SIZE * 2,
        fireRate: 2.5
    }
];

BC.WallType = [
    {
        type: 0,
        MaxHP: 999,
        isDestroyable: false
    },
    {
        type: 1,
        MaxHP: 3,
        isDestroyable: true
    },
    {
        type: 2,
        MaxHP: 5,
        isDestroyable: true
    }
];