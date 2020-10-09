var cont=0;
var nodes = [];
var pause = false;
var created = false;
let a = 0;
let b = 0;
var numCoisa = 0;
var matriz;
var memoryType;
var simulation;
var turnArround;
var firstRun = false;
var ID;
var RUNNING = false;

function processInfo(nodes){
    // Getting data
    quantum = document.getElementById("inputquantum").value
    overload = document.getElementById("inputsobrecarga").value
    algorithm = document.getElementById('algorit-processos').value
    memoryType = document.getElementById('algorit-pages').value
    iotime = document.getElementById("inputiotime").value
    npages = document.getElementById("inputpagesperprocess").value
    processes = []

    for(var i in nodes){
        processes.push({
            idNome:parseInt(nodes[i]),
            id:parseInt(i),
            arriveTime:document.getElementById("inputtime"+nodes[i]).value, 
            execTime:document.getElementById("inputexecute"+nodes[i]).value, 
            deadline:document.getElementById("inputdeadline"+nodes[i]).value, 
            priority:document.getElementById("inputpriority"+nodes[i]).value,
            totalTime:0,
            inIO:false,
            inIOqueue:false,
            exists:false
        });
    }

    // Criando memoria
    if(memoryType == "FIFO"){
        memory = new MemoryFIFO(npages, processes.length)
    }
    if(memoryType == "MRU"){
        memory = new MemoryMRU(npages, processes.length)
    }

    // Criando a simulação
    if(algorithm == "FIFO"){
        simulation = new SimulationFIFO(processes, memory, iotime, quantum, overload)
    }
    if(algorithm == "SJF"){
        simulation = new SimulationSJF(processes, memory, iotime, quantum, overload)
    }
    if(algorithm == "ROUND"){
        simulation = new SimulationROUND(processes, memory, iotime, quantum, overload)
    }
    if(algorithm == "EDF"){
        simulation = new SimulationEDF(processes, memory, iotime, quantum, overload)
    }
    if(algorithm == "PRIO"){
        simulation = new SimulationPRIO(processes, memory, iotime, quantum, overload)
    }
   
    
}


function createTableVirtual(paginas){
    for (let i = 0; i < (nodes.length); i++) {
        tr = document.createElement('tr');
        tr.setAttribute('class',"shedule-mem-v");
        tr.setAttribute('align',"center");

        
        num = document.createElement('td');
        num.innerHTML = "P"+nodes[i];
        num.style.fontSize = '15pt';
        
        tr.appendChild(num);

        for(let j=0; j<paginas; j++){
            td=document.createElement('td');
            td.setAttribute('id', "celula"+ ((parseInt(paginas)*parseInt(i))+parseInt(j) ));
            td.setAttribute('align', "center");
            

            td.setAttribute('width', "5px");
            span = document.createElement('span');
            td.style.position = 'relative';
            
            span.style.position = 'absolute';
            span.style.top = '0px';
            span.style.left = '3px';
            span2 = document.createElement('span');
            span2.setAttribute('id', "span"+((parseInt(paginas)*parseInt(i))+parseInt(j) ));
            span2.innerHTML = '-';
            td.style.fontSize = '12pt';
            td.style.minWidth = '40px';
            td.style.maxWidth = '40px';
            span.style.fontSize = '8pt';
            span.innerHTML = i*parseInt(paginas) + j ;
            td.appendChild(span);
            td.appendChild(span2);
            tr.appendChild(td);
        }

        document.getElementById('thGamer').setAttribute('colspan', paginas+1);
        document.getElementById('memoria-virtual').appendChild(tr);
    }
}
function createTable(){   
    for (let i = 0; i < 50; i++) {
        td = document.createElement('td');
        td.setAttribute('align',"center");
        td2 = document.createElement('td');
        td2.setAttribute('align',"center");
        td2.setAttribute('class', "replaceMem");
        td2.setAttribute('id', "real"+i);
        td.style.fontSize = "8pt";
        td.innerHTML = i;
        td.style.backgroundColor = "lightgrey";
        td2.innerHTML = "-";
        td2.style.fontSize = "13pt";
        td2.style.minWidth = "60px";
        td2.style.maxWidth = "60px";
      
        
        
        document.getElementById('mem-linha1').appendChild(td);
        document.getElementById('result').appendChild(td2);
    }
}



function deleteno(id){
    x = nodes.indexOf(id); 
    aux = document.getElementsByClassName("form-group col-sm-9 removivel")[x];
    document.getElementById("process").removeChild(aux);

    aux = document.getElementsByClassName("form-group col-sm-3 delete-button")[x];
    document.getElementById("process").removeChild(aux); 
    
    aux = document.getElementsByClassName("intdiv")[x];
    document.getElementById("process").removeChild(aux);  
    
    aux = document.getElementById("linha"+id);
    document.getElementById('tabela').removeChild(aux);

    graf = document.getElementById('grafico').style.height;

    graf.replace("px", '');
    graf = parseInt(graf);

    if(graf>200){
        graf-=30;
        document.getElementById('grafico').style.height = graf+"px";
    }
      
    nodes.splice(x, 1);
}

function show(id){
    x = nodes.indexOf(id); 
    aux = document.getElementsByClassName("intdiv")[x];

    var height;
    var id;
    if(aux.style.height == "0px"){
        height = 0;
        id = setInterval(frame, 5);
        function frame() {
            if (height == 210) {
                clearInterval(id);
            } else {
                height+=5; 
                aux.style.height = height + 'px'; 
                aux.style.height = height + 'px'; 
            }
        }
    }
    else {
        height = 210;
        id = setInterval(frame, 5);
        function frame() {
            if (height == 0) {
                clearInterval(id);
            } else {
                height-=5; 
                aux.style.height = height + 'px'; 
                aux.style.height = height + 'px'; 
            }
        }
    }    
}

function pauseSimulation(){
    pause = true;    
    $('#pauseButton').attr("disabled" , true);
    $('#clearButton').attr("disabled", false);
    $('#playButton').attr("disabled", false);
}

function frame(){
    if(!pause){
        informations = simulation.simulateTime();
        RUNNING = true;
    }     
    else{
        clearInterval(ID);
        RUNNING = false;
    }
       
    
    if(informations == null){
        pause = true;
        clearInterval(ID);
        document.getElementById('playButton').setAttribute('disabled',"true");
        document.getElementById('pauseButton').setAttribute('disabled',"true");
        $('#clearButton').attr("disabled", false);
    }
    if(!pause){
         
        numTime = document.createElement('td');
        numTime.setAttribute('class',"square");
        numTime.innerHTML = numCoisa;
        numTime.setAttribute('align', "center");

        document.getElementById('nomes-tabela').appendChild(numTime);

        numCoisa++;        

        deleteProcessQueue();
        for (b ; b < informations.column.length; b++) {
            if(pause)
                break; 
            atualTr = document.getElementById("linha"+nodes[b]);
            newCol = document.createElement('td');
            newCol.setAttribute('class',"square");
            newCol.style.height = "30px";
            newCol.style.width = "30px";
            newCol.style.border = "solid 5px azure";

            if(informations.column[b]=='D'){
                newCol.style.backgroundColor = "gray";
                
                spanIO = document.createElement('span');
                spanIO.style.backgroundColor = "gray";
                spanIO.setAttribute('class',"processo-principal");
                
                spanIO.innerHTML = $(atualTr).first()[0].innerHTML;
                document.getElementById('processo-io').appendChild(spanIO);

            }
            if(informations.column[b]=='E'){
                newCol.style.backgroundColor = "rgb(64, 224, 32)";

                spanEXEC = document.createElement('span');
                spanEXEC.style.backgroundColor = "rgb(64, 224, 32)";
                spanEXEC.setAttribute('class',"processo-principal");
                
                spanEXEC.innerHTML = $(atualTr).first()[0].innerHTML;
                document.getElementById('processo-executando').appendChild(spanEXEC);
            }
            if(informations.column[b]=='L'){
                newCol.style.backgroundColor = "rgb(132, 201, 116)";

                spanEXEC = document.createElement('span');
                spanEXEC.style.backgroundColor = "rgb(64, 224, 32)";
                spanEXEC.setAttribute('class',"processo-principal");
                
                spanEXEC.innerHTML = $(atualTr).first()[0].innerHTML;
                document.getElementById('processo-executando').appendChild(spanEXEC);
            }
            if(informations.column[b]=='X')
                newCol.style.backgroundColor = "rgb(198, 73, 73)";
            if(informations.column[b]=='-')
                newCol.style.backgroundColor = "rgb(252, 241, 67)";
            if(informations.column[b]=='Q')
                newCol.style.backgroundColor = "lightgray";  

            atualTr.appendChild(newCol);       
            var maxScrollLeft = document.getElementById('grafico').scrollWidth - document.getElementById('grafico').clientWidth;
            $('#grafico').scrollLeft(maxScrollLeft);
            document.getElementById('turnaround').innerHTML = "Turnaround médio = "+informations.ta;
            
        }

        // Memoria virtual
        for(let x=0; x<informations.vm.length; x++){
            let celula = document.getElementById('celula'+x);
            let spanDentroDaCelula = document.getElementById('span'+x);
            if(informations.vm[x]==null){                
                if(spanDentroDaCelula.innerHTML != '-'){
                    celula.style.backgroundColor = 'gray'
                    celula.style.color = 'white'
                }
                else{
                    celula.style.backgroundColor = 'transparent'
                    celula.style.color = 'black' 
                }
                spanDentroDaCelula.innerHTML = '-';
            }    
            else{
                spanDentroDaCelula.innerHTML = informations.vm[x];
            }            
        }

        // Memoria real
        for(let x=0; x<informations.rm.length; x++){
            if(informations.rm[x]==null){
                document.getElementById("real"+(x)).innerHTML = '-';
            }
            else{
                document.getElementById("real"+(x)).innerHTML = informations.rm[x];
            }
        }

        turnArround = informations.ta;  

        for(let i in informations.exec){
            tdQueueExec = document.createElement('td');
            tdQueueExec.setAttribute('class', "secundarios")
            spanQueueExec = document.createElement('span');
            spanQueueExec.setAttribute('class',"processo-coad");
            spanQueueExec.style.backgroundColor = "rgb(221, 207, 42)";
            spanQueueExec.innerHTML = "P"+informations.exec[i].idNome;

            tdQueueExec.appendChild(spanQueueExec);
            document.getElementById('lista-exe').appendChild(tdQueueExec);
        }
        for(let i = 1; i < informations.io.length; i++){
            tdQueueExec = document.createElement('td');
            tdQueueExec.setAttribute('class', "secundarios")
            spanQueueExec = document.createElement('span');
            spanQueueExec.setAttribute('class',"processo-coad");
            spanQueueExec.style.backgroundColor = "lightgray";
            spanQueueExec.innerHTML = "P"+informations.io[i].idNome;

            tdQueueExec.appendChild(spanQueueExec);
            document.getElementById('lista-io').appendChild(tdQueueExec);
        }

    }      
    b = 0;   
}

function rangeChange(){
    if(RUNNING){
        clearInterval(ID);
        ID = setInterval(frame,  1000 - document.getElementById('velocidadeExecucao').value);
    }    
    
}

function deleteProcessQueue() {
    let trIO = document.getElementById('lista-io');
    let trEXE = document.getElementById('lista-exe');

    let tdIO = document.getElementById('processo-io');
    let tdEXE = document.getElementById('processo-executando');

    // Remove os principais
    if(tdIO.childNodes.length > 0){
        tdIO.removeChild(tdIO.childNodes[0]);
    }
    if(tdEXE.childNodes.length > 0){
        tdEXE.removeChild(tdEXE.childNodes[0]);
    }

    $('.secundarios').remove()

}

function startSimulation(){    
    if(!created){
        createTableVirtual(document.getElementById("inputpagesperprocess").value);
        created = true;
    }

    $('#playButton').attr("disabled", true);
    $('.removeButton').css("display" , "none");
    $('body :input').attr("disabled" , true);
    $('#pauseButton').attr("disabled" , false);
    $('#clearButton').attr("disabled", true);
    $('.button-process').attr("disabled", false);
    $('#velocidadeExecucao').attr("disabled", false);
    pause = false;
    


    if(!created){
        createTableVirtual(document.getElementById("inputpagesperprocess").value);
        created = true;
    }
   
    if(firstRun == false){
        processInfo(nodes);
        firstRun=true;
    } 

    frame();
    
    
    document.getElementById('addButton').setAttribute('disabled', "true");

    ID = setInterval(frame, 1000 - document.getElementById('velocidadeExecucao').value);
 
   
}



function limparDados(){
    pause = true;
    $('.square').remove();
    $('.removeButton').css("display" , "block");
    $('body :input').attr("disabled" , false);
    $('#pauseButton').attr("disabled", true);
    $('#clearButton').attr("disabled", true);
    $('#playButton').attr("disabled", false);
    $('.shedule-mem-v').remove();
    $('.replaceMem').html('-');
    $('#turnaround').html('Tunraround médio = ...');
    deleteProcessQueue();
    firstRun = false;
    created = false;
    a = 0;
    b = 0;
    numCoisa = 0;
}

function inserirProcesso(){
    var i3 = document.createElement("div");
    i3.setAttribute('class', "form-group col-sm-9 removivel");
    i3.setAttribute('style',"margin-bottom: 0px;");
    if(nodes.length == 0) cont = 1;
    else{
        min = 0;
        for (let i = 0; i < nodes.length; i++) {
           if(nodes[i]>=min) min = nodes[i];
        }
        cont = min+1;
    }
    var botao = document.createElement("input");
    botao.setAttribute('value', "Processo "+cont);
    botao.setAttribute('type', "button");
    botao.setAttribute('onClick', "show("+cont+")");
    botao.setAttribute('style', "opacity: 0;");
    botao.setAttribute('class', "col-12 button-process");
    i3.appendChild(botao);
    
    var opacity = 0;
    var idOpa = setInterval(frame, 30);
    function frame() {
        if (botao.style.opacity == "1") {
            clearInterval(idOpa);
        } else {
            opacity+=0.1; 
            botao.style.opacity = opacity;
        }
    }

    var i2emeio = document.createElement("div");
    i2emeio.setAttribute('class', "intdiv");
    i2emeio.setAttribute('style',"margin: -10px 0px 10px 5px;");

    var i2 = document.createElement("div");
    i2.setAttribute('class', "form-row");

    var i = document.createElement("div");
    i.setAttribute('class',"form-group col-sm-5");

    var p = document.createElement("label");
    p.setAttribute('for', "nsei");
    
    p.innerHTML = "<br>Chegada";
    var t = document.createElement("input");
    t.setAttribute('type', "number");
    t.setAttribute('class', "form-control ajuste");
    t.setAttribute('min', "0");
    t.setAttribute('id', "inputtime" + parseInt(cont));
    t.setAttribute('value', "0");
    
    i.appendChild(p);
    i.appendChild(t);
    i2.appendChild(i);

    i = document.createElement("div");
    i.setAttribute('class',"form-group col-sm-5");
    
    p = document.createElement("label");
    p.setAttribute('for', "nsei");
    p.innerHTML = "<br>Tempo";

    t = document.createElement("input");
    t.setAttribute('type', "number");
    t.setAttribute('class', "form-control ajuste");
    t.setAttribute('min', "0");
    t.setAttribute('id', "inputexecute"+parseInt(cont));
    t.setAttribute('value', "0");

    i.appendChild(p);
    i.appendChild(t);
    i2.appendChild(i);
    i2emeio.appendChild(i2);

    document.getElementById('games').appendChild(i3);

    i2.appendChild(i);
    i2emeio.appendChild(i2);

    i2 = document.createElement("div");
    i2.setAttribute('class', "form-row");

    i = document.createElement("div");
    i.setAttribute('class',"form-group col-sm-5");
    
    p = document.createElement("label");
    p.setAttribute('for', "nsei");
    p.innerHTML = "<br>Prioridade";

    t = document.createElement("input");
    t.setAttribute('type', "number");
    t.setAttribute('class', "form-control ajuste");
    t.setAttribute('id', "inputpriority"+parseInt(cont));
    t.setAttribute('value', "0");

    i.appendChild(p);
    i.appendChild(t);
    i2.appendChild(i);
    
    i = document.createElement("div");
    i.setAttribute('class',"form-group col-sm-5");
    
    p = document.createElement("label");
    p.setAttribute('for', "nsei");
    p.innerHTML = "<br>Deadline";

    t = document.createElement("input");
    t.setAttribute('type', "number");
    t.setAttribute('class', "form-control ajuste");
    t.setAttribute('min', "0");
    t.setAttribute('id', "inputdeadline"+parseInt(cont));
    t.setAttribute('value', "0");

    i.appendChild(p);
    i.appendChild(t);
    i2.appendChild(i);
    i2emeio.appendChild(i2);

    i2emeio.style.overflowY = "hidden";
    i2emeio.style.overflowX = "hidden";
    i2emeio.style.height = "0px";

    i = document.createElement("div");
    i.setAttribute('class',"form-group col-sm-3 delete-button");
    i.setAttribute('style',"position: relative;");    

    t = document.createElement("button");
    t.setAttribute('type', "button");
    t.setAttribute('class', "removeButton btn btn-primary");
    t.setAttribute('style', "height: 43px !important; top: 0px; position: absolute;");
    t.setAttribute('onClick', "deleteno("+cont+")");
    t.innerHTML = "X";

    i.appendChild(t);

    document.getElementById('process').appendChild(i3);
    document.getElementById('process').appendChild(i);
    document.getElementById('process').appendChild(i2emeio);

    item = document.createElement('tr');
    item.setAttribute('id', "linha"+cont);
    item.style.border = "solid 5px azure";

    itemCol = document.createElement('td');
    itemCol.setAttribute('width', "76.4px")
    itemCol.setAttribute('align', "center");
    itemCol.innerHTML = 'P'+cont;

    item.appendChild(itemCol);

    atualHeight = document.getElementById('grafico').style.height;
    
    if (atualHeight == "") atualHeight = 200;
    else {    
        atualHeight.replace('px','');
        atualHeight = parseInt(atualHeight);
    }
    
    if(atualHeight <= ((nodes.length+2)*35)){
        atualHeight += 35;
        document.getElementById('grafico').style.height = atualHeight +"px";
    }
    
    document.getElementById('tabela').appendChild(item);
    
    nodes.push(cont);    
}