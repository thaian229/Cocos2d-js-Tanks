/*
* Enemy class, with move, attack, collision, etc.
* */

var Enemy = cc.Sprite.extend({
    _gunSprite: null,
    _deltaSinceShoot: 2.0,
    _fireRate: 2.0,
    eID: 0,
    active: false,
    zOrder: 1,
    _HP: 1,
    enemyType: null,
    _moveSpeed: 32 * 2,
    _moveDirection: null,
    isBlocked: {
        LEFT: false,
        RIGHT: false,
        UP: false,
        DOWN: false
    },

    ctor: function (enemyType) {
        this.enemyType = enemyType;
        this._super(this.enemyType.hullPath);

        // Init fields
        this._moveDirection = BC.DIRECTION.UP;
        this._HP = this.enemyType.MaxHP;
        this._fireRate = this.enemyType.fireRate;
        this._moveSpeed = this.enemyType.moveSpeed;

        // Add gun
        this._gunSprite = cc.Sprite.create(this.enemyType.gunPath);
        this.addChild(this._gunSprite, this.zOrder + 1);
        this._gunSprite.setPosition(this.width / 2, this.height / 2);


        // Schedule
        // this.scheduleUpdate();
    },

    update: function (dt) {
        this.updateMove(dt);
        this.shoot(dt);
        if (this._HP <= 0) {
            this.destroy();
        }
    },

    updateMove: function (dt) {
        this.updateMoveDirection();

        if (this._moveDirection === BC.DIRECTION.UP && this.y <= BC.MAP_SIZE.height && !this.isBlocked.UP) {
            this.y += dt * this._moveSpeed;
            this.setRotation(BC.ROTATION.UP);
        }
        if (this._moveDirection === BC.DIRECTION.DOWN && this.y >= 0 && !this.isBlocked.DOWN) {
            this.y -= dt * this._moveSpeed;
            this.setRotation(BC.ROTATION.DOWN);
        }
        if (this._moveDirection === BC.DIRECTION.LEFT && this.x >= 0 && !this.isBlocked.LEFT) {
            this.x -= dt * this._moveSpeed;
            this.setRotation(BC.ROTATION.LEFT);
        }
        if (this._moveDirection === BC.DIRECTION.RIGHT && this.x <= BC.MAP_SIZE.width && !this.isBlocked.RIGHT) {
            this.x += dt * this._moveSpeed;
            this.setRotation(BC.ROTATION.RIGHT);
        }
    },

    updateMoveDirection: function () {
        this.resetBlocked();
        for (j = 0; j < BC.CONTAINER.WALLS.length; j++) {
            var wallNode = BC.CONTAINER.WALLS[j];
            if (wallNode.active && this.collide(this, wallNode)) {
                if (wallNode.x + BC.TILE_SIZE / 2 >= this.x + BC.TILE_SIZE && Math.abs(wallNode.y + BC.TILE_SIZE / 2 - this.y) < BC.TILE_SIZE) this.isBlocked.RIGHT = true;
                if (wallNode.x + BC.TILE_SIZE / 2 < this.x - BC.TILE_SIZE && Math.abs(wallNode.y + BC.TILE_SIZE / 2 - this.y) < BC.TILE_SIZE) this.isBlocked.LEFT = true;
                if (wallNode.y + BC.TILE_SIZE / 2 >= this.y + BC.TILE_SIZE && Math.abs(wallNode.x + BC.TILE_SIZE / 2 - this.x) < BC.TILE_SIZE) this.isBlocked.UP = true;
                if (wallNode.y + BC.TILE_SIZE / 2 < this.y - BC.TILE_SIZE && Math.abs(wallNode.x + BC.TILE_SIZE / 2 - this.x) < BC.TILE_SIZE) this.isBlocked.DOWN = true;
            }
        }
        if (
            (this._moveDirection === BC.DIRECTION.UP && this.isBlocked.UP)
            || (this._moveDirection === BC.DIRECTION.DOWN && this.isBlocked.DOWN)
            || (this._moveDirection === BC.DIRECTION.LEFT && this.isBlocked.LEFT)
            || (this._moveDirection === BC.DIRECTION.RIGHT && this.isBlocked.RIGHT)
        ) {
            var randomDirection = Math.floor(Math.random() * 4);
            switch (randomDirection) {
                case 0:
                    this._moveDirection = BC.DIRECTION.UP;
                    break;
                case 1:
                    this._moveDirection = BC.DIRECTION.DOWN;
                    break;
                case 2:
                    this._moveDirection = BC.DIRECTION.LEFT;
                    break;
                case 3:
                    this._moveDirection = BC.DIRECTION.RIGHT;
                    break;
                default:
                    break;
            }
        }
    },

    destroy: function () {
        BC.SCORE += this.enemyType.scoreValue;
        // Hide enemy
        this.visible = false;
        this.active = false;
        this.unscheduleUpdate();
        BC.ACTIVE_ENEMIES--;
    },

    shoot: function (dt) {
        this._deltaSinceShoot += dt;
        if (this._deltaSinceShoot >= this._fireRate) {
            var x = this.x, y = this.y;
            var b = Bullet.getOrCreateBullet(this._moveDirection, 2, BC.UNIT_TAG.ENEMY_BULLET);
            b.x = x + this._moveDirection.offset_x;
            b.y = y + this._moveDirection.offset_y;
            this._deltaSinceShoot = 0.0;
        }
    },

    hurt: function () {
        this._HP--;
    },

    collideRect: function (x, y) {
        var w = this.width * BC.SCALING, h = this.height * BC.SCALING;
        return cc.rect(x - w / 2, y - h / 2, w, h);
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

    resetBlocked: function () {
        this.isBlocked.LEFT = false;
        this.isBlocked.RIGHT = false;
        this.isBlocked.UP = false;
        this.isBlocked.DOWN = false;
    }
});

Enemy.getOrCreateEnemy = function (enemyType) {
    var enemy = null;
    for (var j = 0; j < BC.CONTAINER.ENEMIES.length; j++) {
        enemy = BC.CONTAINER.ENEMIES[j];

        if (enemy.active === false && enemy.enemyType === enemyType) {
            enemy._HP = enemyType.MaxHP;
            enemy.active = true;
            enemy.visible = true;
            enemy.scheduleUpdate();
            BC.ACTIVE_ENEMIES++;
            return enemy;
        }
    }
    enemy = Enemy.create(enemyType);
    enemy.visible = true;
    enemy.active = true;
    enemy.scheduleUpdate();
    BC.ACTIVE_ENEMIES++;
    return enemy;
};

Enemy.create = function (enemyType) {
    var enemy = new Enemy(enemyType);
    g_sharedGameLayer.addChild(enemy, enemy.zOrder, BC.UNIT_TAG.ENEMY);
    enemy.setScale(BC.SCALING);
    BC.CONTAINER.ENEMIES.push(enemy);
    return enemy;
};

Enemy.preSet = function () {
    var enemy = null;
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < BC.EnemyType.length; j++) {
            enemy = Enemy.create(BC.EnemyType[j]);
            enemy.visible = false;
            enemy.active = false;
        }
    }
};