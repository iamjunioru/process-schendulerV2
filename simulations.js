
function getMaxExecTime(processes){
    maxExec = processes[0].execTime
    for(var i in processes){
        if(processes[i].execTime > maxExec){
            maxExec = processes[i].execTime
        }
    }
    return maxExec
}


class Simulation{
    constructor(processes, memoryAlgorithm, iotime, quantum, overload){
        this.processes = processes
        this.memory = memoryAlgorithm
        this.iotime = iotime
        this.usedIOTime = this.iotime
        this.current = null
        this.currentTime = 0
        this.count = processes.length
        this.ioQueue = new NormalQueue()
        this.quantum = quantum
        this.overload = overload
        this.usedOverload = overload
        this.usedQuantum = quantum
        this.preemption = false
        this.increment = (1/(processes.length+1))
    }

    simulate(){
        var matrix = []
        let turn = 0
        while(true){
            var x = this.simulateTime()
            if(x == null) break;
            matrix.push(x.column)
            turn = x.ta
        }
        console.log("TurnAround Médio = "+turn)
        return matrix
    }

    simulateTime(){
        

        // Procura quem chegou
        this.checkArrived()
        this.updateInitInfo()

        let turnAround = 0
        let count = 0
        for(var i=0; i < this.processes.length; i++){
            if(this.currentTime >= this.processes[i].arriveTime){
                turnAround = parseInt(turnAround) + parseInt(this.processes[i].totalTime)
                count++;
            }
        }
        if(count != 0){
            turnAround = turnAround/count
        }
        

        // Se não tem processo
        if(this.count <= 0) return null

        if(this.usedOverload <= 0 && this.usedQuantum <= 0){
            this.preemption = false
        }
        if(this.usedQuantum <= 0){
            this.preemption = true
        }

        // Se tempo de IO acabou, ajeita a memoria e coloca na fila
        if(this.usedIOTime <= 0){
            this.usedIOTime = this.iotime
            let x = this.ioQueue.dequeue()
            x.inIOqueue = false
            if(x != null){
                x.inIO = false
                if(this.current != null && this.preemption == false){
                    this.memory.putPages(x.id, this.current.id)
                }
                else{
                    this.memory.putPages(x.id, -1)
                }
                
                this.readyQueue.queue(x)
            }      
        }            

        // Se a preempção anterior terminou
        if(this.usedOverload <= 0 && this.usedQuantum <= 0){
            this.preemption = false
            this.usedOverload = this.overload
            this.usedQuantum = this.quantum
            if(this.current != null){
                this.readyQueue.queue(this.current)
            }            
            this.current = null
        }

        // Se começou a preempçao agora
        if(this.usedQuantum <= 0){
            this.preemption = true
            this.usedOverload--
        }
       

        // Executa se nao for preempção
        if(this.preemption == false){
            if(this.current == null){
                let auxCount = 0;
                while(this.readyQueue.length != 0){
                    var x = this.readyQueue.dequeue()
                    this.memory.referencePages(x.id, this.currentTime+auxCount)
                    if(this.memory.hasAllPages(x.id)){
                        this.current = x
                        break
                    }
                    else{
                        this.ioQueue.queue(x)
                        x.inIOqueue=true
                        auxCount += this.increment
                    }
                }
            }
            if(this.current != null){                
                this.current.execTime--
            }
        }

        // Seta o topo da fila de IO como IO
        if(this.ioQueue.length != 0){
            this.usedIOTime--
            this.ioQueue.seek().inIO = true
        }

        let currentColumn = this.createColumn(this.preemption, this.current)

        if(this.current != null && this.current.execTime == 0){            
            this.usedQuantum = this.quantum
            this.current.exists = false
            this.current = null
            this.count--
        }
        
        if (this.current != null && this.preemption == false && this.current.inIO == false){
            this.usedQuantum--
        }


        // Finaliza
        this.currentTime++
        let IOQueue = this.ioQueue.arr
        let EXEQueue = this.readyQueue.arr;

        return {column:currentColumn, rm:this.memory.realMemory, vm:this.memory.virtualMemory, ta:turnAround, io:IOQueue, exec:EXEQueue}
    }

    checkArrived(){
        for(var i in this.processes){
            
            if(this.processes[i].arriveTime == this.currentTime){
                if(this.processes[i].execTime == 0){
                    this.count--
                    break;
                }
                this.processes[i].exists = true
                this.readyQueue.queue(this.processes[i])
            }
        }
    }

    updateInitInfo(){
        for(var i in this.processes){
            if(this.processes[i].exists){
                this.processes[i].totalTime++
            }
        }
    }

    createColumn(isPreemption, current){
        var column = []
        var value
        for(var i in this.processes){
            if(this.current == this.processes[i]){
                if(isPreemption == true){
                    value = "X"
                }
                else{
                    if(this.current.deadline < 0){
                        value = "L"
                    }
                    else{
                        value = "E"
                    }
                }                
            }
            else if (this.processes[i].exists){
                value = "-"
            }
            else{
                value = " "
            }
            
            if(this.processes[i].exists ){
                if(this.processes[i].inIOqueue)
                    value = "Q"
                if(this.processes[i].inIO)
                    value = "D"
            }


            column.push(value)
        }
        return column
    }

    
}

class SimulationFIFO extends Simulation{

    constructor(processes, memoryAlgorithm, iotime, quantum, overload){
        super(processes, memoryAlgorithm, iotime, quantum, overload)
        this.readyQueue = new NormalQueue() 
        this.quantum = getMaxExecTime(processes)+1
        this.usedQuantum = this.quantum
        this.overload = 0       
    }
}

class SimulationSJF extends Simulation{
    constructor(processes, memoryAlgorithm, iotime, quantum, overload){
        super(processes, memoryAlgorithm, iotime)

        this.compareFunc = function(a,b)
        {
           if(a.execTime != b.execTime){
               return a.execTime - b.execTime
           }
           else if(a.arriveTime != b.arriveTime){
               return a.arriveTime - b.arriveTime
           }
           else{
                return a.id - b.id
           }
        }
        this.readyQueue = new PrioQueue(this.compareFunc)
        this.quantum = quantum = getMaxExecTime(processes)+1
        this.usedQuantum = this.quantum
        this.overload = 0 
    }
} 

class SimulationROUND extends Simulation{
    constructor(processes, memoryAlgorithm, iotime, quantum, overload){
        super(processes, memoryAlgorithm, iotime, quantum, overload)
        this.readyQueue = new NormalQueue()
    }
}

class SimulationEDF extends Simulation{
    constructor(processes, memoryAlgorithm, iotime, quantum, overload){
        super(processes, memoryAlgorithm, iotime, quantum, overload)
        this.compareFunc = function(a,b)
        {
            return a.deadline - b.deadline
        }
        this.readyQueue = new PrioQueue(this.compareFunc)
    }

    updateInitInfo(){
        super.updateInitInfo()
        for(var i in this.processes){
            if(this.processes[i].exists){                
                this.processes[i].deadline -= 1;
            }
        }
    }
}


class SimulationPRIO extends Simulation{
    constructor(processes, memoryAlgorithm, iotime, quantum, overload){
        super(processes, memoryAlgorithm, iotime, quantum, overload)
        this.compareFunc = function(a,b)
        {
            return b.priority - a.priority
        }
        this.readyQueue = new PrioQueue(this.compareFunc)
    }
}

