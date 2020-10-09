
class Memory{
	constructor(npages){
        this.realMemory = Array(50).fill(null)
        this.pointer = 0
        this.npages = npages
    }

    referencePages(processNumber, currentTime){}

    putPages(processNumber){}

    incrementPointer(){
    	this.pointer++
    	if(this.pointer == 50){
    		this.pointer = 0
    	}
    }   

    hasAllPages(processNumber){
    	for (var i = processNumber*(this.npages); i < (processNumber+1)*this.npages; i++){
    		if(this.virtualMemory[i] == null){
    			return false
    		}
    	}
    	return true
    }
}



class MemoryFIFO extends Memory{
    constructor(npages, nProcesses){
        super(npages)
        this.virtualMemory = Array(nProcesses*npages).fill(null)
        this.fifoQueue = []
    }



    putPages(processNumber, currentNumber){
    	for (var i = (processNumber)*(this.npages); i < (processNumber+1)*this.npages; i++){
            if(this.virtualMemory[i] == null){
                this.fifoQueue.push(i)
                if(this.realMemory[this.pointer] == null){
                    this.virtualMemory[i] = this.pointer
                    this.virtualMemory[ this.realMemory[this.pointer] ] = null
                    this.realMemory[this.pointer] = i
                    this.incrementPointer()
                }
                else{
                    let aux = []
                    while(parseInt(this.fifoQueue[0]/this.npages) == currentNumber || 
                         parseInt(this.fifoQueue[0]/this.npages) == processNumber){
                        aux.push(this.fifoQueue[0])
                        this.fifoQueue.splice(0, 1)
                    }
                    let victmPage = this.fifoQueue[0]
                    let frame = this.virtualMemory[victmPage]
                    this.virtualMemory[victmPage] = null
                    this.virtualMemory[i] = frame
                    this.realMemory[frame] = i
                    this.fifoQueue.splice(0,1)
                    this.fifoQueue = aux.concat(this.fifoQueue)
                }
    		}            
    	}  	
    }

}

class MemoryMRU extends Memory{
	constructor(npages, nProcesses){
		super(npages)
        this.virtualMemory = Array(nProcesses*this.npages).fill(null)
        this.referenceCount = Array(nProcesses*this.npages).fill(0)
	}

    referencePages(processNumber, currentTime){
        let firstPage = (processNumber)*(this.npages)
        for(var i=0; i < this.npages; i++){
            this.referenceCount[parseInt(firstPage)+parseInt(i)] = currentTime;
        }
    }

    findMinCount(processNumber, currentNumber){
        let min = Infinity
        let chosen = null
        for(var i=0; i < this.realMemory.length; i++){            
            let owner = parseInt(this.realMemory[i]/this.npages)
            let refCount = this.referenceCount[this.realMemory[i]]
            if(owner != processNumber && owner != currentNumber && refCount < min){
                min = this.referenceCount[this.realMemory[i]]
                chosen = this.realMemory[i]
            }
        }
        return chosen
    }

    putPages(processNumber, currentNumber){
        let firstPage = (processNumber)*this.npages

        for (var i = 0; i < this.npages; i++){
            let currentPage = parseInt(firstPage)+parseInt(i)

            if(this.virtualMemory[currentPage] == null){
                if(this.realMemory[this.pointer] == null){
                    // console.log("Botou direto")
                    this.virtualMemory[currentPage] = this.pointer
                    this.virtualMemory[ this.realMemory[this.pointer] ] = null
                    this.realMemory[this.pointer] = currentPage
                    this.incrementPointer()
                }
                else{
                    let victmPage = this.findMinCount(processNumber, currentNumber)
                    let frame = this.virtualMemory[victmPage]
                    this.virtualMemory[victmPage] = null
                    this.virtualMemory[currentPage] = frame
                    this.realMemory[frame] = currentPage
                }
            }
        }
    }
}
