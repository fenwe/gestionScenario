/*!
fichier: exemple1-scenario.js
auteur:pascal TOLEDO
date: 2012.02.23
source:
depend de:
description:
*/

scenario = new Tscenario();

//------ definition des scenes ----
scenario.scene1= function()//mise en place
  {
	 addText('la scene1 dure '+this.duree+' secondes');
	}

scenario.scene2= function()
	{
	addText('la scene2 dure '+this.duree+' secondes');
	}

scenario.scene3= function()
	{
	addText('la scene3 dure '+this.duree+' secondes');
	}


//------ ajout des scenes (dans l'ordre d'execution)----
scenario.addScene({duree:5,sceneCode:scenario.scene1,nom:'scene1'});
scenario.addScene({duree:7,sceneCode:scenario.scene2,nom:'scene2',});
scenario.addScene({duree:10,sceneCode:scenario.scene3,nom:'scene3'});



//------ Execution -----------------
//scenario.runAuto('scenario');
