//工具
var util = {
    //产生随机数
    random: function(min,max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    },
}
module.exports = util