cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    onClick: function(){
        cc.log("重新开始游戏！");
        cc.director.loadScene("game");
    }
});
