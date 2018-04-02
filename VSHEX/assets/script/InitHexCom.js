//控制小六边形组件的生成、移动、放下等行为
const InitHex = require("InitHex");
const Util = require("Util");
const scaleNum = 0.7;
cc.Class({
    extends: cc.Component,

    properties: {
        HexFrame :{
            default: null,
            type: InitHex, 
        },
        ["HexH"]: 0, //小六边形的高
        ["HexA"]: 0, //小六边形的边长
        //1点
        ["HexPic1"]: {
            default: null,
            type: cc.SpriteFrame,
        },
        //2点
        ["HexPic2"]: {
            default: null,
            type: cc.SpriteFrame,
        },
        //3点
        ["HexPic3"]: {
            default: null,
            type: cc.SpriteFrame,
        },
        //4点
        ["HexPic4"]: {
            default: null,
            type: cc.SpriteFrame,
        },
        //5点
        ["HexPic5"]: {
            default: null,
            type: cc.SpriteFrame,
        },
        //点击组件音效
        clickSound: {
            default: null,
            url: cc.AudioClip,
        },
        //组件放入六边形框中音效
        putdownSound: {
            default: null,
            url: cc.AudioClip,
        },
        //组件无法放入六边形框时音效
        cannotSound: {
            default: null,
            url: cc.AudioClip,
        },
    },

    //记录不同组合方式
    HexCombination: function() {
        var HexA = this["HexA"];
        var HexH = this["HexH"];
        
        //存放组件的所有组合方式
        var hexComLists = [
            //1个小块的情况
            [cc.p(0,0)],

            //2个小块的情况
            [cc.p(0,0) , cc.p(HexH * 2,0)],//横摆

            [cc.p(0,0) , cc.p(HexH,HexA * 1.5)],//斜摆1
            [cc.p(0,0) , cc.p(HexH,-HexA * 1.5)],//斜摆2

            //3个小块的情况
            [cc.p(-HexH * 2,0) , cc.p(0,0) , cc.p(HexH * 2,0)],//横摆

            [cc.p(-HexH * 2,0) , cc.p(0,0) , cc.p(HexH,HexA * 1.5)],//2个横摆1
            [cc.p(-HexH * 2,0) , cc.p(0,0) , cc.p(HexH,-HexA * 1.5)],//2个横摆2
            [cc.p(-HexH,-HexA * 1.5) , cc.p(0,0) , cc.p(HexH,-HexA * 1.5)],//2个横摆3（堆1）
            [cc.p(-HexH,HexA * 1.5) , cc.p(0,0) , cc.p(HexH,HexA * 1.5)],//2个横摆4（堆2）

            [cc.p(-HexH,-HexA * 1.5) , cc.p(0,0) , cc.p(HexH,HexA * 1.5)],//斜上摆1
            [cc.p(-HexH,-HexA * 1.5) , cc.p(0,0) , cc.p(HexH * 2,0)],//斜上摆2
            [cc.p(-HexH,-HexA * 1.5) , cc.p(0,0) , cc.p(-HexH,HexA * 1.5)],//斜上摆3

            [cc.p(-HexH,HexA * 1.5) , cc.p(0,0) , cc.p(HexH,-HexA * 1.5)],//斜下摆1
            [cc.p(-HexH,HexA * 1.5) , cc.p(0,0) , cc.p(HexH * 2,0)],//斜下摆2
            [cc.p(-HexH,HexA * 1.5) , cc.p(0,0) , cc.p(-HexH,-HexA * 1.5)],//斜下摆3

        ];
        return hexComLists; 
    },

    //创建一个带点数的六边形小块
    createOneHex: function(numIndex){
        var node = new cc.Node("oneHex");
        var sprite = node.addComponent(cc.Sprite);
        sprite.spriteFrame = this["HexPic" + numIndex]
        return node;
    },

    //创建组件
    createHexComNode: function(){
        var HexComNode = new cc.Node("HexComNode");
        var HexCombination = this.HexCombination();

        //生成随机组合方式
        var pointNum = cc.sys.localStorage.getItem("pointNum");
        var ranIndex = 0;
        if(pointNum < 4) {
            //只生成一个小块和两个小块的组合方式，共有四种
            ranIndex = Util.random(0,3);
        }else{
            ranIndex = Util.random(0,HexCombination.length - 1);
        }
        var posList = HexCombination[ranIndex];
        for(var i = 0; i < posList.length; i++){
            var pos = posList[i];
            //随机产生颜色和相应点数
            var numIndex = Util.random(1,pointNum); 
            var oneHex = this.createOneHex(numIndex);
            oneHex.x = pos.x;
            oneHex.y = pos.y;
            //相应的点数，用于计分
            oneHex.num = numIndex;
            HexComNode.addChild(oneHex);
        }
        HexComNode.setScale(scaleNum);
        return HexComNode;
    },

    //添加触摸事件
    addTouchEvent: function(){
        var touchUp = 30;
        var self = this;

        //记录原始位置，便于无法放下时放回
        this.node.ox = this.node.x;
        this.node.oy = this.node.y;

        this.node.on(cc.Node.EventType.TOUCH_START,function(event){
            this.y += touchUp;
            this.getChildByName("HexComNode").setScale(1);
            if(cc.sys.localStorage.getItem("MusicOpen") == "true"){
                cc.audioEngine.play(self.clickSound,false,1);
            }
        },this.node);

        this.node.on(cc.Node.EventType.TOUCH_MOVE,function(event){
            //获取组件距离上一次事件移动的距离对象
            var moveDel = event.touch.getDelta();
            this.x += moveDel.x;
            this.y += moveDel.y;
            //距离检测逻辑
            self.disCheck();
            //变色处理
            if(self.canDrop()) {
                self.changeColor(true);
            } else {
                self.changeColor(false);
            }
        },this.node);

        this.node.on(cc.Node.EventType.TOUCH_CANCEL,function(event){
            this.putDown();
        },this);

        this.node.on(cc.Node.EventType.TOUCH_END,function(event){
            this.putDown();
        },this);
    },

    //将组件的点和六边形框中的所有点进行距离检测
    checkAllPos: function(pos) {
        var len = 27; //检测距离
        for(var i = 0; i < this.HexFrame.HexFrameList.length; i++){
            var hexNode = this.HexFrame.HexFrameList[i];
            var dis = cc.pDistance(hexNode.position,pos);
            if(dis <= len){
                return hexNode;
            }
        }
    },

    //距离检测逻辑
    disCheck: function() {
        //用于检测六边形框中能否放入
        this.checkhexFrame = [];
        //已放入的六边形小块信息
        this.hexList = [];

        //==this.node.getChildByName("HexComNode")
        var HexComNode = this.node.children[0];
        var oneHexList = HexComNode.children;
        for(var i = 0; i < oneHexList.length; i++){
            var offsetDis = cc.pAdd(HexComNode.position,oneHexList[i].position);
            var oneHexPos = cc.pAdd(this.node.position,offsetDis);
            var hexNode = this.checkAllPos(oneHexPos);
            if(hexNode) {
                this.hexList.push(oneHexList[i]);
                this.checkhexFrame.push(hexNode);
            }
        }
    },

    //检测组件是否能够放入六边形框中
    canDrop: function() {
        var oneHexList = this.node.children[0].children;
        //判断数量是否一致，若不一致，则说明有超出的六边形小块，则不放入
        if(this.checkhexFrame.length == 0 || this.checkhexFrame.length != oneHexList.length){
            return false;
        }
        //检测要放下的六边形格子中是否有方块
        for(var i = 0; i < this.checkhexFrame.length; i++){
            if(this.checkhexFrame[i].haveHex){
                return false;
            }
        }
        return true;
    },

    //变色处理，可放入时颜色改变
    changeColor: function(isCanDrop) {
        for(var i = 0; i < this.HexFrame.HexFrameList.length; i++){
            //先初始化一遍，默认为false
            var changeNode = this.HexFrame.HexFrameList[i].getChildByName("changeColor");
            changeNode.active = false;
        }
        //若无法放入则框不变色
        if(!isCanDrop){
            return;
        }
        //若可以放入则框变色
        for(var i = 0; i < this.checkhexFrame.length; i++){
            var changeNode = this.checkhexFrame[i].getChildByName("changeColor");
            changeNode.active = true;
        }
    },

    //放下处理
    putDown: function() {
        //此数组主要用于后续加分和消除，每次放下组件时清空
        this.HexFrame.eliIndex = [];
        //判断能否放下，若不能，则将组件放回原位
        if(!this.canDrop()){
            this.traceBack();
            if(cc.sys.localStorage.getItem("MusicOpen") == "true"){
                cc.audioEngine.play(this.cannotSound,false,1);
            }
            return;
        }
        for(var i = 0; i < this.hexList.length; i++){
            this.hexList[i].x = 0;
            this.hexList[i].y = 0;
            this.hexList[i].parent = this.checkhexFrame[i];
            this.checkhexFrame[i].haveHex = true;
        }
         //重新生成组件
        this.node.removeAllChildren();
        var HexComNode = this.createHexComNode();
        this.node.addChild(HexComNode);
        this.HexFrame.putHexLen = this.hexList.length;
        for(var i = 0; i < this.checkhexFrame.length; i++){
            this.HexFrame.eliIndex.push(this.checkhexFrame[i].hexIndex);
        }
        this.HexFrame.node.emit("successPutDown");
        if(cc.sys.localStorage.getItem("MusicOpen") == "true"){
            cc.audioEngine.play(this.putdownSound,false,1);
        }
        this.traceBack();
    },

    //将组件放回原位
    traceBack: function() {
        this.checkhexFrame = [];

        this.node.getChildByName("HexComNode").setScale(scaleNum);
        this.node.x = this.node.ox;
        this.node.y = this.node.oy;
    },

    //检测组件是否已无法放置，进而判断游戏是否结束
    checkLose: function() {
        //统计可以放置的方块数
        var canDropCount = 0;
        //oneHexList  length
        var oneHexList = this.node.children[0].children;

        for(var i = 0; i < this.HexFrame.HexFrameList.length; i++){
            var hexNode = this.HexFrame.HexFrameList[i];
            var count = 0;
            //检查所有空位
            if(!hexNode.haveHex){
                for(var j = 0; j < oneHexList.length; j++){
                    var len = 27; //检测距离
                    var oneHexPos = cc.pAdd(cc.p(hexNode.x,hexNode.y),cc.p(oneHexList[j].x,oneHexList[j].y));
                    //距离检测
                    for(var k = 0; k < this.HexFrame.HexFrameList.length; k++){
                        var comphexNode = this.HexFrame.HexFrameList[k];
                        var dis = cc.pDistance(cc.p(comphexNode.x,comphexNode.y),oneHexPos);
                        if(dis <= len && !comphexNode.haveHex){
                            count++;
                        }
                    }
                }
                if(count == oneHexList.length){
                    canDropCount++;
                    break;
                }
            } 
        }
        //无法放置，则游戏结束
        if(canDropCount == 0){
            return true;
        }else{
            return false;
        } 
    },

    onLoad: function() {
        this.checkhexFrame = [];
        this.hexList = [];
        //初始状态下，只会生成点数为1和2的小方块
        cc.sys.localStorage.setItem("pointNum",2);

        var HexComNode = this.createHexComNode();
        this.node.addChild(HexComNode);
        this.addTouchEvent();
    },
});
