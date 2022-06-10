/* ## Explanation of the Positioning System 04/06/2019

1- this was a huge pain in the ass. Seems like it should be simple: include a nested SVG, give it a positioning system so it loads correctly, then just transform & scale it from the center. Well first off you cannot add transforms to the definition of a nested SVG. Nope. You can, however, add an x and a y value - which works best as a percentage of your container. Good thing is that even when the container gets bigger - it just works.

2- then instead of a another bodypart level SVG tag for scaling, you have to add a <g> group for your actual paths, then transform THAT via CSS. That's right,  only via inline CSS. Why? Because the SVG based transforms are all done left 0 top 0 -  as in, NOT from the center!! Aaaghhh. And the fix? Usinig CSS, and the transform-origin attribute. But guess what? This is not completely Chrome compatible,  as there is a freakin open BUG on the CSS attribute transform=origin. But here is what you can do, ultimately the SVG pattern looks like this:

######

<svg this is our top for ALL bodyparts, with a perserveAspectRation="none" so the whole thing will scale>
	<svg this is our bodypart SVG, with x and y values, and a preserveAspectRatio="xMidYMin" so it will scale correctly>
		<g this is our group with CSS an inline transform for scale>

######

	a- on the <g> element, set 
		style="transform: scale( {icon.pos.scale} );  transform-box: fill-box;"  
	
	b- your actual x, y offsets must be as transform translate on the g element. 
	
	c- the <g> transform of the scale, and  your x y offset for the bodypart HAS to be inline rather than the MUCH easier center center - due to a Chrome BUG. In Edge this just works w/ center center;
	
	So this looks like this:
	
			<g style="transform-box: fill-box; transform: scale( {icon.pos.scale} ) translate({icon.pos.translate[0] + 'px,' + icon.pos.translate[1] + 'px' });" id="{icon.name}" >
	
	d- the x and y values for the scaling center must be set on the parent SVG - the formula to get these values is ( looks like x & y need to be the SAME to scale by center! ). These need to include the scaling for that icon to find the center. I use icon.vb2 to house these values. But this does NOT position the actual piece correctly!  For that you use b & c.
	
			let num;
			let currentBoxWidth = 200 * icon.pos.scale // this should be either passed as an argument	
			let width = ( currentBoxWidth )// * (icon.pos.scale);
			num =  100 -((width)/2 );
			icon.vb2 = [num, num]
	
	Here is some sample code for getting percentage of a 200 pixel box;
	
	  let num = 48/200;
	  num = num * 100;
	  num  = num.toString() + '%';

*/

const getPosition = (icon, coll, name) => {
	let vb = icon.vb.split(' ');
	       // console.log('icon is '+JSON.stringify(icon))
	switch (coll) {
		   
	 case 'hair':
		     icon.pos.scale = .75;
			 icon.pos.translate = [0, -15];
	 break;
       case 'backs':
		   icon.pos.scale = 2;
	   break;
       case 'faceshape':
			icon.pos.scale = 1;
			icon.pos.translate = [0,0]
			if (name.includes('monster')) {
				icon.pos.scale = 1.3;
				icon.pos.sf = .13;
				icon.pos.translate = [0, 50];
			}
        break;
       case 'mouth':
			icon.pos.scale = .3; 
			icon.pos.translate = [0, 70]

		  if (name.includes('monster')) {
				icon.pos.translate = [0,150];
		  }
	   break;
       case 'glasses':
			icon.pos.scale = .6; 
			icon.pos.sf = .6;
			icon.pos.translate = [0,-10] 
	   break;
	   
       case 'eyes':
			icon.pos.scale = 1; 
			icon.pos.translate = [0,0]
		break;
      
	  case 'eyesiris':
			icon.pos.scale = 1; 
			icon.pos.sf = 1;
			//icon.pos.translate = [0,-105]  135  190

	   break;
	   
	   case 'eyesback':
			icon.pos.scale = 1;
			icon.pos.sf = 1;
	   break
	   case 'eyes':
			icon.pos.scale = .25;
			icon.pos.sf = .25;
			icon.pos.translate = [0,-45]

		break;
	  
       case 'nose':
			icon.pos.scale = .2; 
			icon.pos.translate = [0,0]
		break;

        case 'humanbody':
			icon.pos.scale = 1;  
			icon.pos.translate = [0,50]
	   	break;
		case 'ears':
			icon.pos.scale = .1;

		break;
	   case 'nose':
		   icon.pos.translate = [0, 16];
	   break;
       case 'mustache':
	   icon.pos.scale = .45; 
	   icon.pos.sf = .45; 
	   icon.pos.translate = [0,20] 
	 
	   break;

		case 'eyebrows':
			icon.pos.sf = .2;
			icon.pos.scale = .2;
			icon.pos.translate = [0, -95]
		break;

	// I think none of these will work now that they are nested, will have to use viewbox to accomplish these transformations
	}

			vb[0] = parseInt(vb[0]);
			vb[2] = parseInt(vb[2]);
			

	    icon.vb2 = [0,0];
		
	return getCustomPositions(icon, name);
		
}

const getCustomPositions = (icon, name) => {
	
	switch (name) {
		
		// nose 
			case 'nose_5':
			icon.vb2[1] = -6; 	
			break;		
		
		// mouths
		
			case 'mouth_0':
			icon.pos.translate[0] = -13; // x pos	
			break;		
			case 'mouth_10':
			icon.pos.scale = .19;
			break;		
			case 'mouth_12':
			icon.pos.scale = .22;
			break;				
			case 'mouth_13':
			icon.pos.scale = .13;
			break;	
			case 'mouth_15':
			icon.pos.scale = .22;
			break;				
		// eyebrows
			case 'eyebrows_male_left_3':
			icon.vb2[1] = -7; // y pos	
			break;
			case 'eyebrows_male_left_5':
			icon.vb2[1] = -7; // y pos	
			break;
		case 'eyebrows_male_left_12':
			icon.vb2[1] = -7; // y pos	
			break;
			
		case 'eyebrows_male_left_15':
			icon.vb2[1] = -9; // y pos	
			break;
		
		// default is 73
		case 'eyesback_male_right_1':
			icon.vb2[1] = 3; // y pos	
			break;	
		case 'eyesback_male_right_3':
			icon.vb2[1] = -3; // y pos	
			break;
		case 'eyesback_male_right_4':
			icon.vb2[1] = -4; // y pos	
			break;	
		case 'eyesback_male_right_5':
			icon.vb2[1] = -4; // y pos	
			break;				
		case 'eyesback_male_right_6':
			icon.vb2[1] = -6; // y pos	
			break;			
			
		case 'eyesback_male_right_8':
			icon.vb2[1] = 4; // y pos	
			break;			
		case 'eyesback_male_right_12':
			icon.vb2[1] = -9; // y pos	
			break;			
		case 'eyesback_male_right_15':
			icon.vb2[1] = -5; // y pos	
			break;
		case 'eyesback_male_right_16':
			icon.vb2[1] = -5; // y pos	
			break;				

		//defaults:  x 10
		case 'hair_male_front_2':
			icon.pos.scale = .73;
			icon.vb2[1] = -27; // y pos	
			break;	
		case 'hair_male_front_5':
			icon.pos.scale = .75;
			icon.vb2[1] = -2; // y pos	
			break;	
		case 'hair_male_front_6':
			icon.pos.scale = .72;
			//icon.vb2[1] = 35; // y pos	
			break;				
		case 'hair_male_front_7':
			icon.pos.scale = .70;
			icon.vb2[1] = 25; // y pos	
			break;	
			case 'hair_male_front_8':
			icon.pos.scale = .72;	
			icon.vb2[1] = 10; // y pos	
			
			break;	
		case 'hair_male_front_9':
			//icon.pos.scale = .85;
			icon.vb2[1] = -19; // y pos	
			break;			
		case 'hair_male_front_10':
			icon.pos.scale = 1;
			icon.vb2[1] = -17;
			break;	
		case 'hair_male_front_11':
			//icon.pos.scale = .85;
			icon.vb2[1] = 2; // y po	
			break;				
		case 'hair_male_front_14':
			//icon.pos.scale = .81
			icon.vb2[1] = -20;
		break;	
		case 'hair_male_front_16':
			icon.pos.scale = .74
		break;			
		case 'hair_male_front_18':
			//icon.pos.scale = .85;
			break;		
		case 'hair_male_front_21':
			icon.pos.scale = .95;
			break;
		case 'hair_male_front_22': //175/-15/16
			icon.pos.scale = .90;
			icon.pos.translate[0] = 5;
			icon.vb2[1] = -27 ;		
		break;

		case 'faceshape_male_16':
			icon.pos.scale = .9;
			break;		
		case 'faceshape_male_19':
			icon.pos.scale = .97;
			break;
		case 'faceshape_male_23':
			icon.pos.scale = 1;
			icon.vb2[1] = -4 ;	
			break;
	}
	
	return icon
	
}
export { getPosition };