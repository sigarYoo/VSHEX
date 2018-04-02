cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    onLoad: function(){
        var newScoreNode = cc.find("Canvas/GameOver/lose/scoreTip");
        var newScoreLabel = newScoreNode.getComponent(cc.Label);
        newScoreLabel.string = cc.sys.localStorage.getItem("newScore") || 0;

        var topScoreNode = cc.find("Canvas/GameOver/lose/topScoreTip");
        var topScoreLabel = topScoreNode.getComponent(cc.Label);
        topScoreLabel.string = "最高分：" + (cc.sys.localStorage.getItem("topScore") || 0);
    }
});
