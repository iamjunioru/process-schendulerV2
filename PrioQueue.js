
class PrioQueue{
    constructor(compFunc){
        this.arr = []
        this.length = 0
        this.compFunc = compFunc
    }
    queue(a){
        if(a != null){
            for(var i=0; i < this.arr.length; i++){
                if(this.compFunc(a,this.arr[i]) < 0){
                    this.arr.splice(i, 0, a);
                    this.length++
                    return;
                }
            }
            this.arr.push(a)
            this.length++
        }
    }
    dequeue(){
        if(this.arr.length > 0){
            this.length--
            return this.arr.shift()
        }
    }
    seek(){
        return this.arr[0]
    }
}