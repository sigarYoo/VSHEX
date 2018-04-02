//主要用于控制游戏静音效果
var bgSoundState = require('start');

cc.Class({
    extends: cc.Component,

    properties: {
        
    },
    
    changePic: function(){
        var self = this;
        if(cc.sys.localStorage.getItem("MusicOpen") == "true"){
            //MusicOpen为true时，显示播放图标
            cc.loader.loadRes('textures/voice', cc.SpriteFrame, function (err, spriteFrame){
                if (err) {
                    cc.error(err.message || err);
                    return;
                }
                self.node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            });
        }else{
            //MusicOpen为false时，显示静音图标
            cc.loader.loadRes('textures/noVoice', cc.SpriteFrame, function (err, spriteFrame){
                if (err) {
                    cc.error(err.message || err);
                    return;
                }
                self.node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            });
        }
    },

    onclick: function(){
        cc.find("Canvas").getComponent(bgSoundState).setbgSound();
        this.changePic();
    },
    
    onLoad: function(){
        this.changePic();
    }

});
