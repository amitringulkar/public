import { SIZE } from "./constants";
var Utils;
(function (Utils) {
    function rand(min, max, reduce = SIZE) {
        let num = Math.floor(Math.random() * (max - min)) + min;
        return num - (num % reduce);
    }
    Utils.rand = rand;
    function snap(num, point = SIZE) {
        let bottom = num - num % point;
        let top = bottom + point;
        return num - bottom <= top - num ? bottom : top;
    }
    Utils.snap = snap;
    function removeNode(el) {
        if (el.parentNode) {
            el.parentNode.removeChild(el);
        }
    }
    Utils.removeNode = removeNode;
    function bound(num, min, max) {
        return Math.max(Math.min(num, max), min);
    }
    Utils.bound = bound;
})(Utils || (Utils = {}));
export default Utils;
