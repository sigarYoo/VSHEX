cc.Class({
    extends: cc.Component,

    properties: {
        //背景音是否开启，默认为true
        bgSound: {
           default: null,
           url: cc.AudioClip
        },
    },
    
    //判断是否静音，并进行相关操作
    setbgSound: function(){
        if(cc.sys.localStorage.getItem("MusicOpen") == "true"){
            //如果音乐正在播放，则静音
            cc.audioEngine.pause(this.bgS);
            cc.sys.localStorage.setItem("MusicOpen", "false");
            cc.log("静音");
        }else{
            //如果处于静音状态，则播放背景音
            if(this.bgS != null){
                cc.audioEngine.resume(this.bgS);
            }else{
                this.bgS = cc.audioEngine.play(this.bgSound, true, 0.5);
            }
            cc.sys.localStorage.setItem("MusicOpen", "true");
            cc.log("播放");
        }
    }, 

    onLoad: function(){
        if(cc.sys.localStorage.getItem("MusicOpen") == null){
            cc.log("初始化");
            cc.sys.localStorage.setItem("MusicOpen", "true");
        }
        if(cc.sys.localStorage.getItem("MusicOpen") == "true"){
            this.bgS = cc.audioEngine.play(this.bgSound, true, 0.5);
        }else{
            this.bgS = null;
        }
    },

    onDestroy: function () {
        cc.audioEngine.stop(this.bgS);
    },

});