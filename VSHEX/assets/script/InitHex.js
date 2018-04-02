//记录六边形框架上左斜、右斜、横三个方向各列的小六边形的序号信息
//主要用于后面的消除操作
const allDirectIndex = [
    //左斜
    [0,1,2,3],
    [4,5,6,7,8],
    [9,10,11,12,13,14],
    [15,16,17,18,19,20,21],
    [22,23,24,25,26,27],
    [28,29,30,31,32],
    [33,34,35,36],

    //右斜
    [15,22,28,33],
    [9,16,23,29,34],
    [4,10,17,24,30,35],
    [0,5,11,18,25,31,36],
    [1,6,12,19,26,32],
    [2,7,13,20,27],
    [3,8,14,21],

    //横
    [0,4,9,15],
    [1,5,10,16,22],
    [2,6,11,17,23,28],
    [3,7,12,18,24,29,33],
    [8,13,19,25,30,34],
    [14,20,26,31,35],
    [21,27,32,36],
]

var newScore = 0;

cc.Class({
    extends: cc.Component,

    properties: {
        ["HexH"]: 0, //小六边形的高
        ["HexA"]: 0, //小六边形的边长
        ["HexPic"]:{ //小六边形的图片信息
            default: null,
            type: cc.SpriteFrame,
        },
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
        ["changeColor"]:{
            default: null,
            type: cc.SpriteFrame,
        },
        floatScorePre:{
            default: null,
            type: cc.Prefab,
        },
        loseTipPre:{
            default: null,
            type: cc.Prefab,
        },
        losePre:{
            default: null,
            type: cc.Prefab,
        },
        eliSound:{
            default: null,
            url: cc.AudioClip,
        }
    },

    //六边形框架上小方块代表数字
    getOneHexNum: function(index) {
        return this.HexFrameList[index].getChildByName("oneHex").num
    },

    //计算放下和消除的分数
    getScore: function(putAddFlag) {
        var addCount = 0;
        if(putAddFlag){
            //放下加分
            for(var i = 0; i < this.eliIndex.length; i++){
                addCount += this.getOneHexNum(this.eliIndex[i]);
            }
        }else{
            //消除加分
            addCount = this.getOneHexNum(this.eliList[0]) * 2;
        }
        return addCount;
    },

    //分数变化
    addScore: function(putAddFlag) {
        var addCount = 0;
        if(putAddFlag){
            addCount = this.getScore(putAddFlag);
        }else{
            addCount = this.getScore(putAddFlag) * (this.eliList.length + 1);
        }
        //分数变化
        var Score = cc.find("Canvas/Score");
        var ScoreLabel = Score.getComponent(cc.Label);
        ScoreLabel.string = (addCount + Number(ScoreLabel.string)).toString();
        newScore = Number(ScoreLabel.string);
    },

    //加分飘字的颜色设置
    floatScoreColor: function(){
        var floatScore = cc.instantiate(this.floatScorePre);
        floatScore.color = cc.color(255,246,178);
        var floatScoreLabelOut = floatScore.getComponent(cc.LabelOutline);
        floatScoreLabelOut.color = cc.color(255,238,102);
        return floatScore;
    },

    //消除
    eliminate: function(eliNum,hexEliIndex) {
        this.HexFrameList[hexEliIndex].checkFlag = true;
        for(var i = 0; i < allDirectIndex.length; i++){
            var oneDirectIndex = allDirectIndex[i];
            for(var j = 0; j < oneDirectIndex.length; j++){
                if(oneDirectIndex[j] == hexEliIndex){
                    var front = -1, next = -1;
                    var frontIndex = -1, nextIndex = -1;
                    if(j == 0){
                        next = j + 1;
                        nextIndex = oneDirectIndex[next];
                    }else if(j == oneDirectIndex.length - 1){
                        front = j - 1;
                        frontIndex = oneDirectIndex[front];
                    }else{
                        front = j - 1;
                        frontIndex = oneDirectIndex[front];
                        next = j + 1;
                        nextIndex = oneDirectIndex[next];
                    }
                    if(front != -1 && !this.HexFrameList[frontIndex].checkFlag && this.HexFrameList[frontIndex].haveHex && this.getOneHexNum(frontIndex) == eliNum){
                        this.eliList.push(frontIndex);
                        this.checkEliList.push(frontIndex);
                    }
                    if(next != -1 && !this.HexFrameList[nextIndex].checkFlag && this.HexFrameList[nextIndex].haveHex && this.getOneHexNum(nextIndex) == eliNum){
                        this.eliList.push(nextIndex);
                        this.checkEliList.push(nextIndex);
                    }
                    break;
                }
            }
        }
    },

    //游戏加分和消除
    checkEliminate: function() {
        //组件放下加分
        this.addScore(true);
        //加分飘字
        var floatScore = this.floatScoreColor();
        var floatScoreLabel = floatScore.getComponent(cc.Label);
        floatScoreLabel.string = "+" + this.getScore(true);
        this.node.addChild(floatScore);
        
        //检测消除
        for(var i = 0; i < this.eliIndex.length; i++){
            this.eliList = [];//用于放入可消除的小六边块的下标
            this.checkEliList = [];//用于放入还需搜索的小六边块的下标
            for(var j = 0; j < this.HexFrameList.length; j++){
                this.HexFrameList[j].checkFlag = false;
            }
            this.checkEliList.push(this.eliIndex[i]);
            var eliNum = this.getOneHexNum(this.eliIndex[i]);
            while(this.checkEliList.length != 0){
                var hexEliIndex = this.checkEliList.pop();
                this.eliminate(eliNum,hexEliIndex);
            }
            if(this.eliList.length >= 2){
                if(cc.sys.localStorage.getItem("MusicOpen") == "true"){
                    cc.audioEngine.play(this.eliSound,false,1);
                }
                //开始进行消除
                this.isDeleting = true;
                var eliScore = this.getScore(false);
                for(var k = 0; k < this.eliList.length; k++){
                    //1.加分飘字
                    var floatScore = this.floatScoreColor();
                    var floatScoreLabel = floatScore.getComponent(cc.Label);
                    floatScoreLabel.string = "+" + eliScore;
                    this.HexFrameList[this.eliList[k]].addChild(floatScore);
                    this.HexFrameList[this.eliList[k]].haveHex = null;
                    this.HexFrameList[this.eliList[k]].getChildByName("changeColor").active = false;
                    //2.渐隐效果and移除节点
                    var eliNode = this.HexFrameList[this.eliList[k]].getChildByName("oneHex");
                    if(!eliNode){
                        cc.log("get不到要消除的点");
                        return;
                    }
                    eliNode.runAction(
                        cc.sequence(
                            cc.spawn(cc.scaleTo(0.5,2),cc.fadeOut(0.5)),
                            cc.removeSelf(true),
                        )
                    );
                }
                var floatScoreA = this.floatScoreColor();
                var floatScoreLabelA = floatScoreA.getComponent(cc.Label);
                floatScoreLabelA.string = "+" + eliScore;
                this.HexFrameList[this.eliIndex[i]].addChild(floatScoreA);
                var addNumNode = this.HexFrameList[this.eliIndex[i]].getChildByName("oneHex");
                this.HexFrameList[this.eliIndex[i]].getChildByName("changeColor").active = false;
                if(addNumNode.num < 5){
                    addNumNode.runAction(
                        cc.sequence(
                            cc.spawn(cc.scaleTo(0.2,0.5),cc.fadeOut(0.2)),
                            cc.spawn(cc.scaleTo(0.2,1),cc.fadeIn(0.2)),
                        )
                    );
                    addNumNode.num ++;
                    if(addNumNode.num > cc.sys.localStorage.getItem("pointNum")){
                        cc.sys.localStorage.setItem("pointNum",addNumNode.num);
                    }
                    var sprite = addNumNode.getComponent(cc.Sprite);
                    sprite.spriteFrame = this["HexPic" + addNumNode.num];
                    this.eliIndex.push(this.HexFrameList[this.eliIndex[i]].hexIndex);
                }else{
                    this.HexFrameList[this.eliIndex[i]].haveHex = null;
                    addNumNode.runAction(cc.removeSelf(true));
                }
                this.isDeleting = false;
                this.addScore(false);
            }
        }
        this.checkLose();
    },

    //检测游戏是否结束
    checkLose: function(){
        //如果小六边形正在消除，则不判断
        if(this.isDeleting){
            return;
        }
        var HexCom = cc.find("Canvas/hexCom");
        var HexComScript = HexCom.getComponent("InitHexCom");
        if(HexComScript.checkLose()){
            HexCom.opacity = 100;
            var childrenList = this.node.parent.children;
            for(var i = 0; i < childrenList.length; i++){
                childrenList[i].opacity = 100;
            }
            this.node.runAction(
                cc.sequence(
                    cc.delayTime(1.5),
                    cc.callFunc(function(){
                        var loseTipNode = cc.instantiate(this.loseTipPre);
                        this.node.parent.addChild(loseTipNode);
                    },this),
                    cc.delayTime(1),
                    cc.callFunc(function(){
                        for(var i = 0; i < childrenList.length; i++){
                            childrenList[i].active = false;
                        }
                        HexCom.active = false;
                        cc.log("保存历史最高分");
                        cc.sys.localStorage.setItem("newScore",newScore);
                        var topScore = cc.sys.localStorage.getItem("topScore");
                        if(topScore < newScore){
                            cc.sys.localStorage.setItem("topScore",newScore);
                        }
                        var loseNode = cc.instantiate(this.losePre);
                        this.node.parent.addChild(loseNode);
                        cc.log("游戏结束");
                    },this)
                )
            );
        }else{
            HexCom.opacity = 255;
        }
    },

    onLoad: function(){
        var srcPos = cc.p(this.node.x , this.node.y);
        
        //整个六边形框架各行的信息
        var framePosList = [
            //第一行的位置信息
            {
                count: 4,
                srcPos: cc.p(0 , 0)
            },
            //第二行的位置信息
            {
                count: 5,
                srcPos: cc.p(2 * this["HexH"] , 0)
            },
            //第三行的位置信息
            {
                count: 6,
                srcPos: cc.p(2 * this["HexH"] * 2 , 0)
            },
            //第四行的位置信息
            {
                count: 7,
                srcPos: cc.p(2 * this["HexH"] * 3 , 0)
            },
            //第五行的位置信息
            {
                count: 6,
                srcPos: cc.p(2 * this["HexH"] * 3 + this["HexH"] , (-3 * this["HexA"]) / 2)
            },
            //第六行的位置信息
            {
                count: 5,
                srcPos: cc.p(2 * this["HexH"] * 3 + this["HexH"] * 2 , (-3 * this["HexA"] * 2) / 2)
            },
            //第七行的位置信息
            {
                count: 4,
                srcPos: cc.p(2 * this["HexH"] * 3 + this["HexH"] * 3 , (-3 * this["HexA"] * 3) / 2)
            },
        ];

        //需要增加的单位向量
        var addVec = cc.pMult(cc.pForAngle(240 * (Math.PI / 180)) , this["HexH"] * 2);

        //偏移至原点(0,0)的向量
        var toPOVec = cc.pMult(cc.pForAngle(120 * (Math.PI / 180)) , this["HexH"] * 2 * 3);

        var HexFrameList = [];
        var perPosList = [];
        //生成所有小六边形的位置信息
        for(var i = 0; i < framePosList.length; i++){
            //六边形框架每一行的小六边形的数量
            var count = framePosList[i].count;
            //每一行的起始位置
            var iniSrcPos = cc.pAdd(framePosList[i].srcPos , toPOVec);
            var aimPos = cc.pAdd(srcPos, iniSrcPos);

            for(var j = 0; j < count; j++){
                var perPos = cc.pAdd(aimPos , cc.pMult(addVec , j));
                perPosList.push(perPos);
            }
        }

        //初始化六边形框架
        for(var i = 0 ; i < perPosList.length ; i++){
            var node = new cc.Node("Frame");
            var sprite = node.addComponent(cc.Sprite);
            sprite.spriteFrame = this["HexPic"];

            node.x = perPosList[i].x;
            node.y = perPosList[i].y;
            node.parent = this.node;
            node.hexIndex = i;
            
            //加发光组件，用于变色
            var changeNode = new cc.Node("changeColor");
            var cSprite = changeNode.addComponent(cc.Sprite);
            cSprite.spriteFrame = this["changeColor"];
            changeNode.active = false;//默认不激活
            changeNode.parent = node;

            HexFrameList.push(node);
        }

        this.HexFrameList = HexFrameList;
        this.isDeleting = false;
        this.node.on("successPutDown",this.checkEliminate,this);
    },
});
