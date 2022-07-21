/**
 * Created by GSN on 7/6/2015.
 */

var SceneMenu = cc.Layer.extend({
    _itemMenu:null,
    _beginPos:0,
    isMouseDown:false,
    titleLabel: null,

    ctor:function() {
        this._super();
        var size = cc.director.getVisibleSize();

        var yBtn = 3 * size.height / 5;

        this.titleLabel = cc.LabelTTF("BATTLE CITY", "battlecity/Pixeboy.ttf", 48 * 4);
        this.titleLabel.attr({
            anchorX: 0.5,
            anchorY: 0.5,
            x: size.width / 2,
            y: 3 * size.height / 5
        });
        this.addChild(this.titleLabel, 10);

        var btnStart = gv.commonButton(300, 96, cc.winSize.width/2, yBtn/2,"Start Game");
        this.addChild(btnStart);
        btnStart.addClickEventListener(this.onSelectStart.bind(this));

    },

    onEnter:function(){
        this._super();
    },

    onSelectStart:function(sender)
    {
        fr.view(SceneLevelEndless);
    }
});