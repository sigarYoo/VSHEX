cc.Class({
    extends: cc.Component,

    properties: {
       
    },

    onLoad: function(){
        var topScoreNode = cc.find("Canvas/topScore");
        var topScoreLabel = topScoreNode.getComponent(cc.Label);
        topScoreLabel.string = "最高分：" + (cc.sys.localStorage.getItem("topScore") || 0);
    },
});
