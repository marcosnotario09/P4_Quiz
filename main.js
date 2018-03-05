const readline = require('readline');
const {log, biglog, errorlog, colorize} = require("./out");
const cmds = require("./cmds");



//Mensaje inicial
biglog('CORE Quiz', 'green');
	


const rl = readline.createInterface({
	 input: process.stdin,
	 output: process.stdout,
	 prompt: colorize("quiz> ", 'blue'),
	 completer: (line) => {
  		const completions = 'h help add delete edit list show test p play credits q quit'.split(' ');
  		const hits = completions.filter((c) => c.startsWith(line));
  		// show all completions if none found
  		return [hits.length ? hits : completions, line];
		}
});
rl.prompt();

rl
.on('line', (line) => {

	let args = line.split(" ");
	let cmd = args[0].toLowerCase().trim();

	  switch (cmd) {
	  	case '':
	  		rl.prompt();
	  		break;

	  	case 'help':
	  	case 'h':
	  		cmds.helpCmd(rl);
	  		break;

 		case 'add':
 		case 'a':
	    	cmds.addCmd(rl);
	    	break;

	    case 'delete':
	    case 'd':
	    	cmds.deleteCmd(rl, args[1]);
	    	break;

	    case 'edit':
	    case 'e':
	    	cmds.editCmd(rl, args[1]);
	    	break;
	    	   
	    case 'list':
	    case'l':
	    	cmds.listCmd(rl);
	    	break;

	    case 'show':
	    case 's':
	    	cmds.showCmd(rl, args[1]);
	    	break;

	    case 'test':
	    case 't':
	    	cmds.testCmd(rl, args[1]);
	    	break;
	    
	    case 'play':
	    case 'p':
	    	cmds.playCmd(rl);
	    	break;

	    case 'credits':
	    case 'c':
	    	cmds.creditsCmd(rl);
	    	break;

	    case 'quit':
	    case 'q':
	    	cmds.quitCmd(rl);
	    	break;
	    
	   	      
	    default:
	    	log(`Comando desconocido:'${colorize(cmd, 'red')}'`);
	      	log(`Use ${colorize('help', 'green')} para ver todos los comandos disponibles.`);
	      	rl.prompt();
	      	break;
	  }

	  
	})
	.on('close', () => {
	  log('Adios!');
	  process.exit(0);
	});




