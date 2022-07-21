/**
 * Created by GSN on 7/6/2015.
 */

var SceneGameOver = cc.Layer.extend({
    _itemMenu:null,
    _beginPos:0,
    isMouseDown:false,
    titleLabel: null,
    scoreLabel: null,

    ctor:function() {
        this._super();
        var size = cc.director.getVisibleSize();

        this.titleLabel = cc.LabelTTF("You Died!!!", "battlecity/Pixeboy.ttf", 48 * 4);
        this.titleLabel.attr({
            anchorX: 0.5,
            anchorY: 0.5,
            x: size.width / 2,
            y: size.height / 2 + 48 * 2
        });
        this.addChild(this.titleLabel, 10);

        this.scoreLabel = cc.LabelTTF("Scored: " + BC.SCORE, "battlecity/Pixeboy.ttf", 48 * 4);
        this.scoreLabel.attr({
            anchorX: 0.5,
            anchorY: 0.5,
            x: size.width / 2,
            y: size.height / 2 - 48 * 2
        });
        this.addChild(this.scoreLabel, 10);

        // Add button back
        var btnBack = gv.commonButton(100, 64, size.width - 70, 52, "Back");
        this.addChild(btnBack, 10);
        btnBack.addClickEventListener(this.onSelectBack.bind(this));

    },

    onEnter: function () {
        this._super();
    },

    onSelectBack: function (sender) {
        fr.view(SceneMenu);
    }
});