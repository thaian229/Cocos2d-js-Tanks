
var Wall = cc.Node.extend({
    wallTileSprite: null,
    _HP: 2,
    _wallType: null, // use Sprite's TextureAtlas Index

    ctor: function (sprite, wallType) {
        this._super();
        this.wallTileSprite = sprite;
        this._wallType = wallType;
        this._HP = this._wallType.MaxHP;
        this.x = this.wallTileSprite.x;
        this.y = this.wallTileSprite.y;

        this.scheduleUpdate();
    },

    update: function (dt) {
        if (this._HP <= 0) {
            this.destroy();
        }
    },

    destroy: function () {
        if (this._wallType.isDestroyable) {
            this.wallTileSprite.active = false;
            this.wallTileSprite.visible = false;

            this.unscheduleUpdate();
            this.active = false;
            this.visible = false;
        }
    },

    hurt: function () {
        if (this._wallType.isDestroyable) {
            this._HP--;
            this.wallTileSprite.setOpacity(this._HP * 255 / this._wallType.MaxHP + 25 );
        }
    },

    // Get collision detect rect for checking
    collideRect: function (x, y) {
        return cc.rect(x + 2, y + 2, 32 - 4, 32 - 4);
    }
});