/**
 * 分数上飘渐隐的特效
 */
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

   onLoad: function() {
       this.node.x = 0;
       this.node.y = 0;
       this.node.runAction(
           cc.sequence(
               //1s内同步执行以下两个动作：1.渐隐2.向上移动100
               cc.spawn(cc.fadeOut(1.0),cc.moveBy(1.0,cc.p(0,100))),
               cc.removeSelf(true)
           ));
   },
});
