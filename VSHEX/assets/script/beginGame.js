//主要用于开始游戏按钮的控制
var bgSoundState = require('start');

cc.Class({
    extends: cc.Component,

    properties: {
        btnSound: {
            default: null,
            url: cc.AudioClip
        },
    },

    onclick: function(){
        var gotoGame = cc.callFunc(function(){
            cc.log("Start Game!");
            cc.director.loadScene("game");
            this.node.destroy();
        },this)

        //开始按钮音效，如果游戏设置静音则不播放
        if(cc.sys.localStorage.getItem("MusicOpen") == "true"){
            cc.audioEngine.play(this.btnSound, false, 1);
        }
        
        //停止开始按钮的动画
        var animation = this.getComponent(cc.Animation);
        animation.stop();

        this.node.runAction(gotoGame);
    }

});
