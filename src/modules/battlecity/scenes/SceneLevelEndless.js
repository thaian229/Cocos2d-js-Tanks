/**
 * Simple Battle City Level Endless
 */

STATE_PLAYING = 0;
STATE_GAMEOVER = 1;
MAX_CONTAINT_WIDTH = 100;
MAX_CONTAINT_HEIGHT = 100;

var g_sharedGameLayer;

var SceneLevelEndless = cc.Layer.extend({
    _player: null,
    _explosions: null,
    _state: STATE_PLAYING,
    map: null,
    playerSpawnPoint: null,
    enemySpawnPoints: [],
    scoreLabel: null,
    hpLabel: null,
    _tmpScore: 0,
    _spawnRate: 2.0,
    _deltaTimeSinceSpawned: 0.0,
    _itemMenu: null,
    _beginPos: 0,
    isMouseDown: false,

    ctor: function () {
        this._super();
        this.loadGui();
    },

    loadGui: function () {
        this.removeAllChildren();
        var size = cc.winSize;

        // reset global values
        BC.CONTAINER.ENEMIES = [];
        BC.CONTAINER.ENEMY_BULLETS = [];
        BC.CONTAINER.PLAYER_BULLETS = [];
        BC.CONTAINER.WALLS = [];
        BC.ACTIVE_ENEMIES = 0;

        BC.SCORE = 0;
        this._state = STATE_PLAYING;

        // Add tilemap
        this.map = cc.TMXTiledMap.create("battlecity/TileMap/BC_1.tmx");
        this.addChild(this.map, 0);
        this.map.setPosition(size.width / 2 - this.map.width / 2, 0);

        this.createWallsColliders();
        this.getTMXObjects();

        g_sharedGameLayer = this.map;

        // Player
        this._player = new Player();
        this.map.addChild(this._player, this._player.zOrder, BC.UNIT_TAG.PLAYER);
        this._player.x = this.playerSpawnPoint.x + BC.TILE_SIZE;
        this._player.y = this.playerSpawnPoint.y + BC.TILE_SIZE;

        // Event listeners
        this.addKeyboardListener();

        // schedule
        this.scheduleUpdate();

        // Add score counter
        this.scoreLabel = cc.LabelTTF("Score: 0", "battlecity/Pixeboy.ttf", 48);
        this.scoreLabel.attr({
            anchorX: 1,
            anchorY: 0,
            x: size.width - 25,
            y: size.height - 50
        });
        this.addChild(this.scoreLabel, 10);

        // Add HP counter
        this.hpLabel = cc.LabelTTF("HP: 4", "battlecity/Pixeboy.ttf", 48);
        this.hpLabel.attr({
            anchorX: 0,
            anchorY: 0,
            x: 25,
            y: size.height - 50
        });
        this.addChild(this.hpLabel, 10);

        // Add button back
        var btnBack = gv.commonButton(100, 64, size.width - 70, 52, "Back");
        this.addChild(btnBack, 10);
        btnBack.addClickEventListener(this.onSelectBack.bind(this));

        // Presetting Object Pools
        Bullet.preSet();
        Enemy.preSet();
    },

    createWallsColliders: function () {
        var wallLayer = this.map.getLayer("wall");
        for (var i = 0; i < 25; i++) {
            for (var j = 0; j < 25; j++) {
                var sprite = wallLayer.getTileAt(cc.p(i, j));
                if (!sprite) continue;
                var k = Math.floor(Math.random() * 2) + 1;
                if (i === 0 || i === 24 || j === 0 || j === 24) k = 0;
                var wall = new Wall(sprite, BC.WallType[k]);
                this.map.addChild(wall, 0, 5000);
                wall.active = true;
                wall.visible = true;
                BC.CONTAINER.WALLS.push(wall);
            }
        }
    },

    getTMXObjects: function () {
        var objGroup = this.map.getObjectGroup("object");
        this.playerSpawnPoint = objGroup.getObject("p_sp");
        for (var i = 1; i <= 4; i++) {
            var enemySpawn = objGroup.getObject("e_sp_" + i);
            this.enemySpawnPoints.push(enemySpawn);
        }
    },

    addKeyboardListener: function () {
        if (cc.sys.capabilities.hasOwnProperty('keyboard')) {
            cc.eventManager.addListener({
                event: cc.EventListener.KEYBOARD,
                onKeyPressed: function (key, event) {
                    if (key === cc.KEY.w || key === cc.KEY.s || key === cc.KEY.up || key === cc.KEY.down || key === cc.KEY.a || key === cc.KEY.d || key === cc.KEY.left || key === cc.KEY.right) {
                        BC.KEYS[cc.KEY.a] = false;
                        BC.KEYS[cc.KEY.d] = false;
                        BC.KEYS[cc.KEY.left] = false;
                        BC.KEYS[cc.KEY.right] = false;
                        BC.KEYS[cc.KEY.w] = false;
                        BC.KEYS[cc.KEY.s] = false;
                        BC.KEYS[cc.KEY.up] = false;
                        BC.KEYS[cc.KEY.down] = false;
                    }
                    BC.KEYS[key] = true;
                },
                onKeyReleased: function (key, event) {
                    BC.KEYS[key] = false;
                }
            }, this);
        }
    },

    update: function (dt) {
        if (this._state === STATE_PLAYING) {
            this._spawnRate = 2.0 + 0.25 * BC.ACTIVE_ENEMIES;
            this.checkIsCollide();
            this.checkIsBlocked();
            this.updateUI();
            this.updateEnemiesMoveDirection();
            this.checkPlayerDied();
            this.spawnEnemies(dt);
        }
    },

    checkIsCollide: function () {
        var enemyNode, bulletNode, wallNode;

        // check collide of Player's bullet & Enemies
        var i, player = this._player;
        for (i = 0; i < BC.CONTAINER.ENEMIES.length; i++) {
            enemyNode = BC.CONTAINER.ENEMIES[i];
            if (!enemyNode.active)
                continue;

            for (var j = 0; j < BC.CONTAINER.PLAYER_BULLETS.length; j++) {
                bulletNode = BC.CONTAINER.PLAYER_BULLETS[j];
                if (bulletNode.active && this.collide(bulletNode, enemyNode)) {
                    bulletNode.hurt();
                    enemyNode.hurt();
                }
            }
        }

        // Check collide of Enemies' bullets & Player
        for (i = 0; i < BC.CONTAINER.ENEMY_BULLETS.length; i++) {
            bulletNode = BC.CONTAINER.ENEMY_BULLETS[i];
            if (bulletNode.active && this.collide(bulletNode, player)) {
                if (player.active) {
                    bulletNode.hurt();
                    player.hurt();
                }
            }
        }

        // Check collide bullets & walls
        for (i = 0; i < BC.CONTAINER.PLAYER_BULLETS.length; i++) {
            bulletNode = BC.CONTAINER.PLAYER_BULLETS[i];
            if (!bulletNode.active) continue;
            for (j = 0; j < BC.CONTAINER.WALLS.length; j++) {
                wallNode = BC.CONTAINER.WALLS[j];
                if (!wallNode.active) continue;
                if (this.collide(bulletNode, wallNode)) {
                    bulletNode.hurt();
                    wallNode.hurt();
                }
            }
        }

        for (i = 0; i < BC.CONTAINER.ENEMY_BULLETS.length; i++) {
            bulletNode = BC.CONTAINER.ENEMY_BULLETS[i];
            if (!bulletNode.active) continue;
            for (j = 0; j < BC.CONTAINER.WALLS.length; j++) {
                wallNode = BC.CONTAINER.WALLS[j];
                if (!wallNode.active) continue;
                if (this.collide(bulletNode, wallNode)) {
                    bulletNode.hurt();
                    wallNode.hurt();
                }
            }
        }

    },

    checkIsBlocked: function () {
        var enemyNode, wallNode, i = 0, j = 0, player = this._player;
        player.resetBlocked();
        // check player is blocked
        for (i = 0; i < BC.CONTAINER.WALLS.length; i++) {
            wallNode = BC.CONTAINER.WALLS[i];
            if (wallNode.active && this.collide(player, wallNode)) {
                if (wallNode.x + BC.TILE_SIZE / 2 >= player.x + BC.TILE_SIZE && Math.abs(wallNode.y + BC.TILE_SIZE / 2 - player.y) < BC.TILE_SIZE) player.isBlocked.RIGHT = true;
                if (wallNode.x + BC.TILE_SIZE / 2 < player.x - BC.TILE_SIZE && Math.abs(wallNode.y + BC.TILE_SIZE / 2 - player.y) < BC.TILE_SIZE) player.isBlocked.LEFT = true;
                if (wallNode.y + BC.TILE_SIZE / 2 >= player.y + BC.TILE_SIZE && Math.abs(wallNode.x + BC.TILE_SIZE / 2 - player.x) < BC.TILE_SIZE) player.isBlocked.UP = true;
                if (wallNode.y + BC.TILE_SIZE / 2 < player.y - BC.TILE_SIZE && Math.abs(wallNode.x + BC.TILE_SIZE / 2 - player.x) < BC.TILE_SIZE) player.isBlocked.DOWN = true;
            }
        }
    },

    updateUI: function () {
        if (this._tmpScore < BC.SCORE) {
            this._tmpScore++;
        }
        this.scoreLabel.setString("Score: " + this._tmpScore);
        this.hpLabel.setString("HP: " + this._player.HP);
    },

    checkPlayerDied: function () {
        var player = this._player;
        if (player.HP <= 0) {
            this._state = STATE_GAMEOVER;
            this._player = null;
            this.runAction(cc.sequence(
                cc.delayTime(0.2),
                cc.callFunc(this.onGameOver, this)
            ));
        }
    },

    spawnEnemies: function (dt) {
        if (BC.ACTIVE_ENEMIES >= BC.MAX_ENEMIES) {
            return;
        }
        this._deltaTimeSinceSpawned += dt;
        if (this._deltaTimeSinceSpawned >= this._spawnRate) {
            this._deltaTimeSinceSpawned = 0.0;
            var enemyTypeIndex = Math.floor(Math.random() * BC.EnemyType.length);
            var addEnemy = Enemy.getOrCreateEnemy(BC.EnemyType[enemyTypeIndex]);
            var spawnPointIndex = Math.floor(Math.random() * this.enemySpawnPoints.length);
            addEnemy.x = this.enemySpawnPoints[spawnPointIndex].x + BC.TILE_SIZE;
            addEnemy.y = this.enemySpawnPoints[spawnPointIndex].y + BC.TILE_SIZE;
        }
    },

    collide: function (a, b) {
        var ax = a.x, ay = a.y, bx = b.x, by = b.y;
        if (Math.abs(ax - bx) > MAX_CONTAINT_WIDTH || Math.abs(ay - by) > MAX_CONTAINT_HEIGHT)
            return false;
        // get 2 collider Rect (box) and check intersection
        var aRect = a.collideRect(ax, ay);
        var bRect = b.collideRect(bx, by);
        return cc.rectIntersectsRect(aRect, bRect);
    },

    updateEnemiesMoveDirection: function () {
        var i, enemyNode, playerNode = this._player;

        for (i = 0; i < BC.CONTAINER.ENEMIES.length; i++) {
            enemyNode = BC.CONTAINER.ENEMIES[i];
            if (!enemyNode.active) continue;

            if (Math.abs(playerNode.x - enemyNode.x) < BC.TILE_SIZE / 5 && Math.abs(playerNode.y - enemyNode.y) > BC.TILE_SIZE / 3) {
                if (playerNode.y >= enemyNode.y) enemyNode._moveDirection = BC.DIRECTION.UP;
                if (playerNode.y < enemyNode.y) enemyNode._moveDirection = BC.DIRECTION.DOWN;
            }

            if (Math.abs(playerNode.y - enemyNode.y) < BC.TILE_SIZE / 5 && Math.abs(playerNode.x - enemyNode.x) > BC.TILE_SIZE / 3) {
                if (playerNode.x >= enemyNode.x) enemyNode._moveDirection = BC.DIRECTION.RIGHT;
                if (playerNode.x < enemyNode.x) enemyNode._moveDirection = BC.DIRECTION.LEFT;
            }
        }
    },

    onGameOver: function () {
        fr.view(SceneGameOver);
    },

    onEnter: function () {
        this._super();
    },

    onSelectBack: function (sender) {
        fr.view(SceneMenu);
    }
});