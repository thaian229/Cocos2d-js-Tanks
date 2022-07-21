/*
* Hold bullet sprite, move bullet and define bullet collision
* */

var Bullet = cc.Sprite.extend({
    active: true,
    moveDirection: null,
    HP: 1,
    zOrder: 2,

    ctor: function (moveDirection) {
        this._super("battlecity/sprites/Light_Shell.png");

        this.moveDirection = moveDirection;
        this.scheduleUpdate();
    },

    update: function (dt) {
        this.x += this.moveDirection.x * dt;
        this.y += this.moveDirection.y * dt;
        if (this.x <= 0 || this.x >= BC.MAP_SIZE.width || this.y <= 0 || this.y >= BC.MAP_SIZE.height || this.HP <= 0) {
            this.destroy();
        }
    },

    destroy: function () {
        this.active = false;
        this.visible = false;
    },

    hurt: function () {
        this.HP--;
    },

    // Get collision detect rect for checking
    collideRect: function (x, y) {
        return cc.rect(x - 2, y - 2, 4, 4);
    }
});

Bullet.getOrCreateBullet = function (moveDirection, zOrder, bullet_source) {
    /**/
    var bullet = null;
    if (bullet_source === BC.UNIT_TAG.PLAYER_BULLET) {
        for (var j = 0; j < BC.CONTAINER.PLAYER_BULLETS.length; j++) {
            bullet = BC.CONTAINER.PLAYER_BULLETS[j];
            if (bullet.active === false) {
                bullet.visible = true;
                bullet.HP = 1;
                bullet.active = true;
                bullet.moveDirection = moveDirection;
                bullet.setRotation(bullet.moveDirection.rotation);
                return bullet;
            }
        }
    }
    else {
        for (var j = 0; j < BC.CONTAINER.ENEMY_BULLETS.length; j++) {
            bullet = BC.CONTAINER.ENEMY_BULLETS[j];
            if (bullet.active === false) {
                bullet.visible = true;
                bullet.HP = 1;
                bullet.active = true;
                bullet.moveDirection = moveDirection;
                bullet.setRotation(bullet.moveDirection.rotation);
                return bullet;
            }
        }
    }
    bullet = Bullet.create(moveDirection, zOrder, bullet_source);
    return bullet;
};

Bullet.create = function (moveDirection, zOrder, bullet_source) {
    var bullet = new Bullet(moveDirection);
    g_sharedGameLayer.addChild(bullet, zOrder, bullet_source);
    if (bullet_source === BC.UNIT_TAG.PLAYER_BULLET) {
        BC.CONTAINER.PLAYER_BULLETS.push(bullet);
    } else {
        BC.CONTAINER.ENEMY_BULLETS.push(bullet);
    }
    return bullet;
};

Bullet.preSet = function () {
    var bullet = null;
    for (var i = 0; i < 10; i++) {
        bullet = Bullet.create(BC.DIRECTION.UP, 2, BC.UNIT_TAG.PLAYER_BULLET);
        bullet.visible = false;
        bullet.active = false;
    }
    for (var j = 0; j < 10; j++) {
        bullet = Bullet.create(BC.DIRECTION.UP, 2, BC.UNIT_TAG.ENEMY_BULLET);
        bullet.visible = false;
        bullet.active = false;
    }
};

