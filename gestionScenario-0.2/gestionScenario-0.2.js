/*!
Gestionnaire de scenario
fichier: gestionScenario-2.0.js
version:2.0
auteur:pascal TOLEDO
date: 2012.02.23
source:
depend de:
  * rien
description:
	* Gestionnaire de scenario
	* appeller successivement des fonctions appartenant a un meme tableau avec une temporiation propre a chaque fonction
2.0:
suppression a la reference winDebug
*/
/*******************************************************************/
//function a implementer
function isNumber(n){return (true);}

/*******************************************************************
// Creation de la class scene
// etat:
// 0: stop/terminer
// 1:  en cours
// 3: pause
// param
// - nom
// - duree
// - sceneCode
// - 
// v1.1:
// bug decouvert: mauvais comportement du repeat: le stop ne fonctionne pas quand le repeat en active
// v1.1.1
// correction du comprtement du stop avec le repeat en cours
*******************************************************************/


function Tscenario_scene(init)
{
this.etat=0;
this.nom=(init.nom != undefined)?init.nom:'';
this.duree=(isNumber(init.duree))?init.duree:0;
this.tempsRestant= this.duree;
this.sceneCode=(init.sceneCode!=undefined)?init.sceneCode:function(){}
}

Tscenario_scene.prototype=
	{
	getEtat:function(){return(this.etat);}
	,setEtat:function (etat){this.etat=etat;}
	,setDuree:function(temps){if(isNumber(temps)){this.duree=temps;}this.tempsRestant=this.duree;}
	,tempsRestantDec:function (){if(this.tempsRestant>0){this.tempsRestant--;}return(this.tempsRestant);}
	,lance:function(){this.etat=1;this.sceneCode();this.etat=0;}
	}

//*****************************************************************
// Creation de la class scenario
// etat:
// 0: stop /terminer
// 1:  en cours
// 3: pause
// options
//  * varStatique: var statique contenant la variable scenario
//  * url: nom du fichier charger via ajax
//*******************************************************************
function Tscenario(options)
	{this.isLoad=0;
	if (options){this.varStatique=(options.varStatique)?options.varStatique:null;}	//Ptr vers la fonction
	this.fct=null;
	this.scenarioNom='';
	this.passageNb=0;	//nombre de passage de la derniere scene
	this.sceneNo = 1;	// numero en cours de lecture ou pret a lire 
	this.sceneNb = 0;
	this.scenes= Array();
	this.runAutoTimerID= undefined;
	this.isRepeat=0;	// si 1 repetition automatique en cas de fin
	this.isLoad=1;
	}

Tscenario.prototype=
	{
	destruct:function(){}
	,getSceneNo:function(){return (this.sceneNo);}
	,addScene:function(init){this.sceneNb++;this.scenes[this.sceneNb]= new Tscenario_scene(init);}
	,getSceneNb:function(){return (this.sceneNb);}
	,setSceneNb:function(nb){if(isNumber(nb)){this.sceneNb = nb;};}
	,addSceneNb:function(){this.sceneNb++;}
	// ==== gestion de la lecture automatique ====
	,repeat:function()	// initialisation de isRepeat (fonction bascule)
		{this.isRepeat=!this.isRepeat;if(this.isRepeat){tmp='repeat on';}else{tmp='repeat off';}}
	// augmente si possible et renvoie 1 si deja au max sinon 0
	,selectSceneSuivante:function ()
		{if(this.sceneNo<this.sceneNb){this.sceneNo++;return(0);}else{return(1);}}
	,runAuto:function (scenarioID)
		{
		if (this.runAutoTimerID === undefined)	// verifier si scenario pas deja demarrer
			{fct=scenarioID+".vie();";this.runAutoTimerID= setInterval(fct,1000);}
		else	// si deja demarrer alors c'est une reprise
			{this.scenes[this.sceneNo].setEtat(1);}	// la scene est remis a l'etat 'en cours de lecture'
		}
	,vie:function()
		{
		sc=this.scenes[this.sceneNo];	// on pointe sur la scene courante
		switch (sc.etat)
			{
			case 0:	// pret a lire
				this.scene_run();	// on l'execute;
				sc.etat=1;				// on remet l'etat 'en cours de lecture' ()
				if (this.sceneNo == this.sceneNb){this.passageNb++;}
				//break;	// on teste si la fonction s'arrette dans le mm temps
			case 1:	// en cours de lecture
				if (sc.tempsRestantDec() == 0)	// on decremente le temps restant et si epuise
					{
					// reinitilisation de la scence qui vient de s'arreter
					sc.etat=0;				// on met la scene en etat d'arret (n'est plus en cours de lecture)
					sc.tempsRestant= sc.duree;	// remise au complet du temps restant
					// preparation de la prochaine scene
					if ( this.selectSceneSuivante()  )	// on selectionne la scene suivante et si la scene actuelle est deja au max
						{this.stopIfNoRepeat();}		// on arrete le timer
					}
				break;
	//		case 3:	// en pause -> rien ne se passe, pas de decrementation on reste ds la mm scene
	//			break;
			}
		}
	// ==== function de debug =====
	,scene_info:function(all)
		{
		var d='';
		//winDebug.write(' ==== scenario :' +this.Nom+ ' ====');
		d+= 'sceneNo: '+ this.getSceneNo()+' | ';
		d+= 'sceneNb: '+ this.getSceneNb()+' | ';
	//	winDebug.write(d);
	
		for (nu=1;nu <= this.sceneNb; nu++)
			{
			//winDebug.write(' ==== scene :"' +this.scenes[nu].nom+ '" ====');
			d= 'scenes[' +nu+ '].etat: '			+ this.scenes[nu].getEtat()+ ' | ';
			d+='scenes[' +nu+ '].tempsRestant: '	+ this.scenes[nu].tempsRestant+ ' | ';
			//winDebug.write(d);
			}
		}
	// ====  deplacement dans les scenes====
	,scene_run:function(){this.scenes[this.sceneNo].lance();}
	,pause:function(){this.scenes[this.sceneNo].setEtat(3);}
	,stopIfNoRepeat:function(){this.stop(this.isRepeat);}	//si repeat-> NoStopTimer //si repeat -> NoStopTimer=true
	// NostopTimer:true arret du timer
	,stop:function(NostopTimer)	//stop obligatoirement
		{
		if (!NostopTimer){clearTimeout(this.runAutoTimerID);this.runAutoTimerID= undefined;}
		this.sceneNo=1;
		this.scenes[this.sceneNo].setEtat(0);
		this.scenes[this.sceneNo].tempsRestant= this.scenes[this.sceneNo].duree;
		}
	,scene_runPrecedente:function(){if (this.sceneNo > 1){this.scene_run(--this.sceneNo);return(1);}else	{return(0);}}
	// scene suivante
	// sceneNo incrementer si existe et envoie 1
	// sceneNo mise a 0 si sceneNb atteinte et renvoie 0
	,scene_runSuivante:function(){if (this.sceneNo < this.sceneNb){this.scene_run(++this.sceneNo);return(1);}else{return(0);}}
	}	// Tscenario.prototype
