
const {log, biglog, errorlog, colorize} = require("./out");

const model = require('./model');

/**
*Muestra la ayuda.
*
*@param rl Objeto readline usado para implementar el CLI.
*/
exports.helpCmd = rl => {
	log("Commandos:");
	log(" h|help - Muestra esta ayuda.");
	log(" list - Listar los quizzes existentes.");
	log(" show <id> - Muestra la pregunta y la respuesta del quiz indicado.");
	log(" add - Añadir un nuevo quiz interactivamente");
	log(" delete <id> - Borrar el quiz indicado.");
	log(" edit <id>  - Editar el quiz indicado.");
	log(" test <id> - Probar el quiz indicado.");
	log(" p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
	log(" credits - Créditos.");
	log(" q|quit - Salir del programa.");
	rl.prompt();
};


/**
*Añade un nuevo quiz al modelo.
*Pregunta interactivamente por la pregunta y la repsuesta.
*
*@param rl Objeto readline usado para implementar el CLI.
*/
exports.addCmd = rl => {
	rl.question(colorize('Introduzca una pregunta:', 'red'), question => {
		rl.question(colorize('Introduza una respuesta', 'red'), answer => {
			model.add(question, answer);
			log(`${colorize('Se ha añadido', 'magenta')}: ${question} ${colorize('=>','magenta')} ${answer}`);
			rl.prompt();
		});
	});
};


/**
*Borra un quiz del modelo.
*
*@param rl Objeto readline usado para implementar el CLI.
*@param id Clave del quiz a borrar en el modelo.
*/
exports.deleteCmd = (rl, id) => {
	if (typeof id === "undefined") {
		errorlog(`Falta el parámetro id.`);
	} else {
		try {
			model.deleteByIndex(id);			
		} catch(error) {
			errorlog(error.message);
		}
	}
	rl.prompt();
};


/**
*Edita un quiz.
*
*@param rl Objeto readline usado para implementar el CLI.
*@param id Clave del quiz a editar en el modelo.
*/
exports.editCmd = (rl, id) => {
	if (typeof id === "undefined") {
		errorlog(`Falta el parámetro id.`);
		rl.prompt();
	} else {
		try {

			const quiz = model.getByIndex(id);

			process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)}, 0);

			rl.question(colorize('Introduzca una pregunta:', 'red'), question => {

				process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)}, 0);

				rl.question(colorize('Introduza una respuesta', 'red'), answer => {
					model.update(id, question, answer);
					log(`Se ha cambiado el quiz ${colorize(id, 'magenta')} por: ${question} ${colorize('=>','magenta')} ${answer}`);
					rl.prompt();
				});
			});
			} catch (error) {
				errorlog(error.message);
				rl.prompt();
			}
		}
	};




/**
*Lista todos los quizzes existentes.
*
*@param rl Objeto readline usado para implementar el CLI.
*/
exports.listCmd = rl => {
	model.getAll().forEach((quiz, id) => {

		log(` [${colorize(id, 'magenta')}]: ${quiz.question}`);
	});
	rl.prompt();
};


/**Muetsra el quiz indicado.
*
*@param rl Objeto readline usado para implementar el CLI.
*@param id Clave del quiz a mostrar.
*/
exports.showCmd = (rl, id) => {
	if (typeof id === "undefined") {
		errorlog(`Falta el parámetro id.`);
	} else {
		try {
			const quiz = model.getByIndex(id);
			log(` [${colorize(id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
		} catch(error) {
			errorlog(error.message);
		}
	}
	rl.prompt();
};


/**
*Prueba un quiz, es decir, hace una pregunta en el modelo a la que debemos contestar.
*
*@param rl Objeto readline usado para implementar el CLI.
*@param id Clave del quiz a probar.
*/
exports.testCmd = (rl, id) => {
	if (typeof id === "undefined") {
		errorlog(`Falta el parámetro id.`);
		rl.prompt();
	} 
	else {
		try {
			const quiz = model.getByIndex(id);

			rl.question(colorize(`Pregunta: ${quiz.question} =>`, 'red'), answer => {
				if((answer.toLowerCase().trim()) === ((quiz.answer).toLowerCase().trim())) {
					log('Respuesta correcta');
					
				} 
				else {
					log('Respuesta incorrecta:');
					
				}
				rl.prompt();
			});
			
		} 
		catch(error) {
			errorlog(error.message);
			rl.prompt();
		}
	}
	
};

 

/**
*Pregunta todos los quizzes existentes en el modelo en orden aleatorio.
*Se gana si se contesta a todos satsifactoriamente.
*
*@param rl Objeto readline usado para implementar el CLI.
*/


exports.playCmd = rl => {

	let score = 0; //marcador
	let totalpreguntas = model.count(); //numero total de preguntas
	let toBeResolved =[]; // preguntas a resolver

	model.getAll().forEach((quiz, id) => {
		toBeResolved.push(id);
	});

	const jugar = () => {
		if (score===totalpreguntas) {
			log('No hay nada más que preguntar','magenta');
			log('Fin del examen. Aciertos:', 'magenta');
			biglog(`${score}`, 'magenta');
			rl.prompt();

		}
		else {
			let id = 0;
			const random = () => {
				id = toBeResolved[Math.floor(Math.random() * toBeResolved.length)];
				if (id == "a"){
				random();
				}
			}
			random();

			toBeResolved.splice(id, 1, "a");

			let quiz = model.getByIndex(id); //saco pregunta asociada al id

				rl.question(colorize(`Pregunta: ${quiz.question} =>`, 'red'), answer => {
						if((answer.toLowerCase().trim()) === ((quiz.answer).toLowerCase().trim())) {
						log('CORRECTO', 'green');
						score = score+1;
						log(`Lleva ${score} aciertos`, 'magenta');
						jugar();
					} 
					else {
						log('INCORRECTO', 'red');
						log('Fin del examen. Aciertos:', 'magenta');
						biglog(`${score}`, 'magenta');
						rl.prompt();
					}
				});	
			}		
		}
	jugar();
};


/**
*Muestra los nombres de los autores de la práctica.
*
*@param rl Objeto readline usado para implementar el CLI.
*/
exports.creditsCmd = rl => {
	log('Autores de la práctica:');
	log('Marcos Notario', 'green');
	rl.prompt();
};


/**
*Terminar el programa.
*
*@param rl Objeto readline usado para implementar el CLI.
*/
exports.quitCmd = rl => {
	rl.close();
};
