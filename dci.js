class H2O {
	constructor(pos=createVector(CW/2, CH/2), m_h1=1, m_h2=1, m_o=16){  // args : position du centre de masse, masses //{{{
		this.pos   = pos;
		this.m_h1  = m_h1; 
		this.m_h2  = m_h2; 
		this.m_o   = m_o; 
		this.d_oh  = 0.9576 *200 // distance O_H (A ->pixels)
		this.a_hoh = 1.824   // angle _H-O-H (rad)
		this.m     = this.m_h1+this.m_h2+this.m_o // masse totale
		this.CM    = createVector(this.pos.x, this.pos.y);
		this.CI    = createVector(this.pos.x, this.pos.y);
		let dcmShift = 50;
		this.CM.set(this.pos.x+dcmShift, this.pos.y);
		this.CI.set(this.pos.x+dcmShift, this.pos.y);
	}

	display(){
		angleMode(RADIANS);
		let dcm = ((this.m_h1+this.m_h2) *this.d_oh *cos(this.a_hoh/2))/this.m; // distance entre O et CM
		let O   = createVector(-dcm, 0);  // O position
		let H1  = createVector(O.x+this.d_oh*cos(this.a_hoh/2), O.y+this.d_oh*sin(this.a_hoh/2));
		let H2  = createVector(H1.x,H1.y*-1);
		O.add(this.pos)
		H1.add(this.pos)
		H2.add(this.pos)

		strokeWeight(4);
		line(O.x, O.y, H1.x, H1.y);
		line(O.x, O.y, H2.x, H2.y);
		strokeWeight(1);
		fill('red');
		circle(O.x, O.y, 100);
		fill('white');
		circle(H1.x, H1.y, 40);
		circle(H2.x, H2.y, 40);
		fill('gray');
		this.CI.set(this.CM.x+dciSlider.value()*300, this.pos.y);
		circle(this.CM.x, this.CM.y, 20);
		circle(this.CI.x, this.CI.y, 20);
		text('CM', this.CM.x-7, this.CM.y-13);
		text('CI', this.CI.x-7, this.CI.y+30);
	}


}//}}}

const CX = 10;  // p5 canvas position
const CY = 75;
const CW = 2000; // canvas width
const CH = 1000;  // canvas height
const chartX = 300;  // absolute position of chart (i.e. not reltive to p5 canvas)
const chartY = CY;
const chartW = 600;
const chartH = 800;
const pieX = 1000;  // absolute position of pie (i.e. not reltive to p5 canvas)
const pieY = CY;
const pieW = 300;
const pieH = 300;

var dciSlider;
var graphics;
var h2o;

var pie_gs = new Chart(); // global chart varaible for ground state composition
var pie_1p = new Chart(); // global chart varaible for 1st excited para composition
var showPie = false ; // display pie charts


function preload(){
	table   = loadTable('H2O16_p-Ar_energy_lvl_vs_dci.csv', 'csv', 'header');
	comp_gs = loadTable('H2O16-Ar_p-groundState_composition.csv', 'csv', 'header'); // ground state composition
	comp_1p = loadTable('H2O16-Ar_p-1_ExcitedState_composition.csv', 'csv', 'header'); // 1 excited state composition
}

// A FAIRE : LABEL DES ÉTATS SUR 
// LE DIAGRAMME ÉNERGÉTIQUE


function setup()  // happens only ONCE 
{
	textSize(20);//{{{

	var p5_canvas = createCanvas(CW, CH);
	p5_canvas.parent("p5Canvas");  // attribute parent to p5 canvas in html file
	var can = document.getElementById("p5Canvas");  // canvas object
	can.style.position= "absolute";
	can.style.left   = CX+"px"; // position of the div relative to the page
	can.style.top    = CY+"px";
	p5_canvas.position(0, 0);  // position of the canvas relative to the parent div

	graphics = createGraphics(chartW, chartH);  // transparent canvas behind chart 
	graphics.background(255);


	dciSlider = createSlider(0, 0.15, 0., 0.01);
	dciSlider.parent("p5Canvas");
	dciSlider.position(0, 20);
	dciSlider.input(chartIt);

	showWfn = createButton("Afficher les compositions");
	showWfn.position(pieX+250, pieY-20);
	showWfn.mouseClicked(toggleShowPie);

	chartIt();
}//}}}

function draw() 
{//{{{
	background(255);
	text('dci', dciSlider.x+80, dciSlider.y+3);

	pos = createVector(80, 250);
	h2o = new H2O(pos);
	h2o.display(mouseX, mouseY);

	image(graphics, chartX-CX, chartY-CY);  // par rapprot au canvas p5

	if(MouseOverGraph()){
		drawDciLineMouse();
	}
	if(showPie){
		pieIt();
	}
}//}}}
function updateGraphAndPie(){
	chartIt();
	pieIt();
}
function toggleShowPie(){
	if(showPie){
		showPie = false;
		showWfn.html("Afficher les compostions")
		pie_gs.clear();
		pie_1p.clear();
	}
	else{
		showPie=true;
		showWfn.html("Cacher les compostions")
	}
}



function MouseOverCircle(x, y, r){
// check if mouse is over circle of radius r centerd at x, y
	return(dist(mouseX, mouseY, x, y) < r);
}


function MouseOverGraph(){
// check if mouse is over graph
	var xAxisParam   = getXAxisParam();//{{{
	var incr         = xAxisParam[0];       // incr is 1st item of the returned array
	var mouseX_graph = xAxisParam[1]; // position de la souris par rapport au canvas graphique 
	var x_val        = xAxisParam.slice(2); // x_val are all following elements
	if(mouseX_graph >= x_val[0] && mouseX_graph <= x_val[x_val.length-1]){  // si souris est sur le graphique
		return true;
	} else{
		return false;}
}//}}}


function drawDciLine(){
	graphics.clear();//{{{
	var value = dciSlider.value();
	var lineX = map(value, 0, 0.15, 85, chartW-12); // prendre en compte la largeur du graph pour tomber sur les points
	graphics.line(lineX, chartH-80 , lineX, 13)
}//}}}



function drawDciLineMouse(){
// draw vertical line on graph
	graphics.clear();//{{{
	var xAxisParam   = getXAxisParam();
	var incr         = xAxisParam[0];       // incr is 1st return of getAxisParam() function
	var mouseX_graph = xAxisParam[1];    // position de la souris par rapport au canvas graphique 
	var x_val        = xAxisParam.slice(2); // x_val are all following elements
	if(MouseOverGraph()){
		index = getClosestXValue();
		graphics.line(x_val[index], chartH-80 , x_val[index], 13)
	}
}//}}}

function getClosestXValue(){
// return the index of the closest X value in the graph
	var xAxisParam   = getXAxisParam();//{{{
	var incr         = xAxisParam[0];      
	var mouseX_graph = xAxisParam[1];   
	var x_val        = xAxisParam.slice(2);
	if(MouseOverGraph()){
		var index = int((mouseX_graph-85)/incr); // index de x_val inférieur le plus proche de la souris
		var dist1 = abs(mouseX_graph - x_val[index]); 
		var dist2 = abs(mouseX_graph - x_val[index+1]);
		// handle the case of last element of array in this condition
		if(dist1<dist2 || x_val[index] === x_val[x_val.length-1]){return(index);}
		else{return(index+1);}
	}
}//}}}

function getXAxisParam(){
// return pixel x position and increment of data on graph
// ATTENTION À LA LARGEUR RÉELLE DU GRAPHIQUE (12(à droite)+85(à gauche) ici)//{{{
// cette largeur dépend de la taille/nature des labels des axes
	var nb_data = table.getRowCount();            // nb de valeur que prend la variable indépendante 
	var incr    =  (chartW-(12+85))/(nb_data-1) ; // largeur du graphique divisé par nb de donnée-1
	var xParam   = [];                             // coordonnées x, sur le canvas graphcis, ou se trouve les données 
	xParam.push(incr);
	xParam.push(mouseX-chartX+CX);
	for(var i=0; i<nb_data; i++){
		xParam.push(i*incr+85);
	}
	return(xParam);
}//}}}


function chartIt(){
	data = parseData(table);//{{{
//	drawDciLine();
	//--- position  of graph canvas
	var gc = document.getElementById("chartCanvas");  // div object
	gc.style.position= "absolute";
	gc.style.left   = chartX+"px" ; // position of the div relative to page 
	gc.style.top    = chartY+"px";
	// ---size of graph 
	var c = document.getElementById("chart"); // graph object
	c.style.width  = chartW+"px";
	c.style.height = chartH+"px";
	//------------------------
	const ctx = document.getElementById('chart').getContext('2d'); 
	const pColor = 'red';
	const rtcColor = 'green';

	var dci = dciSlider.value();
	var index = parseInt(map(dci, 0, 0.15, 1, data.x.length));


	const myChart = new Chart(ctx, {   
		type: 'line',
		data: {
			labels: data.x,
			datasets: [
			{
				label           : '1',data:data.y1.splice(0, index),	fill: false,
				backgroundColor : 'rgba(255, 99, 132, 0.2)', borderColor: pColor,
				borderWidth     : 2
			},{
				label           : '2', data:data.y2.splice(0, index), fill: false,
				backgroundColor : 'rgba(255, 99, 132, 0.2)',borderColor: pColor,
				borderWidth     : 2
			},{
				label           : '3', data:data.y3.splice(0, index), fill: false,
				backgroundColor : 'rgba(255, 99, 132, 0.2)',borderColor: rtcColor,
				borderWidth     : 2
			},{
				label           : '4', data:data.y4.splice(0, index), fill: false,
				backgroundColor : 'rgba(255, 99, 132, 0.2)',borderColor: pColor,
				borderWidth     : 2
			},{
				label           : '5', data:data.y5.splice(0, index), fill: false,
				backgroundColor : 'rgba(255, 99, 132, 0.2)',borderColor: pColor,
				borderWidth     : 2
			},{
				label           : '6', data:data.y6.splice(0, index), fill: false,
				backgroundColor : 'rgba(255, 99, 132, 0.2)',borderColor: rtcColor,
				borderWidth     : 2
			},{
				label           : '7', data:data.y7.splice(0, index), fill: false,
				backgroundColor : 'rgba(255, 99, 132, 0.2)',borderColor: rtcColor,
				borderWidth     : 2
			},{
				label           : '8', data:data.y8.splice(0, index), fill: false,
				backgroundColor : 'rgba(255, 99, 132, 0.2)',borderColor: rtcColor,
				borderWidth     : 2
			}
			]
		},
		options : {
			// size of canvas is size given in html file, set 2 following variale to false
			maintainAspectRatio: false, 
			responsive : false,
			animation : {duration : 0},
			tooltips : {enabled : false},
			// ----------------------
			legend : {display : false},
			scales : {
				yAxes : [{
					scaleLabel : {display:true, labelString:'Énergie (cm\u207B\u00B9)', fontSize : 20},
					ticks : {fontSize : 20, min:0, max:110}
				}],
				xAxes : [{
					scaleLabel : {display:true, labelString:'Distance entre CM et CI (dci, \u212B)', fontSize:20},
					ticks : {fontSize : 20 }
				}]
			}
		}
	});
}//}}}


function pieIt(){
	data_gs =  parseDataComp(comp_gs);
//	//--- position  of graph canvas
	var gc = document.getElementById("pieChartCanvasGs");  // div object
	gc.style.position= "absolute";
	gc.style.left   = pieX+"px" ; // position of the div relative to page 
	gc.style.top    = pieY+"px";
	// ---size of graph 
	var c = document.getElementById("pieGs"); // graph object
	c.style.width  = pieW+"px";
	c.style.height = pieH+"px";
//	//------------------------
	const pColor = 'red';
	const rtcColor = 'green';


//	var dci = dciSlider.value();
//	var index = parseInt(map(dci, 0, 0.15, 0, data.x.length-1));

	if(MouseOverGraph()){
		index = getClosestXValue();
	}

	
	const ctx = document.getElementById('pieGs').getContext('2d'); 
	pie_gs = new Chart(ctx, {
		type: 'pie',
		data: {
		labels: ["000;00", "111; 01", "111; 10"],
		  datasets: [{
			backgroundColor: [pColor, rtcColor, rtcColor],
			data: [data_gs.y1[index], data_gs.y2[index], data_gs.y3[index]] 
		  }]
		},
		options: {
			maintainAspectRatio: false, 
			responsive : false,
			animation : {duration : 0},
			tooltips : {enabled : false},
			plugins : {  // plugin labels
				labels: {render: 'percentage', fontColor : 'white', fontStyle : 'bold'} //show values on pie 
			},
		    title: {
				display: true,
				text: ['Composition de l\'état fondamental','dci='+data_gs.x[index]+' \u212B'],
				  fontSize : 20

			}
		}
	});
	
	pieIt1p();
}



function pieIt1p(){
	data_1p =  parseDataComp1p(comp_1p);
//	//--- position  of graph canvas
	var gc = document.getElementById("pieChartCanvas1p");  // div object
	gc.style.position= "absolute";
	gc.style.left   = pieX+350+"px" ; // position of the div relative to page 
	gc.style.top    = pieY+"px";
	// ---size of graph 
	var c = document.getElementById("pie1p"); // graph object
	c.style.width  = pieW+"px";
	c.style.height = pieH+"px";
//	//------------------------
	const pColor = 'red';
	const rtcColor = 'green';

	if(MouseOverGraph()){index = getClosestXValue();}

	const ctx = document.getElementById('pie1p').getContext('2d'); 
	pie_1p = new Chart(ctx, {
		type: 'pie',
		data: {
		labels: ["111;00", "000; 01"],
		  datasets: [{
			backgroundColor: [pColor, rtcColor],
			data: [data_1p.y1[index], data_1p.y2[index]] 
		  }]
		},
		options: {
			maintainAspectRatio: false, 
			responsive : false,
			animation : {duration : 0},
			tooltips : {enabled : false},
			plugins : {  // plugin labels
				labels: {render: 'percentage', fontColor : 'white', fontStyle : 'bold'} //show values on pie 
			},
		    title: {
				display: true,
				text: ['Composition du 1er état excité','dci='+data_1p.x[index]+' \u212B'],
				  fontSize : 20

			}
		}
	});
}





function parseData(table){
	const x = [];//{{{
	const y1 = []; const y2 = []; const y3 = []; const y4 = [];
	const y5 = []; const y6 = []; const y7 = []; const y8 = [];

	for(var i=0; i<table.getRowCount(); i++){
		row = table.getRow(i);
		x.push(row.getString(0));
		y1.push(float(row.getString(1))); 
		y2.push(float(row.getString(2))); 
		y3.push(float(row.getString(3))); 
		y4.push(float(row.getString(4))); 
		y5.push(float(row.getString(5))); 
		y6.push(float(row.getString(6))); 
		y7.push(float(row.getString(7))); 
		y8.push(float(row.getString(8))); 
	}
	return {x, y1, y2, y3, y4, y5, y6, y7, y8};
}//}}}


function parseDataComp(table){
	const x = [];//{{{
	const y1 = []; const y2 = []; const y3 = [];

	for(var i=0; i<table.getRowCount(); i++){
		row = table.getRow(i);
		x.push(row.getString(0));
		y1.push(float(row.getString(1))); 
		y2.push(float(row.getString(2))); 
		y3.push(float(row.getString(3))); 
	}
	return {x, y1, y2, y3};
}//}}}


function parseDataComp1p(table){
	const x = [];//{{{
	const y1 = []; const y2 = [];

	for(var i=0; i<table.getRowCount(); i++){
		row = table.getRow(i);
		x.push(row.getString(0));
		y1.push(float(row.getString(1))); 
		y2.push(float(row.getString(2))); 
	}
	return {x, y1, y2};
}//}}}















