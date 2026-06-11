const NONE = -1;

function random(range) {
    return Math.floor(Math.random()*range);
}

class PseudorandomGenerator {
    constructor(inSeed) {
        this.seed = inSeed;
        this.mw = this.seed;
        this.mz = 987654321;
    }

    getNext = function() {
        let result;
        let mask = 0xffffffff;
        this.mz = (36969 * (this.mz & 65535) + (this.mz >> 16)) & mask;
        this.mw = (18000 * (this.mw & 65535) + (this.mw >> 16)) & mask;
        result = ((this.mz << 16) + this.mw) & mask;
        result /= 4294967296;
        return result + 0.5;
    }

    integer(max) {
        return Math.floor(this.getNext()*max);
    }
}

function padNumber(number, span) {
    let len = number.toString().length;
    let paddingNeeded = span - len;
    let result = "";

    while (paddingNeeded>0) {
        result += " ";
        paddingNeeded--;
    }
    result += number;
    return result;
}